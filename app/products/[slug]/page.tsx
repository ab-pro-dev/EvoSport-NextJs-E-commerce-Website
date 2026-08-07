import { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductDetails } from "@/components/product/product-details";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductCard } from "@/components/shop/product-card";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!product) {
    return {
      title: "Product Not Found | EvoSport",
    };
  }

  return {
    title: `${product.name} | EvoSport`,
    description: product.description,
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

  const reviewStats = await prisma.review.aggregate({
    where: { productId: product.id, status: "APPROVED" },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = reviewStats._avg.rating ? Number(reviewStats._avg.rating.toFixed(1)) : 4.8;
  const reviewCount = reviewStats._count.rating || 12;

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

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Main Product Details Header & Interactivity */}
        <ProductDetails product={serializedProduct} />

        {/* Detailed Tabs Section */}
        <ProductTabs
          description={product.description}
          brandName={product.brand.name}
          categoryName={product.category.name}
        />

        {/* Related Products Section */}
        {serializedRelated.length > 0 && (
          <section className="mt-16 pt-12 border-t border-neutral-800">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold tracking-tight text-white">
                  YOU MAY ALSO <span className="text-lime-400">LIKE</span>
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Hand-picked gear from the {product.category.name} collection
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {serializedRelated.map((relProduct) => (
                <ProductCard key={relProduct.id} product={relProduct} />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
