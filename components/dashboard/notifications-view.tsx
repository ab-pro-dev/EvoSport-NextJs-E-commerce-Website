"use client";

import { useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Package,
  Info,
  Tag,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface NotificationItem {
  id: string;
  type: "ORDER_UPDATE" | "SYSTEM" | "PROMOTION" | "STOCK_ALERT" | "PRICE_DROP" | string;
  message: string;
  read: boolean;
  createdAt: string | Date;
}

interface NotificationsViewProps {
  initialNotifications: NotificationItem[];
  totalCount: number;
  unreadCount: number;
}

export function NotificationsView({
  initialNotifications,
  totalCount: initialTotal,
  unreadCount: initialUnread,
}: NotificationsViewProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [unreadCount, setUnreadCount] = useState(initialUnread);
  const [filterTab, setFilterTab] = useState<"all" | "unread">("all");
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const displayedNotifications =
    filterTab === "unread"
      ? notifications.filter((n) => !n.read)
      : notifications;

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true);
      const res = await fetch("/api/notifications/read-all", { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        setUnreadCount(0);
        toast.success("All notifications marked as read");
      } else {
        toast.error("Failed to mark all as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, read: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
        toast.success("Notification marked as read");
      }
    } catch {
      toast.error("Failed to mark notification as read");
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER_UPDATE":
        return <Package className="h-4 w-4 text-[#5B8DEF]" />;
      case "PROMOTION":
      case "PRICE_DROP":
        return <Tag className="h-4 w-4 text-[#B8FF00]" />;
      case "STOCK_ALERT":
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      default:
        return <Info className="h-4 w-4 text-[#5B8DEF]" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white flex items-center gap-2">
            <Bell className="h-6 w-6 text-[#B8FF00]" />
            NOTIFICATIONS
          </h1>
          <p className="text-xs text-[#0F1B2D]/50 dark:text-slate-400 mt-0.5">
            Stay updated on your orders, system updates, and exclusive athletic promotions
          </p>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={isMarkingAll}
            className="border-gray-200 dark:border-slate-800 text-xs font-bold text-[#0F1B2D] dark:text-white hover:bg-gray-50 dark:hover:bg-slate-800 h-9"
          >
            <CheckCheck className="mr-1.5 h-4 w-4 text-[#5B8DEF]" />
            {isMarkingAll ? "Marking..." : "Mark All as Read"}
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setFilterTab("all")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            filterTab === "all"
              ? "bg-[#0F1B2D] text-white dark:bg-white dark:text-[#0F1B2D] shadow-sm"
              : "bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 text-[#0F1B2D]/60 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white"
          }`}
        >
          All ({notifications.length})
        </button>

        <button
          onClick={() => setFilterTab("unread")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            filterTab === "unread"
              ? "bg-[#0F1B2D] text-white dark:bg-white dark:text-[#0F1B2D] shadow-sm"
              : "bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 text-[#0F1B2D]/60 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white"
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#B8FF00] text-[9px] font-black text-[#0F1B2D]">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 shadow-sm">
        {displayedNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100 dark:divide-slate-800">
            {displayedNotifications.map((item) => {
              const dateStr = new Date(item.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={item.id}
                  onClick={() => !item.read && handleMarkAsRead(item.id)}
                  className={`flex items-start justify-between gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                    item.read
                      ? "opacity-75 hover:opacity-100 hover:bg-gray-50/50 dark:hover:bg-slate-800/30"
                      : "bg-[#F4F8FC] dark:bg-slate-800/60 border border-[#5B8DEF]/15 dark:border-slate-700/60 my-1"
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 shadow-sm mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F1B2D] dark:text-white leading-snug">
                          {item.message}
                        </span>
                        {!item.read && (
                          <span className="inline-flex items-center rounded-full bg-[#B8FF00] px-2 py-0.5 text-[9px] font-black text-[#0F1B2D] uppercase tracking-wider">
                            New
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#0F1B2D]/40 dark:text-slate-500 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>{dateStr}</span>
                      </div>
                    </div>
                  </div>

                  {!item.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(item.id);
                      }}
                      className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#0F1B2D]/50 dark:text-slate-400 hover:text-emerald-500 hover:border-emerald-500 transition-colors shadow-sm"
                      title="Mark as read"
                      aria-label="Mark as read"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F8FC] dark:bg-slate-900 text-[#0F1B2D]/30 dark:text-slate-500 mx-auto border border-gray-200 dark:border-slate-800">
              <Sparkles className="h-6 w-6 text-[#B8FF00]" />
            </div>
            <h3 className="text-sm font-black uppercase text-[#0F1B2D] dark:text-white">
              {filterTab === "unread" ? "No unread notifications" : "No notifications yet"}
            </h3>
            <p className="text-xs text-[#0F1B2D]/40 dark:text-slate-400 max-w-sm mx-auto">
              {filterTab === "unread"
                ? "You're all caught up! There are no unread notifications waiting."
                : "You will receive updates here regarding your orders, shipments, and store promotions."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
