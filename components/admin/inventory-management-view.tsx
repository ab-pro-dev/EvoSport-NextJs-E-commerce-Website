"use client";

import { useState } from "react";
import Link from "next/link";
import { Boxes, Search, AlertTriangle, CheckCircle2, XCircle, Edit2, Save, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface InventoryVariant {
  id: string;
  sku: string;
  color: string;
  size: string;
  stock: number | null;
  price: number | null;
  productId: string;
  productName: string;
  productSlug: string;
  productStatus: string;
  updatedAt: string;
}

interface InventoryStats {
  totalVariants: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
}

interface InventoryManagementViewProps {
  initialVariants: InventoryVariant[];
  initialStats: InventoryStats;
}

export function InventoryManagementView({ initialVariants, initialStats }: InventoryManagementViewProps) {
  const [variants, setVariants] = useState<InventoryVariant[]>(initialVariants);
  const [stats, setStats] = useState<InventoryStats>(initialStats);
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState("ALL");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStockValue, setEditStockValue] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  const filteredVariants = variants.filter((v) => {
    const matchesSearch =
      search === "" ||
      v.sku.toLowerCase().includes(search.toLowerCase()) ||
      v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.color.toLowerCase().includes(search.toLowerCase()) ||
      v.size.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (stockFilter === "LOW") return v.stock !== null && v.stock <= 10 && v.stock > 0;
    if (stockFilter === "OUT") return v.stock !== null && v.stock === 0;
    if (stockFilter === "IN") return v.stock === null || v.stock > 10;
    return true;
  });

  const handleStartEdit = (variant: InventoryVariant) => {
    setEditingId(variant.id);
    setEditStockValue(variant.stock === null ? "" : variant.stock.toString());
  };

  const handleSaveStock = async (variantId: string) => {
    try {
      setIsSaving(true);
      const stockInt = editStockValue.trim() === "" ? null : parseInt(editStockValue.trim(), 10);
      if (stockInt !== null && (isNaN(stockInt) || stockInt < 0)) {
        alert("Please enter a valid non-negative integer for stock or leave blank for unlimited.");
        setIsSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/inventory/${variantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: stockInt }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update stock.");
        setIsSaving(false);
        return;
      }

      const newVariants = variants.map((v) => (v.id === variantId ? { ...v, stock: data.variant.stock } : v));
      setVariants(newVariants);
      setEditingId(null);

      // Recalculate stats
      const inStock = newVariants.filter((v) => v.stock === null || v.stock > 10).length;
      const lowStock = newVariants.filter((v) => v.stock !== null && v.stock <= 10 && v.stock > 0).length;
      const outOfStock = newVariants.filter((v) => v.stock !== null && v.stock === 0).length;

      setStats({
        totalVariants: newVariants.length,
        inStockCount: inStock,
        lowStockCount: lowStock,
        outOfStockCount: outOfStock,
      });
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Failed to update stock.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Boxes className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            INVENTORY & STOCK CONTROL
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Monitor real-time warehouse stock levels, edit variant inventory counts, and track low stock alerts.
          </p>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Total Variants</p>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-1">{stats.totalVariants}</p>
        </div>

        <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">In Stock (&gt;10)</p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{stats.inStockCount}</p>
        </div>

        <div className="rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Low Stock (≤10)</p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{stats.lowStockCount}</p>
        </div>

        <div className="rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 p-4 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400">Out of Stock (0)</p>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{stats.outOfStockCount}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900/60 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
          <Input
            placeholder="Search SKU, product name, color, size..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Stock Levels</option>
            <option value="LOW">Low Stock (≤ 10)</option>
            <option value="OUT">Out of Stock (0)</option>
            <option value="IN">Healthy Stock (&gt; 10)</option>
          </select>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Product Name</th>
                <th className="py-3.5 px-4">Variant (Color / Size)</th>
                <th className="py-3.5 px-4">Current Stock</th>
                <th className="py-3.5 px-4">Stock Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
              {filteredVariants.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                    No product variants found.
                  </td>
                </tr>
              ) : (
                filteredVariants.map((v) => {
                  const isEditing = editingId === v.id;
                  const isUnlimited = v.stock === null;
                  const isLow = v.stock !== null && v.stock <= 10 && v.stock > 0;
                  const isOut = v.stock !== null && v.stock === 0;

                  return (
                    <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/90 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-rose-600 dark:text-rose-400 text-xs">{v.sku}</td>

                      <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                        <Link href={`/admin/products`} className="hover:underline">
                          {v.productName}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-600 dark:text-neutral-300">
                        {v.color} / <span className="font-bold text-neutral-900 dark:text-white">{v.size}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="0"
                              placeholder="Blank=Unlimited"
                              value={editStockValue}
                              onChange={(e) => setEditStockValue(e.target.value)}
                              className="w-24 h-7 text-xs bg-gray-50 dark:bg-neutral-950 border-rose-500 text-neutral-900 dark:text-white font-bold"
                            />
                            <Button
                              onClick={() => handleSaveStock(v.id)}
                              disabled={isSaving}
                              className="h-7 px-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold"
                            >
                              <Save className="h-3 w-3" />
                            </Button>
                          </div>
                        ) : isUnlimited ? (
                          <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                            Unlimited
                          </span>
                        ) : (
                          <span className={`font-black text-sm ${isOut ? "text-rose-600 dark:text-rose-400" : isLow ? "text-amber-600 dark:text-amber-400" : "text-neutral-900 dark:text-white"}`}>
                            {v.stock} units
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {isUnlimited ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            <CheckCircle2 className="h-3 w-3" /> Unlimited
                          </span>
                        ) : isOut ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                            <XCircle className="h-3 w-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                            <AlertTriangle className="h-3 w-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                            <CheckCircle2 className="h-3 w-3" /> In Stock
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        {!isEditing && (
                          <button
                            onClick={() => handleStartEdit(v)}
                            className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white font-bold text-xs inline-flex items-center gap-1"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                            Edit Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
