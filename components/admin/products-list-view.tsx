"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Edit2, Trash2, Package, Search, Filter, AlertCircle, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  gender?: string;
  basePrice: number;
  compareAtPrice: number | null;
  status: string;
  brand?: { id: string; name: string } | null;
  category?: { id: string; name: string } | null;
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

  // Bulk Selection & Modal State
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
    isLoading: false,
  });

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false, isLoading: false }));
  };

  // 1. Parent Categories (Main Categories)
  const mainCategories = useMemo(() => {
    return categories.filter((c) => !c.parentId);
  }, [categories]);

  const defaultMainCatId = mainCategories[0]?.id || "";
  const [selectedMainCatId, setSelectedMainCatId] = useState(defaultMainCatId);

  // 2. Subcategories dynamically filtered to selected Main Category
  const availableSubcategories = useMemo(() => {
    return categories.filter((c) => c.parentId === selectedMainCatId);
  }, [categories, selectedMainCatId]);

  // Form State for Add Product
  const [newProductName, setNewProductName] = useState("");
  const [newProductSlug, setNewProductSlug] = useState("");
  const [newProductDesc, setNewProductDesc] = useState("");
  const [newGender, setNewGender] = useState<"MEN" | "WOMEN" | "KIDS" | "UNISEX">("UNISEX");
  const [newBrandId, setNewBrandId] = useState("");
  const [newCategoryId, setNewCategoryId] = useState(availableSubcategories[0]?.id || "");
  const [newBasePrice, setNewBasePrice] = useState("");
  const [newComparePrice, setNewComparePrice] = useState("");
  const [newStock, setNewStock] = useState("");
  const [newStatus, setNewStatus] = useState("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Image Upload State (unlimited images support)
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.brand?.name && p.brand.name.toLowerCase().includes(searchQuery.toLowerCase()));
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

  const handleMainCategoryChange = (mainCatId: string) => {
    setSelectedMainCatId(mainCatId);
    const subcats = categories.filter((c) => c.parentId === mainCatId);
    if (subcats.length > 0) {
      setNewCategoryId(subcats[0].id);
    } else {
      setNewCategoryId(mainCatId);
    }
  };

  const openAddModal = () => {
    setIsAddModalOpen(true);
    const initialMain = mainCategories[0]?.id || "";
    setSelectedMainCatId(initialMain);
    const subcats = categories.filter((c) => c.parentId === initialMain);
    setNewCategoryId(subcats[0]?.id || initialMain);
    setNewGender("UNISEX");
    setNewBrandId("");
    setNewProductName("");
    setNewProductSlug("");
    setNewProductDesc("");
    setNewBasePrice("");
    setNewComparePrice("");
    setNewStock("");
    setImageUrls([]);
    setImageUrlInput("");
    setErrorMsg(null);
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

      const targetCategoryId = newCategoryId || selectedMainCatId;
      if (!targetCategoryId) {
        setErrorMsg("Please select a valid subcategory.");
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: newProductName.trim(),
        slug: newProductSlug.trim(),
        description: newProductDesc.trim() || undefined,
        brandId: newBrandId.trim() || undefined,
        categoryId: targetCategoryId,
        gender: newGender,
        basePrice: parseFloat(newBasePrice),
        compareAtPrice: newComparePrice ? parseFloat(newComparePrice) : null,
        status: newStatus,
        stock: newStock.trim() ? parseInt(newStock, 10) : null,
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
      const createdProduct = data.product;
      const formattedCreated: ProductItem = {
        id: createdProduct.id,
        name: createdProduct.name,
        slug: createdProduct.slug,
        description: createdProduct.description,
        gender: createdProduct.gender,
        basePrice: Number(createdProduct.basePrice),
        compareAtPrice: createdProduct.compareAtPrice ? Number(createdProduct.compareAtPrice) : null,
        status: createdProduct.status,
        brand: createdProduct.brand,
        category: createdProduct.category,
        image: createdProduct.images?.[0]?.url || null,
        imagesCount: createdProduct.images?.length || 0,
        variantsCount: createdProduct.variants?.length || 1,
        totalStock: createdProduct.variants?.some((v: any) => v.stock === null) ? null : createdProduct.variants?.reduce((s: number, v: any) => s + (v.stock ?? 0), 0) ?? null,
        createdAt: createdProduct.createdAt,
      };

      setProducts((prev) => [formattedCreated, ...prev]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error("Error adding product:", err);
      setErrorMsg("Network error. Please try again.");
      toast.error("Network error creating product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAllSelected =
    filteredProducts.length > 0 &&
    filteredProducts.every((p) => selectedProductIds.includes(p.id));

  const isSomeSelected =
    filteredProducts.some((p) => selectedProductIds.includes(p.id)) &&
    !isAllSelected;

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredSet = new Set(filteredProducts.map((p) => p.id));
      setSelectedProductIds((prev) => prev.filter((id) => !filteredSet.has(id)));
    } else {
      const visibleIds = filteredProducts.map((p) => p.id);
      setSelectedProductIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkDeletePrompt = () => {
    const count = selectedProductIds.length;
    if (count === 0) return;

    setConfirmModal({
      isOpen: true,
      title: "Delete Products?",
      description: `Delete ${count} selected product(s)? This action cannot be undone.`,
      onConfirm: executeBulkDelete,
      isLoading: false,
    });
  };

  const executeBulkDelete = async () => {
    try {
      setIsBulkDeleting(true);
      setConfirmModal((prev) => ({ ...prev, isLoading: true }));

      const res = await fetch("/api/admin/products/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productIds: selectedProductIds }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Bulk delete failed.");
        setIsBulkDeleting(false);
        closeConfirmModal();
        return;
      }

      const deletedIds = new Set((data.deleted || []).map((d: any) => d.id));
      const deletedCount = data.deleted?.length || 0;
      const failedCount = data.failed?.length || 0;

      // Update products state
      setProducts((prev) => prev.filter((p) => !deletedIds.has(p.id)));
      setSelectedProductIds((prev) => prev.filter((id) => !deletedIds.has(id)));

      if (deletedCount > 0 && failedCount === 0) {
        toast.success(`${deletedCount} product(s) deleted successfully.`);
      } else if (deletedCount > 0 && failedCount > 0) {
        const failedSummary = data.failed
          .map((f: any) => `${f.name} (${f.reason})`)
          .join("; ");
        toast.warning(
          `${deletedCount} deleted, ${failedCount} failed: ${failedSummary}`
        );
      } else if (failedCount > 0) {
        const failedSummary = data.failed
          .map((f: any) => `${f.name}: ${f.reason}`)
          .join("; ");
        toast.error(`Failed to delete product(s): ${failedSummary}`);
      }
    } catch (err) {
      console.error("Error bulk deleting products:", err);
      toast.error("Network error executing bulk delete.");
    } finally {
      setIsBulkDeleting(false);
      closeConfirmModal();
    }
  };

  const handleDeleteProductPrompt = (id: string, name: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Product?",
      description: `Are you sure you want to delete "${name}"? This will remove all its images and variants.`,
      onConfirm: () => executeDeleteProduct(id),
      isLoading: false,
    });
  };

  const executeDeleteProduct = async (id: string) => {
    try {
      setDeletingId(id);
      setConfirmModal((prev) => ({ ...prev, isLoading: true }));
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to delete product.");
        closeConfirmModal();
        return;
      }

      toast.success("Product deleted successfully!");
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting product:", err);
      toast.error("Network error deleting product.");
    } finally {
      setDeletingId(null);
      closeConfirmModal();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 shadow-sm">
        <div>
          <h1 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white uppercase flex items-center gap-2">
            <Package className="h-5 w-5 text-rose-600 dark:text-rose-500" />
            PRODUCTS CATALOG
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage your store items, category hierarchy, variants, and stock status ({products.length} products total)
          </p>
        </div>

        <Button
          onClick={openAddModal}
          className="bg-rose-600 text-white font-bold text-xs uppercase tracking-wider hover:bg-rose-500 rounded-xl px-5 shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add New Product
        </Button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400" />
          <Input
            placeholder="Search products by name, slug, brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg px-3 py-2 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Only</option>
            <option value="DRAFT">Drafts</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/60 text-[10px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(el) => {
                      if (el) el.indeterminate = isSomeSelected;
                    }}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                    title="Select All Filtered Products"
                  />
                </th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Category & Gender</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Inventory</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                    No products found matching filters.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-rose-50/50 dark:bg-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          : "hover:bg-gray-50 dark:hover:bg-neutral-900/90"
                      }`}
                    >
                      <td className="py-3.5 px-4 w-10">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectProduct(p.id)}
                          className="h-4 w-4 rounded border-gray-300 dark:border-neutral-700 text-rose-600 focus:ring-rose-500 cursor-pointer accent-rose-600"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative rounded bg-white dark:bg-neutral-950 overflow-hidden border border-gray-200 dark:border-neutral-800 shrink-0 p-0.5">
                          {p.image ? (
                            <Image src={p.image} alt={p.name} fill sizes="40px" className="object-contain" />
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
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-neutral-900 dark:text-white">{p.category?.name || "Uncategorized"}</span>
                        <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300">
                          {p.gender || "UNISEX"}
                        </span>
                      </div>
                      <span className="block text-[10px] text-neutral-400 dark:text-neutral-500">{p.brand?.name || "No Brand"}</span>
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
                      <span className="block text-[10px] text-neutral-500 dark:text-neutral-400">
                        Total Stock: {p.totalStock === null ? "Unlimited" : p.totalStock}
                      </span>
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
                          onClick={() => handleDeleteProductPrompt(p.id, p.name)}
                          disabled={isDeleting === p.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:border-rose-300 dark:hover:border-rose-800 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shadow-sm"
                          title="Delete Product"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Floating Action Bar for Bulk Actions */}
      {selectedProductIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-neutral-900 dark:bg-neutral-800 text-white px-5 py-3 rounded-2xl shadow-2xl border border-neutral-700/80 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-white font-black text-[10px]">
              {selectedProductIds.length}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider">
              {selectedProductIds.length === 1 ? "Product Selected" : "Products Selected"}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-neutral-700" />

          <Button
            type="button"
            onClick={handleBulkDeletePrompt}
            disabled={isBulkDeleting}
            className="bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs uppercase px-4 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5"
          >
            <Trash2 className="h-3.5 w-3.5" />
            {isBulkDeleting ? "Deleting..." : "Delete Selected"}
          </Button>

          <button
            type="button"
            onClick={() => setSelectedProductIds([])}
            className="text-neutral-400 hover:text-white text-xs font-bold transition-colors"
          >
            Clear Selection
          </button>
        </div>
      )}

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
              {/* Product Name & Slug */}
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

              {/* 1. GENDER DROPDOWN & BRAND (OPTIONAL) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    GENDER *
                  </label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as "MEN" | "WOMEN" | "KIDS" | "UNISEX")}
                    className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-rose-500"
                  >
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                    <option value="KIDS">Kids</option>
                    <option value="UNISEX">Unisex</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Brand (Optional)
                  </label>
                  <select
                    value={newBrandId}
                    onChange={(e) => setNewBrandId(e.target.value)}
                    className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                  >
                    <option value="">-- No Brand / Generic (Optional) --</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 2. TWO-STEP MAIN CATEGORY + SUBCATEGORY PICKER */}
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/60 p-4 space-y-3">
                <div className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <span>Category Tree Selection</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Step 1: Main Category */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      MAIN CATEGORY *
                    </label>
                    <select
                      value={selectedMainCatId}
                      onChange={(e) => handleMainCategoryChange(e.target.value)}
                      className="mt-1 w-full bg-white dark:bg-neutral-900 border border-gray-300 dark:border-neutral-700 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 font-bold focus:outline-none focus:border-rose-500"
                    >
                      {mainCategories.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Step 2: Subcategory dynamically filtered */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      SUBCATEGORY *
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
                        <option value={selectedMainCatId}>
                          {mainCategories.find((p) => p.id === selectedMainCatId)?.name || "General"}
                        </option>
                      )}
                    </select>
                  </div>
                </div>
              </div>

              {/* 3. MULTIPLE IMAGES SECTION (Unlimited) */}
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/60 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Product Images ({imageUrls.length} added)
                  </span>
                  <div className="flex rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-0.5 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("upload")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageInputMode === "upload"
                          ? "bg-rose-600 text-white"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2.5 py-1 rounded-md transition-colors ${
                        imageInputMode === "url"
                          ? "bg-rose-600 text-white"
                          : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
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
                      <span className="text-[10px] text-neutral-500 mt-0.5">PNG, JPG, WEBP up to 10MB (Unlimited uploads)</span>
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

                {/* Thumbnails of Added Images (Unlimited images) */}
                {imageUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-neutral-800/80 max-h-48 overflow-y-auto p-1">
                    {imageUrls.map((url, idx) => (
                      <div
                        key={idx}
                        className="relative h-16 w-16 rounded-lg overflow-hidden border border-gray-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 group shrink-0"
                      >
                        <Image src={url} alt={`Preview ${idx + 1}`} fill className="object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(idx)}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 hover:text-rose-300 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        {idx === 0 ? (
                          <span className="absolute bottom-0 inset-x-0 bg-rose-600 text-white text-[7px] font-black uppercase text-center py-0.5">
                            Card Primary
                          </span>
                        ) : (
                          <span className="absolute bottom-0 inset-x-0 bg-neutral-900/80 text-neutral-300 text-[7px] font-bold text-center py-0.5">
                            Gallery #{idx + 1}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Compare Price */}
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

              {/* Stock / Quantity & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    Stock / Quantity (Leave blank for Unlimited)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="e.g. 50 (or blank for Unlimited)"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
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
              </div>

              {/* 4. OPTIONAL DESCRIPTION */}
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Description (Optional)
                </label>
                <textarea
                  rows={3}
                  value={newProductDesc}
                  onChange={(e) => setNewProductDesc(e.target.value)}
                  placeholder="Detailed product features, technical specifications, and materials (optional)..."
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500 placeholder:text-neutral-400"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-gray-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                  className="border-gray-300 dark:border-neutral-700 text-xs font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-black uppercase tracking-wider px-5"
                >
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        description={confirmModal.description}
        isLoading={confirmModal.isLoading}
      />
    </div>
  );
}
