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
  isSoundMuted,
  setSoundMuted,
} from "@/lib/audio-notification";

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
  const [isMuted, setIsMuted] = useState(false);
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    setIsMuted(isSoundMuted());
    const handleToggle = (e: Event) => {
      const customEvent = e as CustomEvent<{ muted: boolean }>;
      setIsMuted(customEvent.detail?.muted ?? isSoundMuted());
    };
    window.addEventListener("evosport_sound_toggle", handleToggle);
    return () => window.removeEventListener("evosport_sound_toggle", handleToggle);
  }, []);

  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    setSoundMuted(nextState);
  };

  const fetchAdminAlerts = useCallback(async () => {
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
          message: `Customer ${o.customer?.name || o.user?.name || "Guest"} placed an order of $${Number(o.total ?? o.totalAmount ?? 0).toFixed(2)}`,
          type: "ORDER",
          createdAt: o.createdAt || new Date().toISOString(),
        }));

        const newCount = mappedAlerts.length;

        // Play chime only if alert count strictly increased from previous poll
        if (prevCountRef.current !== null && newCount > prevCountRef.current) {
          playNotificationSound();
        }
        prevCountRef.current = newCount;

        setAlerts(mappedAlerts);
        setUnreadCount(newCount);
      }
    } catch (err) {
      console.error("[AdminNotificationsDropdown] Error fetching alerts:", err);
    }
  }, []);

  useEffect(() => {
    fetchAdminAlerts();
    const interval = setInterval(fetchAdminAlerts, 15000);
    return () => clearInterval(interval);
  }, [fetchAdminAlerts]);

  const handleDismissAll = () => {
    setAlerts([]);
    setUnreadCount(0);
    prevCountRef.current = 0;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
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

      <PopoverContent className="w-80 sm:w-96 rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0 text-neutral-900 dark:text-white shadow-2xl" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-900 dark:text-white">Admin Alerts</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 px-2 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
                {unreadCount} pending
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="flex items-center gap-1 text-[11px] font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
              title={isMuted ? "Unmute notification sounds" : "Mute notification sounds"}
            >
              {isMuted ? (
                <VolumeX className="h-3.5 w-3.5 text-rose-500" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 text-emerald-500" />
              )}
              <span className="text-[10px]">{isMuted ? "Muted" : "Sound"}</span>
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
                    <div className="text-xs font-bold text-neutral-900 dark:text-white">{item.title}</div>
                    <div className="text-[11px] text-neutral-600 dark:text-neutral-300 mt-0.5">{item.message}</div>
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
