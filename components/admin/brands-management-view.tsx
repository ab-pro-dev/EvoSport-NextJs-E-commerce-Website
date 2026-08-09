"use client";

import { useState } from "react";
import Image from "next/image";
import { Tag, Plus, Edit2, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface BrandItem {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  _count: { products: number };
}

interface BrandsManagementViewProps {
  initialBrands: BrandItem[];
}

export function BrandsManagementView({ initialBrands }: BrandsManagementViewProps) {
  const [brands, setBrands] = useState<BrandItem[]>(initialBrands);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/admin/brands", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          logoUrl: logoUrl || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create brand.");
        setIsSubmitting(false);
        return;
      }

      setBrands([...brands, data.brand]);
      setIsAddModalOpen(false);
      setName("");
      setSlug("");
      setLogoUrl("");
    } catch (err) {
      console.error("Error creating brand:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: string, brandName: string) => {
    if (!confirm(`Are you sure you want to delete brand "${brandName}"?`)) return;

    try {
      setDeletingId(id);
      setErrorMsg(null);

      const res = await fetch(`/api/admin/brands/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to delete brand.");
        setDeletingId(null);
        return;
      }

      setBrands(brands.filter((b) => b.id !== id));
    } catch (err) {
      console.error("Error deleting brand:", err);
      setErrorMsg("Failed to delete brand.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Tag className="h-6 w-6 text-rose-500" />
            BRAND MANAGEMENT
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage athletic manufacturer brands and logos.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-rose-600 text-white font-black uppercase text-xs tracking-wider hover:bg-rose-500 rounded-lg h-10 px-5"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Brand
        </Button>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-900/60 bg-rose-950/40 p-4 text-xs text-rose-300 font-medium flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-neutral-400 hover:text-white">✕</button>
        </div>
      )}

      {/* Brands Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((b) => (
          <div key={b.id} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 relative rounded bg-neutral-950 flex items-center justify-center overflow-hidden border border-neutral-800 shrink-0">
                {b.logoUrl ? (
                  <Image src={b.logoUrl} alt={b.name} fill sizes="32px" className="object-contain p-1" />
                ) : (
                  <Tag className="h-4 w-4 text-neutral-600" />
                )}
              </div>
              <div>
                <p className="font-bold text-white text-xs">{b.name}</p>
                <p className="text-[10px] text-neutral-500 font-mono">/{b.slug}</p>
                <p className="text-[10px] text-rose-400 font-bold mt-0.5">{b._count.products} products attached</p>
              </div>
            </div>

            <button
              onClick={() => handleDeleteBrand(b.id, b.name)}
              disabled={deletingId === b.id}
              className="text-neutral-400 hover:text-rose-400 transition-colors p-2"
              title="Delete Brand"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add Brand Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-6">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-white">ADD BRAND</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateBrand} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Brand Name *</label>
                <Input
                  required
                  placeholder="e.g. Nike Pro"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">URL Slug *</label>
                <Input
                  required
                  placeholder="nike-pro"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Logo Image URL (Optional)</label>
                <Input
                  placeholder="https://placehold.co/150x50..."
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-neutral-800 text-xs text-neutral-400 font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-500 rounded-lg px-6"
                >
                  {isSubmitting ? "Creating..." : "Create Brand"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
