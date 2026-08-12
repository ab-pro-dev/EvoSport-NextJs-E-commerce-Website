import { CartSkeleton } from "@/components/skeletons/cart-skeleton";

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-slate-100 transition-colors">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CartSkeleton />
      </main>
    </div>
  );
}
