"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Package, Search, Filter, AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";
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

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string; slug: string } | null;
}

interface ProductsListViewProps {
  initialProducts: ProductItem[];
  brands: { id: string; name: string }[];
  categories: CategoryItem[];
}

export function ProductsListView({ initialProducts, brands, categories }: ProductsListViewProps) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Group categories into Parents (Genders) and Subcategories
  const parentCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  const defaultGenderId = parentCategories[0]?.id || "";
  const [selectedGenderId, setSelectedGenderId] = useState(defaultGenderId);

  // Subcategories for the selected gender
  const availableSubcategories = useMemo(() => {
    return categories.filter((c) => c.parentId === selectedGenderId);
  }, [categories, selectedGenderId]);

  // Form State for Add Product
  const [newProductName, setNewProductName] = useState("");
  const [newProductSlug, setNewProductSlug] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newBrandId, setNewBrandId] = useState(brands[0]?.id || "");
  const [newCategoryId, setNewCategoryId] = useState(availableSubcategories[0]?.id || "");
  const [newBasePrice, setNewBasePrice] = useState("");
  const [newComparePrice, setNewComparePrice] = useState("");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Upload State
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleGenderChange = (genderId: string) => {
    setSelectedGenderId(genderId);
    const subcats = categories.filter((c) => c.parentId === genderId);
    if (subcats.length > 0) {
      setNewCategoryId(subcats[0].id);
    } else {
      setNewCategoryId(genderId);
    }
  };

  // Image Upload via File
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "File upload failed.");
        return;
      }

      if (data.secure_url) {
        setImageUrls((prev) => [...prev, data.secure_url]);
        toast.success("Image uploaded successfully!");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error("Network error uploading image.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrlInput.trim()) return;
    setImageUrls((prev) => [...prev, imageUrlInput.trim()]);
    setImageUrlInput("");
    toast.success("Image URL added!");
  };

  const handleRemoveImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload = {
        name: newProductName,
        slug: newProductSlug,
        description: newProductDesc,
        brandId: newBrandId,
        categoryId: newCategoryId || selectedGenderId,
        basePrice: parseFloat(newBasePrice),
        compareAtPrice: newComparePrice ? parseFloat(newComparePrice) : null,
        status: newStatus,
        images: imageUrls.map((url, idx) => ({ url, position: idx })),
      };

      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create product.");
        toast.error(data.error || "Failed to create product.");
        setIsSubmitting(false);
        return;
      }

      toast.success("Product created successfully!");
      setProducts([data, ...products]);
      setIsAddModalOpen(false);

      // Reset Form
      setNewProductName("");
      setNewProductSlug("");
      setNewProductDesc("");
      setNewBasePrice("");
      setNewComparePrice("");
      setImageUrls([]);
      setImageUrlInput("");
    } catch (err: any) {
      console.error("Error adding product:", err);
      const msg = err?.message || "Failed to create product.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      setIsDeleting(id);
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete product.");
      }

      toast.success("Product deleted successfully!");
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            PRODUCT MANAGEMENT
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Manage product catalog, inventory stock, and Cloudinary media assets.
          </p>
        </div>

        <Button
          onClick={() => {
            setIsAddModalOpen(true);
            if (parentCategories.length > 0) {
              handleGenderChange(parentCategories[0].id);
            }
          }}
          className="bg-rose-600 text-white font-black uppercase text-xs tracking-wider hover:bg-rose-500 rounded-lg h-10 px-5 shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-neutral-900/60 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Input
            placeholder="Search by name, slug, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white pl-9"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 dark:text-neutral-500" />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="DRAFT">DRAFT</option>
            <option value="ARCHIVED">ARCHIVED</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">Product</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Variants / Stock</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/90 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative rounded bg-gray-100 dark:bg-neutral-950 overflow-hidden border border-gray-200 dark:border-neutral-800 shrink-0">
                          {p.image ? (
                            <Image src={p.image} alt={p.name} fill sizes="40px" className="object-cover" />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-neutral-400 dark:text-neutral-600">
                              <Package className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900 dark:text-white text-xs">{p.name}</p>
                          <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">/{p.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-900 dark:text-white">{p.category?.name}</span>
                      <span className="block text-[10px] text-neutral-400 dark:text-neutral-500">{p.brand?.name}</span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-900 dark:text-white">
                      ${p.basePrice.toFixed(2)}
                      {p.compareAtPrice && (
                        <span className="block text-[10px] text-neutral-400 dark:text-neutral-500 line-through">
                          ${p.compareAtPrice.toFixed(2)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-neutral-900 dark:text-white">{p.variantsCount} variants</span>
                      <span className="block text-[10px] text-neutral-500 dark:text-neutral-400">Total Stock: {p.totalStock}</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          p.status === "ACTIVE"
                            ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                            : p.status === "DRAFT"
                            ? "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                            : "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-300 hover:border-rose-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-sm"
                          title="Edit Product"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          disabled={isDeleting === p.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="border-b border-gray-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-neutral-900 dark:text-white flex items-center gap-2">
                <Package className="h-5 w-5 text-rose-600 dark:text-rose-500" />
                ADD NEW PRODUCT
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Product Name *</label>
                  <Input
                    required
                    placeholder="e.g. Apex Carbon Speed Shoe"
                    value={newProductName}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">URL Slug *</label>
                  <Input
                    required
                    placeholder="apex-carbon-speed-shoe"
                    value={newProductSlug}
                    onChange={(e) => setNewProductSlug(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                  />
                </div>
              </div>

              {/* Brand Selector */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Brand *</label>
                <select
                  value={newBrandId}
                  onChange={(e) => setNewBrandId(e.target.value)}
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                >
                  {brands.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* TWO-STEP GENDER + CATEGORY PICKER */}
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/60 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <span>Category & Department Selection</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Step 1: Gender Selector */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      1. Gender / Department *
                    </label>
                    <select
                      value={selectedGenderId}
                      onChange={(e) => handleGenderChange(e.target.value)}
                      className="mt-1 w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-rose-500"
                    >
                      {parentCategories.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Specific Subcategory within Gender */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      2. Subcategory *
                    </label>
                    <select
                      value={newCategoryId}
                      onChange={(e) => setNewCategoryId(e.target.value)}
                      className="mt-1 w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-rose-500"
                    >
                      {availableSubcategories.length > 0 ? (
                        availableSubcategories.map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            {sub.name}
                          </option>
                        ))
                      ) : (
                        <option value={selectedGenderId}>General ({parentCategories.find(p => p.id === selectedGenderId)?.name})</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* IMAGE UPLOAD SECTION */}
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Product Images
                  </span>
                  <div className="flex rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageInputMode === "upload" ? "bg-rose-600 text-white" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageInputMode === "url" ? "bg-rose-600 text-white" : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      Paste URL
                    </button>
                  </div>
                </div>

                {imageInputMode === "upload" ? (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="product-image-file-input"
                    />
                    <label
                      htmlFor="product-image-file-input"
                      className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 dark:border-neutral-800 rounded-lg bg-white/70 dark:bg-neutral-900/50 hover:bg-white dark:hover:bg-neutral-900 hover:border-gray-400 dark:hover:border-neutral-700 cursor-pointer transition-all text-center"
                    >
                      <Upload className="h-5 w-5 text-neutral-400 mb-1" />
                      <span className="text-xs font-bold text-neutral-900 dark:text-white">
                        {isUploadingImage ? "Uploading to Cloudinary..." : "Click to browse and upload image"}
                      </span>
                      <span className="text-[10px] text-neutral-500 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://images.unsplash.com/photo-..."
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white flex-1"
                    />
                    <Button
                      type="button"
                      onClick={handleAddImageUrl}
                      className="bg-neutral-800 dark:bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-bold px-4"
                    >
                      Add URL
                    </Button>
                  </div>
                )}

                {/* Thumbnails of Added Images */}
                {imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-neutral-800/80">
                    {imageUrls.map((url, idx) => (
                      <div key={idx} className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 group">
                        <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-0 inset-x-0 bg-rose-600/90 text-white text-[8px] font-black uppercase text-center py-0.5">
                            Primary
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Base Price ($) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    placeholder="149.99"
                    value={newBasePrice}
                    onChange={(e) => setNewBasePrice(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Compare Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="189.99"
                    value={newComparePrice}
                    onChange={(e) => setNewComparePrice(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="DRAFT">DRAFT</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Description</label>
                <textarea
                  rows={3}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Pro-grade athletic gear description..."
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-gray-300 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 font-bold hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-500 rounded-lg px-6 h-10 shadow-sm"
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
