"use client";

import { useState, useEffect, useCallback } from "react";
import { Star, CheckCircle2, MessageSquare, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  verifiedPurchase: boolean;
  createdAt: string;
  userName: string;
  userImage: string | null;
}

interface ProductReviewsTabProps {
  productId: string;
  slug: string;
  initialReviewCount: number;
  initialAvgRating: number;
}

export function ProductReviewsTab({
  productId,
  slug,
  initialReviewCount,
  initialAvgRating,
}: ProductReviewsTabProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [totalCount, setTotalCount] = useState(initialReviewCount);
  const [avgRating, setAvgRating] = useState(initialAvgRating);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/products/${slug}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setTotalCount(data.totalCount || 0);
        setAvgRating(data.avgRating || 0);
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setSubmitError("Please sign in to write a review.");
        } else {
          setSubmitError(data.error || "Failed to submit review.");
        }
        setIsSubmitting(false);
        return;
      }

      setSubmitSuccess(true);
      setComment("");
    } catch (err) {
      console.error("Error submitting review:", err);
      setSubmitError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 text-xs text-neutral-300">
      {/* Overview Rating Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-6">
        <div className="flex items-center gap-4">
          <div className="text-3xl font-black text-[#CCFF00]">{avgRating.toFixed(1)}</div>
          <div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-4 w-4 ${
                    star <= Math.round(avgRating)
                      ? "fill-[#CCFF00] text-[#CCFF00]"
                      : "text-neutral-700"
                  }`}
                />
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mt-1 font-medium">
              Based on {totalCount} verified customer {totalCount === 1 ? "review" : "reviews"}
            </p>
          </div>
        </div>
      </div>

      {/* Write a Review Section */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-6 space-y-4">
        <h3 className="text-sm font-black uppercase text-white flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#CCFF00]" />
          WRITE A CUSTOMER REVIEW
        </h3>

        {submitSuccess ? (
          <div className="rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-4 text-emerald-400 font-medium space-y-1">
            <div className="flex items-center gap-2 font-bold text-xs uppercase">
              <CheckCircle2 className="h-4 w-4" />
              Review Submitted for Moderation
            </div>
            <p className="text-[11px] text-neutral-300">
              Thank you for your feedback! Your review is in the moderation queue and will appear publicly once approved.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} className="space-y-4">
            {submitError && (
              <div className="rounded-lg border border-rose-900/60 bg-rose-950/40 p-3 text-rose-300 text-[11px] font-medium">
                {submitError}
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Your Rating *
              </label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => {
                  const currentDisplayRating = hoverRating !== null ? hoverRating : rating;
                  return (
                    <button
                      type="button"
                      key={star}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`h-5 w-5 ${
                          star <= currentDisplayRating
                            ? "fill-[#CCFF00] text-[#CCFF00]"
                            : "text-neutral-700"
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="ml-2 font-mono text-xs font-bold text-neutral-300">
                  {rating} / 5
                </span>
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1.5">
                Review Details (Optional)
              </label>
              <textarea
                rows={3}
                placeholder="Share performance insights, fit details, or endurance tests..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border border-neutral-800 bg-neutral-900 p-3 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:ring-1 focus:ring-[#CCFF00]"
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#CCFF00] text-black font-black uppercase text-xs tracking-wider hover:bg-[#b8e600] rounded-lg px-6 h-10"
            >
              <Send className="mr-1.5 h-3.5 w-3.5" />
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        )}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
          APPROVED REVIEWS ({reviews.length})
        </h3>

        {isLoading ? (
          <div className="p-8 text-center text-neutral-500">Loading reviews...</div>
        ) : reviews.length > 0 ? (
          <div className="divide-y divide-neutral-800 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4">
            {reviews.map((r) => (
              <div key={r.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-xs">{r.userName}</span>
                    {r.verifiedPurchase && (
                      <Badge className="bg-emerald-950/80 text-emerald-400 border-emerald-800/80 text-[9px] uppercase font-bold px-2 py-0.2 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Verified Purchase
                      </Badge>
                    )}
                  </div>
                  <span className="text-[10px] text-neutral-500">
                    {new Date(r.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-3.5 w-3.5 ${
                        star <= r.rating
                          ? "fill-[#CCFF00] text-[#CCFF00]"
                          : "text-neutral-800"
                      }`}
                    />
                  ))}
                </div>

                {r.comment && (
                  <p className="text-xs text-neutral-300 leading-relaxed pt-1">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-neutral-500 rounded-xl border border-dashed border-neutral-800">
            No approved public reviews yet for this product. Be the first to leave a review above!
          </div>
        )}
      </div>
    </div>
  );
}
