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
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-[#CCFF00] mb-6">
          <Lock className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Sign In to View Your Wishlist</h2>
        <p className="mt-2 text-xs text-neutral-400 max-w-sm">
          Save your favorite sportswear, gear, and footwear to track items and buy anytime.
        </p>
        <Link href="/login" className="mt-6">
          <Button size="lg" className="bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg px-8">
            Sign In Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 py-16">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-[#CCFF00] mb-6">
          <Heart className="h-10 w-10 fill-[#CCFF00]" />
        </div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-white">Your Wishlist is Empty</h2>
        <p className="mt-2 text-xs text-neutral-400 max-w-sm">
          You haven&apos;t saved any products to your wishlist yet.
        </p>
        <Link href="/shop" className="mt-6">
          <Button size="lg" className="bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg px-8">
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
      <div className="flex items-center justify-between border-b border-neutral-800 pb-5">
        <h1 className="text-3xl font-black uppercase tracking-tight text-white">
          MY WISHLIST <span className="text-[#CCFF00]">({items.length})</span>
        </h1>
        <Link href="/shop" className="text-xs text-neutral-400 hover:text-[#CCFF00] font-medium transition-colors">
          Continue Shopping &rarr;
        </Link>
      </div>

      {/* 4-Column Card Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => {
          const product = item.product;
          const image = product.images[0]?.url || "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600";
          const price = Number(product.basePrice);
          const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
          const isLoading = loadingId === product.id;

          return (
            <div
              key={item.id}
              className={`group relative flex flex-col overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/70 transition-all duration-300 hover:border-[#CCFF00]/50 ${
                isLoading ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              {/* Product Image */}
              <div className="relative aspect-square w-full overflow-hidden bg-neutral-950 p-4">
                <Image
                  src={image}
                  alt={product.images[0]?.altText || product.name}
                  fill
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                />

                {/* Filled Heart Icon (Click to Remove from Wishlist) */}
                <button
                  onClick={() => handleRemoveFromWishlist(product.id)}
                  aria-label="Remove from wishlist"
                  className="absolute right-3 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900/90 text-rose-500 backdrop-blur-sm transition-transform hover:scale-110"
                >
                  <Heart className="h-4 w-4 fill-rose-500" />
                </button>
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

                {/* Price */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-[#CCFF00]">${price.toFixed(2)}</span>
                  {compareAt && compareAt > price && (
                    <span className="text-xs text-neutral-500 line-through">${compareAt.toFixed(2)}</span>
                  )}
                </div>

                {/* Add to Cart Button */}
                <div className="mt-4 pt-3 border-t border-neutral-800/60">
                  <Button
                    onClick={() => handleAddToCart(item)}
                    size="sm"
                    className="w-full bg-[#CCFF00] font-extrabold text-black hover:bg-[#b8e600] text-xs uppercase tracking-wider rounded-lg"
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
