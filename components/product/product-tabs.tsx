"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ProductTabsProps {
  description: string;
  brandName: string;
  categoryName: string;
}

export function ProductTabs({ description, brandName, categoryName }: ProductTabsProps) {
  return (
    <div className="mt-12 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-md">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="flex gap-8 border-b border-neutral-800 bg-transparent p-0 rounded-none w-full justify-start">
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
            REVIEWS (128)
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
            The {categoryName} is built for athletes who demand more. With breathable mesh, responsive cushioning, and reinforced heel for stability, it&apos;s perfect for running, training, or everyday performance.
          </p>
          <ul className="space-y-2 pt-2 text-neutral-400">
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
              <span>Lightweight breathable mesh</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
              <span>Responsive cushioning</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
              <span>Durable rubber outsole</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
              <span>Reinforced heel support</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#CCFF00]" />
              <span>Suitable for running, training, and daily wear</span>
            </li>
          </ul>
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
          <p>Customer reviews section coming soon.</p>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 space-y-4 text-xs text-neutral-300">
          <p>Free shipping on orders over $100. 30-day hassle-free return policy.</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
