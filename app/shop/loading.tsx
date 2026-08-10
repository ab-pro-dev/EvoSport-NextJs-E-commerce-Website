import { ShopGridSkeleton } from "@/components/skeletons/product-card-skeleton";

export default function ShopLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl space-y-8">
        <div className="flex flex-col gap-2 border-b border-neutral-800 pb-5">
          <div className="h-8 w-48 rounded bg-neutral-900 animate-pulse" />
          <div className="h-4 w-72 rounded bg-neutral-900/60 animate-pulse" />
        </div>
        <ShopGridSkeleton count={8} />
      </main>
    </div>
  );
}
