"use client";

import { useState } from "react";
import { FolderTree, Plus, Edit2, Trash2, AlertCircle, CornerDownRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  _count: { products: number; children: number };
}

interface CategoriesManagementViewProps {
  initialCategories: CategoryItem[];
}

export function CategoriesManagementView({ initialCategories }: CategoriesManagementViewProps) {
  const [categories, setCategories] = useState<CategoryItem[]>(initialCategories);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState("");
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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const res = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          slug,
          parentId: parentId || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to create category.");
        setIsSubmitting(false);
        return;
      }

      setCategories([...categories, data.category]);
      setIsAddModalOpen(false);
      setName("");
      setSlug("");
      setParentId("");
    } catch (err) {
      console.error("Error creating category:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    try {
      setDeletingId(id);
      setErrorMsg(null);

      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to delete category.");
        setDeletingId(null);
        return;
      }

      setCategories(categories.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Error deleting category:", err);
      setErrorMsg("Failed to delete category.");
    } finally {
      setDeletingId(null);
    }
  };

  // Build hierarchical list for indented display
  const parentCategories = categories.filter((c) => !c.parentId);
  const getChildren = (parentId: string) => categories.filter((c) => c.parentId === parentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-white flex items-center gap-2">
            <FolderTree className="h-6 w-6 text-rose-500" />
            CATEGORY MANAGEMENT
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Organize catalog hierarchy and parent-child subcategory trees.
          </p>
        </div>

        <Button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-rose-600 text-white font-black uppercase text-xs tracking-wider hover:bg-rose-500 rounded-lg h-10 px-5"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Add Category
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

      {/* Categories Table / Tree */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-800 bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">URL Slug</th>
                <th className="py-3.5 px-4">Parent Category</th>
                <th className="py-3.5 px-4">Products Attached</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {categories.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-neutral-500 italic">
                    No categories found.
                  </td>
                </tr>
              ) : (
                parentCategories.map((parent) => {
                  const children = getChildren(parent.id);
                  return (
                    <div key={parent.id} className="contents">
                      {/* Parent Row */}
                      <tr className="hover:bg-neutral-900/90 transition-colors bg-neutral-900/40">
                        <td className="py-3.5 px-4 font-bold text-white text-xs flex items-center gap-2">
                          <FolderTree className="h-4 w-4 text-rose-500" />
                          <span>{parent.name}</span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">/{parent.slug}</td>
                        <td className="py-3.5 px-4 text-neutral-500 font-medium">— Main Category —</td>
                        <td className="py-3.5 px-4 font-bold text-white">{parent._count.products} products</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteCategory(parent.id, parent.name)}
                            disabled={deletingId === parent.id}
                            className="text-neutral-400 hover:text-rose-400 transition-colors p-1"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>

                      {/* Indented Children Rows */}
                      {children.map((child) => (
                        <tr key={child.id} className="hover:bg-neutral-900/90 transition-colors">
                          <td className="py-3.5 px-4 pl-10 font-bold text-neutral-200 text-xs flex items-center gap-2">
                            <CornerDownRight className="h-3.5 w-3.5 text-neutral-500" />
                            <span>{child.name}</span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400">/{child.slug}</td>
                          <td className="py-3.5 px-4 font-semibold text-rose-400">{parent.name}</td>
                          <td className="py-3.5 px-4 font-bold text-white">{child._count.products} products</td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleDeleteCategory(child.id, child.name)}
                              disabled={deletingId === child.id}
                              className="text-neutral-400 hover:text-rose-400 transition-colors p-1"
                              title="Delete Category"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </div>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-neutral-800 bg-neutral-900 p-6 space-y-6">
            <div className="border-b border-neutral-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-white">ADD CATEGORY</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-neutral-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Category Name *</label>
                <Input
                  required
                  placeholder="e.g. Trail Running"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">URL Slug *</label>
                <Input
                  required
                  placeholder="trail-running"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 bg-neutral-950 border-neutral-800 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Parent Category (Optional)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="mt-1 w-full bg-neutral-950 border border-neutral-800 text-xs text-white rounded-lg p-2.5"
                >
                  <option value="">— None (Top-Level Category) —</option>
                  {parentCategories.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
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
                  {isSubmitting ? "Creating..." : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
