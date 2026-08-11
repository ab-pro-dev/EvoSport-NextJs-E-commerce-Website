import { Metadata } from "next";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ProductCard } from "@/components/shop/product-card";
import { ShopPagination } from "@/components/shop/shop-pagination";

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category || "";
  const brandSlug = resolvedParams.brand || "";
  const search = resolvedParams.search || "";

  let title = "Shop All Sportswear & Equipment | EvoSport";
  if (categorySlug) {
    const category = await prisma.category.findUnique({ where: { slug: categorySlug } });
    if (category) title = `${category.name} Sportswear & Gear | EvoSport`;
  } else if (brandSlug) {
    const brand = await prisma.brand.findUnique({ where: { slug: brandSlug } });
    if (brand) title = `${brand.name} Athletic Gear | EvoSport`;
  } else if (search) {
    title = `Search results for "${search}" | EvoSport`;
  }

  return {
    title,
    description: "Browse EvoSport's collection of high-performance sportswear, marathon running footwear, and endurance gear.",
    alternates: {
      canonical: "/shop",
    },
  };
}

export const dynamic = "force-dynamic";

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const resolvedParams = await searchParams;

  const categorySlug = resolvedParams.category || "";
  const brandSlug = resolvedParams.brand || "";
  const minPrice = resolvedParams.minPrice ? parseFloat(resolvedParams.minPrice) : undefined;
  const maxPrice = resolvedParams.maxPrice ? parseFloat(resolvedParams.maxPrice) : undefined;
  const sort = resolvedParams.sort || "newest";
  const search = resolvedParams.search || "";
  const currentPage = Math.max(1, parseInt(resolvedParams.page || "1", 10));
  const limit = 8;
  const skip = (currentPage - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    status: "ACTIVE",
  };

  if (categorySlug) {
    where.category = { slug: categorySlug };
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.basePrice = {};
    if (minPrice !== undefined) where.basePrice.gte = minPrice;
    if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
  }

  let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };
  if (sort === "price_asc") {
    orderBy = { basePrice: "asc" };
  } else if (sort === "price_desc") {
    orderBy = { basePrice: "desc" };
  }

  const rawProducts = await prisma.product.findMany({
    where,
    orderBy,
    skip,
    take: limit,
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: "asc" } },
      variants: true,
    },
  });

  const totalCount = await prisma.product.count({ where });
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" } });

  const products = rawProducts.map((p) => ({
    ...p,
    basePrice: Number(p.basePrice),
    compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
    variants: p.variants.map((v) => ({
      ...v,
      price: v.price ? Number(v.price) : null,
    })),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#0F1B2D]">
      {/* Header Panel */}
      <section className="relative border-b border-gray-200 bg-gradient-to-r from-[#B8FF00]/20 via-[#5B8DEF]/10 to-[#F4F8FC] py-8 backdrop-blur-sm">
        <div className="container mx-auto px-4 max-w-7xl">
          <h1 className="text-3xl font-black tracking-tight text-[#0F1B2D] uppercase">
            Shop
          </h1>
          <p className="mt-1 text-xs text-[#0F1B2D]/50">
            Find the best sportswear & equipment for every move.
          </p>
        </div>
      </section>

      {/* Main Shop Container */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<div className="h-96 bg-white animate-pulse rounded-xl border border-gray-200" />}>
              <ShopFilters
                categories={categories}
                brands={brands}
                selectedCategory={categorySlug}
                selectedBrand={brandSlug}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sort={sort}
                search={search}
              />
            </Suspense>
          </aside>

          {/* Product Grid & Top Bar */}
          <section className="lg:col-span-3">
            {/* Top Bar matching mockup */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 bg-white p-3.5 shadow-sm text-xs text-[#0F1B2D]/60">
              <div>
                Showing <strong className="text-[#0F1B2D]">1-{products.length}</strong> of{" "}
                <strong className="text-[#0F1B2D]">{totalCount}</strong> results
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-[#0F1B2D]/60">Sort by: <strong className="text-[#0F1B2D]">Featured</strong></span>
                <span className="font-medium text-[#0F1B2D]/60">Show: <strong className="text-[#0F1B2D]">12</strong></span>
              </div>
            </div>

            {/* Product Grid - 4 Column Layout */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 p-12 text-center bg-white">
                <h3 className="text-sm font-bold text-[#0F1B2D]">No products found</h3>
                <p className="mt-1 text-xs text-[#0F1B2D]/50">
                  Try clearing your filters or searching for another term.
                </p>
              </div>
            )}

            {/* Pagination */}
            <ShopPagination currentPage={currentPage} totalPages={totalPages} />
          </section>
        </div>
      </main>
    </div>
  );
}
