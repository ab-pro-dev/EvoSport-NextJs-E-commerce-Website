import { Skeleton } from "@/components/ui/skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 space-y-4">
      {/* Product Image Placeholder */}
      <Skeleton className="aspect-square w-full rounded-xl bg-gray-100" />

      {/* Brand & Title */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-16 bg-gray-100" />
        <Skeleton className="h-4 w-3/4 bg-gray-200/80" />
      </div>

      {/* Stars */}
      <Skeleton className="h-3 w-24 bg-gray-100" />

      {/* Price & Action */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <Skeleton className="h-5 w-20 bg-gray-200/80" />
        <Skeleton className="h-8 w-24 rounded-xl bg-gray-100" />
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
