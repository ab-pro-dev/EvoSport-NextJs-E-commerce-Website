"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  RotateCcw,
  Filter,
  Check,
  ChevronDown,
  ChevronRight,
  Menu,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCategoryIcon } from "./category-icons";

export interface CategoryTreeItem {
  id: string;
  name: string;
  slug: string;
  children: {
    id: string;
    name: string;
    slug: string;
  }[];
}

interface ShopFiltersProps {
  categories?: CategoryTreeItem[];
  brands?: { id: string; name: string; slug: string }[];
  selectedGender?: string;
  selectedCategory?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  search?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onExpand?: () => void;
  isMobileDrawer?: boolean;
}

const GENDER_OPTIONS = [
  { label: "All", value: "" },
  { label: "Men", value: "MEN" },
  { label: "Women", value: "WOMEN" },
  { label: "Kids", value: "KIDS" },
  { label: "Unisex", value: "UNISEX" },
];

const COLLAPSED_RAIL_ITEMS = [
  { name: "All Products", slug: "", isGender: false },
  { name: "Footwear", slug: "footwear", isGender: false },
  { name: "Apparel", slug: "apparel-parent", isGender: false },
  { name: "Jerseys & Teamwear", slug: "jerseys-teamwear", isGender: false },
  { name: "Gym & Training", slug: "gym-training", isGender: false },
  { name: "Bags", slug: "bags", isGender: false },
  { name: "Hydration", slug: "hydration", isGender: false },
  { name: "Accessories", slug: "accessories-parent", isGender: false },
  { name: "Gender", slug: "gender", isGender: true },
];

