import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WishlistView } from "@/components/wishlist/wishlist-view";

export const metadata: Metadata = {
  title: "My Wishlist | EvoSport",
  description: "View and manage your saved sportswear and equipment items.",
};

export default async function WishlistPage() {
  const session = await auth();

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200">
        <main className="container mx-auto px-4 py-8 max-w-7xl">
          <WishlistView initialItems={[]} isAuthenticated={false} />
        </main>
      </div>
    );
  }

  const rawItems = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: true,
        },
      },
    },
  });

  const initialItems = rawItems.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
    product: {
      ...item.product,
      basePrice: Number(item.product.basePrice),
      compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
      variants: item.product.variants.map((v) => ({
        ...v,
        price: v.price ? Number(v.price) : null,
      })),
    },
  }));

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <WishlistView initialItems={initialItems} isAuthenticated={true} />
      </main>
    </div>
  );
}
