import { CartSkeleton } from "@/components/skeletons/cart-skeleton";

export default function CartLoading() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CartSkeleton />
      </main>
    </div>
  );
}
