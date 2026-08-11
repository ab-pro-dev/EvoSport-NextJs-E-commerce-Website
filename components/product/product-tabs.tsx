"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductReviewsTab } from "@/components/product/product-reviews-tab";

interface ProductTabsProps {
  productId: string;
  slug: string;
  description: string;
  brandName: string;
  categoryName: string;
  reviewCount: number;
  avgRating: number;
}

export function ProductTabs({
  productId,
  slug,
  description,
  brandName,
  categoryName,
  reviewCount,
  avgRating,
}: ProductTabsProps) {
  return (
    <div className="mt-12 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="flex gap-8 border-b border-gray-200 bg-transparent p-0 rounded-none w-full justify-start overflow-x-auto">
          <TabsTrigger
            value="description"
            className="pb-3 text-xs font-black uppercase tracking-wider rounded-none bg-transparent text-[#0F1B2D]/40 data-[state=active]:border-b-2 data-[state=active]:border-[#B8FF00] data-[state=active]:text-[#0F1B2D] data-[state=active]:bg-transparent shadow-none"
          >
            DESCRIPTION
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="pb-3 text-xs font-black uppercase tracking-wider rounded-none bg-transparent text-[#0F1B2D]/40 data-[state=active]:border-b-2 data-[state=active]:border-[#B8FF00] data-[state=active]:text-[#0F1B2D] data-[state=active]:bg-transparent shadow-none"
          >
            DETAILS
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="pb-3 text-xs font-black uppercase tracking-wider rounded-none bg-transparent text-[#0F1B2D]/40 data-[state=active]:border-b-2 data-[state=active]:border-[#B8FF00] data-[state=active]:text-[#0F1B2D] data-[state=active]:bg-transparent shadow-none"
          >
            REVIEWS ({reviewCount})
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="pb-3 text-xs font-black uppercase tracking-wider rounded-none bg-transparent text-[#0F1B2D]/40 data-[state=active]:border-b-2 data-[state=active]:border-[#B8FF00] data-[state=active]:text-[#0F1B2D] data-[state=active]:bg-transparent shadow-none"
          >
            SHIPPING & RETURNS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6 space-y-4 text-xs text-[#0F1B2D]/70">
          <p className="leading-relaxed text-[#0F1B2D]/70">
            {description}
          </p>
        </TabsContent>

        <TabsContent value="details" className="mt-6 space-y-4">
          <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white text-xs shadow-sm">
            <div className="grid grid-cols-3 p-3">
              <span className="font-bold text-[#0F1B2D]">Brand</span>
              <span className="col-span-2 text-[#0F1B2D]/70">{brandName}</span>
            </div>
            <div className="grid grid-cols-3 p-3">
              <span className="font-bold text-[#0F1B2D]">Category</span>
              <span className="col-span-2 text-[#0F1B2D]/70">{categoryName}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6">
          <ProductReviewsTab
            productId={productId}
            slug={slug}
            initialReviewCount={reviewCount}
            initialAvgRating={avgRating}
          />
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 space-y-4 text-xs text-[#0F1B2D]/70">
          <p>Free express shipping on all orders over $100. 30-day return policy.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
