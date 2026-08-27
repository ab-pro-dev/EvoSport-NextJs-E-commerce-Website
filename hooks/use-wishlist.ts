"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { toast } from "sonner";

export function useWishlist() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [wishlistProductIds, setWishlistProductIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);

  const fetchWishlist = useCallback(async () => {
    if (status !== "authenticated") {
      setWishlistProductIds(new Set());
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/wishlist");
      if (res.ok) {
        const data = await res.json();
        const ids = new Set<string>((data.items || []).map((item: any) => item.productId));
        setWishlistProductIds(ids);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    fetchWishlist();

    const handleWishlistUpdated = () => {
      fetchWishlist();
    };

    window.addEventListener("wishlist-updated", handleWishlistUpdated);
    return () => {
      window.removeEventListener("wishlist-updated", handleWishlistUpdated);
    };
  }, [fetchWishlist]);

  const isWishlisted = (productId: string) => {
    return wishlistProductIds.has(productId);
  };

  const toggleWishlist = async (productId: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (status !== "authenticated") {
      toast.error("Please log in to save items to your wishlist.");
      router.push(`/login?callbackUrl=${encodeURIComponent(pathname)}`);
      return false;
    }

    const currentlyWishlisted = wishlistProductIds.has(productId);

    // Optimistic UI update
    setWishlistProductIds((prev) => {
      const next = new Set(prev);
      if (currentlyWishlisted) next.delete(productId);
      else next.add(productId);
      return next;
    });

    try {
      if (currentlyWishlisted) {
        // Remove from wishlist
        const res = await fetch(`/api/wishlist?productId=${productId}`, {
          method: "DELETE",
        });
        if (res.ok) {
          toast.success("Removed from wishlist");
          window.dispatchEvent(new Event("wishlist-updated"));
          return true;
        } else {
          // Revert optimistic update
          setWishlistProductIds((prev) => new Set(prev).add(productId));
          const data = await res.json();
          toast.error(data.error || "Failed to remove from wishlist");
          return false;
        }
      } else {
        // Add to wishlist
        const res = await fetch("/api/wishlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ productId }),
        });
        if (res.ok) {
          toast.success("Added to wishlist!");
          window.dispatchEvent(new Event("wishlist-updated"));
          return true;
        } else {
          // Revert optimistic update
          setWishlistProductIds((prev) => {
            const next = new Set(prev);
            next.delete(productId);
            return next;
          });
          const data = await res.json();
          toast.error(data.error || "Failed to add to wishlist");
          return false;
        }
      }
    } catch (err: any) {
      console.error("Wishlist toggle error:", err);
      fetchWishlist();
      toast.error("An error occurred");
      return false;
    }
  };

  return {
    wishlistProductIds,
    wishlistCount: wishlistProductIds.size,
    isWishlisted,
    toggleWishlist,
    loading,
    refreshWishlist: fetchWishlist,
  };
}
