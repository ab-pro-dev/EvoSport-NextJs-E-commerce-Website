"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AddToCartTooltip } from "@/components/ui/add-to-cart-tooltip";

interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    compareAtPrice: number | null;
    brand: { name: string };
    category: { name: string };
    images: { url: string; altText: string | null }[];
    variants: { id: string; sku: string; color: string; size: string; price: number | null; stock: number }[];
  };
}

interface WishlistViewProps {
  initialItems: WishlistItem[];
  isAuthenticated: boolean;
}

export function WishlistView({ initialItems, isAuthenticated }: WishlistViewProps) {
  const router = useRouter();
  const [items, setItems] = useState<WishlistItem[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [cartMessage, setCartMessage] = useState<{ id: string; text: string } | null>(null);

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      setLoadingId(productId);
      const res = await fetch(`/api/wishlist?productId=${productId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setItems((prev) => prev.filter((item) => item.productId !== productId));
        window.dispatchEvent(new Event("wishlist-updated"));
        toast.success("Removed from wishlist");
        router.refresh();
      }
    } catch (err) {
      console.error("Error removing item from wishlist:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart.");
      router.push("/login?callbackUrl=/wishlist");
      return;
    }

    const firstVariant = item.product.variants[0];
    if (!firstVariant) return;

    try {
      setLoadingId(item.productId);
      setCartMessage(null);

      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId: firstVariant.id, quantity: 1 }),
      });

      if (res.status === 401) {
        toast.error("Please log in to add items to your cart.");
        router.push("/login?callbackUrl=/wishlist");
        return;
      }

      if (res.ok) {
        setCartMessage({ id: item.productId, text: "Added to Cart!" });
        setTimeout(() => setCartMessage(null), 1800);
        window.dispatchEvent(new Event("cart-updated"));
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add to cart");
      }
    } catch (err: any) {
      console.error("Error adding to cart:", err);
      toast.error(err?.message || "Failed to add to cart");
    } finally {
      setLoadingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[#0F1B2D]/50 dark:text-slate-400 mb-6 shadow-sm">
          <Lock className="h-10 w-10 text-[#0F1B2D]/60 dark:text-slate-400" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">Sign In to View Your Wishlist</h2>
        <p className="mt-2 text-xs sm:text-sm text-[#0F1B2D]/60 dark:text-slate-400 max-w-sm">
          Save your favorite sportswear, gear, and footwear to track items and buy anytime.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs sm:max-w-md justify-center">
          <Link href="/login?callbackUrl=/wishlist" className="w-full sm:w-auto">
            <Button size="lg" className="w-full bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-xl px-8 h-12 shadow-sm">
              Sign In Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-[#0F1B2D] dark:text-white font-bold text-xs uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-slate-800 rounded-xl px-6 h-12">
              Create Account
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 text-[#0F1B2D]/50 dark:text-slate-400 mb-6 shadow-sm">
          <Heart className="h-10 w-10 fill-none" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">Your Wishlist is Empty</h2>
        <p className="mt-2 text-xs text-[#0F1B2D]/50 dark:text-slate-400 max-w-sm">
          You haven&apos;t saved any products to your wishlist yet.
        </p>
        <Link href="/shop" className="mt-6">
          <Button size="lg" className="bg-[#B8FF00] text-[#0F1B2D] font-black uppercase text-xs tracking-wider hover:bg-[#a3e600] rounded-xl px-8 shadow-sm">
            Explore Products
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white">
          YOUR WISHLIST <span className="text-[#B8FF00]">({items.length})</span>
        </h1>
        <Link href="/shop" className="text-xs text-[#5B8DEF] hover:text-[#4a7bd1] dark:hover:text-[#B8FF00] font-medium transition-colors">
          Continue Shopping &rarr;
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const product = item.product;
          const image = (product.images && product.images.length > 0 && product.images[0]?.url)
            ? product.images[0].url
            : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
          const price = Number(product.basePrice);
          const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;

          return (
            <div
              key={item.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#0F172A] border border-gray-200 dark:border-slate-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/50"
            >
              {/* Image Container */}
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-gray-100 dark:bg-slate-900">
                <Image
                  src={image}
                  alt={(product.images && product.images.length > 0 && product.images[0]?.altText) ? product.images[0].altText : product.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />

                {/* Filled Heart Icon */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 dark:bg-slate-900/90 text-[#0F1B2D]/30 dark:text-slate-400 backdrop-blur-sm transition-transform hover:scale-110 hover:text-rose-500 shadow-sm"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
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

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-[#0F1B2D] dark:text-white">${price.toFixed(2)}</span>
                  {compareAt && compareAt > price && (
                    <span className="text-xs text-[#0F1B2D]/40 dark:text-slate-500 line-through">${compareAt.toFixed(2)}</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 relative">
                  <AddToCartTooltip show={cartMessage?.id === item.productId} />
                  <Button
                    onClick={() => handleAddToCart(item)}
                    size="sm"
                    className="w-full bg-[#B8FF00] font-extrabold text-[#0F1B2D] hover:bg-[#a3e600] text-xs uppercase tracking-wider rounded-xl transition-colors shadow-sm"
                  >
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                    {cartMessage?.id === item.productId ? cartMessage.text : "ADD TO CART"}
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
