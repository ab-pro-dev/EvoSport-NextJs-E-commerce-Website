"use client";

import { useState } from "react";
import Link from "next/link";
import { Star, CheckCircle, XCircle, Trash2, ShieldCheck, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  status: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
  user: { id: string; name: string | null; email: string; image: string | null };
  product: { id: string; name: string; slug: string };
}

interface ReviewsManagementViewProps {
  initialReviews: ReviewItem[];
}

export function ReviewsManagementView({ initialReviews }: ReviewsManagementViewProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredReviews = reviews.filter((r) => statusFilter === "ALL" || r.status === statusFilter);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to update review status.");
        setUpdatingId(null);
        return;
      }

      setReviews(reviews.map((r) => (r.id === id ? { ...r, status: data.review.status } : r)));
    } catch (err) {
      console.error("Error updating review status:", err);
      alert("Failed to update review status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    try {
      setUpdatingId(id);
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        alert("Failed to delete review.");
        setUpdatingId(null);
        return;
      }

      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      console.error("Error deleting review:", err);
      alert("Failed to delete review.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-neutral-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
            <Star className="h-6 w-6 text-rose-600 dark:text-rose-500" />
            REVIEWS MODERATION
          </h1>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
            Approve or reject customer product reviews, verify purchase badges, and purge spam content.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-4 bg-white dark:bg-neutral-900/60 p-4 rounded-xl border border-gray-200 dark:border-neutral-800 shadow-sm">
        <div className="flex items-center gap-3">
          <Filter className="h-4 w-4 text-neutral-500 dark:text-neutral-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 text-xs text-neutral-900 dark:text-white rounded-lg px-3 py-2 focus:outline-none focus:border-rose-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">PENDING</option>
            <option value="APPROVED">APPROVED</option>
            <option value="REJECTED">REJECTED</option>
          </select>
        </div>
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">{filteredReviews.length} Reviews Shown</span>
      </div>

      {/* Reviews Cards List */}
      <div className="space-y-4">
        {filteredReviews.length === 0 ? (
          <div className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-8 text-center text-xs text-neutral-400 dark:text-neutral-500 italic shadow-sm">
            No product reviews found matching filter.
          </div>
        ) : (
          filteredReviews.map((r) => {
            const formattedDate = new Date(r.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={r.id}
                className="rounded-xl border border-gray-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/60 p-5 space-y-4 hover:border-gray-300 dark:hover:border-neutral-700 transition-colors shadow-sm"
              >
                {/* Header Row: User Info + Rating + Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-neutral-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-rose-100 dark:bg-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40 flex items-center justify-center font-black text-xs shrink-0">
                      {r.user.name?.charAt(0).toUpperCase() || "C"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-neutral-900 dark:text-white text-xs">{r.user.name || "Customer User"}</p>
                        {r.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                            <ShieldCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-neutral-400 dark:text-neutral-500">{r.user.email} • Reviewed on {formattedDate}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Star Rating */}
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-300 dark:text-neutral-700"
                          }`}
                        />
                      ))}
                    </div>

                    {/* Status Pill */}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        r.status === "APPROVED"
                          ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : r.status === "REJECTED"
                          ? "bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800"
                          : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>
                </div>

                {/* Body: Product Name + Comment Text */}
                <div className="space-y-2">
                  <p className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
                    Product:{" "}
                    <Link href={`/admin/products`} className="text-rose-600 dark:text-rose-400 hover:underline">
                      {r.product.name}
                    </Link>
                  </p>
                  <p className="text-xs text-neutral-700 dark:text-neutral-300 bg-gray-50 dark:bg-neutral-950 p-3 rounded-lg border border-gray-200/80 dark:border-neutral-800/80 leading-relaxed italic">
                    &ldquo;{r.comment || "No comment text provided."}&rdquo;
                  </p>
                </div>

                {/* Footer Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-2">
                  {r.status !== "APPROVED" && (
                    <Button
                      onClick={() => handleUpdateStatus(r.id, "APPROVED")}
                      disabled={updatingId === r.id}
                      className="bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-xs font-bold h-8 px-3"
                    >
                      <CheckCircle className="mr-1 h-3.5 w-3.5" />
                      Approve
                    </Button>
                  )}

                  {r.status !== "REJECTED" && (
                    <Button
                      onClick={() => handleUpdateStatus(r.id, "REJECTED")}
                      disabled={updatingId === r.id}
                      className="bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 dark:hover:bg-amber-900 text-xs font-bold h-8 px-3"
                    >
                      <XCircle className="mr-1 h-3.5 w-3.5" />
                      Reject
                    </Button>
                  )}

                  <Button
                    onClick={() => handleDeleteReview(r.id)}
                    disabled={updatingId === r.id}
                    variant="outline"
                    className="border-gray-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-400 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-900 text-xs font-bold h-8 px-3"
                  >
                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
