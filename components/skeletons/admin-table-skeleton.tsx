import { Skeleton } from "@/components/ui/skeleton";

export function AdminTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-neutral-800 pb-5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48 bg-neutral-800/80" />
          <Skeleton className="h-3 w-64 bg-neutral-800/60" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg bg-neutral-800/80" />
      </div>

      {/* Table Skeleton */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 overflow-hidden">
        <div className="p-4 border-b border-neutral-800 bg-neutral-950/80 flex items-center justify-between">
          <Skeleton className="h-4 w-32 bg-neutral-800/70" />
          <Skeleton className="h-8 w-48 rounded-lg bg-neutral-800/60" />
        </div>
        <div className="divide-y divide-neutral-800/60 p-4 space-y-3">
          {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg bg-neutral-800/70" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-40 bg-neutral-800/80" />
                  <Skeleton className="h-3 w-24 bg-neutral-800/60" />
                </div>
              </div>
              <Skeleton className="h-4 w-24 bg-neutral-800/70" />
              <Skeleton className="h-6 w-20 rounded-full bg-neutral-800/70" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded-lg bg-neutral-800/60" />
                <Skeleton className="h-8 w-8 rounded-lg bg-neutral-800/60" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
