import { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Flame, ShoppingBag } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navigation/navbar";
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
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-gray-200 bg-gradient-to-b from-[#E8F5E9] via-[#F4F8FC] to-white py-20 lg:py-32">
        {/* Glow Accent Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-[#5B8DEF]/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 max-w-7xl relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#B8FF00] bg-[#B8FF00] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#0F1B2D]">
            <Flame className="h-4 w-4" />
            <span>NEW 2026 PRO COLLECTION RELEASED</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tighter text-[#0F1B2D] max-w-4xl mx-auto leading-none">
            ENGINEER YOUR <span className="text-[#B8FF00] italic">LIMITLESS</span> POTENTIAL
          </h1>

          <p className="text-xs sm:text-sm text-[#0F1B2D]/50 max-w-2xl mx-auto leading-relaxed">
            Discover precision carbon running shoes, thermal compression apparel, and endurance hydration systems designed for professional athletes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/shop">
              <button className="flex items-center gap-2 rounded-lg bg-[#B8FF00] px-8 py-4 text-xs font-black uppercase tracking-wider text-[#0F1B2D] hover:bg-[#a8ef00] transition-colors shadow-lg shadow-[#B8FF00]/20">
                <ShoppingBag className="h-4 w-4" />
                EXPLORE ALL GEAR
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>

            <Link href="/shop?category=footwear">
              <button className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-8 py-4 text-xs font-bold uppercase tracking-wider text-[#0F1B2D] hover:border-[#B8FF00] hover:bg-gray-50 transition-colors">
                FOOTWEAR COLLECTION
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-16 container mx-auto px-4 max-w-7xl space-y-8">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D]">
                FEATURED <span className="text-[#B8FF00]">GEAR</span>
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
