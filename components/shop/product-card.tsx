"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { AddToCartTooltip } from "@/components/ui/add-to-cart-tooltip";
import { useWishlist } from "@/hooks/use-wishlist";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    basePrice: number;
    compareAtPrice: number | null;
    images: { url: string; altText: string | null }[];
    brand?: { name: string } | null;
    category?: { name: string } | null;
    variants?: { id?: string; color: string }[];
    avgRating?: number;
    reviewCount?: number;
  };
  showDiscountBadge?: boolean;
}

export function ProductCard({ product, showDiscountBadge = false }: ProductCardProps) {
  const router = useRouter();
  const { status } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const { isWishlisted, toggleWishlist } = useWishlist();

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
        setTimeout(() => setAdded(false), 1800);
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        const data = await cartRes.json();
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (err: any) {
      console.error("Quick add error:", err);
      toast.error(err.message || "Failed to add to cart");
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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-100 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50">
      {/* Image Container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 dark:bg-slate-900">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
        />
        
        {/* Optional Discount Badge (Controlled via Admin Settings) */}
        {showDiscountBadge && discountPercent && (
          <div className="absolute left-3 top-3 z-10">
            <span className="rounded-md bg-[#B8FF00] px-2 py-0.5 text-[10px] font-black uppercase text-[#0F1B2D] shadow-sm">
              -{discountPercent}%
            </span>
          </div>
        )}

        {/* Action Buttons: Wishlist */}
        <div className="absolute right-3 top-3 flex flex-col gap-2 z-10">
          <button
            type="button"
            onClick={(e) => toggleWishlist(product.id, e)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-[#0F1B2D] dark:text-white shadow-sm transition-all hover:bg-white dark:hover:bg-slate-800 hover:scale-110"
            title={isWishlisted(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}
          >
            <Heart className={`h-4 w-4 transition-colors ${isWishlisted(product.id) ? "fill-rose-500 text-rose-500" : "hover:text-rose-500"}`} />
          </button>
        </div>

        <div className="absolute inset-x-3 bottom-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100 z-10 relative">
          <AddToCartTooltip show={added} />
          <button
            onClick={handleQuickAdd}
            disabled={isAdding}
            className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-[#B8FF00] py-2.5 text-xs font-black uppercase tracking-wider text-[#0F1B2D] shadow-lg shadow-[#B8FF00]/20 hover:bg-[#a8ef00] transition-colors"
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            {isAdding ? "Adding..." : added ? "Added!" : "Quick Add"}
          </button>
        </div>
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col p-4">
        {product.brand?.name && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/40 dark:text-slate-400">
            {product.brand.name}
          </span>
        )}
        <Link href={`/products/${product.slug}`} className="hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors mt-0.5">
          <h3 className="line-clamp-1 text-sm font-bold text-[#0F1B2D] dark:text-white">
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
                    : "fill-gray-200 dark:fill-slate-700 text-gray-200 dark:text-slate-700"
                }`}
              />
            ))}
          </div>
          <span className="text-[11px] text-[#0F1B2D]/40 dark:text-slate-400 font-medium">({reviewCount})</span>
        </div>

        {/* Price & Real Color Variants */}
        <div className="mt-3 flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-3">
          <div className="flex items-baseline gap-2">
            <span className="text-base font-extrabold text-[#0F1B2D] dark:text-white">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="text-xs text-[#0F1B2D]/30 dark:text-slate-500 line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>

          {/* Real Color Swatches Preview */}
          {colors.length > 1 && (
            <div className="flex items-center gap-1" title={`${colors.length} colors available`}>
              {colors.slice(0, 3).map((c, i) => (
                <span
                  key={i}
                  className="h-2.5 w-2.5 rounded-full border border-gray-300 dark:border-slate-600 bg-gray-200 dark:bg-slate-700 inline-block"
                />
              ))}
              {colors.length > 3 && (
                <span className="text-[9px] font-bold text-[#0F1B2D]/40 dark:text-slate-500">+{colors.length - 3}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
