import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-28" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] shadow-sm">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-xl" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44" />
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-5 w-20" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-xl" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-[#0F172A] p-6 space-y-4 shadow-sm">
            <Skeleton className="h-6 w-36" />
            <div className="space-y-2 border-t border-b border-gray-100 dark:border-slate-800 py-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
