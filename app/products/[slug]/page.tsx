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
    description: product.description,
    alternates: {
      canonical: `/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} | EvoSport`,
      description: product.description,
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

  // Real Related Products from Database (excluding current product)
  const rawRelated = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: "ACTIVE",
    },
    take: 4,
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

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
  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
  const inStock = totalStock > 0;
  const productImages = product.images.map((img) => img.url);

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
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
    <div className="min-h-screen bg-neutral-950 text-white">
      {/* Schema.org Product Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Product Details & Gallery */}
        <ProductDetails product={serializedProduct} />

        {/* Dynamic Product Tabs with Suspense Boundary */}
        <Suspense fallback={<div className="h-64 bg-neutral-900/50 animate-pulse rounded-xl my-8 border border-neutral-800" />}>
          <ProductTabs
            productId={product.id}
            slug={product.slug}
            description={product.description}
            brandName={product.brand.name}
            categoryName={product.category.name}
            reviewCount={serializedProduct.reviewCount}
            avgRating={serializedProduct.avgRating}
          />
        </Suspense>

        {/* Related Products Section with Suspense Boundary */}
        {serializedRelated.length > 0 && (
          <Suspense fallback={<div className="h-48 bg-neutral-900/50 animate-pulse rounded-xl mt-12 border border-neutral-800" />}>
            <section className="mt-16 pt-12 border-t border-neutral-800">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white uppercase">
                    YOU MAY ALSO <span className="text-[#CCFF00]">LIKE</span>
                  </h2>
                  <p className="text-xs text-neutral-400 mt-1">
                    Hand-picked gear from the {product.category.name} collection
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {serializedRelated.map((relProduct) => (
                  <ProductCard key={relProduct.id} product={relProduct} />
                ))}
              </div>
            </section>
          </Suspense>
        )}
      </main>
    </div>
  );
}
