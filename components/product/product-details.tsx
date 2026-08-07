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
    : [
        { id: "1", url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600", altText: product.name },
        { id: "2", url: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600", altText: product.name },
        { id: "3", url: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600", altText: product.name },
      ];

  const [selectedImage, setSelectedImage] = useState(images[0].url);
  const [selectedColor, setSelectedColor] = useState(product.variants[0]?.color || "Black / Neon Green");
  const [selectedSize, setSelectedSize] = useState(product.variants[0]?.size || "9");
  const [quantity, setQuantity] = useState(1);

  const sizes = ["7", "8", "9", "10", "11", "12"];
  const colors = [
    { name: "Black / Neon Green", bg: "bg-black border-[#CCFF00]" },
    { name: "White / Cyan", bg: "bg-white border-cyan-400" },
    { name: "Stealth Black", bg: "bg-neutral-900 border-neutral-700" },
    { name: "Crimson Red", bg: "bg-red-600 border-red-400" },
  ];

  const currentVariant = product.variants.find(
    (v) => (v.color === selectedColor || !selectedColor) && (v.size === selectedSize || !selectedSize)
  ) || product.variants[0];

  const price = currentVariant?.price ? Number(currentVariant.price) : Number(product.basePrice);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const discountPercent = compareAt && compareAt > price
    ? Math.round(((compareAt - price) / compareAt) * 100)
    : null;

  const inStock = (currentVariant?.stock ?? 12) > 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-neutral-400 font-medium">
        <Link href="/" className="hover:text-[#CCFF00] transition-colors">Home</Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <Link href="/shop" className="hover:text-[#CCFF00] transition-colors">Men</Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <Link href={`/shop?category=${product.category.slug}`} className="hover:text-[#CCFF00] transition-colors">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3 text-neutral-600" />
        <span className="text-white font-bold truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main Grid: Left Gallery + Right Panel */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column (5 cols): Vertical Thumbnails + Main Image */}
        <div className="lg:col-span-6 flex gap-4">
          {/* Vertical Thumbnail Strip Stacked to the Left */}
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

          {/* Large Main Product Image Box */}
          <div className="relative aspect-square flex-1 overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 p-6 shadow-2xl">
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              className="object-cover object-center transition-all duration-300"
            />

            {/* Badges Overlay */}
            <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10">
              <Badge className="bg-[#CCFF00] text-black font-extrabold text-xs tracking-wider uppercase px-2.5 py-1 rounded">
                BEST SELLER
              </Badge>
              {discountPercent && (
                <Badge className="bg-rose-600 text-white font-extrabold text-xs px-2.5 py-0.5 rounded">
                  -{discountPercent}%
                </Badge>
              )}
            </div>

            {/* Heart Icon */}
            <button
              aria-label="Add to wishlist"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-900/80 text-neutral-400 backdrop-blur-md transition-colors hover:text-[#CCFF00]"
            >
              <Heart className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Right Column (6 cols): Product Options & Checkout CTA */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white uppercase">
              {product.name}
            </h1>
            
            {/* Rating Stars & Count */}
            <div className="mt-2 flex items-center gap-2">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-neutral-300">
                (128 reviews)
              </span>
            </div>
          </div>

          {/* Price Header */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-[#CCFF00]">${price.toFixed(2)}</span>
            {compareAt && compareAt > price && (
              <span className="text-base text-neutral-500 line-through">${compareAt.toFixed(2)}</span>
            )}
          </div>

          {/* Summary Description */}
          <p className="text-xs leading-relaxed text-neutral-400">
            Engineered for speed, comfort and durability. The EvoRun Pro delivers maximum performance with lightweight design and superior grip.
          </p>

          {/* Color Selection */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-neutral-300">
              Color: <span className="text-white font-normal">{selectedColor}</span>
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              {colors.map((c) => (
                <button
                  key={c.name}
                  title={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  className={`h-7 w-7 rounded-full border-2 ${c.bg} transition-all ${
                    selectedColor === c.name ? "ring-2 ring-[#CCFF00] ring-offset-2 ring-offset-neutral-950 scale-110" : "hover:scale-105 opacity-80"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-300">
                Size: <span className="text-white font-normal">US</span>
              </span>
              <button className="text-xs text-neutral-400 hover:text-[#CCFF00] underline font-medium transition-colors">
                Size Guide
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`h-9 w-12 rounded-md border text-xs font-bold transition-all ${
                    selectedSize === size
                      ? "border-[#CCFF00] bg-[#CCFF00]/10 text-[#CCFF00]"
                      : "border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-neutral-700 hover:text-white"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Status Indicator */}
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>In Stock</span>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex gap-3">
              {/* Quantity Stepper */}
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

              {/* Primary ADD TO CART Button */}
              <Button
                size="lg"
                disabled={!inStock}
                className="flex-1 bg-[#CCFF00] font-black text-black hover:bg-[#b8e600] h-11 text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-[#CCFF00]/10"
              >
                <ShoppingBag className="mr-2 h-4 w-4" />
                ADD TO CART
              </Button>

              {/* Secondary BUY NOW Button */}
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

            {/* Wishlist & Compare Links */}
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

          {/* Trust Badges Bar (Mockup Row) */}
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
