import Link from "next/link";
import Image from "next/image";
import { Share2, Globe, MessageSquare, Video } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white dark:bg-[#060911] border-t border-gray-200/80 dark:border-slate-800 text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200 mt-auto">
      {/* Main Footer Links */}
      <div className="container mx-auto px-4 py-12 md:py-16 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 md:gap-12">
          {/* Brand Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2">
              <Image
                src="/images/evosport_logo_light.png"
                alt="EvoSport Logo"
                width={170}
                height={30}
                className="h-8 w-auto object-contain dark:hidden"
              />
              <Image
                src="/images/evosport_logo_dark.png"
                alt="EvoSport Logo"
                width={170}
                height={30}
                className="h-8 w-auto object-contain hidden dark:block"
              />
            </Link>
            <p className="text-sm md:text-base text-[#0F1B2D]/70 dark:text-slate-300 max-w-md leading-relaxed">
              Engineer your athletic potential with pro-grade apparel, endurance equipment, and performance sportswear built for athletes.
            </p>
          </div>

          {/* Shop Column */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white">
              Shop
            </h4>
            <ul className="space-y-3 text-sm text-[#0F1B2D]/70 dark:text-slate-300 font-medium">
              <li>
                <Link href="/shop" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  Shop All Gear
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=MEN" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  Men&apos;s Sportswear
                </Link>
              </li>
              <li>
                <Link href="/shop?gender=WOMEN" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  Women&apos;s Sportswear
                </Link>
              </li>
              <li>
                <Link href="/shop?category=apparel-parent" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  Apparel & Tops
                </Link>
              </li>
              <li>
                <Link href="/shop?category=accessories-parent" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  Bags & Accessories
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white">
              Company
            </h4>
            <ul className="space-y-3 text-sm text-[#0F1B2D]/70 dark:text-slate-300 font-medium">
              <li>
                <Link href="/blog" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  EvoSport Journal (Blog)
                </Link>
              </li>
              <li>
                <span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">
                  About EvoSport (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">
                  Careers & Team (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">
                  Contact Support (Coming Soon)
                </span>
              </li>
            </ul>
          </div>

          {/* Support & Account Column */}
          <div className="space-y-4">
            <h4 className="text-sm sm:text-base font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white">
              Customer Care
            </h4>
            <ul className="space-y-3 text-sm text-[#0F1B2D]/70 dark:text-slate-300 font-medium">
              <li>
                <Link href="/dashboard/orders" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  Track Order Status
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors">
                  Saved Wishlist
                </Link>
              </li>
              <li>
                <span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">
                  Shipping Policy (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-[#0F1B2D]/40 dark:text-slate-600 cursor-not-allowed">
                  Returns & FAQ (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Copyright & Payment Badges Bar */}
      <div className="border-t border-gray-100 dark:border-slate-800/80 bg-[#F4F8FC]/40 dark:bg-[#090E17]/40 py-6">
        <div className="container mx-auto px-4 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-[#0F1B2D]/60 dark:text-slate-400 font-medium">
          <p>© {new Date().getFullYear()} EvoSport, Inc. All rights reserved.</p>

          {/* Social Icons */}
          <div className="flex items-center gap-5">
            <a href="#" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-transform hover:scale-110" title="Global Community">
              <Globe className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-transform hover:scale-110" title="Social Feed">
              <Share2 className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-transform hover:scale-110" title="Community Chat">
              <MessageSquare className="h-5 w-5" />
            </a>
            <a href="#" className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-transform hover:scale-110" title="Athlete Videos">
              <Video className="h-5 w-5" />
            </a>
          </div>

          {/* Payment Method Badges */}
          <div className="flex items-center gap-2.5">
            <span className="text-xs uppercase font-bold text-[#0F1B2D]/50 dark:text-slate-400">Secured By</span>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase text-[#0F1B2D]/80 dark:text-slate-200">
              <span className="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 shadow-2xs">VISA</span>
              <span className="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 shadow-2xs">MC</span>
              <span className="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 shadow-2xs">AMEX</span>
              <span className="rounded-md border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1 shadow-2xs">APPLE PAY</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
