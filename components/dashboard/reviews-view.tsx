"use client";

import Link from "next/link";
import Image from "next/image";
import { Star, ShieldCheck, Clock, ExternalLink, MessageSquare, ShoppingBag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface UserReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  verifiedPurchase: boolean;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  product: {
    id: string;
    name: string;
    slug: string;
    basePrice: number;
    images: { url: string }[];
  };
}

interface ReviewsViewProps {
  initialReviews: UserReviewItem[];
}

export function ReviewsView({ initialReviews }: ReviewsViewProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-[10px] uppercase font-bold">
            Published
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 text-[10px] uppercase font-bold">
            Rejected
          </Badge>
        );
      case "PENDING":
      default:
        return (
          <Badge className="bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800 text-[10px] uppercase font-bold">
            Pending Moderation
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-[#0F1B2D] dark:text-white flex items-center gap-2">
            <Star className="h-6 w-6 text-[#B8FF00]" />
            MY PRODUCT REVIEWS
          </h1>
          <p className="text-xs text-[#0F1B2D]/50 dark:text-slate-400 mt-0.5">
            Track and view feedback you have provided on athletic gear and sportswear
          </p>
        </div>

        <Link href="/shop">
          <Button
            size="sm"
            className="bg-[#B8FF00] hover:bg-[#a8ef00] text-[#0F1B2D] text-xs font-bold uppercase tracking-wider h-9 shadow-sm"
          >
            <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
            Browse More Products
          </Button>
        </Link>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {initialReviews.length > 0 ? (
          initialReviews.map((rev) => {
            const productImg =
              rev.product?.images?.[0]?.url ||
              "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400";
            const dateStr = new Date(rev.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={rev.id}
                className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-5 shadow-sm space-y-4"
              >
                {/* Top Row: Product Info + Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-slate-800 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                      <Image
                        src={productImg}
                        alt={rev.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Link
                        href={`/products/${rev.product.slug}`}
                        className="text-sm font-bold text-[#0F1B2D] dark:text-white hover:text-[#5B8DEF] dark:hover:text-[#B8FF00] transition-colors flex items-center gap-1.5"
                      >
                        <span>{rev.product.name}</span>
                        <ExternalLink className="h-3 w-3 opacity-50" />
                      </Link>
                      <div className="text-xs font-extrabold text-[#0F1B2D] dark:text-white mt-0.5">
                        ${rev.product.basePrice.toFixed(2)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(rev.status)}
                    {rev.verifiedPurchase && (
                      <span className="inline-flex items-center gap-1 rounded-md bg-[#B8FF00]/15 dark:bg-[#B8FF00]/20 px-2 py-0.5 text-[10px] font-bold text-[#0F1B2D] dark:text-[#B8FF00] border border-[#B8FF00]/30">
                        <ShieldCheck className="h-3 w-3" />
                        Verified Purchase
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating Stars & Comment */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < rev.rating
                              ? "fill-amber-400 text-amber-400"
                              : "fill-gray-200 dark:fill-slate-700 text-gray-200 dark:text-slate-700"
                          }`}
                        />
                      ))}
                      <span className="ml-1.5 text-xs font-black text-[#0F1B2D] dark:text-white">
                        {rev.rating} / 5
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[#0F1B2D]/40 dark:text-slate-500 font-medium">
                      <Clock className="h-3 w-3" />
                      <span>{dateStr}</span>
                    </div>
                  </div>

                  {rev.comment ? (
                    <p className="text-xs text-[#0F1B2D]/80 dark:text-slate-300 leading-relaxed bg-[#F4F8FC] dark:bg-slate-900/60 p-3 rounded-xl border border-gray-100 dark:border-slate-800">
                      &ldquo;{rev.comment}&rdquo;
                    </p>
                  ) : (
                    <p className="text-xs italic text-[#0F1B2D]/40 dark:text-slate-500">
                      No written feedback provided.
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-12 text-center shadow-sm space-y-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F4F8FC] dark:bg-slate-900 text-[#0F1B2D]/30 dark:text-slate-500 mx-auto border border-gray-200 dark:border-slate-800">
              <MessageSquare className="h-6 w-6 text-[#B8FF00]" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-black uppercase text-[#0F1B2D] dark:text-white">
                No product reviews yet
              </h3>
              <p className="text-xs text-[#0F1B2D]/40 dark:text-slate-400 max-w-sm mx-auto">
                Share your experience on gear you&apos;ve purchased to help fellow athletes make the best decision.
              </p>
            </div>
            <Link href="/shop" className="inline-block pt-2">
              <Button
                size="sm"
                className="bg-[#B8FF00] hover:bg-[#a8ef00] text-[#0F1B2D] text-xs font-bold uppercase tracking-wider px-6 h-9"
              >
                Shop Gear to Review
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
