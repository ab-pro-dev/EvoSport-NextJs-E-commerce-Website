"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Save, Upload, Trash2, Plus, Package, Layers, Image as ImageIcon, AlertCircle, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Variant {
  id: string;
  sku: string;
  color: string;
  size: string;
  stock: number | null;
  price: number;
}

interface ProductImageItem {
  id: string;
  url: string;
  altText: string | null;
  position: number;
}

interface CategoryItem {
  id: string;
  name: string;
  slug?: string;
  parentId?: string | null;
  parent?: { id: string; name: string; slug: string } | null;
}

interface ProductDetailProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    gender?: string;
    basePrice: number;
    compareAtPrice: number | null;
    status: string;
    brandId: string | null;
    categoryId: string;
    images: ProductImageItem[];
    variants: Variant[];
  };
  brands: { id: string; name: string }[];
  categories: CategoryItem[];
}

export function ProductDetailEditView({ product, brands, categories }: ProductDetailProps) {
  // 1. Categories Hierarchy
  const mainCategories = categories.filter((c) => !c.parentId);
  const currentCat = categories.find((c) => c.id === product.categoryId);
  const initialMainId = currentCat?.parentId || (currentCat && !currentCat.parentId ? currentCat.id : (mainCategories[0]?.id || ""));

  const [selectedMainCatId, setSelectedMainCatId] = useState(initialMainId);
  const availableSubcategories = categories.filter((c) => c.parentId === selectedMainCatId);

  // Basic Info Form State
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description || "");
  const [gender, setGender] = useState(product.gender || "UNISEX");
  const [brandId, setBrandId] = useState(product.brandId || "");
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [basePrice, setBasePrice] = useState(product.basePrice.toString());
  const [compareAtPrice, setCompareAtPrice] = useState(product.compareAtPrice ? product.compareAtPrice.toString() : "");
  const [status, setStatus] = useState(product.status);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState<string | null>(null);
  const [productErrorMsg, setProductErrorMsg] = useState<string | null>(null);

  const handleMainCategoryChange = (mainCatId: string) => {
    setSelectedMainCatId(mainCatId);
    const subcats = categories.filter((c) => c.parentId === mainCatId);
    if (subcats.length > 0) {
      setCategoryId(subcats[0].id);
    } else {
      setCategoryId(mainCatId);
    }
  };

  // Images State
  const [images, setImages] = useState<ProductImageItem[]>(product.images);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // Variants State
  const [variants, setVariants] = useState<Variant[]>(product.variants);
  const [newSku, setNewSku] = useState("");
  const [newColor, setNewColor] = useState("");
  const [newSize, setNewSize] = useState("");
  const [newStock, setNewStock] = useState("10");
  const [newPrice, setNewPrice] = useState(product.basePrice.toString());
  const [isAddingVariant, setIsAddingVariant] = useState(false);

  // 1. Handle Product Update
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProduct(true);
      setProductSuccessMsg(null);
      setProductErrorMsg(null);

      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          description: description.trim() || null,
          brandId: brandId.trim() || null,
          categoryId: categoryId || selectedMainCatId,
          gender,
          basePrice: parseFloat(basePrice),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setProductErrorMsg(data.error || "Failed to update product.");
        setIsSavingProduct(false);
        return;
      }

      setProductSuccessMsg("Product updated successfully!");
    } catch (err) {
      console.error("Error updating product:", err);
      setProductErrorMsg("Network error. Please try again.");
    } finally {
      setIsSavingProduct(false);
    }
  };

  // 2. Handle Cloudinary File / URL Upload
  const handleImageFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/products/${product.id}/images`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Image upload failed.");
        setIsUploadingImage(false);
        return;
      }

      setImages([...images, data.image]);
    } catch (err) {
      console.error("Error uploading image to Cloudinary:", err);
      alert("Image upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleImageUrlUpload = async () => {
    if (!imageUrlInput.trim()) return;

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append("url", imageUrlInput.trim());

      const res = await fetch(`/api/admin/products/${product.id}/images`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Image URL upload failed.");
        setIsUploadingImage(false);
        return;
      }

      setImages([...images, data.image]);
      setImageUrlInput("");
    } catch (err) {
      console.error("Error uploading image URL to Cloudinary:", err);
      alert("Image URL upload failed.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Delete Image Handler
  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete image.");
        return;
      }

      if (data.images) {
        setImages(data.images);
      } else {
        setImages(images.filter((img) => img.id !== imageId));
      }
    } catch (err) {
      console.error("Error deleting image:", err);
      alert("Failed to delete image.");
    }
  };

  // Set as Main Image Handler
  const handleSetMainImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${product.id}/images/${imageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isMain: true }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to set main image.");
        return;
      }

      if (data.images) {
        setImages(data.images);
      }
    } catch (err) {
      console.error("Error setting main image:", err);
      alert("Failed to set main image.");
    }
  };

  // 3. Handle Variant Addition
  const handleAddVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsAddingVariant(true);

      const res = await fetch(`/api/admin/products/${product.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: newSku.trim(),
          color: newColor.trim(),
          size: newSize.trim(),
          stock: newStock.trim() ? parseInt(newStock, 10) : null,
          price: parseFloat(newPrice),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to add variant.");
        setIsAddingVariant(false);
        return;
      }

      setVariants([...variants, data.variant]);
      setNewSku("");
      setNewColor("");
      setNewSize("");
      setNewStock("");
    } catch (err) {
      console.error("Error adding variant:", err);
      alert("Failed to add variant.");
    } finally {
      setIsAddingVariant(false);
    }
  };

  // 4. Handle Variant Deletion
  const handleDeleteVariant = async (variantId: string) => {
    if (!confirm("Are you sure you want to delete this variant?")) return;

    try {
      const res = await fetch(`/api/admin/products/${product.id}/variants/${variantId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete variant.");
        return;
      }

      setVariants(variants.filter((v) => v.id !== variantId));
    } catch (err) {
      console.error("Error deleting variant:", err);
      alert("Failed to delete variant.");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white">
              EDIT PRODUCT: {product.name}
            </h1>
            <p className="text-xs text-neutral-400 dark:text-neutral-500 font-mono">ID: {product.id}</p>
          </div>
        </div>
      </div>

      {productSuccessMsg && (
        <div className="rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 p-4 text-xs text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          <span>{productSuccessMsg}</span>
        </div>
      )}

      {productErrorMsg && (
        <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>{productErrorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Details Form (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
              <Package className="h-4 w-4 text-rose-600 dark:text-rose-500" />
              <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">BASIC PRODUCT INFORMATION</h2>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Product Name *</label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">URL Slug *</label>
                <Input
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                />
              </div>

              {/* Gender & Brand (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                    GENDER *
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
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
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
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

              {/* Two-step Category Picker */}
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

                  {/* Step 2: Subcategory */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                      SUBCATEGORY *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Base Price ($) *</label>
                  <Input
                    required
                    type="number"
                    step="0.01"
                    value={basePrice}
                    onChange={(e) => setBasePrice(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Compare Price ($)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Status *</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                  Description (Optional)
                </label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detailed product features, technical specifications, and materials (optional)..."
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500 placeholder:text-neutral-400"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  disabled={isSavingProduct}
                  className="bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-500 rounded-lg px-6 shadow-sm"
                >
                  <Save className="mr-1.5 h-3.5 w-3.5" />
                  {isSavingProduct ? "Saving..." : "Save Product Details"}
                </Button>
              </div>
            </form>
          </div>

          {/* Variants Management Card */}
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
              <Layers className="h-4 w-4 text-rose-600 dark:text-rose-500" />
              <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">PRODUCT VARIANTS ({variants.length})</h2>
            </div>

            {/* Variants Table */}
            {variants.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/60 text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
                    <tr>
                      <th className="py-2.5 px-3">SKU</th>
                      <th className="py-2.5 px-3">Color</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Stock</th>
                      <th className="py-2.5 px-3">Price</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
                    {variants.map((v) => (
                      <tr key={v.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-neutral-900 dark:text-white">{v.sku}</td>
                        <td className="py-2.5 px-3">{v.color}</td>
                        <td className="py-2.5 px-3">{v.size}</td>
                        <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white">
                          {v.stock === null ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] uppercase">Unlimited</span>
                          ) : (
                            v.stock
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-neutral-900 dark:text-white">${Number(v.price).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right">
                          <button
                            onClick={() => handleDeleteVariant(v.id)}
                            className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                            title="Delete Variant"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Add Variant Form */}
            <form onSubmit={handleAddVariant} className="pt-2 border-t border-gray-100 dark:border-neutral-800 space-y-3">
              <p className="text-xs font-bold text-neutral-900 dark:text-white uppercase">+ Add New Variant</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Input
                  required
                  placeholder="SKU-001"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
                <Input
                  required
                  placeholder="Color (e.g. Neon)"
                  value={newColor}
                  onChange={(e) => setNewColor(e.target.value)}
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
                <Input
                  required
                  placeholder="Size (e.g. L)"
                  value={newSize}
                  onChange={(e) => setNewSize(e.target.value)}
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
                <Input
                  type="number"
                  min="0"
                  placeholder="Stock (blank=Unlimited)"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
                <Input
                  required
                  type="number"
                  step="0.01"
                  placeholder="Price"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isAddingVariant}
                  className="bg-neutral-800 dark:bg-neutral-800 text-white font-bold text-xs hover:bg-neutral-700 h-9 px-4 shadow-sm"
                >
                  <Plus className="mr-1 h-3.5 w-3.5" />
                  {isAddingVariant ? "Adding..." : "Add Variant"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Media / Cloudinary Upload Section (1 Col) */}
        <div className="space-y-6">
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2 border-b border-gray-100 dark:border-neutral-800 pb-3">
              <ImageIcon className="h-4 w-4 text-rose-600 dark:text-rose-500" />
              <h2 className="text-sm font-black uppercase tracking-tight text-neutral-900 dark:text-white">CLOUDINARY MEDIA ASSETS</h2>
            </div>

            {/* Cloudinary Images Grid */}
            <div className="grid grid-cols-2 gap-3">
              {images
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((img, idx) => {
                  const isMain = img.position === 0 || idx === 0;

                  return (
                    <div
                      key={img.id}
                      className={`relative group rounded-xl overflow-hidden bg-white dark:bg-neutral-950 aspect-square p-1 transition-all ${
                        isMain
                          ? "border-2 border-rose-600 dark:border-rose-500 shadow-md ring-2 ring-rose-600/20"
                          : "border border-gray-200 dark:border-neutral-800 hover:border-gray-400"
                      }`}
                    >
                      <Image src={img.url} alt={img.altText || "Product Image"} fill sizes="200px" className="object-contain p-1" />

                      {/* Main Badge or Set Main Button */}
                      {isMain ? (
                        <div className="absolute left-2 top-2 z-10">
                          <span className="flex items-center gap-1 bg-rose-600 text-white font-extrabold text-[9px] uppercase px-1.5 py-0.5 rounded shadow-sm">
                            <Star className="h-2.5 w-2.5 fill-current text-white" />
                            MAIN
                          </span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleSetMainImage(img.id)}
                          className="absolute left-2 top-2 z-10 hidden group-hover:flex items-center gap-1 bg-neutral-900/90 hover:bg-rose-600 text-white text-[9px] font-bold uppercase px-1.5 py-0.5 rounded backdrop-blur-sm transition-colors shadow-sm"
                          title="Set as Main Image (Position 0)"
                        >
                          <Star className="h-2.5 w-2.5" />
                          Set Main
                        </button>
                      )}

                      {/* Delete Overlay Button */}
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(img.id)}
                        className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-neutral-900/80 hover:bg-rose-600 text-white transition-all shadow-sm opacity-80 group-hover:opacity-100"
                        title="Delete Image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Upload File Control */}
            <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Upload Local Image File to Cloudinary
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageFileUpload}
                disabled={isUploadingImage}
                className="text-xs text-neutral-500 dark:text-neutral-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-rose-600 file:text-white hover:file:bg-rose-500 cursor-pointer"
              />
            </div>

            {/* Upload Image URL Control */}
            <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-neutral-800">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                Or Upload Image from URL
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
                <Button
                  type="button"
                  onClick={handleImageUrlUpload}
                  disabled={isUploadingImage}
                  className="bg-neutral-800 dark:bg-neutral-800 text-white text-xs font-bold hover:bg-neutral-700 shadow-sm"
                >
                  <Upload className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
