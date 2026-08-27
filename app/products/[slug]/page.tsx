import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/product/product-details";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductCard } from "@/components/shop/product-card";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  if (!product) {
    return {
      title: "Product Not Found | EvoSport",
    };
  }

  const firstImageUrl = product.images?.[0]?.url;

  return {
    title: `${product.name} | EvoSport`,
    description: product.description || undefined,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | EvoSport`,
      description: product.description || undefined,
      images: firstImageUrl ? [{ url: firstImageUrl, alt: product.name }] : [],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  });

  if (!product || product.status !== "ACTIVE") {
    notFound();
  }

  // Real DB Aggregate Query over Review table
  const reviewStats = await prisma.review.aggregate({
    where: { productId: product.id, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = reviewStats._avg.rating ? Number(reviewStats._avg.rating.toFixed(1)) : 0;
  const reviewCount = reviewStats._count.rating || 0;

  // Real Related Products from Database using 4-tier relevance algorithm:
  // a. Same subcategory + same gender
  // b. Same subcategory + Unisex gender
  // c. Same main category + same gender
  // d. Same main category regardless of gender
  const mainCategoryId = product.category.parentId || product.categoryId;

  const [sameSubcatGender, discountBadgeSetting] = await Promise.all([
    prisma.product.findMany({
      where: {
        id: { not: product.id },
        status: "ACTIVE",
        categoryId: product.categoryId,
        gender: product.gender,
      },
      take: 4,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.setting.findUnique({ where: { key: "showDiscountBadge" } }),
  ]);

  let relatedList = [...sameSubcatGender];

  if (relatedList.length < 4 && product.gender !== "UNISEX") {
    const existingIds = [product.id, ...relatedList.map((p) => p.id)];
    const stepB = await prisma.product.findMany({
      where: {
        id: { notIn: existingIds },
        status: "ACTIVE",
        categoryId: product.categoryId,
        gender: "UNISEX",
      },
      take: 4 - relatedList.length,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });
    relatedList = [...relatedList, ...stepB];
  }

  if (relatedList.length < 4) {
    const existingIds = [product.id, ...relatedList.map((p) => p.id)];
    const stepC = await prisma.product.findMany({
      where: {
        id: { notIn: existingIds },
        status: "ACTIVE",
        gender: product.gender,
        category: {
          OR: [
            { id: mainCategoryId },
            { parentId: mainCategoryId },
          ],
        },
      },
      take: 4 - relatedList.length,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });
    relatedList = [...relatedList, ...stepC];
  }

  if (relatedList.length < 4) {
    const existingIds = [product.id, ...relatedList.map((p) => p.id)];
    const stepD = await prisma.product.findMany({
      where: {
        id: { notIn: existingIds },
        status: "ACTIVE",
        category: {
          OR: [
            { id: mainCategoryId },
            { parentId: mainCategoryId },
          ],
        },
      },
      take: 4 - relatedList.length,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });
    relatedList = [...relatedList, ...stepD];
  }

  const rawRelated = relatedList;

  const showDiscountBadge = discountBadgeSetting?.value === "true";

  const serializedProduct = {
    ...product,
    basePrice: Number(product.basePrice),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    avgRating,
    reviewCount,
    variants: product.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
    })),
  };

  const serializedRelated = rawRelated.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    variants: p.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
    })),
  }));

  // JSON-LD Structured Data Schema.org/Product
  const hasUnlimited = product.variants.some((v) => v.stock === null);
  const totalStock = product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
  const inStock = hasUnlimited || totalStock > 0;
  const productImages = product.images.map((img) => img.url);

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: productImages.length > 0 ? productImages : undefined,
    offers: {
      "@type": "Offer",
      price: Number(product.basePrice),
      priceCurrency: "USD",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  if (reviewCount > 0) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: avgRating,
      reviewCount: reviewCount,
    };
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl space-y-12">
        {/* Main Product Info Section */}
        <ProductDetails product={serializedProduct} />

        {/* Product Details Tabs (Reviews, Specs, Shipping) */}
        <ProductTabs
          productId={product.id}
          slug={product.slug}
          description={product.description}
          brandName={product.brand?.name || null}
          categoryName={product.category.name}
          reviewCount={serializedProduct.reviewCount}
          avgRating={serializedProduct.avgRating}
        />

        {/* Related Products Grid */}
        {serializedRelated.length > 0 && (
          <Suspense fallback={<div className="h-64 rounded-2xl bg-gray-100 dark:bg-slate-900 animate-pulse" />}>
            <section className="pt-8 border-t border-gray-200 dark:border-slate-800">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
                    Related <span className="text-[#5B8DEF] dark:text-[#B8FF00]">Products</span>
                  </h2>
                  <p className="text-xs text-[#0F1B2D]/50 dark:text-slate-400 mt-1">
                    Hand-picked gear from the {product.category.name} collection
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {serializedRelated.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} showDiscountBadge={showDiscountBadge} />
                ))}
              </div>
            </section>
          </Suspense>
        )}
      </main>
    </div>
  );
}
