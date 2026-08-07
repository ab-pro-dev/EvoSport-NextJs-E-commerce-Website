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
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 p-4 backdrop-blur-md flex items-center gap-3">
        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#CCFF00] font-black text-black text-sm shadow-md shadow-[#CCFF00]/10">
          {getInitials(user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-bold text-sm text-white">{user.name || "Customer"}</h3>
          <p className="truncate text-[11px] text-neutral-400">{user.email}</p>
        </div>
      </div>

      {/* Main Navigation Group */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-3 backdrop-blur-md space-y-4">
        <div>
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-neutral-500">
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/10"
                      : "text-neutral-400 hover:bg-neutral-800/80 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Account Navigation Group */}
        <div className="border-t border-neutral-800/80 pt-3">
          <div className="px-3 pb-2 text-[10px] font-black uppercase tracking-wider text-neutral-500">
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#CCFF00] text-black shadow-md shadow-[#CCFF00]/10"
                      : "text-neutral-400 hover:bg-neutral-800/80 hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}

            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-bold text-rose-400 hover:bg-rose-950/30 hover:text-rose-300 transition-all"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </nav>
        </div>
      </div>
    </aside>
  );
}
