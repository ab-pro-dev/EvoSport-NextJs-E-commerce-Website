import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-4 space-y-4 shadow-sm">
      {/* Product Image Placeholder */}
      <Skeleton className="aspect-square w-full rounded-xl" />

      {/* Brand & Title */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-3/4" />
      </div>

      {/* Stars */}
      <Skeleton className="h-3 w-24" />

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-slate-800">
        <Skeleton className="h-5 w-20" />
        <Skeleton className="h-8 w-24 rounded-xl" />
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
