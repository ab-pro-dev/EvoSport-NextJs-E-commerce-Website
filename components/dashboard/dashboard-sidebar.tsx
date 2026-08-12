"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  Package,
  Heart,
  MapPin,
  Star,
  Bell,
  User,
  CreditCard,
  Settings,
  Lock,
  LogOut,
} from "lucide-react";

interface DashboardSidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const pathname = usePathname();

  const getInitials = (name?: string | null) => {
    if (!name) return "US";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const mainNav = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/dashboard/orders", icon: Package },
    { name: "Wishlist", href: "/wishlist", icon: Heart },
    { name: "Addresses", href: "/dashboard/addresses", icon: MapPin },
    { name: "Reviews", href: "/dashboard/reviews", icon: Star },
    { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  ];

  const accountNav = [
    { name: "Profile", href: "/dashboard/profile", icon: User },
    { name: "Payment Methods", href: "/dashboard/payments", icon: CreditCard },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
    { name: "Security", href: "/dashboard/security", icon: Lock },
  ];

  return (
    <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
      {/* Profile Mini-Card */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 shadow-sm flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#B8FF00] font-black text-[#0F1B2D] text-sm shadow-sm">
          {getInitials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-sm text-[#0F1B2D] dark:text-white">{user.name || "Customer"}</h3>
          <p className="truncate text-[11px] text-[#0F1B2D]/40 dark:text-slate-400">{user.email}</p>
        </div>
      </div>

      {/* Main Navigation Group */}
      <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-3 shadow-sm space-y-4">
        <div>
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-[#0F1B2D]/30 dark:text-slate-400">
            Main Menu
          </div>
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#B8FF00]/10 dark:bg-[#B8FF00]/20 text-[#0F1B2D] dark:text-[#B8FF00]"
                      : "text-[#0F1B2D]/50 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-[#0F1B2D] dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#B8FF00]" : "text-[#0F1B2D]/40 dark:text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account Navigation Group */}
        <div className="border-t border-gray-100 dark:border-slate-800 pt-3">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-[#0F1B2D]/30 dark:text-slate-400">
            Account Settings
          </div>
          <nav className="space-y-1">
            {accountNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#B8FF00]/10 dark:bg-[#B8FF00]/20 text-[#0F1B2D] dark:text-[#B8FF00]"
                      : "text-[#0F1B2D]/50 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-[#0F1B2D] dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-[#B8FF00]" : "text-[#0F1B2D]/40 dark:text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-all"
            >
              <LogOut className="h-4 w-4 text-rose-500/60" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
