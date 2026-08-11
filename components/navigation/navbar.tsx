"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ShoppingBag, Heart, User, LogOut, Menu, X } from "lucide-react";
import { NotificationsDropdown } from "@/components/navigation/notifications-dropdown";
import { toast } from "sonner";

interface NavbarProps {
  cartItemCount?: number;
}

export function Navbar({ cartItemCount = 0 }: NavbarProps) {
  const { data: session } = useSession();
  const [itemCount, setItemCount] = useState(cartItemCount);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100"
          : "bg-white border-b border-gray-100"
      }`}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl font-black italic tracking-tighter text-[#0F1B2D]">
            EVO<span className="text-[#B8FF00]">SPORT</span>
          </span>
        </Link>

        {/* Center Nav Links - Desktop */}
        <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-[#0F1B2D]/70">
          <Link href="/shop" className="hover:text-[#0F1B2D] transition-colors py-1">
            Shop All
          </Link>
          <Link href="/shop?category=footwear" className="hover:text-[#0F1B2D] transition-colors py-1">
            Footwear
          </Link>
          <Link href="/shop?category=apparel" className="hover:text-[#0F1B2D] transition-colors py-1">
            Apparel
          </Link>
          <Link href="/shop?category=accessories" className="hover:text-[#0F1B2D] transition-colors py-1">
            Accessories
          </Link>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {/* Wishlist Icon */}
          <Link
            href="/wishlist"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#0F1B2D]/60 hover:bg-gray-100 hover:text-[#0F1B2D] transition-colors"
            title="Wishlist"
          >
            <Heart className="h-[18px] w-[18px]" />
          </Link>

          {/* Notifications Dropdown */}
          <NotificationsDropdown />

          {/* Cart Link with Badge */}
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full text-[#0F1B2D]/60 hover:bg-gray-100 hover:text-[#0F1B2D] transition-colors"
            title="Cart"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {itemCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#B8FF00] font-black text-[9px] text-[#0F1B2D]">
                {itemCount}
              </span>
            )}
          </Link>

          {/* User Account / Auth Control */}
          {session?.user ? (
            <div className="flex items-center gap-1.5">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0F1B2D] hover:border-[#B8FF00] hover:bg-[#B8FF00]/5 transition-colors"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B8FF00] text-[10px] font-black text-[#0F1B2D]">
                  {session.user.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <span className="hidden sm:inline">{session.user.name?.split(" ")[0]}</span>
              </Link>

              <button
                onClick={() => {
                  toast.success("You've been logged out");
                  signOut({ callbackUrl: "/login" });
                }}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[#0F1B2D]/40 hover:bg-rose-50 hover:text-rose-500 transition-colors"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-full bg-[#0F1B2D] px-5 py-2 text-xs font-bold uppercase text-white hover:bg-[#0F1B2D]/90 transition-colors ml-1"
            >
              <User className="h-3.5 w-3.5" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded-full text-[#0F1B2D]/60 hover:bg-gray-100 transition-colors ml-1"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="container mx-auto max-w-7xl px-4 py-4 space-y-1">
            {[
              { href: "/shop", label: "Shop All" },
              { href: "/shop?category=footwear", label: "Footwear" },
              { href: "/shop?category=apparel", label: "Apparel" },
              { href: "/shop?category=accessories", label: "Accessories" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-[#0F1B2D]/70 hover:bg-gray-50 hover:text-[#0F1B2D] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
