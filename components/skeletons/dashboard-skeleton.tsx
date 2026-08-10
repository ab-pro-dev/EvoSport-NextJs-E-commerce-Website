import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2 border-b border-neutral-800 pb-5">
        <Skeleton className="h-8 w-64 bg-neutral-800/80" />
        <Skeleton className="h-4 w-48 bg-neutral-800/60" />
      </div>

      {/* Stat Tiles (4 Grid) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24 bg-neutral-800/70" />
              <Skeleton className="h-8 w-8 rounded-lg bg-neutral-800/80" />
            </div>
            <Skeleton className="h-7 w-20 bg-neutral-800/90" />
            <Skeleton className="h-3 w-32 bg-neutral-800/60" />
          </div>
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
          <Skeleton className="h-5 w-36 bg-neutral-800/80" />
          <Skeleton className="h-4 w-20 bg-neutral-800/60" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-neutral-800/50">
              <div className="flex items-center gap-3">
                <Skeleton className="h-9 w-9 rounded-lg bg-neutral-800/70" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 bg-neutral-800/80" />
                  <Skeleton className="h-3 w-24 bg-neutral-800/60" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-neutral-800/70" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
