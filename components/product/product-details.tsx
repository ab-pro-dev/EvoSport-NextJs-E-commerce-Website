"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Star, Heart, ShieldCheck, Truck, RefreshCw, Minus, Plus, ShoppingBag, Zap, ChevronRight } from "lucide-react";
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
    : [{ id: "placeholder", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", altText: product.name }];

  const [selectedImage, setSelectedImage] = useState(images[0].url);
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || "");
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || "");
  const [quantity, setQuantity] = useState(1);

  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.color)));
  const uniqueSizes = Array.from(new Set(product.variants.map((v) => v.size)));

  const currentVariant = product.variants.find(
    (v) => (v.color === selectedColor || !selectedColor) && (v.size === selectedSize || !selectedSize)
  ) || product.variants[0];

  const price = currentVariant?.price ? Number(currentVariant.price) : Number(product.basePrice);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAt && compareAt > price
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null;

  const inStock = (currentVariant?.stock ?? 0) > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400">
        <Link href="/" className="hover:text-lime-400 transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <Link href="/shop" className="hover:text-lime-400 transition-colors">Shop</Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-lime-400 transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <span className="text-neutral-200 font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left Column: Image Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900 shadow-2xl">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center transition-all duration-300"
            />
            {discountPercent && (
              <Badge className="absolute left-4 top-4 bg-lime-500 font-bold text-black hover:bg-lime-400 text-sm px-3 py-1">
                -{discountPercent}% OFF
              </Badge>
            )}
            <button
              aria-label="Add to wishlist"
              className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-300 backdrop-blur-md transition-all hover:bg-lime-500 hover:text-black"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                    selectedImage === img.url
                      ? "border-lime-500 ring-2 ring-lime-500/30 scale-105"
                      : "border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100"
                  }`}
                >
                  <Image src={img.url} alt={img.altText || product.name} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Details & Purchase Actions */}
        <div className="flex flex-col space-y-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-lime-500/40 text-lime-400 bg-lime-500/10">
                {product.brand.name}
              </Badge>
              <span className="text-xs text-neutral-500">SKU: {currentVariant?.sku || "N/A"}</span>
            </div>
            <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl text-white">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(product.avgRating || 4.5) ? "fill-amber-400 text-amber-400" : "fill-neutral-800 text-neutral-800"}`}
                />
              ))}
            </div>
            <span className="text-sm font-semibold text-neutral-200">
              {product.avgRating > 0 ? product.avgRating.toFixed(1) : "4.8"}
            </span>
            <span className="text-xs text-neutral-500">
              ({product.reviewCount > 0 ? product.reviewCount : 12} customer reviews)
            </span>
          </div>

          {/* Price & Stock */}
          <div className="flex items-baseline gap-3 pb-4 border-b border-neutral-800">
            <span className="text-3xl font-extrabold text-lime-400">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="text-lg text-neutral-500 line-through">${compareAt.toFixed(2)}</span>
            )}
            <span className={`ml-auto text-xs font-semibold px-2.5 py-1 rounded-full ${
              inStock ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
            }`}>
              {inStock ? `In Stock (${currentVariant?.stock} available)` : "Out of Stock"}
            </span>
          </div>

          {/* Color Selection */}
          {uniqueColors.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Color: <span className="text-white font-normal">{selectedColor}</span>
              </label>
              <div className="mt-2 flex flex-wrap gap-3">
                {uniqueColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`rounded-xl border px-4 py-2 text-xs font-medium transition-all ${
                      selectedColor === color
                        ? "border-lime-500 bg-lime-500/20 text-lime-400 font-bold shadow-lg shadow-lime-500/10"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Selection */}
          {uniqueSizes.length > 0 && (
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Size: <span className="text-white font-normal">{selectedSize}</span>
              </label>
              <div className="mt-2 flex flex-wrap gap-2">
                {uniqueSizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`h-10 min-w-10 rounded-xl border px-3 text-xs font-semibold transition-all ${
                      selectedSize === size
                        ? "border-lime-500 bg-lime-500/20 text-lime-400 font-bold shadow-lg shadow-lime-500/10"
                        : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-4 border-t border-neutral-800">
            <div className="flex items-center gap-4">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Quantity:
              </label>
              <div className="flex items-center rounded-xl border border-neutral-800 bg-neutral-900">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-neutral-400 hover:text-lime-400 transition-colors"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center text-sm font-bold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-neutral-400 hover:text-lime-400 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                size="lg"
                disabled={!inStock}
                className="w-full bg-lime-500 font-bold text-black hover:bg-lime-400 h-12 text-sm uppercase tracking-wider shadow-lg shadow-lime-500/20"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={!inStock}
                className="w-full border-lime-500/50 text-lime-400 hover:bg-lime-500/10 hover:border-lime-500 h-12 text-sm uppercase tracking-wider font-bold"
              >
                <Zap className="mr-2 h-5 w-5" />
                Buy Now
              </Button>
            </div>
          </div>

          {/* Trust Icons Row */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-neutral-800 text-center">
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
              <Truck className="h-5 w-5 text-lime-400" />
              <span className="text-xs font-semibold text-neutral-200">Free Express Shipping</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
              <RefreshCw className="h-5 w-5 text-lime-400" />
              <span className="text-xs font-semibold text-neutral-200">30-Day Easy Returns</span>
            </div>
            <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-neutral-900/60 border border-neutral-800/80">
              <ShieldCheck className="h-5 w-5 text-lime-400" />
              <span className="text-xs font-semibold text-neutral-200">Secure Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