export function ShopFilters({
  categories = [],
  isCollapsed = false,
  onToggleCollapse,
  onExpand,
  isMobileDrawer = false,
}: ShopFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentGender = searchParams.get("gender") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";
  const currentSearch = searchParams.get("search") || "";

  const [searchInput, setSearchInput] = useState(currentSearch);
  const [minPriceInput, setMinPriceInput] = useState(currentMinPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(currentMaxPrice);

  // Sync search input if URL changes externally
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Open categories state
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    for (const parent of categories) {
      const isParentActive = currentCategory === parent.slug;
      const isChildActive = parent.children.some((child) => child.slug === currentCategory);
      if (isParentActive || isChildActive) {
        initial[parent.slug] = true;
      }
    }
    return initial;
  });

  const toggleCategoryOpen = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setOpenCategories((prev) => ({
      ...prev,
      [slug]: !prev[slug],
    }));
  };

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

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const queryString = createQueryString({ [key]: value });
      router.push(`${pathname}?${queryString}`);
    },
    [createQueryString, pathname, router]
  );

  // Debounced search trigger (350ms)
  useEffect(() => {
    if (searchInput === currentSearch) return;

    const timer = setTimeout(() => {
      updateFilter("search", searchInput.trim() || null);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput, currentSearch, updateFilter]);

  const handlePriceApply = () => {
    const queryString = createQueryString({
      minPrice: minPriceInput || null,
      maxPrice: maxPriceInput || null,
    });
    router.push(`${pathname}?${queryString}`);
  };

  const handleClearAll = () => {
    setSearchInput("");
    setMinPriceInput("");
    setMaxPriceInput("");
    router.push(pathname);
  };

  const handleRailIconClick = (item: { name: string; slug: string; isGender: boolean }) => {
    if (item.isGender) {
      // Gender icon: auto-expand sidebar so user can choose from Men/Women/Kids/Unisex
      if (onExpand) onExpand();
      const genderElem = document.getElementById("shop-filter-gender-section");
      if (genderElem) {
        genderElem.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      // Category icon: apply filter directly AND auto-expand sidebar back to full view
      updateFilter("category", item.slug || null);
      if (onExpand) onExpand();
    }
  };

  // If in collapsed mode (desktop only), render the slim vertical icon rail
  if (isCollapsed && !isMobileDrawer) {
    return (
      <div className="w-16 flex-shrink-0 flex flex-col items-center py-3.5 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-sm select-none transition-all duration-300">
        {/* Hamburger / Menu Toggle Icon (always at top) */}
        <div className="relative group flex items-center justify-center">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0F1B2D] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 border border-transparent hover:border-gray-200 dark:hover:border-slate-700 transition-all shadow-sm"
            title="Expand Filters"
            aria-label="Expand Filters"
          >
            <Menu className="h-5 w-5 stroke-[2.5]" />
          </button>

          {/* Floating Tooltip */}
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden group-hover:flex items-center">
            <span className="rounded-md bg-[#0F1B2D] dark:bg-white text-white dark:text-[#0F1B2D] px-2.5 py-1 text-xs font-bold whitespace-nowrap shadow-xl">
              Expand Filters
            </span>
          </div>
        </div>

        {/* Divider line below hamburger */}
        <div className="w-8 h-[1px] bg-gray-200 dark:bg-slate-800 my-3" />

        {/* Vertical Icon Rail */}
        <div className="flex flex-col items-center gap-2 w-full px-2">
          {COLLAPSED_RAIL_ITEMS.map((item) => {
            const isGenderActive = item.isGender && !!currentGender;
            const isCategoryActive =
              !item.isGender &&
              ((!item.slug && !currentCategory) ||
                (item.slug &&
                  (currentCategory === item.slug ||
                    categories
                      .find((c) => c.slug === item.slug)
                      ?.children.some((ch) => ch.slug === currentCategory))));
            const isActive = isGenderActive || isCategoryActive;

            return (
              <div key={item.name} className="relative group w-full flex justify-center">
                <button
                  type="button"
                  onClick={() => handleRailIconClick(item)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                    isActive
                      ? "bg-[#B8FF00] text-[#0F1B2D] shadow-md shadow-[#B8FF00]/25 font-bold scale-105"
                      : "text-[#0F1B2D]/60 dark:text-slate-400 hover:text-[#0F1B2D] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  title={item.name}
                  aria-label={item.name}
                >
                  {getCategoryIcon(item.slug, "h-4 w-4")}
                </button>

                {/* Floating Tooltip */}
                <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none hidden group-hover:flex items-center">
                  <span className="rounded-md bg-[#0F1B2D] dark:bg-white text-white dark:text-[#0F1B2D] px-2.5 py-1 text-xs font-bold whitespace-nowrap shadow-xl">
                    {item.name}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // EXPANDED STATE (or mobile drawer)
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-sm text-[#0F1B2D] dark:text-slate-100 space-y-6 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 font-black text-sm uppercase tracking-wider text-[#0F1B2D] dark:text-white">
          {!isMobileDrawer && onToggleCollapse ? (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-[#0F1B2D] dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors mr-1"
              title="Collapse to icon rail"
              aria-label="Collapse to icon rail"
            >
              <Menu className="h-4 w-4 text-[#B8FF00]" />
            </button>
          ) : (
            <Filter className="h-4 w-4 text-[#B8FF00]" />
          )}
          <span>FILTERS</span>
        </div>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1 text-[11px] text-[#0F1B2D]/40 dark:text-slate-400 hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Clear All
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">
          Search
        </label>
        <div className="relative mt-2">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[#0F1B2D]/40 dark:text-slate-500" />
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                updateFilter("search", searchInput.trim() || null);
              }
            }}
            className="pl-9 bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-[#0F1B2D] dark:text-white placeholder:text-[#0F1B2D]/40 dark:placeholder:text-slate-500 focus-visible:ring-[#B8FF00] text-xs h-9"
          />
        </div>
      </div>

      {/* 1. Product Type / Category Tree */}
      <div className="border-t border-gray-100 dark:border-slate-800 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400">
            Product Type
          </h4>
          <span className="text-[10px] text-[#0F1B2D]/40 dark:text-slate-500 font-semibold">
            {categories.length} Categories
          </span>
        </div>

        <div className="space-y-1">
          {/* All Product Types option */}
          <button
            onClick={() => updateFilter("category", null)}
            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
              !currentCategory
                ? "bg-[#B8FF00]/15 dark:bg-[#B8FF00]/20 text-[#0F1B2D] dark:text-[#B8FF00] font-bold"
                : "text-[#0F1B2D]/60 dark:text-slate-400 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/60 hover:text-[#0F1B2D] dark:hover:text-white"
            }`}
          >
            <span>All Product Types</span>
            {!currentCategory && <Check className="h-3.5 w-3.5 text-[#0F1B2D] dark:text-[#B8FF00]" />}
          </button>

          {/* Parent Categories Tree */}
          {categories.map((parent) => {
            const isParentActive = currentCategory === parent.slug;
            const isOpen = !!openCategories[parent.slug];
            const hasChildren = parent.children && parent.children.length > 0;
            const hasActiveChild = parent.children.some((child) => child.slug === currentCategory);

            return (
              <div key={parent.id} className="space-y-1 pt-1">
                {/* Parent Row */}
                <div
                  className={`group flex items-center justify-between rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ${
                    isParentActive
                      ? "bg-[#B8FF00]/15 dark:bg-[#B8FF00]/20 text-[#0F1B2D] dark:text-[#B8FF00] font-bold"
                      : hasActiveChild
                      ? "text-[#0F1B2D] dark:text-white font-bold bg-gray-50 dark:bg-slate-800/40"
                      : "text-[#0F1B2D]/80 dark:text-slate-300 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/60"
                  }`}
                >
                  <button
                    onClick={() => {
                      updateFilter("category", isParentActive ? null : parent.slug);
                      if (!isOpen && hasChildren) {
                        setOpenCategories((prev) => ({ ...prev, [parent.slug]: true }));
                      }
                    }}
                    className="flex-1 text-left flex items-center gap-1.5 truncate"
                  >
                    <span>{parent.name}</span>
                    {isParentActive && (
                      <Check className="h-3 w-3 text-[#0F1B2D] dark:text-[#B8FF00] shrink-0" />
                    )}
                  </button>

                  {hasChildren && (
                    <button
                      onClick={(e) => toggleCategoryOpen(parent.slug, e)}
                      className="p-1 text-[#0F1B2D]/40 dark:text-slate-500 hover:text-[#0F1B2D] dark:hover:text-white transition-colors"
                      title={isOpen ? "Collapse subcategories" : "Expand subcategories"}
                    >
                      {isOpen ? (
                        <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>

                {/* Subcategories */}
                {isOpen && hasChildren && (
                  <div className="pl-3.5 pr-1 py-1 space-y-0.5 border-l-2 border-gray-100 dark:border-slate-800 ml-3">
                    {parent.children.map((child) => {
                      const isChildActive = currentCategory === child.slug;

                      return (
                        <button
                          key={child.id}
                          onClick={() =>
                            updateFilter("category", isChildActive ? null : child.slug)
                          }
                          className={`flex w-full items-center justify-between rounded-md px-2 py-1 text-[11px] font-medium transition-colors ${
                            isChildActive
                              ? "bg-[#B8FF00]/20 dark:bg-[#B8FF00]/25 text-[#0F1B2D] dark:text-[#B8FF00] font-bold"
                              : "text-[#0F1B2D]/60 dark:text-slate-400 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/40 hover:text-[#0F1B2D] dark:hover:text-white"
                          }`}
                        >
                          <span className="truncate">{child.name}</span>
                          {isChildActive && (
                            <Check className="h-3 w-3 text-[#0F1B2D] dark:text-[#B8FF00] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Gender Section */}
      <div id="shop-filter-gender-section" className="border-t border-gray-100 dark:border-slate-800 pt-5 scroll-mt-28">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400 mb-3">
          Gender
        </h4>
        <div className="space-y-1.5">
          {GENDER_OPTIONS.map((g) => {
            const isSelected =
              (!g.value && !currentGender) ||
              (g.value && currentGender.toUpperCase() === g.value);

            return (
              <button
                key={g.value}
                onClick={() =>
                  updateFilter("gender", isSelected && g.value ? null : g.value || null)
                }
                className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                  isSelected
                    ? "bg-[#B8FF00]/15 dark:bg-[#B8FF00]/20 text-[#0F1B2D] dark:text-[#B8FF00] font-bold"
                    : "text-[#0F1B2D]/60 dark:text-slate-400 hover:bg-[#F4F8FC] dark:hover:bg-slate-800/60 hover:text-[#0F1B2D] dark:hover:text-white"
                }`}
              >
                <span>{g.label}</span>
                {isSelected && <Check className="h-3.5 w-3.5 text-[#0F1B2D] dark:text-[#B8FF00]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Price Range */}
      <div className="border-t border-gray-100 dark:border-slate-800 pt-5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#0F1B2D]/60 dark:text-slate-400 mb-3">
          Price Range ($)
        </h4>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            value={minPriceInput}
            onChange={(e) => setMinPriceInput(e.target.value)}
            className="bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-[#0F1B2D] dark:text-white placeholder:text-[#0F1B2D]/40 dark:placeholder:text-slate-500 focus-visible:ring-[#B8FF00] text-xs h-9"
          />
          <span className="text-[#0F1B2D]/40 dark:text-slate-500">-</span>
          <Input
            type="number"
            placeholder="Max"
            value={maxPriceInput}
            onChange={(e) => setMaxPriceInput(e.target.value)}
            className="bg-[#F4F8FC] dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-[#0F1B2D] dark:text-white placeholder:text-[#0F1B2D]/40 dark:placeholder:text-slate-500 focus-visible:ring-[#B8FF00] text-xs h-9"
          />
        </div>
        <Button
          onClick={handlePriceApply}
          size="sm"
          className="mt-3 w-full bg-[#B8FF00] hover:bg-[#a8ef00] text-[#0F1B2D] text-xs font-bold uppercase tracking-wider transition-colors shadow-sm h-9"
        >
          Apply Price
        </Button>
      </div>
    </div>
  );
}
