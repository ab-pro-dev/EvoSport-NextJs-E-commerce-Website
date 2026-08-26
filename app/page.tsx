import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/shop/product-card";
import { HeroBannerCarousel, HomepageBannerData } from "@/components/home/hero-banner-carousel";

export const metadata: Metadata = {
  title: "EvoSport | High-Performance Athletic Apparel & Gear",
  description: "Engineer your athletic potential with pro-grade footwear, apparel, and endurance equipment.",
};

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const now = new Date();

  // Fetch real active and scheduled banners
  const rawBanners = await prisma.homepageBanner.findMany({
    where: {
      active: true,
      AND: [
        {
          OR: [
            { startsAt: null },
            { startsAt: { lte: now } },
          ],
        },
        {
          OR: [
            { endsAt: null },
            { endsAt: { gte: now } },
          ],
        },
      ],
    },
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const banners: HomepageBannerData[] = rawBanners.map((b) => ({
    id: b.id,
    headline: b.headline,
    subtext: b.subtext,
    badgeText: b.badgeText,
    ctaText: b.ctaText,
    ctaLink: b.ctaLink,
    backgroundImageUrl: b.backgroundImageUrl,
    backgroundBlur: b.backgroundBlur ?? 0,
    lightModeOverlayOpacity: b.lightModeOverlayOpacity ?? 80,
    darkModeOverlayOpacity: b.darkModeOverlayOpacity ?? 85,
    order: b.order,
  }));

  // Fetch real featured products and settings from DB
  const [rawProducts, discountBadgeSetting] = await Promise.all([
    prisma.product.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
        reviews: { select: { rating: true } },
      },
    }),
    prisma.setting.findUnique({ where: { key: "showDiscountBadge" } }),
  ]);

  const showDiscountBadge = discountBadgeSetting?.value === "true";

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
      brand: p.brand ? { name: p.brand.name } : null,
      category: p.category ? { name: p.category.name } : null,
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
      {/* Dynamic Hero Section from Real HomepageBanner Database Records */}
      <HeroBannerCarousel banners={banners} />

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
              <ProductCard key={product.id} product={product} showDiscountBadge={showDiscountBadge} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
