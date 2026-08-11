"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ShoppingBag, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

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
        router.refresh();
      }
    } catch (err) {
      console.error("Error removing item from wishlist:", err);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
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

      if (res.ok) {
        setCartMessage({ id: item.productId, text: "Added to Cart!" });
        setTimeout(() => setCartMessage(null), 3000);
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
    } finally {
      setLoadingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border border-gray-200 text-[#0F1B2D]/50 mb-6 shadow-sm">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D]">Sign In to View Your Wishlist</h2>
        <p className="mt-2 text-xs text-[#0F1B2D]/50 max-w-sm">
          Save your favorite sportswear, gear, and footwear to track items and buy anytime.
        </p>
        <Link href="/login" className="mt-6 text-[#5B8DEF] font-bold hover:underline flex items-center">
          Sign In Now
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white border border-gray-200 text-[#0F1B2D]/50 mb-6 shadow-sm">
          <Heart className="h-10 w-10 fill-none" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D]">Your Wishlist is Empty</h2>
        <p className="mt-2 text-xs text-[#0F1B2D]/50 max-w-sm">
          You haven&apos;t saved any products to your wishlist yet.
        </p>
        <Link href="/shop" className="mt-6 text-[#5B8DEF] font-bold hover:underline flex items-center">
          Explore Products
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight text-[#0F1B2D]">
          MY WISHLIST <span className="text-[#B8FF00]">({items.length})</span>
        </h1>
        <Link href="/shop" className="text-xs text-[#0F1B2D]/50 hover:text-[#5B8DEF] font-medium transition-colors">
          Continue Shopping &rarr;
        </Link>
      </div>

      {/* 4-Column Card Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const product = item.product;
          const image = (product.images && product.images.length > 0 && product.images[0]?.url)
            ? product.images[0].url
            : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
          const price = Number(product.basePrice);
          const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
          const isLoading = loadingId === product.id;

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition-all duration-300 shadow-sm hover:shadow-xl hover:border-gray-300 ${
                isLoading ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {/* Product Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-[#F4F8FC] p-4">
                <Image
                  src={image}
                  alt={(product.images && product.images.length > 0 && product.images[0]?.altText) ? product.images[0].altText : product.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Filled Heart Icon (Click to Remove from Wishlist) */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white text-[#0F1B2D]/30 backdrop-blur-sm transition-transform hover:scale-110 hover:text-rose-500 shadow-sm"
                >
                  <Heart className="h-4 w-4 fill-current" />
                </button>
              </div>

              {/* Details */}
              <div className="flex flex-1 flex-col p-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#0F1B2D]/40">
                  {product.brand.name}
                </span>
                <Link href={`/products/${product.slug}`} className="hover:text-[#5B8DEF] transition-colors mt-0.5">
                  <h3 className="line-clamp-1 text-sm font-bold text-[#0F1B2D]">
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-[#0F1B2D]">${price.toFixed(2)}</span>
                  {compareAt && compareAt > price && (
                    <span className="text-xs text-[#0F1B2D]/40 line-through">${compareAt.toFixed(2)}</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    size="sm"
                    className="w-full bg-[#B8FF00] font-extrabold text-[#0F1B2D] hover:bg-[#a3e600] text-xs uppercase tracking-wider rounded-xl transition-colors"
                  >
                    <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
                    {cartMessage?.id === product.id ? cartMessage.text : "ADD TO CART"}
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
