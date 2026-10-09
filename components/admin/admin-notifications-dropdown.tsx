"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, ShoppingCart, Volume2, VolumeX } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  playNotificationSound,
  isSoundEnabled,
  setSoundEnabled,
  initNotificationPreferences,
} from "@/lib/audio-notification";
import { useSmartPolling, ADMIN_POLLING_CONFIG } from "@/hooks/use-smart-polling";

interface AdminAlertItem {
  id: string;
  title: string;
  message: string;
  type: "ORDER" | "STOCK" | "USER";
  createdAt: string;
}

export function AdminNotificationsDropdown() {
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const prevCountRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<string | null>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    setSoundOn(isSoundEnabled());

    // Fetch user preferences from DB to sync
    fetch("/api/user/notification-settings")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          initNotificationPreferences(data);
          setSoundOn(data.soundEnabled ?? true);
        }
      })
      .catch(() => {});

    const handleSoundChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ soundEnabled?: boolean; muted?: boolean }>;
      if (customEvent.detail?.soundEnabled !== undefined) {
        setSoundOn(customEvent.detail.soundEnabled);
      } else if (customEvent.detail?.muted !== undefined) {
        setSoundOn(!customEvent.detail.muted);
      } else {
        setSoundOn(isSoundEnabled());
      }
    };

    window.addEventListener("evosport_sound_toggle", handleSoundChange);
    window.addEventListener("evosport_sound_preference_changed", handleSoundChange);

    return () => {
      window.removeEventListener("evosport_sound_toggle", handleSoundChange);
      window.removeEventListener("evosport_sound_preference_changed", handleSoundChange);
    };
  }, []);

  const toggleSound = async () => {
    const nextState = !soundOn;
    setSoundOn(nextState);
    setSoundEnabled(nextState);

    // Persist to admin user settings in DB
    try {
      await fetch("/api/user/notification-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ soundEnabled: nextState }),
      });
    } catch {}
  };

  const fetchFullAlerts = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    try {
      const res = await fetch("/api/admin/orders?limit=5");
      if (res.ok) {
        const data = await res.json();
        const orders = data.orders || [];
        const pendingOrders = orders.filter(
          (o: any) => o.status === "PENDING" || o.status === "PAID"
        );

        const mappedAlerts: AdminAlertItem[] = pendingOrders.map((o: any) => ({
          id: o.id || "",
          title: `New Order #${(o.id || "").slice(-6).toUpperCase()}`,
          message: `Customer ${o.customer?.name || o.user?.name || "Guest"} placed an order of $${Number(
            o.total ?? o.totalAmount ?? 0
          ).toFixed(2)}`,
          type: "ORDER",
          createdAt: o.createdAt || new Date().toISOString(),
        }));

        setAlerts(mappedAlerts);
        const newCount = mappedAlerts.length;
        setUnreadCount(newCount);
        prevCountRef.current = newCount;
      }
    } catch (err) {
      console.error("[AdminNotificationsDropdown] Error fetching alerts:", err);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  const pollAlertsSummary = useCallback(
    async ({ isCatchUp }: { isCatchUp: boolean }) => {
      try {
        const res = await fetch("/api/admin/orders/alerts-summary");
        if (!res.ok) return;
        const data = await res.json();
        const newCount = typeof data.pendingCount === "number" ? data.pendingCount : 0;
        const newTimestamp = data.latestOrderTimestamp || null;

        // Chime rule: play only when count strictly increases between two consecutive active polls
        // Skip on catch-up fetch or initial load
        if (!isCatchUp && prevCountRef.current !== null && newCount > prevCountRef.current) {
          playNotificationSound();
        }

        const summaryChanged =
          prevCountRef.current !== null &&
          (newCount !== prevCountRef.current || newTimestamp !== lastTimestampRef.current);

        prevCountRef.current = newCount;
        lastTimestampRef.current = newTimestamp;
        setUnreadCount(newCount);

        // Fetch full order list only when dropdown is opened or summary changed
        if (summaryChanged || isOpen) {
          fetchFullAlerts();
        }
      } catch (err) {
        console.error("[AdminNotificationsDropdown] Error polling alerts summary:", err);
      }
    },
    [isOpen, fetchFullAlerts]
  );

  useSmartPolling({
    intervalMs: ADMIN_POLLING_CONFIG.intervalMs,
    idleLimitMs: ADMIN_POLLING_CONFIG.idleLimitMs,
    pauseWhenHidden: ADMIN_POLLING_CONFIG.pauseWhenHidden,
    onPoll: pollAlertsSummary,
  });

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchFullAlerts();
    }
  };

  const handleDismissAll = () => {
    setAlerts([]);
    setUnreadCount(0);
    prevCountRef.current = 0;
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors shadow-sm"
          aria-label="Admin Alerts"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 font-black text-[9px] text-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 sm:w-96 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 text-neutral-900 dark:text-white shadow-2xl"
        align="end"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">
              Admin Alerts
            </h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                {unreadCount} pending
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title={soundOn ? "Mute notification sounds" : "Unmute notification sounds"}
            >
              {soundOn ? (
                <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <VolumeX className="h-3.5 w-3.5 text-rose-500" />
              )}
              <span className="text-[10px]">{soundOn ? "Sound" : "Muted"}</span>
            </button>

            {unreadCount > 0 && (
              <button
                onClick={handleDismissAll}
                className="text-[10px] font-bold text-rose-600 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
        </div>

        {/* Alerts List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-neutral-800/60 p-2">
          {alerts.length > 0 ? (
            alerts.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between gap-3 p-3 rounded-xl bg-gray-50 dark:bg-neutral-800/60 border border-rose-500/10 dark:border-neutral-700/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 mt-0.5 text-rose-600 dark:text-rose-400">
                    <ShoppingCart className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-0.5">
                      {item.message}
                    </div>
                    <div className="text-[10px] text-neutral-400 dark:text-neutral-500 mt-1">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
              No pending alerts. All systems normal.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
