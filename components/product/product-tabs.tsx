"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductTabsProps {
  description: string;
  brandName: string;
  categoryName: string;
  reviewCount: number;
  avgRating: number;
}

export function ProductTabs({
  description,
  brandName,
  categoryName,
  reviewCount,
  avgRating,
}: ProductTabsProps) {
  return (
    <div className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-md">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="flex gap-8 border-b border-neutral-800 bg-transparent p-0 rounded-none w-full justify-start overflow-x-auto">
          <TabsTrigger
            value="description"
            className="pb-3 text-xs font-black uppercase tracking-wider rounded-none bg-transparent text-neutral-400 data-[state=active]:border-b-2 data-[state=active]:border-[#CCFF00] data-[state=active]:text-[#CCFF00] data-[state=active]:bg-transparent shadow-none"
          >
            DESCRIPTION
          </TabsTrigger>
          <TabsTrigger
            value="details"
            className="pb-3 text-xs font-black uppercase tracking-wider rounded-none bg-transparent text-neutral-400 data-[state=active]:border-b-2 data-[state=active]:border-[#CCFF00] data-[state=active]:text-[#CCFF00] data-[state=active]:bg-transparent shadow-none"
          >
            DETAILS
          </TabsTrigger>
          <TabsTrigger
            value="reviews"
            className="pb-3 text-xs font-black uppercase tracking-wider rounded-none bg-transparent text-neutral-400 data-[state=active]:border-b-2 data-[state=active]:border-[#CCFF00] data-[state=active]:text-[#CCFF00] data-[state=active]:bg-transparent shadow-none"
          >
            REVIEWS ({reviewCount})
          </TabsTrigger>
          <TabsTrigger
            value="shipping"
            className="pb-3 text-xs font-black uppercase tracking-wider rounded-none bg-transparent text-neutral-400 data-[state=active]:border-b-2 data-[state=active]:border-[#CCFF00] data-[state=active]:text-[#CCFF00] data-[state=active]:bg-transparent shadow-none"
          >
            SHIPPING & RETURNS
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6 space-y-4 text-xs text-neutral-300">
          <p className="leading-relaxed text-neutral-300">
            {description}
          </p>
        </TabsContent>

        <TabsContent value="details" className="mt-6 space-y-4">
          <div className="divide-y divide-neutral-800 rounded-lg border border-neutral-800 bg-neutral-950/60 text-xs">
            <div className="grid grid-cols-3 p-3">
              <span className="font-bold text-neutral-400">Brand</span>
              <span className="col-span-2 text-neutral-200">{brandName}</span>
            </div>
            <div className="grid grid-cols-3 p-3">
              <span className="font-bold text-neutral-400">Category</span>
              <span className="col-span-2 text-neutral-200">{categoryName}</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-4 text-xs text-neutral-300">
          {reviewCount > 0 ? (
            <p>Average Rating: {avgRating.toFixed(1)} / 5 ({reviewCount} reviews)</p>
          ) : (
            <p className="text-neutral-500 italic">No customer reviews yet for this product.</p>
          )}
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 space-y-4 text-xs text-neutral-300">
          <p>Free express shipping on all orders over $100. 30-day return policy.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
