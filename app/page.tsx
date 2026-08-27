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

  // Fetch discount badge setting
  const discountBadgeSetting = await prisma.setting.findUnique({ where: { key: "showDiscountBadge" } });
  const showDiscountBadge = discountBadgeSetting?.value === "true";

  // 1. Fetch Real Featured Gear (status: ACTIVE & isFeatured: true)
  let rawFeatured = await prisma.product.findMany({
    where: { status: "ACTIVE", isFeatured: true },
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

  // Fallback if fewer than 4 items are marked featured
  if (rawFeatured.length < 4) {
    const existingIds = rawFeatured.map((p) => p.id);
    const fallbackFeatured = await prisma.product.findMany({
      where: { status: "ACTIVE", id: { notIn: existingIds } },
      take: 4 - rawFeatured.length,
      orderBy: { createdAt: "desc" },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
        reviews: { select: { rating: true } },
      },
    });
    rawFeatured = [...rawFeatured, ...fallbackFeatured];
  }

  // 2. Fetch Real Best Sellers from OrderItem quantity aggregations
  const orderItemsGrouped = await prisma.orderItem.groupBy({
    by: ["variantId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
  });

  let bestSellerProductIds: string[] = [];
  if (orderItemsGrouped.length > 0) {
    const variantIds = orderItemsGrouped.map((item) => item.variantId);
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: { id: true, productId: true },
    });
    const variantToProductMap = new Map(variants.map((v) => [v.id, v.productId]));

    const productSalesMap = new Map<string, number>();
    for (const item of orderItemsGrouped) {
      const pId = variantToProductMap.get(item.variantId);
      if (pId) {
        const currentSales = productSalesMap.get(pId) || 0;
        productSalesMap.set(pId, currentSales + (item._sum.quantity || 0));
      }
    }

    bestSellerProductIds = Array.from(productSalesMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);
  }

  let rawBestSellers = await prisma.product.findMany({
    where: { status: "ACTIVE", id: { in: bestSellerProductIds } },
    take: 4,
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
      reviews: { select: { rating: true } },
    },
  });

  rawBestSellers.sort((a, b) => bestSellerProductIds.indexOf(a.id) - bestSellerProductIds.indexOf(b.id));

  // Fallback if fewer than 4 products have real order sales
  if (rawBestSellers.length < 4) {
    const existingIds = rawBestSellers.map((p) => p.id);
    const fallbackBestSellers = await prisma.product.findMany({
      where: { status: "ACTIVE", id: { notIn: existingIds } },
      take: 4 - rawBestSellers.length,
      orderBy: { reviews: { _count: "desc" } },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
        reviews: { select: { rating: true } },
      },
    });
    rawBestSellers = [...rawBestSellers, ...fallbackBestSellers];
  }

  const mapProductToCard = (p: typeof rawFeatured[number]) => {
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
  };

  const featuredProducts = rawFeatured.map(mapProductToCard);
  const bestSellerProducts = rawBestSellers.map(mapProductToCard);

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Dynamic Hero Section from Real HomepageBanner Database Records */}
      <HeroBannerCarousel banners={banners} />

      {/* Featured Products Grid */}
      {featuredProducts.length > 0 && (
        <section className="py-12 sm:py-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
          <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
              FEATURED <span className="text-[#0F1B2D] bg-[#B8FF00] px-2 py-0.5 rounded-lg ml-1">GEAR</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#0F1B2D]/60 dark:text-slate-400 mt-1">
              Top-tier athletic performance equipment selected for pro performance
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} showDiscountBadge={showDiscountBadge} />
            ))}
          </div>
        </section>
      )}

      {/* Best Sellers Grid */}
      {bestSellerProducts.length > 0 && (
        <section className="py-12 sm:py-16 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl space-y-8">
          <div className="border-b border-gray-200 dark:border-slate-800 pb-4">
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
              BEST <span className="text-[#0F1B2D] bg-[#B8FF00] px-2 py-0.5 rounded-lg ml-1">SELLERS</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#0F1B2D]/60 dark:text-slate-400 mt-1">
              Most popular athletic gear ranked by real customer purchases
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {bestSellerProducts.map((product) => (
              <ProductCard key={product.id} product={product} showDiscountBadge={showDiscountBadge} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
