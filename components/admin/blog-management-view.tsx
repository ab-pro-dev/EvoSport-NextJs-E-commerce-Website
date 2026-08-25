"use client";

import { useState } from "react";
import Link from "next/link";
import { FileText, Plus, Trash2, Edit2, Eye, Globe, Lock, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ConfirmModal } from "@/components/ui/confirm-modal";

interface BlogPostItem {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  coverImageUrl: string | null;
  status: string;
  authorName: string;
  publishedAt: string | null;
  createdAt: string;
}

interface BlogManagementViewProps {
  initialPosts: BlogPostItem[];
}

export function BlogManagementView({ initialPosts }: BlogManagementViewProps) {
  const [posts, setPosts] = useState<BlogPostItem[]>(initialPosts);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingId) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "")
      );
    }
  };

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setSlug("");
    setContent("");
    setExcerpt("");
    setCoverImageUrl("");
    setStatus("DRAFT");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: BlogPostItem) => {
    setEditingId(p.id);
    setTitle(p.title);
    setSlug(p.slug);
    setContent(p.content);
    setExcerpt(p.excerpt || "");
    setCoverImageUrl(p.coverImageUrl || "");
    setStatus(p.status);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const endpoint = editingId ? `/api/admin/blog/${editingId}` : "/api/admin/blog";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt,
          coverImageUrl,
          status,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Failed to save blog post.");
        setIsSubmitting(false);
        return;
      }

      if (editingId) {
        setPosts(posts.map((p) => (p.id === editingId ? { ...p, ...data.post, authorName: p.authorName } : p)));
      } else {
        setPosts([
          {
            ...data.post,
            authorName: data.post.author?.name || "Admin",
            publishedAt: data.post.publishedAt || null,
            createdAt: data.post.createdAt,
          },
          ...posts,
        ]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Error saving blog post:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "Failed to toggle status.");
        return;
      }

      setPosts(posts.map((p) => (p.id === id ? { ...p, status: data.post.status, publishedAt: data.post.publishedAt } : p)));
      toast.success(`Blog post status set to ${data.post.status}.`);
    } catch (err) {
      console.error("Error toggling post status:", err);
      toast.error("Failed to toggle status.");
    }
  };

  const handleDeletePostPrompt = (id: string, postTitle: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Blog Post?",
      description: `Are you sure you want to delete blog post "${postTitle}"? This cannot be undone.`,
      onConfirm: () => executeDeletePost(id, postTitle),
      isLoading: false,
    });
  };

  const executeDeletePost = async (id: string, postTitle: string) => {
    try {
      setConfirmModal((prev) => ({ ...prev, isLoading: true }));
      const res = await fetch(`/api/admin/blog/${id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error("Failed to delete post.");
        closeConfirmModal();
        return;
      }
      setPosts(posts.filter((p) => p.id !== id));
      toast.success(`Post "${postTitle}" deleted successfully!`);
    } catch (err) {
      console.error("Error deleting post:", err);
      toast.error("Failed to delete post.");
    } finally {
      closeConfirmModal();
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={closeConfirmModal}
        title={confirmModal.title}
        description={confirmModal.description}
        onConfirm={confirmModal.onConfirm}
        isLoading={confirmModal.isLoading}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <FileText className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            BLOG & ARTICLES CMS
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Publish editorial content, athletic gear guides, draft stories, and manage blog status.
          </p>
        </div>

        <Button
          onClick={handleOpenCreateModal}
          className="bg-rose-600 text-white font-black uppercase text-xs tracking-wider hover:bg-rose-500 rounded-lg h-10 px-5 shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          New Article
        </Button>
      </div>

      {/* Posts Table */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950/80 text-[10px] font-black uppercase text-neutral-500 dark:text-neutral-400">
              <tr>
                <th className="py-3.5 px-4">Title & Slug</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/60 text-neutral-700 dark:text-neutral-300">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic">
                    No blog articles created yet.
                  </td>
                </tr>
              ) : (
                posts.map((p) => {
                  const isPublished = p.status === "PUBLISHED";

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-neutral-900/90 transition-colors">
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-neutral-900 dark:text-white text-xs">{p.title}</p>
                        <p className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">/blog/{p.slug}</p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-neutral-700 dark:text-neutral-300">{p.authorName}</td>

                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => handleToggleStatus(p.id, p.status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${
                            isPublished
                              ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900"
                              : "bg-gray-100 dark:bg-neutral-950 text-neutral-600 dark:text-neutral-400 border border-gray-200 dark:border-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-900"
                          }`}
                        >
                          {isPublished ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                          {p.status}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-neutral-500 dark:text-neutral-400">
                        {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPublished && (
                            <Link
                              href={`/blog/${p.slug}`}
                              target="_blank"
                              className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1"
                              title="View Live Article"
                            >
                              <Eye className="h-4 w-4" />
                            </Link>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 p-1"
                            title="Edit Article"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePostPrompt(p.id, p.title)}
                            className="text-neutral-400 hover:text-rose-600 dark:hover:text-rose-500 p-1"
                            title="Delete Article"
                          >
                            <Trash2 className="h-4 w-4" />
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

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl rounded-2xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 space-y-5 my-8 shadow-2xl">
            <div className="border-b border-gray-100 dark:border-neutral-800 pb-3 flex items-center justify-between">
              <h3 className="text-base font-black uppercase text-neutral-900 dark:text-white">
                {editingId ? "EDIT ARTICLE" : "CREATE NEW ARTICLE"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white text-xs font-bold">
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSavePost} className="space-y-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Article Title *</label>
                <Input
                  required
                  placeholder="e.g. 5 Training Tips for Marathon Runners"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">URL Slug *</label>
                <Input
                  required
                  placeholder="e.g. 5-training-tips-marathon-runners"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="mt-1 bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Publication Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5"
                >
                  <option value="DRAFT">DRAFT (Hidden from public)</option>
                  <option value="PUBLISHED">PUBLISHED (Live on shop blog)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Excerpt / Short Summary</label>
                <textarea
                  rows={2}
                  placeholder="Brief 1-2 sentence teaser for post cards..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Article Body Content *</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Write full article body text..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="mt-1 w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg p-2.5 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="border-gray-300 dark:border-neutral-800 text-xs text-neutral-600 dark:text-neutral-400 font-bold hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-rose-600 text-white font-black uppercase text-xs hover:bg-rose-500 rounded-lg px-6 shadow-sm"
                >
                  {isSubmitting ? "Saving..." : editingId ? "Save Changes" : "Create Article"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
