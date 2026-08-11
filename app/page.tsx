import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Flame, ShoppingBag, Zap, ShieldCheck } from "lucide-react";
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
    <div className="min-h-screen bg-[#F4F8FC] text-[#0F1B2D] selection:bg-[#B8FF00] selection:text-[#0F1B2D]">
      {/* Hero Section with Action Athlete & Dynamic Gradient */}
      <section className="relative overflow-hidden border-b border-gray-200/80 bg-gradient-to-b from-[#EEF8F1] via-[#F4F8FC] to-white py-12 lg:py-20">
        {/* Soft Ambient Gradients & Glow Circles */}
        <div className="absolute top-1/4 left-10 h-96 w-96 rounded-full bg-[#B8FF00]/15 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-10 h-96 w-96 rounded-full bg-[#5B8DEF]/15 blur-3xl pointer-events-none" />

        {/* Decorative Speed Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-20 hidden lg:block">
          <div className="absolute right-10 top-12 h-1 w-96 rotate-[-20deg] bg-gradient-to-r from-transparent via-[#B8FF00] to-[#5B8DEF]" />
          <div className="absolute right-32 top-36 h-0.5 w-64 rotate-[-20deg] bg-gradient-to-r from-transparent via-[#5B8DEF] to-[#B8FF00]" />
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B8FF00] bg-[#B8FF00]/20 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#0F1B2D]">
                <Flame className="h-4 w-4 text-[#0F1B2D]" />
                <span>NEW 2026 PRO COLLECTION RELEASED</span>
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-6xl xl:text-7xl font-black uppercase tracking-tight text-[#0F1B2D] leading-[0.95]">
                ENGINEER YOUR <span className="text-[#0F1B2D] inline-block underline decoration-[#B8FF00] decoration-8 underline-offset-4">LIMITLESS</span> POTENTIAL
              </h1>

              <p className="text-sm sm:text-base text-[#0F1B2D]/60 max-w-xl leading-relaxed font-medium">
                Discover precision carbon running shoes, thermal compression apparel, and endurance hydration systems designed for professional athletes.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <Link href="/shop">
                  <button className="flex items-center justify-center gap-2 rounded-xl bg-[#B8FF00] px-8 py-4 text-xs font-black uppercase tracking-wider text-[#0F1B2D] hover:bg-[#a8ef00] transition-all shadow-lg shadow-[#B8FF00]/25 hover:shadow-xl hover:-translate-y-0.5">
                    <ShoppingBag className="h-4 w-4" />
                    EXPLORE ALL GEAR
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>

                <Link href="/shop?category=footwear">
                  <button className="flex items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#0F1B2D] hover:border-[#B8FF00] hover:bg-gray-50 transition-all shadow-sm">
                    FOOTWEAR COLLECTION
                  </button>
                </Link>
              </div>

              {/* Trust Micro-Badges */}
              <div className="pt-4 flex items-center gap-6 text-xs text-[#0F1B2D]/50 border-t border-gray-200/80">
                <div className="flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-[#5B8DEF]" />
                  <span>Pro-Grade Tested</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Official Warranty</span>
                </div>
              </div>
            </div>

            {/* Right Athlete Action Visual */}
            <div className="lg:col-span-5 relative">
              <div className="relative h-64 sm:h-80 lg:h-96 w-full rounded-2xl overflow-hidden shadow-xl bg-gradient-to-tr from-[#EEF8F1] via-white to-[#E9F4FE] border border-gray-200">
                <Image
                  src="/images/shop_runner_hero.jpg"
                  alt="Athlete in sprint motion"
                  fill
                  priority
                  className="object-cover object-center select-none [mask-image:linear-gradient(to_left,black_80%,transparent_100%)]"
                />
                {/* Floating Tag */}
                <div className="absolute bottom-4 left-4 rounded-xl bg-white/90 backdrop-blur-md border border-gray-200 p-3 shadow-lg flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#B8FF00] text-[#0F1B2D] font-black text-xs">
                    EVO
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#0F1B2D]">SPEED FORM 2026</div>
                    <div className="text-[10px] text-[#0F1B2D]/50 font-medium">Carbon Kinetic Power</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-16 container mx-auto px-4 max-w-7xl space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D]">
                FEATURED <span className="text-[#0F1B2D] bg-[#B8FF00] px-2 py-0.5 rounded-lg">GEAR</span>
              </h2>
              <p className="text-xs text-[#0F1B2D]/50 mt-0.5">Top-tier athletic performance equipment</p>
            </div>

            <Link href="/shop" className="text-xs font-bold text-[#5B8DEF] hover:underline flex items-center gap-1">
              <span>View All Shop</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
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
