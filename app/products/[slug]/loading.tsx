import { PdpSkeleton } from "@/components/skeletons/pdp-skeleton";

export default function ProductLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <PdpSkeleton />
      </main>
    </div>
  );
}
