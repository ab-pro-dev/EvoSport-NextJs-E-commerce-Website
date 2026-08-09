"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Package, Search, Filter, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice: number | null;
  status: string;
  brand: { id: string; name: string };
  category: { id: string; name: string };
  image: string | null;
  imagesCount: number;
  variantsCount: number;
  totalStock: number;
  createdAt: string;
}

interface ProductsListViewProps {
  initialProducts: ProductItem[];
  brands: { id: string; name: string }[];
  categories: { id: string; name: string }[];
}

export function ProductsListView({ initialProducts, brands, categories }: ProductsListViewProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State for Add Product
  const [newProductName, setNewProductName] = useState("");
  const [newProductSlug, setNewProductSlug] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newBrandId, setNewBrandId] = useState(brands[0]?.id || "");
  const [newCategoryId, setNewCategoryId] = useState(categories[0]?.id || "");
  const [newBasePrice, setNewBasePrice] = useState("");
  const [newComparePrice, setNewComparePrice] = useState("");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNameChange = (val: string) => {
    setNewProductName(val);
    setNewProductSlug(
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "")
    );
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProductName,
          slug: newProductSlug,
          description: newProductDesc,
          brandId: newBrandId,
          categoryId: newCategoryId,
          basePrice: parseFloat(newBasePrice),
          compareAtPrice: newComparePrice ? parseFloat(newComparePrice) : null,
          status: newStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const msg = data.error || "Failed to create product.";
        setErrorMsg(msg);
        toast.error(msg);
        setIsSubmitting(false);
        return;
      }

      toast.success(`Product "${newProductName}" created successfully!`);

      // Add new product to local list
      const addedProduct: ProductItem = {
        id: data.product.id,
        name: data.product.name,
        slug: data.product.slug,
        description: data.product.description,
        basePrice: Number(data.product.basePrice),
        compareAtPrice: data.product.compareAtPrice ? Number(data.product.compareAtPrice) : null,
        status: data.product.status,
        brand: data.product.brand,
        category: data.product.category,
        image: null,
        imagesCount: 0,
        variantsCount: 0,
        totalStock: 0,
        createdAt: data.product.createdAt,
      };

      setProducts([addedProduct, ...products]);
      setIsAddModalOpen(false);
      setNewProductName("");
      setNewProductSlug("");
      setNewProductDesc("");
      setNewBasePrice("");
      setNewComparePrice("");
    } catch (err: any) {
      console.error("Error creating product:", err);
      const msg = err?.message || "Network error. Please try again.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
      return;
    }
    try {
      setIsDeleting(id);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        const msg = data.error || "Failed to delete product.";
        toast.error(msg);
        setIsDeleting(null);
        return;
      }

      toast.success(`Product "${name}" deleted successfully!`);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("Error deleting product:", err);
      const msg = err?.message || "Failed to delete product.";
      toast.error(msg);
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-rose-500" />
            PRODUCT MANAGEMENT
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage product catalog, inventory stock, and Cloudinary media assets.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-rose-600 text-white font-black uppercase text-xs tracking-wider hover:bg-rose-500 rounded-lg h-10 px-5"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search by name, slug, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-neutral-950 border-neutral-800 text-xs text-white pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 text-xs text-white rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Variants / Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-500 italic">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-900/90 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative rounded bg-neutral-950 overflow-hidden border border-neutral-800 shrink-0">
                          {p.image ? (
                            <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-neutral-600">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-xs">{p.name}</p>
                          <p className="text-[10px] text-neutral-500 font-mono">/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-white">{p.category?.name}</span>
                      <span className="block text-[10px] text-neutral-500">{p.brand?.name}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white">
                      ${p.basePrice.toFixed(2)}
                      {p.compareAtPrice && (
                        <span className="block text-[10px] text-neutral-500 line-through">
                          ${p.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white">{p.variantsCount} variants</span>
                      <span className="block text-[10px] text-neutral-400">Total Stock: {p.totalStock}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.status === "ACTIVE"
                            ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800"
                            : p.status === "DRAFT"
                            ? "bg-amber-950/80 text-amber-400 border border-amber-800"
                            : "bg-rose-950/80 text-rose-400 border border-rose-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:border-rose-500 hover:text-rose-400 transition-colors"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={isDeleting === p.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-400 hover:border-rose-800 hover:text-rose-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-6">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-white">ADD NEW PRODUCT</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Product Name *</label>
                <Input
                  required
                  placeholder="Apex Carbon Running Shoe"
                  value={newProductName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">URL Slug *</label>
                <Input
                  required
                  placeholder="apex-carbon-running-shoe"
                  value={newProductSlug}
                  onChange={(e) => setNewProductSlug(e.target.value)}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Brand *</label>
                  <select
                    value={newBrandId}
                    onChange={(e) => setNewBrandId(e.target.value)}
                    className="mt-1 w-full bg-neutral-950 border border-neutral-800 text-xs text-white rounded-lg p-2.5"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Category *</label>
                  <select
                    value={newCategoryId}
                    onChange={(e) => setNewCategoryId(e.target.value)}
                    className="mt-1 w-full bg-neutral-950 border border-neutral-800 text-xs text-white rounded-lg p-2.5"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Base Price ($) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="149.99"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Compare Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="189.99"
                    value={newComparePrice}
                    onChange={(e) => setNewComparePrice(e.target.value)}
                    className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full bg-neutral-950 border border-neutral-800 text-xs text-white rounded-lg p-2.5"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Pro-grade athletic gear description..."
                  className="mt-1 w-full bg-neutral-950 border border-neutral-800 text-xs text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
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
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
