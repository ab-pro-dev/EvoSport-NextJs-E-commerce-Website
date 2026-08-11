import { Skeleton } from "@/components/ui/skeleton";

export function CartSkeleton() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <Skeleton className="h-8 w-48 bg-gray-200/80" />
        <Skeleton className="h-4 w-28 bg-gray-100" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 bg-white">
              <div className="flex items-center gap-4">
                <Skeleton className="h-20 w-20 rounded-xl bg-gray-100" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-44 bg-gray-200/80" />
                  <Skeleton className="h-3 w-28 bg-gray-100" />
                  <Skeleton className="h-5 w-20 bg-gray-200/70" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-xl bg-gray-100" />
            </div>
          ))}
        </div>

        <div className="lg:col-span-4">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-4">
            <Skeleton className="h-6 w-36 bg-gray-200/80" />
            <div className="space-y-2 border-t border-b border-gray-100 py-4">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 bg-gray-100" />
                <Skeleton className="h-4 w-16 bg-gray-200/80" />
              </div>
              <div className="flex justify-between">
                <Skeleton className="h-4 w-20 bg-gray-100" />
                <Skeleton className="h-4 w-16 bg-gray-200/80" />
              </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl bg-gray-200/90" />
          </div>
        </div>
      </div>
    </div>
  );
}
