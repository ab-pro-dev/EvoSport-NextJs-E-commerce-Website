import { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { ShopFilters } from "@/components/shop/shop-filters";
import { ProductCard } from "@/components/shop/product-card";
import { ShopPagination } from "@/components/shop/shop-pagination";

interface ShopPageProps {
  searchParams: Promise<{
    gender?: string;
    category?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    search?: string;
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const genderSlug = resolvedParams.gender || "";
  const categorySlug = resolvedParams.category || "";
  const brandSlug = resolvedParams.brand || "";
  const search = resolvedParams.search || "";

  let title = "Shop All Sportswear & Equipment | EvoSport";
  if (genderSlug && categorySlug) {
    title = `${genderSlug.toUpperCase()} ${categorySlug.toUpperCase()} | EvoSport`;
  } else if (genderSlug) {
    title = `${genderSlug.charAt(0).toUpperCase() + genderSlug.slice(1)}'s Sportswear & Gear | EvoSport`;
  } else if (categorySlug) {
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

  const genderSlug = resolvedParams.gender || "";
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

  if (genderSlug && genderSlug !== "all") {
    const genderUpper = genderSlug.toUpperCase();
    if (["MEN", "WOMEN", "KIDS", "UNISEX"].includes(genderUpper)) {
      where.gender = genderUpper as any;
    }
  }

  if (categorySlug && categorySlug !== "all") {
    where.category = {
      OR: [
        { id: categorySlug },
        { slug: categorySlug },
        { parent: { slug: categorySlug } },
        { parent: { id: categorySlug } },
      ],
    };
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

  const [rawProducts, rawCategories, totalCount, brands, discountBadgeSetting] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        brand: true,
        category: {
          include: {
            parent: true,
          },
        },
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
    }),
    prisma.category.findMany({
      where: {
        parentId: null,
        slug: {
          in: [
            "footwear",
            "apparel-parent",
            "jerseys-teamwear",
            "gym-training",
            "bags",
            "hydration",
            "accessories-parent",
          ],
        },
      },
      include: {
        children: {
          orderBy: { name: "asc" },
        },
      },
    }),
    prisma.product.count({ where }),
    prisma.brand.findMany({ orderBy: { name: "asc" } }),
    prisma.setting.findUnique({ where: { key: "showDiscountBadge" } }),
  ]);

  const showDiscountBadge = discountBadgeSetting?.value === "true";

  const parentOrder = [
    "footwear",
    "apparel-parent",
    "jerseys-teamwear",
    "gym-training",
    "bags",
    "hydration",
    "accessories-parent",
  ];

  const categories = rawCategories
    .sort((a, b) => parentOrder.indexOf(a.slug) - parentOrder.indexOf(b.slug))
    .map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      children: c.children.map((ch) => ({
        id: ch.id,
        name: ch.name,
        slug: ch.slug,
      })),
    }));

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
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200">
      {/* Hero Banner with Athlete Action Image and Soft Gradient Blend */}
      <section className="relative overflow-hidden border-b border-gray-200/80 dark:border-slate-800/80 bg-gradient-to-r from-[#F4F8FC] via-[#EEF8F1] to-[#E9F4FE] dark:from-[#090E17] dark:via-[#0D1B2A] dark:to-[#0B1524]">
        {/* Abstract Ambient Gradients & Geometric Glow */}
        <div className="absolute -left-16 -top-16 h-72 w-72 rounded-full bg-[#B8FF00]/15 dark:bg-[#B8FF00]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 h-64 w-64 rounded-full bg-[#5B8DEF]/15 dark:bg-[#5B8DEF]/10 blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-0 h-80 w-80 rounded-full bg-[#B8FF00]/10 dark:bg-[#B8FF00]/5 blur-2xl pointer-events-none" />

        {/* Decorative Graphic Speed Lines */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 pointer-events-none opacity-25 hidden md:block">
          <div className="absolute -right-8 top-6 h-1 w-64 rotate-[-22deg] bg-gradient-to-r from-transparent via-[#B8FF00] to-[#5B8DEF]" />
          <div className="absolute right-24 top-20 h-0.5 w-48 rotate-[-22deg] bg-gradient-to-r from-transparent via-[#5B8DEF] to-[#B8FF00]" />
          <div className="absolute right-6 bottom-10 h-1.5 w-80 rotate-[-22deg] bg-gradient-to-r from-transparent via-[#B8FF00] to-transparent" />
        </div>

        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between min-h-[180px] sm:min-h-[220px] md:min-h-[240px] py-4 md:py-0">
            {/* Left Content */}
            <div className="w-full md:w-1/2 py-6 md:py-10 z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#0F1B2D] dark:text-white uppercase font-sans">
                {genderSlug ? `${genderSlug.toUpperCase()} SHOP` : "Shop"}
              </h1>
              <p className="mt-2 text-xs sm:text-sm md:text-base text-[#0F1B2D]/60 dark:text-slate-400 max-w-md font-medium leading-relaxed">
                Find the best sportswear & equipment for every move.
              </p>
            </div>

            {/* Right Athlete Image with Soft Edge Blend */}
            <div className="relative w-full md:w-1/2 h-44 sm:h-52 md:h-60 lg:h-64 flex items-center justify-end overflow-hidden md:overflow-visible">
              <div className="relative w-full h-full max-w-lg">
                <Image
                  src="/images/shop_runner_hero.jpg"
                  alt="High-performance athlete running in motion"
                  fill
                  priority
                  className="object-cover object-center md:object-right select-none [mask-image:linear-gradient(to_left,black_70%,transparent_100%)]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Shop Container */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Filter Sidebar */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<div className="h-96 bg-white dark:bg-slate-900 animate-pulse rounded-xl border border-gray-200 dark:border-slate-800" />}>
              <ShopFilters
                categories={categories}
                brands={brands}
                selectedGender={genderSlug}
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
            {/* Top Bar */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-3.5 shadow-sm text-xs text-[#0F1B2D]/60 dark:text-slate-400">
              <div>
                Showing <strong className="text-[#0F1B2D] dark:text-white">{products.length > 0 ? "1-" + products.length : "0"}</strong> of{" "}
                <strong className="text-[#0F1B2D] dark:text-white">{totalCount}</strong> results
              </div>
              <div className="flex items-center gap-4">
                <span className="font-medium text-[#0F1B2D]/60 dark:text-slate-400">Sort by: <strong className="text-[#0F1B2D] dark:text-white">Featured</strong></span>
                <span className="font-medium text-[#0F1B2D]/60 dark:text-slate-400">Show: <strong className="text-[#0F1B2D] dark:text-white">8</strong></span>
              </div>
            </div>

            {/* Product Grid - 4 Column Layout */}
            {products.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} showDiscountBadge={showDiscountBadge} />
                ))}
              </div>
            ) : (
              <div className="flex min-h-[40vh] flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 dark:border-slate-800 p-12 text-center bg-white dark:bg-[#0F172A] shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#F4F8FC] dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[#0F1B2D]/40 dark:text-slate-500 mb-4">
                  <Image
                    src="/images/shop_runner_hero.jpg"
                    alt="Empty"
                    width={40}
                    height={40}
                    className="rounded-full object-cover opacity-50 grayscale"
                  />
                </div>
                <h3 className="text-base font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">No products found</h3>
                <p className="mt-1.5 text-xs text-[#0F1B2D]/50 dark:text-slate-400 max-w-sm">
                  We don&apos;t have any products matching your selected filters right now. New gear is arriving soon!
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
