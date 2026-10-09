"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Tag,
  ShoppingBag,
  Users,
  Star,
  Boxes,
  Ticket,
  Megaphone,
  BarChart3,
  FileText,
  Settings,
  UserCircle,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { ConfirmModal } from "@/components/ui/confirm-modal";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Categories", href: "/admin/categories", icon: FolderTree },
  { name: "Brands", href: "/admin/brands", icon: Tag },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Customers", href: "/admin/customers", icon: Users },
  { name: "Reviews", href: "/admin/reviews", icon: Star },
  { name: "Inventory", href: "/admin/inventory", icon: Boxes },
  { name: "Coupons", href: "/admin/coupons", icon: Ticket },
  { name: "Banners", href: "/admin/homepage-banners", icon: Megaphone },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Blog", href: "/admin/blog", icon: FileText },
  { name: "Settings", href: "/admin/settings", icon: Settings },
  { name: "Profile", href: "/admin/profile", icon: UserCircle },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut({ callbackUrl: "/admin-login" });
    } catch {
      setIsLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <aside className="w-64 border-r border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/90 flex flex-col justify-between p-4 shrink-0 min-h-[calc(100vh-4rem)]">
        <div className="space-y-6">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-neutral-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-500">
              ADMIN MANAGEMENT
            </span>
          </div>

          <nav className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/admin"
                  ? pathname === "/admin"
                  : pathname.startsWith(item.href);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition-all ${
                    isActive
                      ? "bg-rose-600 text-white shadow-md shadow-rose-900/20"
                      : "text-neutral-600 dark:text-neutral-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? "text-white" : "text-neutral-500 dark:text-neutral-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t border-gray-200 dark:border-neutral-800">
          <button
            type="button"
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Confirm Logout"
        description="Are you sure you want to log out of the admin dashboard? You will need to sign in again to access the admin panel."
        confirmText="Log Out"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoggingOut}
        icon={<LogOut className="h-5 w-5" />}
      />
    </>
  );
}
