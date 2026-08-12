import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";

export const metadata: Metadata = {
  title: "EvoSport | High-Performance Athletic Apparel & Gear",
  description: "Engineer your athletic potential with pro-grade footwear, apparel, and endurance equipment.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  // Fetch real featured products from DB
  const rawProducts = await prisma.product.findMany({
    take: 4,
    orderBy: { createdAt: "desc" },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
      reviews: { select: { rating: true } },
    },
  });

  const featuredProducts = rawProducts.map((p) => {
    const reviewCount = p.reviews.length;
    const avgRating =
      reviewCount > 0
        ? Number((p.reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description || "",
      basePrice: Number(p.basePrice),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      brand: { name: p.brand.name },
      category: { name: p.category.name },
      images: p.images.map((img) => ({ url: img.url, altText: img.altText })),
      reviewCount,
      avgRating,
      variants: p.variants.map((v) => ({
        color: v.color,
      })),
    };
  });

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Full-Height Hero Section with Balanced 2-Line Headline */}
      <section className="relative overflow-hidden border-b border-gray-200/80 dark:border-slate-800/80 bg-gradient-to-b from-[#EEF8F1] via-[#F4F8FC] to-white dark:from-[#0B182B] dark:via-[#090E17] dark:to-[#090E17] min-h-[calc(100vh-4rem)] flex items-center py-10 sm:py-14">
        {/* Soft Ambient Gradients & Glow Circles */}
        <div className="absolute top-1/4 left-10 h-80 w-80 rounded-full bg-[#B8FF00]/15 dark:bg-[#B8FF00]/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-80 w-80 rounded-full bg-[#5B8DEF]/15 dark:bg-[#5B8DEF]/10 blur-3xl pointer-events-none" />

        {/* Decorative Speed Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20 hidden lg:block">
          <div className="absolute right-10 top-12 h-1 w-96 rotate-[-20deg] bg-gradient-to-r from-transparent via-[#B8FF00] to-[#5B8DEF]" />
          <div className="absolute right-32 top-36 h-0.5 w-64 rotate-[-20deg] bg-gradient-to-r from-transparent via-[#5B8DEF] to-[#B8FF00]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10 text-left">
          <div className="max-w-5xl space-y-4 sm:space-y-5">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#B8FF00] bg-[#B8FF00]/20 dark:bg-[#B8FF00]/15 px-3.5 py-1 text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#0F1B2D] dark:text-[#B8FF00]">
              <Flame className="h-3.5 w-3.5 text-[#0F1B2D] dark:text-[#B8FF00]" />
              <span>NEW 2026 PRO COLLECTION RELEASED</span>
            </div>

            {/* 2-Line Natural Wrapping Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4.25rem] font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white leading-[1.08] sm:leading-[1.04]">
              <span className="block md:whitespace-nowrap">
                ENGINEER YOUR{" "}
                <span className="inline-block underline decoration-[#B8FF00] decoration-4 sm:decoration-6 underline-offset-4 sm:underline-offset-6">
                  LIMITLESS
                </span>
              </span>
              <span className="block">POTENTIAL</span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base md:text-lg text-[#0F1B2D]/75 dark:text-slate-300 max-w-2xl leading-relaxed font-medium">
              Discover precision carbon running shoes, thermal compression apparel, and endurance hydration systems designed for professional athletes.
            </p>

            {/* CTA Button */}
            <div className="pt-2">
              <Link href="/shop">
                <button className="inline-flex items-center justify-center gap-2.5 rounded-xl bg-[#B8FF00] px-7 sm:px-9 py-3.5 sm:py-4 text-xs sm:text-sm font-black uppercase tracking-wider text-[#0F1B2D] hover:bg-[#a8ef00] transition-all shadow-lg shadow-[#B8FF00]/25 hover:shadow-xl hover:-translate-y-0.5 cursor-pointer">
                  <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span>EXPLORE ALL GEAR</span>
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid (Below the Fold) */}
      {featuredProducts.length > 0 && (
        <section className="py-16 sm:py-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
          <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
              FEATURED <span className="text-[#0F1B2D] bg-[#B8FF00] px-2 py-0.5 rounded-lg">GEAR</span>
            </h2>
            <p className="text-xs text-[#0F1B2D]/50 dark:text-slate-400 mt-0.5">Top-tier athletic performance equipment</p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
