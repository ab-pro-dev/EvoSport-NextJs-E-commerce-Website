"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Heart, User, Search, LogOut } from "lucide-react";
import { NotificationsDropdown } from "@/components/navigation/notifications-dropdown";
import { toast } from "sonner";

interface NavbarProps {
  cartItemCount?: number;
}

export function Navbar({ cartItemCount = 0 }: NavbarProps) {
  const { data: session } = useSession();
  const [itemCount, setItemCount] = useState(cartItemCount);

  const fetchCartCount = useCallback(async () => {
    try {
      const res = await fetch("/api/cart");
      if (res.ok) {
        const data = await res.json();
        const total = data.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;
        setItemCount(total);
      }
    } catch (e) {
      console.error("Failed to fetch cart count:", e);
    }
  }, []);

  useEffect(() => {
    fetchCartCount();

    const handleUpdate = () => fetchCartCount();
    window.addEventListener("cart-updated", handleUpdate);
    return () => window.removeEventListener("cart-updated", handleUpdate);
  }, [fetchCartCount]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black italic tracking-tighter text-white">
            EVO<span className="text-[#CCFF00]">SPORT</span>
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-300">
          <Link href="/shop" className="hover:text-[#CCFF00] transition-colors">
            Shop All
          </Link>
          <Link href="/shop?category=footwear" className="hover:text-[#CCFF00] transition-colors">
            Footwear
          </Link>
          <Link href="/shop?category=apparel" className="hover:text-[#CCFF00] transition-colors">
            Apparel
          </Link>
          <Link href="/shop?category=accessories" className="hover:text-[#CCFF00] transition-colors">
            Accessories
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-3">
          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
            title="Wishlist"
          >
            <Heart className="h-4 w-4" />
          </Link>

          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* Cart Link with Badge */}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-neutral-700 hover:text-white transition-colors"
            title="Cart"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#CCFF00] font-black text-[9px] text-black">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account / Auth Control */}
          {session?.user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-1.5 text-xs font-bold text-white hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#CCFF00] text-[10px] font-black text-black">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline">{session.user.name?.split(" ")[0]}</span>
              </Link>

              <button
                onClick={() => {
                  toast.success("You've been logged out");
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-rose-800 hover:text-rose-400 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-[#CCFF00] px-4 py-2 text-xs font-black uppercase text-black hover:bg-[#b8e600] transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
