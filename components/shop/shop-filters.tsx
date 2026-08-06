"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw, Filter, Check, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface ShopFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  brands: { id: string; name: string; slug: string }[];
}

export function ShopFilters({ categories, brands }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentBrand = searchParams.get("brand") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSearch = searchParams.get("search") || "";

  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      
      newSearchParams.set("page", "1");

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const updateFilter = (key: string, value: string | null) => {
    const queryString = createQueryString({ [key]: value });
    router.push(`${pathname}?${queryString}`);
  };

  const handlePriceApply = () => {
    const queryString = createQueryString({
      minPrice: minPriceInput || null,
      maxPrice: maxPriceInput || null,
    });
    router.push(`${pathname}?${queryString}`);
  };

  const handleClearAll = () => {
    setMinPriceInput("");
    setMaxPriceInput("");
    setSelectedSize("");
    setSelectedColor("");
    router.push(pathname);
  };

  const sizes = ["US 8", "US 9", "US 10", "US 11", "S", "M", "L", "XL"];
  const colors = [
    { name: "Black", bg: "bg-black" },
    { name: "White", bg: "bg-white border-neutral-700" },
    { name: "Cyan", bg: "bg-cyan-500" },
    { name: "Red", bg: "bg-red-500" },
    { name: "Gray", bg: "bg-neutral-500" },
  ];

  return (
    <Card className="border-neutral-800 bg-neutral-900/80 p-5 backdrop-blur-md text-white">
      <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-2 font-bold text-lg text-lime-400">
          <Filter className="h-5 w-5" />
          <span>Filters</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearAll}
          className="h-8 text-xs text-neutral-400 hover:text-lime-400 hover:bg-neutral-800"
        >
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Clear All
        </Button>
      </div>

      {/* Search Input */}
      <div className="mt-5">
        <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
          Search
        </label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search products..."
            value={currentSearch}
            onChange={(e) => updateFilter("search", e.target.value || null)}
            className="pl-9 bg-neutral-950 border-neutral-800 text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-lime-500"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 border-t border-neutral-800/60 pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Category
        </h4>
        <div className="space-y-1.5">
          <button
            onClick={() => updateFilter("category", null)}
            className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              currentCategory === ""
                ? "bg-lime-500/10 text-lime-400 border border-lime-500/30"
                : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
            }`}
          >
            <span>All Categories</span>
            {currentCategory === "" && <Check className="h-4 w-4 text-lime-400" />}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                updateFilter("category", currentCategory === cat.slug ? null : cat.slug)
              }
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentCategory === cat.slug
                  ? "bg-lime-500/10 text-lime-400 border border-lime-500/30"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <span>{cat.name}</span>
              {currentCategory === cat.slug && <Check className="h-4 w-4 text-lime-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="mt-6 border-t border-neutral-800/60 pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Price Range ($)
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="bg-neutral-950 border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-lime-500"
          />
          <span className="text-neutral-600">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="bg-neutral-950 border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-600 focus-visible:ring-lime-500"
          />
        </div>
        <Button
          onClick={handlePriceApply}
          size="sm"
          className="mt-3 w-full bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-semibold"
        >
          Apply Price
        </Button>
      </div>

      {/* Brands */}
      <div className="mt-6 border-t border-neutral-800/60 pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Brand
        </h4>
        <div className="space-y-1.5">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() =>
                updateFilter("brand", currentBrand === b.slug ? null : b.slug)
              }
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                currentBrand === b.slug
                  ? "bg-lime-500/10 text-lime-400 border border-lime-500/30"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
              }`}
            >
              <span>{b.name}</span>
              {currentBrand === b.slug && <Check className="h-4 w-4 text-lime-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="mt-6 border-t border-neutral-800/60 pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Size
        </h4>
        <div className="flex flex-wrap gap-2">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
              className={`rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                selectedSize === s
                  ? "border-lime-500 bg-lime-500/20 text-lime-400 font-bold"
                  : "border-neutral-800 bg-neutral-950 text-neutral-400 hover:border-neutral-700 hover:text-white"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color Swatches */}
      <div className="mt-6 border-t border-neutral-800/60 pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Color
        </h4>
        <div className="flex items-center gap-3">
          {colors.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => setSelectedColor(selectedColor === c.name ? "" : c.name)}
              className={`h-7 w-7 rounded-full border-2 ${c.bg} flex items-center justify-center transition-transform ${
                selectedColor === c.name ? "ring-2 ring-lime-400 ring-offset-2 ring-offset-neutral-900 scale-110" : "hover:scale-105"
              }`}
            >
              {selectedColor === c.name && <Check className="h-3.5 w-3.5 text-lime-500" />}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="mt-6 border-t border-neutral-800/60 pt-5">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
            >
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3.5 w-3.5 ${i < r ? "fill-amber-400" : "fill-neutral-800 text-neutral-800"}`}
                  />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </div>
    </Card>
  );
}
