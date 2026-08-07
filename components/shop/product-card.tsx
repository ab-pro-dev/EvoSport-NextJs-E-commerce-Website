"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    compareAtPrice: number | null;
    images: { url: string; altText: string | null }[];
    brand: { name: string };
    category: { name: string };
    variants?: { color: string }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
  const price = Number(product.basePrice);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAt && compareAt > price
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null;

  // Extract unique color variants for color dot preview
  const colors = Array.from(new Set(product.variants?.map((v) => v.color) || []));

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/70 transition-all duration-300 hover:-translate-y-1 hover:border-[#CCFF00]/50 hover:shadow-lg hover:shadow-[#CCFF00]/5">
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-950 p-4">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {discountPercent ? (
            <Badge className="bg-rose-600 text-white font-extrabold text-[11px] px-2 py-0.5 rounded">
              -{discountPercent}%
            </Badge>
          ) : (
            <Badge className="bg-[#CCFF00] text-black font-extrabold text-[10px] tracking-wider uppercase px-2 py-0.5 rounded">
              BEST SELLER
            </Badge>
          )}
        </div>

        {/* Wishlist Icon */}
        <button
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-400 backdrop-blur-sm transition-colors hover:text-[#CCFF00]"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick Add Overlay on Hover */}
        <div className="absolute bottom-3 left-3 right-3 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CCFF00] py-2 text-xs font-extrabold uppercase text-black hover:bg-[#b8e600] transition-colors shadow-md">
            <ShoppingBag className="h-3.5 w-3.5" />
            Quick Add
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          {product.brand.name}
        </span>
        <Link href={`/products/${product.slug}`} className="hover:text-[#CCFF00] transition-colors mt-0.5">
          <h3 className="line-clamp-1 text-sm font-bold text-white">
            {product.name}
          </h3>
        </Link>

        {/* Rating Stars */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3 w-3 ${i < 4 ? "fill-amber-400" : "fill-neutral-800 text-neutral-800"}`} />
            ))}
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">(128)</span>
        </div>

        {/* Price & Colors */}
        <div className="mt-3 flex items-center justify-between border-t border-neutral-800/60 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-white">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="text-xs text-neutral-500 line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>

          {/* Color Preview Dots */}
          {colors.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-full bg-black border border-neutral-600 inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#CCFF00] inline-block" />
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 inline-block" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
