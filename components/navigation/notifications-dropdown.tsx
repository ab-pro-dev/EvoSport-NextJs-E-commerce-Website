"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Bell, Check, Package, Info, Volume2, VolumeX } from "lucide-react";
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

interface NotificationItem {
  id: string;
  type: "ORDER_UPDATE" | "SYSTEM" | "PROMOTION" | "RESTOCK";
  message: string;
  read: boolean;
  createdAt: string;
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const prevUnreadCountRef = useRef<number | null>(null);

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

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const newNotifications = data.notifications || [];
        const newUnread = data.unreadCount || 0;

        // Play chime only if unread count strictly increased from previous poll
        if (prevUnreadCountRef.current !== null && newUnread > prevUnreadCountRef.current) {
          playNotificationSound();
        }
        prevUnreadCountRef.current = newUnread;

        setNotifications(newNotifications);
        setUnreadCount(newUnread);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        prevUnreadCountRef.current = 0;
      }
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => {
          const nextVal = Math.max(0, prev - 1);
          prevUnreadCountRef.current = nextVal;
          return nextVal;
        });
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER_UPDATE":
        return <Package className="h-4 w-4 text-[#5B8DEF]" />;
      default:
        return <Info className="h-4 w-4 text-[#B8FF00]" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#0F1B2D]/60 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-[#0F1B2D] dark:hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-black text-[9px] text-white animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 sm:w-96 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-0 text-[#0F1B2D] dark:text-slate-100 shadow-xl" align="end">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 p-4">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#B8FF00]/15 dark:bg-[#B8FF00]/20 border border-[#B8FF00]/40 px-2 py-0.5 text-[10px] font-bold text-[#0F1B2D] dark:text-[#B8FF00]">
                {unreadCount} new
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleMute}
              className="flex items-center gap-1 text-[11px] font-medium text-[#0F1B2D]/60 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white transition-colors"
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
                onClick={handleMarkAllRead}
                className="text-[10px] font-bold text-[#5B8DEF] hover:underline"
              >
                Mark all
              </button>
            )}
          </div>
        </div>

        {/* Notification List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-gray-50 dark:divide-slate-800/60 p-2">
          {notifications.length > 0 ? (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => !item.read && handleMarkAsRead(item.id)}
                className={`flex items-start justify-between gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                  item.read
                    ? "bg-transparent opacity-60 hover:opacity-100"
                    : "bg-[#F4F8FC] dark:bg-slate-800/60 border border-[#5B8DEF]/10 dark:border-slate-700/50"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-[#F4F8FC] dark:bg-slate-800 border border-gray-200 dark:border-slate-700 mt-0.5">
                    {getIcon(item.type)}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#0F1B2D] dark:text-white">{item.message}</div>
                    <div className="text-[10px] text-[#0F1B2D]/40 dark:text-slate-400 mt-0.5">
                      {new Date(item.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>

                {!item.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkAsRead(item.id);
                    }}
                    className="text-[#0F1B2D]/30 dark:text-slate-500 hover:text-[#5B8DEF] p-1"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-[#0F1B2D]/40 dark:text-slate-500">
              No notifications yet.
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
