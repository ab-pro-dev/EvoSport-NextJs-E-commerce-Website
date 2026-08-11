"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Star, Heart, RefreshCw, Minus, Plus, ShoppingBag, Zap, ChevronRight, ShieldCheck, Truck } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProductDetailsProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    basePrice: number;
    compareAtPrice: number | null;
    brand: { name: string; slug: string };
    category: { name: string; slug: string };
    images: { id: string; url: string; altText: string | null }[];
    variants: { id: string; sku: string; color: string; size: string; price: number | null; stock: number }[];
    avgRating: number;
    reviewCount: number;
  };
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  const images = product.images.length > 0
    ? product.images
    : [{ id: "fallback", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", altText: product.name }];

  const [selectedImage, setSelectedImage] = useState(images[0].url);

  // Dynamically extract colors and sizes strictly from real product.variants from API
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean)));
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size).filter(Boolean)));

  const [selectedColor, setSelectedColor] = useState(uniqueColors[0] || "");
  const [selectedSize, setSelectedSize] = useState(uniqueSizes[0] || "");
  const [quantity, setQuantity] = useState(1);

  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  // Find selected variant from real API data
  const currentVariant = product.variants.find(
    (v) => (v.color === selectedColor || !selectedColor) && (v.size === selectedSize || !selectedSize)
  ) || product.variants[0];

  const handleAddToCart = async () => {
    // Enforce authentication before adding to cart
    if (status !== "authenticated") {
      toast.error("Please log in to add items to your cart.");
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!currentVariant?.id || !inStock || isAdding) return;
    setIsAdding(true);
    setAddError(null);
    setAddSuccess(false);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: currentVariant.id,
          quantity,
        }),
      });

      if (res.status === 401) {
        toast.error("Please log in to add items to your cart.");
        router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        const msg = data.error || "Failed to add item to cart";
        toast.error(msg);
        throw new Error(msg);
      }

      toast.success(`${product.name} added to cart!`);
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err: any) {
      setAddError(err.message || "Failed to add to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    // Enforce authentication before proceeding to checkout
    if (status !== "authenticated") {
      toast.error("Please log in with your account to proceed to checkout.");
      router.push(`/login?callbackUrl=/checkout`);
      return;
    }

    if (!currentVariant?.id || !inStock || isAdding) return;
    setIsAdding(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variantId: currentVariant.id,
          quantity,
        }),
      });

      if (res.ok) {
        window.dispatchEvent(new Event("cart-updated"));
        router.push("/checkout");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to proceed to checkout");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to proceed to checkout");
    } finally {
      setIsAdding(false);
    }
  };

  const price = currentVariant?.price ? Number(currentVariant.price) : Number(product.basePrice);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAt && compareAt > price
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null;

  const stockCount = currentVariant?.stock ?? 0;
  const inStock = stockCount > 0;

  return (
    <div className="space-y-6">
      {/* Real Breadcrumb built strictly from category and product name */}
      <nav className="flex items-center gap-2 text-xs text-[#0F1B2D]/40 font-medium">
        <Link href="/" className="hover:text-[#5B8DEF] transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <Link href="/shop" className="hover:text-[#5B8DEF] transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#5B8DEF] transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3 text-gray-300" />
        <span className="text-[#0F1B2D] font-bold truncate max-w-[250px]">{product.name}</span>
      </nav>

      {/* Main Grid: Left Gallery + Right Panel */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Vertical Thumbnails + Main Image */}
        <div className="lg:col-span-6 flex gap-4">
          {images.length > 1 && (
            <div className="flex flex-col gap-3">
              {images.slice(0, 5).map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === img.url
                      ? "border-[#B8FF00] ring-2 ring-[#B8FF00]/30 scale-105"
                      : "border-gray-200 hover:border-gray-300 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img.url} alt={img.altText || product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Product Image */}
          <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-gray-200 bg-[#F4F8FC] p-6 shadow-sm">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center transition-all duration-300"
            />

            {discountPercent && (
              <div className="absolute left-4 top-4 z-10">
                <Badge className="bg-rose-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded">
                  -{discountPercent}% OFF
                </Badge>
              </div>
            )}

            <button
              aria-label="Add to wishlist"
              onClick={() => {
                if (status !== "authenticated") {
                  toast.error("Please log in to manage your wishlist.");
                  router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
                }
              }}
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/80 text-[#0F1B2D]/40 backdrop-blur-md transition-colors hover:text-rose-400 border border-gray-200"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Product Options & Checkout CTA */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-gray-200 text-[#0F1B2D]/40 bg-white text-[10px] uppercase font-bold">
                {product.brand.name}
              </Badge>
              {currentVariant?.sku && (
                <span className="text-[11px] text-[#0F1B2D]/40 font-mono">SKU: {currentVariant.sku}</span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-[#0F1B2D] uppercase">
              {product.name}
            </h1>
            
            {/* Real Rating Stars & Count from API */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${
                      i < Math.floor(product.avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-[#0F1B2D]/70">
                {product.avgRating > 0 ? product.avgRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs text-[#0F1B2D]/50">
                ({product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>

          {/* Real Price Header */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#0F1B2D]">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="text-base text-[#0F1B2D]/30 line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>

          {/* Real Description from Database */}
          <p className="text-xs leading-relaxed text-[#0F1B2D]/70">
            {product.description}
          </p>

          {/* Dynamic Color Selection from real variants */}
          {uniqueColors.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0F1B2D]/60">
                Color: <span className="text-[#0F1B2D] font-normal">{selectedColor}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedColor === color
                        ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D]"
                        : "border-gray-200 bg-white text-[#0F1B2D]/60 hover:border-gray-300 hover:text-[#0F1B2D]"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Size Selection from real variants */}
          {uniqueSizes.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-[#0F1B2D]/60">
                Size: <span className="text-[#0F1B2D] font-normal">{selectedSize}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 min-w-10 rounded-md border px-3 text-xs font-bold transition-all ${
                      selectedSize === size
                        ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D]"
                        : "border-gray-200 bg-white text-[#0F1B2D]/60 hover:border-gray-300 hover:text-[#0F1B2D]"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Real Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs font-bold">
            <span className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-600 animate-pulse" : "bg-rose-500"}`} />
            <span className={inStock ? "text-emerald-600" : "text-rose-500"}>
              {inStock ? `In Stock (${stockCount} available)` : "Out of Stock"}
            </span>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <div className="flex items-center rounded-lg border border-gray-200 bg-white px-2 shadow-sm">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-[#0F1B2D]/50 hover:text-[#0F1B2D] transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-black text-[#0F1B2D]">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-[#0F1B2D]/50 hover:text-[#0F1B2D] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                size="lg"
                disabled={!inStock || isAdding}
                onClick={handleAddToCart}
                className="flex-1 bg-[#B8FF00] font-black text-[#0F1B2D] hover:bg-[#a3e600] h-11 text-xs uppercase tracking-wider rounded-lg shadow-sm"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {isAdding ? "ADDING..." : addSuccess ? "ADDED TO CART!" : "ADD TO CART"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                disabled={!inStock || isAdding}
                onClick={handleBuyNow}
                className="flex-1 border-[#0F1B2D] text-white hover:bg-[#0F1B2D]/90 h-11 text-xs uppercase tracking-wider font-black rounded-lg bg-[#0F1B2D] shadow-sm"
              >
                <Zap className="mr-2 h-4 w-4 text-[#B8FF00]" />
                BUY NOW
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-[#0F1B2D]/60">
              <button
                onClick={() => {
                  if (status !== "authenticated") {
                    toast.error("Please log in to manage your wishlist.");
                    router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
                  }
                }}
                className="flex items-center gap-1.5 hover:text-[#5B8DEF] transition-colors"
              >
                <Heart className="h-3.5 w-3.5" />
                <span>Add to Wishlist</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#5B8DEF] transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Compare</span>
              </button>
            </div>
          </div>

          {/* Static Trust Badges Bar */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-gray-200 text-left">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
              <Truck className="h-5 w-5 text-[#B8FF00] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-[#0F1B2D] uppercase">Free Shipping</div>
                <div className="text-[10px] text-[#0F1B2D]/60">On orders over $100</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
              <RefreshCw className="h-5 w-5 text-[#B8FF00] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-[#0F1B2D] uppercase">Easy Returns</div>
                <div className="text-[10px] text-[#0F1B2D]/60">30 days return policy</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-white border border-gray-100 shadow-sm">
              <ShieldCheck className="h-5 w-5 text-[#B8FF00] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-[#0F1B2D] uppercase">Secure Payment</div>
                <div className="text-[10px] text-[#0F1B2D]/60">100% secure payment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
