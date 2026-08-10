import { Skeleton } from "@/components/ui/skeleton";

export function PdpSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16 bg-neutral-800/60" />
        <Skeleton className="h-3 w-16 bg-neutral-800/60" />
        <Skeleton className="h-3 w-32 bg-neutral-800/70" />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Image Gallery */}
        <div className="lg:col-span-6 flex gap-4">
          <div className="flex flex-col gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-16 rounded-lg bg-neutral-800/70" />
            ))}
          </div>
          <Skeleton className="aspect-square flex-1 rounded-2xl bg-neutral-900 border border-neutral-800" />
        </div>

        {/* Right Details Column */}
        <div className="lg:col-span-6 space-y-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20 bg-neutral-800/70" />
            <Skeleton className="h-8 w-3/4 bg-neutral-800/80" />
            <Skeleton className="h-4 w-36 bg-neutral-800/60" />
          </div>

          <Skeleton className="h-8 w-28 bg-neutral-800/80" />
          <Skeleton className="h-16 w-full bg-neutral-900 border border-neutral-800" />

          {/* Color & Size Swatches */}
          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-neutral-800/60" />
            <div className="flex gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-lg bg-neutral-800/70" />
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-3 w-20 bg-neutral-800/60" />
            <div className="flex gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-12 rounded-md bg-neutral-800/70" />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Skeleton className="h-12 flex-1 rounded-lg bg-neutral-800/80" />
            <Skeleton className="h-12 flex-1 rounded-lg bg-neutral-800/80" />
          </div>
        </div>
      </div>
    </div>
  );
}
