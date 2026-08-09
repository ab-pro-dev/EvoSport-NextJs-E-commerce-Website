"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, RefreshCw, Minus, Plus, ShoppingBag, Zap, ChevronRight, ShieldCheck, Truck } from "lucide-react";
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

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add item to cart");
      }

      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
      window.dispatchEvent(new Event("cart-updated"));
    } catch (err: any) {
      setAddError(err.message || "Failed to add to cart");
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
      <nav className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
        <Link href="/" className="hover:text-[#CCFF00] transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <Link href="/shop" className="hover:text-[#CCFF00] transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#CCFF00] transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <span className="text-white font-bold truncate max-w-[250px]">{product.name}</span>
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
                      ? "border-[#CCFF00] ring-2 ring-[#CCFF00]/30 scale-105"
                      : "border-neutral-800 hover:border-neutral-700 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={img.url} alt={img.altText || product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Main Product Image */}
          <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
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
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-400 backdrop-blur-md transition-colors hover:text-[#CCFF00]"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Column: Product Options & Checkout CTA */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="outline" className="border-[#CCFF00]/40 text-[#CCFF00] bg-[#CCFF00]/10 text-[10px] uppercase font-bold">
                {product.brand.name}
              </Badge>
              {currentVariant?.sku && (
                <span className="text-[11px] text-neutral-500 font-mono">SKU: {currentVariant.sku}</span>
              )}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
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
                        : "fill-neutral-800 text-neutral-800"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-300">
                {product.avgRating > 0 ? product.avgRating.toFixed(1) : "0.0"}
              </span>
              <span className="text-xs text-neutral-500">
                ({product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"})
              </span>
            </div>
          </div>

          {/* Real Price Header */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#CCFF00]">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="text-base text-neutral-500 line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>

          {/* Real Description from Database */}
          <p className="text-xs leading-relaxed text-neutral-300">
            {product.description}
          </p>

          {/* Dynamic Color Selection from real variants */}
          {uniqueColors.length > 0 && (
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Color: <span className="text-white font-normal">{selectedColor}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-bold transition-all ${
                      selectedColor === color
                        ? "border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00]"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
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
              <div className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Size: <span className="text-white font-normal">{selectedSize}</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-9 min-w-10 rounded-md border px-3 text-xs font-bold transition-all ${
                      selectedSize === size
                        ? "border-[#CCFF00] bg-[#CCFF00]/20 text-[#CCFF00]"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
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
            <span className={`h-2 w-2 rounded-full ${inStock ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
            <span className={inStock ? "text-emerald-400" : "text-rose-400"}>
              {inStock ? `In Stock (${stockCount} available)` : "Out of Stock"}
            </span>
          </div>

          {/* Quantity & Action Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              <div className="flex items-center rounded-lg border border-neutral-800 bg-neutral-900 px-2">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 text-neutral-400 hover:text-[#CCFF00] transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-black text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-neutral-400 hover:text-[#CCFF00] transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              <Button
                size="lg"
                disabled={!inStock || isAdding}
                onClick={handleAddToCart}
                className="flex-1 bg-[#CCFF00] font-black text-black hover:bg-[#b8e600] h-11 text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-[#CCFF00]/10"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                {isAdding ? "ADDING..." : addSuccess ? "ADDED TO CART!" : "ADD TO CART"}
              </Button>

              <Button
                size="lg"
                variant="outline"
                disabled={!inStock}
                className="flex-1 border-neutral-700 text-white hover:border-[#CCFF00] hover:text-[#CCFF00] h-11 text-xs uppercase tracking-wider font-black rounded-lg bg-neutral-900/60"
              >
                <Zap className="mr-2 h-4 w-4 text-[#CCFF00]" />
                BUY NOW
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-2 text-xs font-semibold text-neutral-400">
              <button className="flex items-center gap-1.5 hover:text-[#CCFF00] transition-colors">
                <Heart className="h-3.5 w-3.5" />
                <span>Add to Wishlist</span>
              </button>
              <button className="flex items-center gap-1.5 hover:text-[#CCFF00] transition-colors">
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Compare</span>
              </button>
            </div>
          </div>

          {/* Static Trust Badges Bar */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-neutral-800 text-left">
            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <Truck className="h-5 w-5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-white uppercase">Free Shipping</div>
                <div className="text-[10px] text-neutral-400">On orders over $100</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <RefreshCw className="h-5 w-5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-white uppercase">Easy Returns</div>
                <div className="text-[10px] text-neutral-400">30 days return policy</div>
              </div>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-900/60 border border-neutral-800/80">
              <ShieldCheck className="h-5 w-5 text-[#CCFF00] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-[11px] font-bold text-white uppercase">Secure Payment</div>
                <div className="text-[10px] text-neutral-400">100% secure payment</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
