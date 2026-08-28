"use client";

import { useState } from "react";
import Image from "next/image";
import { SlidersHorizontal } from "lucide-react";
import { ShopFilters, CategoryTreeItem } from "@/components/shop/shop-filters";
import { ProductCard } from "@/components/shop/product-card";
import { ShopPagination } from "@/components/shop/shop-pagination";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

interface ShopLayoutViewProps {
  categories: CategoryTreeItem[];
  products: any[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  showDiscountBadge: boolean;
  genderSlug: string;
  categorySlug: string;
  brandSlug: string;
  minPrice?: number;
  maxPrice?: number;
  sort: string;
  search: string;
}

export function ShopLayoutView({
  categories,
  products,
  totalCount,
  totalPages,
  currentPage,
  showDiscountBadge,
  genderSlug,
  categorySlug,
  brandSlug,
  minPrice,
  maxPrice,
  sort,
  search,
}: ShopLayoutViewProps) {
  // Desktop collapse state (default expanded)
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Mobile drawer open state
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Check how many filters are active for mobile badge
  const activeFilterCount = [
    genderSlug,
    categorySlug,
    brandSlug,
    minPrice !== undefined,
    maxPrice !== undefined,
    search,
  ].filter(Boolean).length;

  return (
    <div className="w-full">
      {/* Mobile-Only Filter Bar Button (< lg) */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-xl border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] text-xs font-bold text-[#0F1B2D] dark:text-white shadow-sm h-10 px-4"
            >
              <SlidersHorizontal className="h-4 w-4 text-[#B8FF00]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#B8FF00] text-[10px] font-black text-[#0F1B2D]">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[85vw] max-w-sm p-0 overflow-y-auto bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-slate-800"
          >
            <SheetHeader className="p-4 pb-0 text-left border-b border-gray-100 dark:border-slate-800">
              <SheetTitle className="text-sm font-black uppercase tracking-wider text-[#0F1B2D] dark:text-white flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#B8FF00]" />
                Filter Products
              </SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <ShopFilters
                categories={categories}
                selectedGender={genderSlug}
                selectedCategory={categorySlug}
                selectedBrand={brandSlug}
                minPrice={minPrice}
                maxPrice={maxPrice}
                sort={sort}
                search={search}
                isMobileDrawer={true}
              />
            </div>
          </SheetContent>
        </Sheet>

        <span className="text-xs text-[#0F1B2D]/60 dark:text-slate-400 font-medium">
          {totalCount} products
        </span>
      </div>

      {/* Main Layout Container: Desktop Sidebar + Product Grid */}
      <div className="flex flex-col lg:flex-row items-start gap-6 transition-all duration-300">
        {/* Desktop-Only Collapsible / Expandable Sidebar Container */}
        <aside
          className={`hidden lg:block transition-all duration-300 ease-in-out flex-shrink-0 sticky top-24 self-start ${
            isCollapsed ? "w-16" : "w-[300px] xl:w-[320px]"
          }`}
        >
          <ShopFilters
            categories={categories}
            selectedGender={genderSlug}
            selectedCategory={categorySlug}
            selectedBrand={brandSlug}
            minPrice={minPrice}
            maxPrice={maxPrice}
            sort={sort}
            search={search}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed((prev) => !prev)}
            onExpand={() => setIsCollapsed(false)}
          />
        </aside>

        {/* Main Product Grid & Content Area (Smoothly expands when sidebar is collapsed) */}
        <section className="flex-1 w-full min-w-0 transition-all duration-300 ease-in-out">
          {/* Top Bar */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-3.5 shadow-sm text-xs text-[#0F1B2D]/60 dark:text-slate-400">
            <div>
              Showing{" "}
              <strong className="text-[#0F1B2D] dark:text-white">
                {products.length > 0 ? `1-${products.length}` : "0"}
              </strong>{" "}
              of <strong className="text-[#0F1B2D] dark:text-white">{totalCount}</strong> results
            </div>
            <div className="flex items-center gap-4">
              <span className="font-medium text-[#0F1B2D]/60 dark:text-slate-400">
                Sort by: <strong className="text-[#0F1B2D] dark:text-white">Featured</strong>
              </span>
              <span className="font-medium text-[#0F1B2D]/60 dark:text-slate-400">
                Show: <strong className="text-[#0F1B2D] dark:text-white">12</strong>
              </span>
            </div>
          </div>

          {/* Product Grid - Dynamically transitions columns between expanded and collapsed states */}
          {products.length > 0 ? (
            <div
              className={`grid grid-cols-1 gap-6 sm:grid-cols-2 transition-all duration-300 ${
                isCollapsed
                  ? "lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4"
                  : "lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
              }`}
            >
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showDiscountBadge={showDiscountBadge}
                />
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
              <h3 className="text-base font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
                No products found
              </h3>
              <p className="mt-1.5 text-xs text-[#0F1B2D]/50 dark:text-slate-400 max-w-sm">
                We don&apos;t have any products matching your selected filters right now. New gear is arriving soon!
              </p>
            </div>
          )}

          {/* Pagination */}
          <ShopPagination currentPage={currentPage} totalPages={totalPages} />
        </section>
      </div>
    </div>
  );
}
