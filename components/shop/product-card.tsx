"use client";

import { useState } from "react";
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
    variants?: { id?: string; color: string }[];
    avgRating?: number;
    reviewCount?: number;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleQuickAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdding) return;

    setIsAdding(true);
    try {
      let variantId = product.variants?.[0]?.id;
      if (!variantId) {
        const res = await fetch(`/api/products/${product.slug}`);
        const data = await res.json();
        variantId = data.variants?.[0]?.id || data.product?.variants?.[0]?.id;
      }

      if (!variantId) throw new Error("No variant available");

      const cartRes = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, quantity: 1 }),
      });

      if (cartRes.ok) {
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (err) {
      console.error("Quick add error:", err);
    } finally {
      setIsAdding(false);
    }
  };
  const mainImage = (product.images && product.images.length > 0 && product.images[0]?.url)
    ? product.images[0].url
    : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
  const price = Number(product.basePrice);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAt && compareAt > price
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null;

  const avgRating = product.avgRating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  // Extract unique real colors from variants
  const colors = Array.from(new Set(product.variants?.map((v) => v.color).filter(Boolean) || []));

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

        <div className="absolute bottom-3 left-3 right-3 z-10 translate-y-4 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#CCFF00] py-2 text-xs font-extrabold uppercase text-black hover:bg-[#b8e600] transition-colors shadow-md disabled:opacity-50"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {isAdding ? "Adding..." : added ? "Added!" : "Quick Add"}
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

        {/* Real Rating Stars & Review Count */}
        <div className="mt-2 flex items-center gap-1.5">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-neutral-800 text-neutral-800"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-neutral-400 font-medium">({reviewCount})</span>
        </div>

        {/* Price & Real Color Variants */}
        <div className="mt-3 flex items-center justify-between border-t border-neutral-800/60 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-white">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="text-xs text-neutral-500 line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>

          {/* Real Color Swatches Preview strictly from real variants */}
          {colors.length > 1 && (
            <div className="flex items-center gap-1" title={`${colors.length} colors available`}>
              {colors.slice(0, 3).map((c, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border border-neutral-600 bg-neutral-700 inline-block"
                />
              ))}
              {colors.length > 3 && (
                <span className="text-[9px] font-bold text-neutral-400">+{colors.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
