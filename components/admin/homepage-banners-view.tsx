"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import {
  Megaphone,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Upload,
  X,
  Image as ImageIcon,
  ExternalLink,
  Search,
  ArrowUpDown,
  Sparkles,
  AlertCircle,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/ui/confirm-modal";

export interface BannerItem {
  id: string;
  headline: string;
  subtext: string;
  badgeText: string | null;
  ctaText: string;
  ctaLink: string;
  backgroundImageUrl: string | null;
  backgroundBlur: number;
  lightModeOverlayOpacity: number;
  darkModeOverlayOpacity: number;
  displayDurationSeconds: number;
  order: number;
  active: boolean;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface HomepageBannersViewProps {
  initialBanners: BannerItem[];
}

export function HomepageBannersView({ initialBanners }: HomepageBannersViewProps) {
  const [banners, setBanners] = useState<BannerItem[]>(initialBanners);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "SCHEDULED">("ALL");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<BannerItem | null>(null);

  // Form State
  const [headline, setHeadline] = useState("");
  const [subtext, setSubtext] = useState("");
  const [badgeText, setBadgeText] = useState("");
  const [ctaText, setCtaText] = useState("EXPLORE ALL GEAR");
  const [ctaLink, setCtaLink] = useState("/shop");
  const [backgroundImageUrl, setBackgroundImageUrl] = useState("");
  const [backgroundBlur, setBackgroundBlur] = useState<number>(0);
  const [lightModeOverlayOpacity, setLightModeOverlayOpacity] = useState<number>(80);
  const [darkModeOverlayOpacity, setDarkModeOverlayOpacity] = useState<number>(85);
  const [displayDurationSeconds, setDisplayDurationSeconds] = useState<number>(5);
  const [order, setOrder] = useState<number>(0);
  const [active, setActive] = useState(true);
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // Image Upload State
  const [imageInputMode, setImageInputMode] = useState<"upload" | "url">("upload");
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Action states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const openCreateModal = () => {
    setEditingBanner(null);
    setHeadline("");
    setSubtext("");
    setBadgeText("NEW 2026 PRO COLLECTION RELEASED");
    setCtaText("EXPLORE ALL GEAR");
    setCtaLink("/shop");
    setBackgroundImageUrl("");
    setBackgroundBlur(0);
    setLightModeOverlayOpacity(80);
    setDarkModeOverlayOpacity(85);
    setDisplayDurationSeconds(5);
    setImageUrlInput("");
    setOrder(banners.length > 0 ? Math.max(...banners.map((b) => b.order)) + 1 : 1);
    setActive(true);
    setStartsAt("");
    setEndsAt("");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: BannerItem) => {
    setEditingBanner(banner);
    setHeadline(banner.headline);
    setSubtext(banner.subtext);
    setBadgeText(banner.badgeText || "");
    setCtaText(banner.ctaText);
    setCtaLink(banner.ctaLink);
    setBackgroundImageUrl(banner.backgroundImageUrl || "");
    setBackgroundBlur(banner.backgroundBlur ?? 0);
    setLightModeOverlayOpacity(banner.lightModeOverlayOpacity ?? 80);
    setDarkModeOverlayOpacity(banner.darkModeOverlayOpacity ?? 85);
    setDisplayDurationSeconds(banner.displayDurationSeconds ?? 5);
    setImageUrlInput(banner.backgroundImageUrl || "");
    setOrder(banner.order);
    setActive(banner.active);
    setStartsAt(banner.startsAt ? new Date(banner.startsAt).toISOString().slice(0, 16) : "");
    setEndsAt(banner.endsAt ? new Date(banner.endsAt).toISOString().slice(0, 16) : "");
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Image Upload via File input
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
        toast.error(data.error || "Failed to upload image.");
        return;
      }

      const uploadedUrl = data.secure_url || data.url;
      if (uploadedUrl) {
        setBackgroundImageUrl(uploadedUrl);
        toast.success("Image uploaded to Cloudinary successfully!");
      } else {
        toast.error("Failed to parse uploaded image URL.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading image file.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleApplyUrl = () => {
    if (!imageUrlInput.trim()) return;
    setBackgroundImageUrl(imageUrlInput.trim());
    toast.success("Image URL applied!");
  };

  // Form Submit: Create or Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setErrorMsg(null);

      const payload = {
        headline: headline.trim(),
        subtext: subtext.trim(),
        badgeText: badgeText.trim() || null,
        ctaText: ctaText.trim(),
        ctaLink: ctaLink.trim(),
        backgroundImageUrl: backgroundImageUrl.trim() || null,
        backgroundBlur: Number(backgroundBlur) || 0,
        lightModeOverlayOpacity: Number(lightModeOverlayOpacity) ?? 80,
        darkModeOverlayOpacity: Number(darkModeOverlayOpacity) ?? 85,
        displayDurationSeconds: Number(displayDurationSeconds) || 5,
        order: Number(order) || 0,
        active,
        startsAt: startsAt ? new Date(startsAt).toISOString() : null,
        endsAt: endsAt ? new Date(endsAt).toISOString() : null,
      };

      if (editingBanner) {
        // PATCH /api/admin/homepage-banners/[id]
        const res = await fetch(`/api/admin/homepage-banners/${editingBanner.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Failed to update banner.");
          setIsSubmitting(false);
          return;
        }

        setBanners(
          banners
            .map((b) => (b.id === editingBanner.id ? data.banner : b))
            .sort((a, b) => a.order - b.order)
        );
      } else {
        // POST /api/admin/homepage-banners
        const res = await fetch("/api/admin/homepage-banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || "Failed to create banner.");
          setIsSubmitting(false);
          return;
        }

        setBanners([...banners, data.banner].sort((a, b) => a.order - b.order));
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Submit banner error:", err);
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

  // Delete Banner
  const handleDeletePrompt = (id: string, bannerHeadline: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Banner?",
      description: `Are you sure you want to delete banner "${bannerHeadline}"?`,
      onConfirm: () => executeDeleteBanner(id, bannerHeadline),
      isLoading: false,
    });
  };

  const executeDeleteBanner = async (id: string, bannerHeadline: string) => {
    try {
      setDeletingId(id);
      setConfirmModal((prev) => ({ ...prev, isLoading: true }));
      const res = await fetch(`/api/admin/homepage-banners/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        toast.error("Failed to delete banner.");
        setDeletingId(null);
        closeConfirmModal();
        return;
      }

      setBanners(banners.filter((b) => b.id !== id));
      toast.success(`Banner "${bannerHeadline}" deleted successfully.`);
    } catch (err) {
      console.error("Delete banner error:", err);
      toast.error("Error deleting banner.");
    } finally {
      setDeletingId(null);
      closeConfirmModal();
    }
  };

  // Inline Quick Toggle Active
  const handleToggleActive = async (banner: BannerItem) => {
    try {
      const updatedActive = !banner.active;
      const res = await fetch(`/api/admin/homepage-banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: updatedActive }),
      });

      if (res.ok) {
        const data = await res.json();
        setBanners(banners.map((b) => (b.id === banner.id ? data.banner : b)));
      }
    } catch (err) {
      console.error("Toggle active error:", err);
    }
  };

  // Inline Quick Reorder
  const handleQuickReorder = async (banner: BannerItem, newOrder: number) => {
    if (isNaN(newOrder) || newOrder === banner.order) return;
    try {
      const res = await fetch(`/api/admin/homepage-banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: newOrder }),
      });

