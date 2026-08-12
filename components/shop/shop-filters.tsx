"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, RotateCcw, Filter, Check, Star } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ShopFiltersProps {
  brands: { id: string; name: string; slug: string }[];
  selectedGender?: string;
  selectedCategory?: string;
  selectedBrand?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
}

const CATEGORY_OPTIONS = [
  { label: "All", value: "" },
  { label: "Footwear / Running Shoes", value: "running-shoes" },
  { label: "Apparel", value: "apparel" },
  { label: "Gym Gear", value: "gym-gear" },
  { label: "Accessories", value: "accessories" },
];

const GENDER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Men", value: "men" },
  { label: "Women", value: "women" },
  { label: "Kids", value: "kids" },
  { label: "Unisex", value: "unisex" },
];

export function ShopFilters({ brands }: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentGender = searchParams.get("gender") || "";
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

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];
  const colors = [
    { name: "Black", bg: "bg-black" },
    { name: "White", bg: "bg-white border-neutral-700" },
    { name: "Cyan", bg: "bg-cyan-500" },
    { name: "Red", bg: "bg-red-500" },
    { name: "Neon Green", bg: "bg-[#CCFF00]" },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm text-[#0F1B2D] space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-[#0F1B2D]">
          <Filter className="h-4 w-4 text-[#B8FF00]" />
          <span>FILTERS</span>
        </div>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 text-[11px] text-[#0F1B2D]/40 hover:text-[#5B8DEF] transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Clear All
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60">
          Search
        </label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#0F1B2D]/40" />
          <Input
            placeholder="Search products..."
            value={currentSearch}
            onChange={(e) => updateFilter("search", e.target.value || null)}
            className="pl-9 bg-[#F4F8FC] border-gray-200 text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
          />
        </div>
      </div>

      {/* 1. Product Type / Category (Above Gender) */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 mb-3">
          Product Type
        </h4>
        <div className="space-y-1.5">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat.value}
              onClick={() =>
                updateFilter("category", currentCategory === cat.value ? null : cat.value || null)
              }
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                currentCategory === cat.value
                  ? "bg-[#B8FF00]/15 text-[#0F1B2D] font-bold"
                  : "text-[#0F1B2D]/60 hover:bg-[#F4F8FC] hover:text-[#0F1B2D]"
              }`}
            >
              <span>{cat.label}</span>
              {currentCategory === cat.value && <Check className="h-3.5 w-3.5 text-[#0F1B2D]" />}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Gender Section */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 mb-3">
          Gender
        </h4>
        <div className="space-y-1.5">
          {GENDER_OPTIONS.map((g) => (
            <button
              key={g.value}
              onClick={() => updateFilter("gender", currentGender === g.value ? null : g.value || null)}
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                currentGender === g.value
                  ? "bg-[#B8FF00]/15 text-[#0F1B2D] font-bold"
                  : "text-[#0F1B2D]/60 hover:bg-[#F4F8FC] hover:text-[#0F1B2D]"
              }`}
            >
              <span>{g.label}</span>
              {currentGender === g.value && <Check className="h-3.5 w-3.5 text-[#0F1B2D]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 mb-3">
          Price Range ($)
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="bg-[#F4F8FC] border-gray-200 text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
          />
          <span className="text-[#0F1B2D]/40">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="bg-[#F4F8FC] border-gray-200 text-[#0F1B2D] placeholder:text-[#0F1B2D]/40 focus-visible:ring-[#B8FF00]"
          />
        </div>
        <Button
          onClick={handlePriceApply}
          size="sm"
          className="mt-3 w-full bg-[#B8FF00] hover:bg-[#a8ef00] text-[#0F1B2D] text-xs font-bold uppercase tracking-wider transition-colors"
        >
          Apply Price
        </Button>
      </div>

      {/* Brands */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 mb-3">
          Brand
        </h4>
        <div className="space-y-1.5">
          {brands.map((b) => (
            <button
              key={b.id}
              onClick={() =>
                updateFilter("brand", currentBrand === b.slug ? null : b.slug)
              }
              className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                currentBrand === b.slug
                  ? "bg-[#B8FF00]/15 text-[#0F1B2D] font-bold"
                  : "text-[#0F1B2D]/60 hover:bg-[#F4F8FC] hover:text-[#0F1B2D]"
              }`}
            >
              <span>{b.name}</span>
              {currentBrand === b.slug && <Check className="h-3.5 w-3.5 text-[#0F1B2D]" />}
            </button>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 mb-3">
          Size
        </h4>
        <div className="grid grid-cols-4 gap-1.5">
          {sizes.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
              className={`rounded-md border py-1.5 text-xs font-bold transition-colors ${
                selectedSize === s
                  ? "border-[#B8FF00] bg-[#B8FF00]/20 text-[#0F1B2D]"
                  : "border-gray-200 bg-[#F4F8FC] text-[#0F1B2D]/50 hover:border-gray-300 hover:text-[#0F1B2D]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Color Swatches */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 mb-3">
          Color
        </h4>
        <div className="flex items-center gap-2.5">
          {colors.map((c) => (
            <button
              key={c.name}
              title={c.name}
              onClick={() => setSelectedColor(selectedColor === c.name ? "" : c.name)}
              className={`h-6 w-6 rounded-full border ${c.bg} flex items-center justify-center transition-transform ${
                selectedColor === c.name ? "ring-2 ring-[#B8FF00] ring-offset-2 ring-offset-white scale-110" : "hover:scale-105"
              }`}
            >
              {selectedColor === c.name && <Check className="h-3 w-3 text-black" />}
            </button>
          ))}
        </div>
      </div>

      {/* Rating */}
      <div className="border-t border-gray-100 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 mb-3">
          Rating
        </h4>
        <div className="space-y-1.5">
          {[4, 3, 2].map((r) => (
            <button
              key={r}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs text-[#0F1B2D]/60 hover:bg-gray-50 hover:text-[#0F1B2D] transition-colors"
            >
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${i < r ? "fill-amber-400" : "fill-gray-200 text-gray-200"}`}
                  />
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
