"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Truck, Shield, CheckCircle2 } from "lucide-react";

interface ProductTabsProps {
  description: string;
  brandName: string;
  categoryName: string;
}

export function ProductTabs({ description, brandName, categoryName }: ProductTabsProps) {
  return (
    <div className="mt-12 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 backdrop-blur-md">
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 bg-neutral-950 p-1 border border-neutral-800 rounded-xl">
          <TabsTrigger value="description" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black font-semibold text-xs uppercase tracking-wider">
            Description
          </TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black font-semibold text-xs uppercase tracking-wider">
            Specifications
          </TabsTrigger>
          <TabsTrigger value="reviews" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black font-semibold text-xs uppercase tracking-wider">
            Reviews (12)
          </TabsTrigger>
          <TabsTrigger value="shipping" className="data-[state=active]:bg-lime-500 data-[state=active]:text-black font-semibold text-xs uppercase tracking-wider">
            Shipping & Returns
          </TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="mt-6 space-y-4 text-sm text-neutral-300">
          <h3 className="text-base font-bold text-white">Engineered for Peak Performance</h3>
          <p className="leading-relaxed">{description}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <CheckCircle2 className="h-4 w-4 text-lime-400" />
              <span>Ultra-breathable ergonomic design</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <CheckCircle2 className="h-4 w-4 text-lime-400" />
              <span>Reinforced impact protection & durability</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <CheckCircle2 className="h-4 w-4 text-lime-400" />
              <span>Moisture-wicking temperature control</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-300">
              <CheckCircle2 className="h-4 w-4 text-lime-400" />
              <span>Official {brandName} Pro Edition warranty</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-6 space-y-4">
          <h3 className="text-base font-bold text-white">Technical Specifications</h3>
          <div className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-950/60 overflow-hidden text-sm">
            <div className="grid grid-cols-3 p-3">
              <span className="font-semibold text-neutral-400">Brand</span>
              <span className="col-span-2 text-neutral-200">{brandName}</span>
            </div>
            <div className="grid grid-cols-3 p-3">
              <span className="font-semibold text-neutral-400">Category</span>
              <span className="col-span-2 text-neutral-200">{categoryName}</span>
            </div>
            <div className="grid grid-cols-3 p-3">
              <span className="font-semibold text-neutral-400">Material</span>
              <span className="col-span-2 text-neutral-200">High-grade Synthetic Composite & Breathable Mesh</span>
            </div>
            <div className="grid grid-cols-3 p-3">
              <span className="font-semibold text-neutral-400">Warranty</span>
              <span className="col-span-2 text-neutral-200">1-Year Limited Manufacturer Warranty</span>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Customer Reviews</h3>
            <div className="flex items-center gap-2 text-sm text-amber-400">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400" />
                ))}
              </div>
              <span className="font-bold text-white">4.8 out of 5</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Marcus Vance</span>
                <span className="text-xs text-neutral-500">2 days ago</span>
              </div>
              <div className="flex items-center text-amber-400 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="mt-2 text-xs text-neutral-300">
                Absolute game changer! The build quality and comfort exceeded my expectations for intense training sessions.
              </p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="shipping" className="mt-6 space-y-4 text-sm text-neutral-300">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-center gap-2 text-lime-400 font-bold mb-2">
                <Truck className="h-4 w-4" />
                <span>Shipping Policy</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400">
                Free standard express shipping on all orders over $75. Orders processed within 24 hours Monday through Friday.
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <div className="flex items-center gap-2 text-lime-400 font-bold mb-2">
                <Shield className="h-4 w-4" />
                <span>Hassle-Free Returns</span>
              </div>
              <p className="text-xs leading-relaxed text-neutral-400">
                Return any unused product within 30 days of receipt for a full refund or direct exchange.
              </p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