      if (res.ok) {
        const data = await res.json();
        setBanners(
          banners
            .map((b) => (b.id === banner.id ? data.banner : b))
            .sort((a, b) => a.order - b.order)
        );
      }
    } catch (err) {
      console.error("Quick reorder error:", err);
    }
  };

  // Filter banners
  const filteredBanners = banners.filter((b) => {
    const matchesSearch =
      b.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.subtext.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.badgeText && b.badgeText.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === "ACTIVE") return b.active;
    if (statusFilter === "INACTIVE") return !b.active;
    if (statusFilter === "SCHEDULED") return b.startsAt !== null || b.endsAt !== null;

    return true;
  });

  const totalCount = banners.length;
  const activeCount = banners.filter((b) => b.active).length;
  const scheduledCount = banners.filter((b) => b.startsAt || b.endsAt).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2.5">
            <Megaphone className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            <span>Homepage Banners</span>
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            Manage hero promotion banners, custom backgrounds, multi-banner sequence order, and scheduling.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold gap-2 self-start sm:self-auto shadow-md shadow-rose-900/20"
        >
          <Plus className="h-4 w-4" />
          <span>Add Banner</span>
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Total Banners
            </span>
            <Sparkles className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-2xl font-black text-neutral-900 dark:text-white mt-2">{totalCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Active Live
            </span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{activeCount}</p>
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Scheduled
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">{scheduledCount}</p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-3 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-neutral-400" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search headline, subtext, badge..."
            className="pl-8 text-xs bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end sm:self-auto w-full sm:w-auto overflow-x-auto">
          {(["ALL", "ACTIVE", "INACTIVE", "SCHEDULED"] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                statusFilter === filter
                  ? "bg-rose-600 text-white"
                  : "bg-gray-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Banners List / Table */}
      <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm overflow-hidden">
        {filteredBanners.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Megaphone className="h-10 w-10 text-neutral-300 dark:text-neutral-700 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-900 dark:text-white">No Homepage Banners Found</h3>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? "No banners matched your search query."
                : "Create your first homepage hero promotional banner to engage visitors."}
            </p>
            {!searchQuery && (
              <Button
                onClick={openCreateModal}
                className="mt-4 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                <Plus className="h-3.5 w-3.5 mr-1.5" />
                Add First Banner
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-gray-200 dark:border-neutral-800 bg-gray-50/75 dark:bg-neutral-950/50 text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-16 text-center">Order</th>
                  <th className="py-3 px-4 w-28">Preview</th>
                  <th className="py-3 px-4">Headline & Content</th>
                  <th className="py-3 px-4">CTA Button</th>
                  <th className="py-3 px-4">Schedule</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-neutral-800/80">
                {filteredBanners.map((banner) => (
                  <tr
                    key={banner.id}
                    className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors"
                  >
                    {/* Order */}
                    <td className="py-3.5 px-4 text-center">
                      <input
                        type="number"
                        defaultValue={banner.order}
                        onBlur={(e) => handleQuickReorder(banner, parseInt(e.target.value, 10))}
                        className="w-12 text-center text-xs font-black rounded-md border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 text-neutral-900 dark:text-white py-1 focus:border-rose-500 focus:outline-none"
                        title="Change order sequence"
                      />
                    </td>

                    {/* Thumbnail / Background */}
                    <td className="py-3.5 px-4">
                      {banner.backgroundImageUrl ? (
                        <div className="relative h-12 w-20 rounded-lg overflow-hidden border border-gray-200 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-950">
                          <Image
                            src={banner.backgroundImageUrl}
                            alt={banner.headline}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ) : (
                        <div className="h-12 w-20 rounded-lg border border-gray-200 dark:border-slate-800 bg-gradient-to-br from-[#EEF8F1] via-[#F4F8FC] to-[#5B8DEF]/20 dark:from-[#0B182B] dark:via-[#090E17] dark:to-[#5B8DEF]/20 flex items-center justify-center p-1 text-[9px] font-bold text-center text-neutral-600 dark:text-neutral-400">
                          Gradient Theme
                        </div>
                      )}
                    </td>

                    {/* Headline & Details */}
                    <td className="py-3.5 px-4 max-w-sm">
                      {banner.badgeText && (
                        <span className="inline-block rounded-full bg-[#B8FF00]/20 border border-[#B8FF00]/60 dark:bg-[#B8FF00]/15 px-2 py-0.5 text-[9px] font-black uppercase text-neutral-900 dark:text-[#B8FF00] mb-1">
                          {banner.badgeText}
                        </span>
                      )}
                      <h4 className="font-extrabold text-neutral-900 dark:text-white line-clamp-1">
                        {banner.headline}
                      </h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 mt-0.5">
                        {banner.subtext}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                          <Clock className="h-3 w-3" />
                          {banner.displayDurationSeconds ?? 5}s rotation duration
                        </span>
                      </div>
                    </td>

                    {/* CTA Details */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-neutral-800 text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                        <span>{banner.ctaText}</span>
                        <span className="text-neutral-400">→</span>
                        <span className="text-neutral-500 dark:text-neutral-400 font-mono text-[10px]">
                          {banner.ctaLink}
                        </span>
                      </div>
                    </td>

                    {/* Schedule Dates */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {banner.startsAt || banner.endsAt ? (
                        <div className="space-y-0.5 text-[10px] text-neutral-600 dark:text-neutral-400">
                          {banner.startsAt && (
                            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                              <Calendar className="h-3 w-3" />
                              <span>From: {new Date(banner.startsAt).toLocaleDateString()}</span>
                            </div>
                          )}
                          {banner.endsAt && (
                            <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <Clock className="h-3 w-3" />
                              <span>To: {new Date(banner.endsAt).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-400 italic">Always Active</span>
                      )}
                    </td>

                    {/* Active Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(banner)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold transition-colors ${
                          banner.active
                            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800"
                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700"
                        }`}
                        title="Click to toggle status"
                      >
                        {banner.active ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="p-1.5 rounded-lg border border-gray-200 dark:border-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 transition-colors"
                          title="Edit Banner"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeletePrompt(banner.id, banner.headline)}
                          disabled={deletingId === banner.id}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 transition-colors disabled:opacity-50"
                          title="Delete Banner"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-200 dark:border-neutral-800 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-neutral-800 pb-4">
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-neutral-900 dark:text-white">
                  {editingBanner ? "Edit Homepage Banner" : "Create Homepage Banner"}
                </h3>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Configure promotion headline, CTA link, duration, and hero effects.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-gray-100 dark:hover:bg-neutral-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Badge Text */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Pill Badge Text (Optional Top Tag)
                </label>
                <Input
                  value={badgeText}
                  onChange={(e) => setBadgeText(e.target.value)}
                  placeholder="e.g. NEW 2026 PRO COLLECTION RELEASED"
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                />
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Headline Text *
                </label>
                <Input
                  required
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. ENGINEER YOUR LIMITLESS POTENTIAL"
                  className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs font-black uppercase text-neutral-900 dark:text-white"
                />
              </div>

              {/* Subtext */}
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                  Subtext Description *
                </label>
                <textarea
                  required
                  rows={2}
                  value={subtext}
                  onChange={(e) => setSubtext(e.target.value)}
                  placeholder="e.g. Discover precision carbon running shoes, thermal compression apparel..."
                  className="w-full rounded-md border border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-950 p-2 text-xs text-neutral-900 dark:text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* CTA Text & Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Button CTA Text *
                  </label>
                  <Input
                    required
                    value={ctaText}
                    onChange={(e) => setCtaText(e.target.value)}
                    placeholder="e.g. EXPLORE ALL GEAR"
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs font-bold uppercase text-neutral-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Button Destination URL / Route *
                  </label>
                  <Input
                    required
                    value={ctaLink}
                    onChange={(e) => setCtaLink(e.target.value)}
                    placeholder="e.g. /shop or /shop?category=shoes"
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs font-mono text-neutral-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Background Image & Effects Section */}
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-950/60 p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                    <ImageIcon className="h-3.5 w-3.5 text-rose-500" />
                    Background Image & Hero Effects
                  </span>

                  <div className="flex items-center gap-1 bg-gray-200/70 dark:bg-neutral-800 p-0.5 rounded-lg text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setImageInputMode("upload")}
                      className={`px-2 py-0.5 rounded ${
                        imageInputMode === "upload"
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                          : "text-neutral-500"
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageInputMode("url")}
                      className={`px-2 py-0.5 rounded ${
                        imageInputMode === "url"
                          ? "bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs"
                          : "text-neutral-500"
                      }`}
                    >
                      Enter URL
                    </button>
                  </div>
                </div>

                {/* Upload or URL controls */}
                {imageInputMode === "upload" ? (
                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="w-full flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 dark:border-neutral-700 rounded-xl p-4 text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:border-rose-500 dark:hover:border-rose-500 transition-colors cursor-pointer bg-white/60 dark:bg-neutral-900/60"
                    >
                      <Upload className="h-4 w-4 text-rose-500" />
                      {isUploadingImage ? "Uploading to Cloudinary..." : "Click to browse and upload image from device"}
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={imageUrlInput}
                      onChange={(e) => setImageUrlInput(e.target.value)}
                      placeholder="Paste Unsplash / Cloudinary / Web image URL..."
                      className="text-xs bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-800"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyUrl}
                      className="bg-neutral-800 hover:bg-neutral-900 text-white text-xs font-bold shrink-0"
                    >
                      Apply
                    </Button>
                  </div>
                )}

                {/* Image Preview & Sliders */}
                {backgroundImageUrl && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-3 p-2 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800">
                      <div className="relative h-12 w-20 rounded overflow-hidden border border-gray-200 dark:border-neutral-700 shrink-0">
                        <Image
                          src={backgroundImageUrl}
                          alt="Banner Preview"
                          fill
                          className="object-cover"
                          style={{
                            filter: backgroundBlur > 0 ? `blur(${backgroundBlur}px)` : "none",
                          }}
                        />
                      </div>
                      <p className="text-[10px] text-neutral-500 truncate font-mono">{backgroundImageUrl}</p>
                      <button
                        type="button"
                        onClick={() => setBackgroundImageUrl("")}
                        className="ml-auto p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Image Effect Sliders Control (Blur, Light Overlay, Dark Overlay, Display Duration) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 pt-2 border-t border-gray-200/80 dark:border-neutral-800/80">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            Background Blur
                          </label>
                          <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded border border-rose-200 dark:border-rose-900">
                            {backgroundBlur}px
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="20"
                          step="1"
                          value={backgroundBlur}
                          onChange={(e) => setBackgroundBlur(parseInt(e.target.value, 10) || 0)}
                          className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-rose-600 dark:accent-rose-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            Light Overlay %
                          </label>
                          <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-200 dark:border-indigo-900">
                            {lightModeOverlayOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={lightModeOverlayOpacity}
                          onChange={(e) => setLightModeOverlayOpacity(parseInt(e.target.value, 10) || 0)}
                          className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-500"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            Dark Overlay %
                          </label>
                          <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                            {darkModeOverlayOpacity}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={darkModeOverlayOpacity}
                          onChange={(e) => setDarkModeOverlayOpacity(parseInt(e.target.value, 10) || 0)}
                          className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-600 dark:accent-emerald-500"
                        />
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic">
                          0% to 100% (dark theme).
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                            Display Duration
                          </label>
                          <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                            {displayDurationSeconds}s
                          </span>
                        </div>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="1"
                          value={displayDurationSeconds}
                          onChange={(e) => setDisplayDurationSeconds(parseInt(e.target.value, 10) || 5)}
                          className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:accent-amber-500"
                        />
                        <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic">
                          1s to 30s before rotating.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {!backgroundImageUrl && (
                  <div className="space-y-3 pt-2">
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 italic">
                      No image set. Banner will automatically use the dynamic ambient gradient theme.
                    </p>

                    {/* Display Duration slider even when gradient theme is active */}
                    <div className="p-3 bg-white dark:bg-neutral-900 rounded-lg border border-gray-200 dark:border-neutral-800 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                          Display Duration (seconds)
                        </label>
                        <span className="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-900">
                          {displayDurationSeconds}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={displayDurationSeconds}
                        onChange={(e) => setDisplayDurationSeconds(parseInt(e.target.value, 10) || 5)}
                        className="w-full h-2 bg-gray-200 dark:bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-600 dark:accent-amber-500"
                      />
                      <p className="text-[10px] text-neutral-500 dark:text-neutral-400 italic">
                        Controls how long this banner shows (1–30s) before rotating.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order, Duration & Active Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Display Order Sequence
                  </label>
                  <Input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10) || 0)}
                    placeholder="1"
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs font-bold text-neutral-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                    Display Duration (seconds)
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={30}
                    value={displayDurationSeconds}
                    onChange={(e) => setDisplayDurationSeconds(parseInt(e.target.value, 10) || 5)}
                    placeholder="5"
                    className="bg-gray-50 dark:bg-neutral-950 border-gray-200 dark:border-neutral-800 text-xs font-bold text-neutral-900 dark:text-white"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="banner-active-checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                  />
                  <label
                    htmlFor="banner-active-checkbox"
                    className="text-xs font-bold text-neutral-900 dark:text-white cursor-pointer"
                  >
                    Active / Live on Storefront
                  </label>
                </div>
              </div>

              {/* Scheduled Dates (Optional startsAt / endsAt) */}
              <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-gray-50/70 dark:bg-neutral-950/60 p-4 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-500" />
                  Scheduled Availability (Optional)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      Start Time (startsAt)
                    </label>
                    <Input
                      type="datetime-local"
                      value={startsAt}
                      onChange={(e) => setStartsAt(e.target.value)}
                      className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-600 dark:text-neutral-400 mb-1">
                      End Time (endsAt)
                    </label>
                    <Input
                      type="datetime-local"
                      value={endsAt}
                      onChange={(e) => setEndsAt(e.target.value)}
                      className="bg-white dark:bg-neutral-900 border-gray-300 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100 dark:border-neutral-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="text-xs font-bold border-gray-300 dark:border-neutral-700"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold px-6 shadow-md shadow-rose-900/20"
                >
                  {isSubmitting
                    ? "Saving..."
                    : editingBanner
                    ? "Save Changes"
                    : "Create Banner"}
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
