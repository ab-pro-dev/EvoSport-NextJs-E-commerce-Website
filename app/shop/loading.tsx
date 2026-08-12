import { ShopGridSkeleton } from "@/components/skeletons/product-card-skeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-slate-100 transition-colors">
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex flex-col gap-2 border-b border-gray-200 dark:border-slate-800 pb-5">
          <div className="h-8 w-48 rounded-xl bg-slate-200/80 dark:bg-slate-800/80 animate-pulse" />
          <div className="h-4 w-72 rounded-lg bg-slate-200/60 dark:bg-slate-800/60 animate-pulse" />
        </div>
        <ShopGridSkeleton count={8} />
      </main>
    </div>
  );
}
