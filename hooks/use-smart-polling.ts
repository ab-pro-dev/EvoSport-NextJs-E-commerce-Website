"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

export interface SmartPollingConfig {
  intervalMs: number;
  idleLimitMs: number;
  pauseWhenHidden: boolean;
}

export const CUSTOMER_POLLING_CONFIG: SmartPollingConfig = {
  intervalMs: 60000, // 60 seconds
  idleLimitMs: 5 * 60 * 1000, // 5 minutes
  pauseWhenHidden: true,
};

export const ADMIN_POLLING_CONFIG: SmartPollingConfig = {
  intervalMs: 60000, // 60 seconds
  idleLimitMs: 30 * 60 * 1000, // 30 minutes
  pauseWhenHidden: false,
};

export interface UseSmartPollingOptions {
  intervalMs: number;
  idleLimitMs: number;
  pauseWhenHidden: boolean;
  onPoll: (params: { isCatchUp: boolean }) => void | Promise<void>;
  enabled?: boolean;
}

export interface SmartPollingManagerOptions {
  intervalMs: number;
  idleLimitMs: number;
  pauseWhenHidden: boolean;
  onPoll: (params: { isCatchUp: boolean }) => void | Promise<void>;
  getNow?: () => number;
  isDocumentHidden?: () => boolean;
  setTimer?: (callback: () => void, ms: number) => any;
  clearTimer?: (id: any) => void;
}

/**
 * Pure state manager for smart polling logic.
 * Decoupled from React to allow 100% deterministic unit testing with fake timers.
 */
export class SmartPollingManager {
  private intervalMs: number;
  private idleLimitMs: number;
  private pauseWhenHidden: boolean;
  private onPoll: (params: { isCatchUp: boolean }) => void | Promise<void>;
  private getNow: () => number;
  private isDocumentHidden: () => boolean;
  private setTimer: (callback: () => void, ms: number) => any;
  private clearTimer: (id: any) => void;

  private isRunning = false;
  private isIdle = false;
  private timerId: any = null;
  private lastActivityTime = 0;

  constructor(options: SmartPollingManagerOptions) {
    this.intervalMs = options.intervalMs;
    this.idleLimitMs = options.idleLimitMs;
    this.pauseWhenHidden = options.pauseWhenHidden;
    this.onPoll = options.onPoll;
    this.getNow = options.getNow || (() => Date.now());
    this.isDocumentHidden =
      options.isDocumentHidden ||
      (() => typeof document !== "undefined" && document.visibilityState === "hidden");
    this.setTimer = options.setTimer || ((cb, ms) => setTimeout(cb, ms));
    this.clearTimer = options.clearTimer || ((id) => clearTimeout(id));
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastActivityTime = this.getNow();
    this.isIdle = false;

    // If tab is hidden and configured to pause when hidden, do not poll immediately
    if (this.pauseWhenHidden && this.isDocumentHidden()) {
      return;
    }

    // Initial poll on activation
    this.onPoll({ isCatchUp: false });
    this.scheduleNext();
  }

  public stop(): void {
    this.isRunning = false;
    this.isIdle = false;
    if (this.timerId !== null) {
      this.clearTimer(this.timerId);
      this.timerId = null;
    }
  }

  public handleActivity(): void {
    if (!this.isRunning) return;
    const now = this.getNow();
    this.lastActivityTime = now;

    if (this.isIdle) {
      this.isIdle = false;
      // Resumed from idle after user activity!
      // If tab is hidden and pauseWhenHidden is active, wait until tab is visible
      if (this.pauseWhenHidden && this.isDocumentHidden()) {
        return;
      }
      this.triggerCatchUp();
    }
  }

  public handleVisibilityChange(visible?: boolean): void {
    if (!this.isRunning) return;
    const isVisible = visible !== undefined ? visible : !this.isDocumentHidden();

    if (this.pauseWhenHidden) {
      if (isVisible) {
        // Tab became visible again
        this.lastActivityTime = this.getNow();
        this.isIdle = false;
        this.triggerCatchUp();
      } else {
        // Tab became hidden - pause timer
        if (this.timerId !== null) {
          this.clearTimer(this.timerId);
          this.timerId = null;
        }
      }
    }
  }

  private triggerCatchUp(): void {
    if (this.timerId !== null) {
      this.clearTimer(this.timerId);
      this.timerId = null;
    }
    // Resume with ONE immediate fetch, marked as catch-up
    this.onPoll({ isCatchUp: true });
    this.scheduleNext();
  }

  private scheduleNext(): void {
    if (!this.isRunning) return;
    if (this.timerId !== null) {
      this.clearTimer(this.timerId);
      this.timerId = null;
    }

    this.timerId = this.setTimer(() => {
      this.timerId = null;
      this.onIntervalTick();
    }, this.intervalMs);
  }

  private onIntervalTick(): void {
    if (!this.isRunning) return;

    // Check if hidden and pauseWhenHidden
    if (this.pauseWhenHidden && this.isDocumentHidden()) {
      return;
    }

    // Check if idle limit exceeded
    const idleDuration = this.getNow() - this.lastActivityTime;
    if (idleDuration >= this.idleLimitMs) {
      this.isIdle = true;
      // Stop polling while idle - will resume on activity or visibility
      return;
    }

    // Active interval poll
    this.onPoll({ isCatchUp: false });
    this.scheduleNext();
  }

  // Diagnostic getters for testing
  public getStatus() {
    return {
      isRunning: this.isRunning,
      isIdle: this.isIdle,
      hasTimer: this.timerId !== null,
    };
  }
}

/**
 * Reusable React polling hook that enforces user authentication,
 * tab visibility pausing, and idle detection.
 */
export function useSmartPolling({
  intervalMs,
  idleLimitMs,
  pauseWhenHidden,
  onPoll,
  enabled = true,
}: UseSmartPollingOptions) {
  const { status } = useSession();
  const isAuthenticated = status === "authenticated";

  const onPollRef = useRef(onPoll);
  useEffect(() => {
    onPollRef.current = onPoll;
  }, [onPoll]);

  useEffect(() => {
    // 1. NEVER start when logged out
    if (!isAuthenticated || !enabled) {
      return;
    }

    const manager = new SmartPollingManager({
      intervalMs,
      idleLimitMs,
      pauseWhenHidden,
      onPoll: (params) => onPollRef.current(params),
    });

    manager.start();

    // 2. User activity tracking (mousemove, keydown, scroll, touchstart, click)
    const activityEvents = ["mousemove", "keydown", "scroll", "touchstart", "click"] as const;
    let throttleTimeout: any = null;

    const onUserActivity = () => {
      if (throttleTimeout) return;
      throttleTimeout = setTimeout(() => {
        throttleTimeout = null;
      }, 500); // 500ms throttle for activity listeners
      manager.handleActivity();
    };

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, onUserActivity, { passive: true });
    });

    // 3. Tab visibility tracking
    const onVisibilityChange = () => {
      manager.handleVisibilityChange();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      manager.stop();
      if (throttleTimeout) clearTimeout(throttleTimeout);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, onUserActivity);
      });
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [isAuthenticated, enabled, intervalMs, idleLimitMs, pauseWhenHidden]);
}
