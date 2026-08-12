import { PdpSkeleton } from "@/components/skeletons/pdp-skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-slate-100 py-8 transition-colors">
      <main className="container mx-auto px-4 max-w-7xl">
        <PdpSkeleton />
      </main>
    </div>
  );
}
