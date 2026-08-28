"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Send, Share2, Globe, MessageSquare, Video } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Thank you for subscribing to EvoSport updates!");
    setEmail("");
  };

  return (
    <footer className="bg-white dark:bg-[#060911] border-t border-gray-200/80 dark:border-slate-800 text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200 mt-auto">
      {/* Main Footer Links & Newsletter */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Newsletter (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <span className="text-2xl font-black uppercase tracking-tighter text-[#0F1B2D] dark:text-white">
                EVO<span className="text-[#0F1B2D] bg-[#B8FF00] px-1.5 py-0.5 rounded-md ml-0.5">SPORT</span>
              </span>
            </Link>
            <p className="text-xs text-[#0F1B2D]/60 dark:text-slate-400 max-w-sm leading-relaxed">
              Engineer your athletic potential with pro-grade apparel, endurance equipment, and performance sportswear built for athletes.
            </p>

            {/* Newsletter Form */}
            <div className="pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white mb-2">
                Join the EvoSport Club
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1 rounded-xl bg-[#F4F8FC] dark:bg-slate-900 border border-gray-200 dark:border-slate-800 px-3.5 py-2 text-xs text-[#0F1B2D] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#B8FF00]"
                />
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-[#B8FF00] px-4 py-2 text-xs font-black uppercase text-[#0F1B2D] hover:bg-[#a8ef00] transition-colors shadow-sm"
                >
                  <span>Subscribe</span>
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>
              <p className="text-[10px] text-[#0F1B2D]/40 dark:text-slate-500 mt-1.5">
                Subscribe for exclusive gear drops, athlete stories, and early sale access.
              </p>
            </div>
          </div>

          {/* Shop Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white">Shop</h4>
            <ul className="space-y-2 text-xs text-[#0F1B2D]/60 dark:text-slate-400 font-medium">
              <li><Link href="/shop" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">Shop All Gear</Link></li>
              <li><Link href="/shop?gender=MEN" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">Men&apos;s Sportswear</Link></li>
              <li><Link href="/shop?gender=WOMEN" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">Women&apos;s Sportswear</Link></li>
              <li><Link href="/shop?category=apparel-parent" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">Apparel & Tops</Link></li>
              <li><Link href="/shop?category=accessories-parent" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">Bags & Accessories</Link></li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white">Company</h4>
            <ul className="space-y-2 text-xs text-[#0F1B2D]/60 dark:text-slate-400 font-medium">
              <li><Link href="/blog" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">EvoSport Journal (Blog)</Link></li>
              <li><span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">About EvoSport (Coming Soon)</span></li>
              <li><span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">Careers & Team (Coming Soon)</span></li>
              <li><span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">Contact Support (Coming Soon)</span></li>
            </ul>
          </div>

          {/* Support & Account Column */}
          <div className="space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white">Customer Care</h4>
            <ul className="space-y-2 text-xs text-[#0F1B2D]/60 dark:text-slate-400 font-medium">
              <li><Link href="/dashboard/orders" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">Track Order Status</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">My Account</Link></li>
              <li><Link href="/wishlist" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">Saved Wishlist</Link></li>
              <li><span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">Shipping Policy (Coming Soon)</span></li>
              <li><span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">Returns & FAQ (Coming Soon)</span></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payment Badges Bar */}
      <div className="border-t border-gray-100 dark:border-slate-800/80 bg-[#F4F8FC]/40 dark:bg-[#090E17]/40 py-6">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#0F1B2D]/50 dark:text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} EvoSport, Inc. All rights reserved.</p>

          {/* Social Icons (Placeholders) */}
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors" title="Global Community">
              <Globe className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors" title="Social Feed">
              <Share2 className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors" title="Community Chat">
              <MessageSquare className="h-4 w-4" />
            </a>
            <a href="#" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors" title="Athlete Videos">
              <Video className="h-4 w-4" />
            </a>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-[#0F1B2D]/40 dark:text-slate-500">Secured By</span>
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-[#0F1B2D]/70 dark:text-slate-300">
              <span className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 shadow-2xs">VISA</span>
              <span className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 shadow-2xs">MC</span>
              <span className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 shadow-2xs">AMEX</span>
              <span className="rounded border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2 py-0.5 shadow-2xs">APPLE PAY</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
