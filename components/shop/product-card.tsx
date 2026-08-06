"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: any;
    compareAtPrice: any;
    images: { url: string; altText: string | null }[];
    brand: { name: string };
    category: { name: string };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const mainImage = product.images[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
  const price = Number(product.basePrice);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAt && compareAt > price
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-lime-500/50 hover:shadow-lg hover:shadow-lime-500/10">
      {/* Image container */}
      <div className="relative aspect-square w-full overflow-hidden bg-neutral-950">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        
        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5 z-10">
          {discountPercent && (
            <Badge className="bg-lime-500 font-bold text-black hover:bg-lime-400">
              -{discountPercent}%
            </Badge>
          )}
          <Badge variant="outline" className="border-neutral-700 bg-neutral-900/80 text-neutral-300 backdrop-blur-md">
            {product.brand.name}
          </Badge>
        </div>

        {/* Wishlist Button */}
        <button
          aria-label="Add to wishlist"
          className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-300 backdrop-blur-md transition-all hover:bg-lime-500 hover:text-black"
        >
          <Heart className="h-4 w-4" />
        </button>

        {/* Quick Add Button on Hover */}
        <div className="absolute bottom-3 left-3 right-3 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <Button className="w-full bg-lime-500 font-semibold text-black hover:bg-lime-400">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Quick Add
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-lime-400">
          {product.category.name}
        </span>
        <Link href={`/products/${product.slug}`} className="group-hover:text-lime-400 transition-colors">
          <h3 className="mt-1 line-clamp-1 text-base font-semibold text-white">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 text-xs text-neutral-400">
          {product.description}
        </p>

        {/* Rating Placeholder */}
        <div className="mt-3 flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`h-3.5 w-3.5 ${i < 4 ? "fill-amber-400" : "fill-neutral-700 text-neutral-700"}`} />
            ))}
          </div>
          <span className="text-xs text-neutral-400 font-medium">(4.8)</span>
        </div>

        {/* Price */}
        <div className="mt-auto pt-4 flex items-baseline gap-2">
          <span className="text-lg font-bold text-lime-400">${price.toFixed(2)}</span>
          {compareAt && compareAt > price && (
            <span className="text-xs text-neutral-500 line-through">${compareAt.toFixed(2)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
