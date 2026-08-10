import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-neutral-800/80 bg-neutral-900/70 p-4 space-y-4">
      {/* Product Image Placeholder */}
      <Skeleton className="aspect-square w-full rounded-lg bg-neutral-800/80" />

      {/* Brand & Title */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 bg-neutral-800/70" />
        <Skeleton className="h-4 w-3/4 bg-neutral-800/80" />
      </div>

      {/* Stars */}
      <Skeleton className="h-3 w-24 bg-neutral-800/60" />

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-neutral-800/60">
        <Skeleton className="h-5 w-20 bg-neutral-800/80" />
        <Skeleton className="h-8 w-24 rounded-lg bg-neutral-800/70" />
      </div>
    </div>
  );
}

export function ShopGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
