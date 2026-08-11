import { Metadata } from "next";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CartView } from "@/components/cart/cart-view";

export const metadata: Metadata = {
  title: "Shopping Cart | EvoSport",
  description: "Review your shopping cart items and proceed to checkout.",
};

async function getInitialCart() {
  const session = await auth();
  const userId = session?.user?.id || null;

  const cookieStore = await cookies();
  const sessionId = cookieStore.get("cart_session")?.value || null;

  if (!userId && !sessionId) {
    return { items: [], subtotal: 0 };
  }

  const where = userId ? { userId } : { sessionId: sessionId! };

  const rawItems = await prisma.cartItem.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      variant: {
        include: {
          product: {
            include: {
              brand: { select: { name: true, slug: true } },
              category: { select: { name: true, slug: true } },
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  let subtotal = 0;
  const items = rawItems.map((item) => {
    const unitPrice = item.variant.price
      ? Number(item.variant.price)
      : Number(item.variant.product.basePrice);
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    return {
      id: item.id,
      userId: item.userId,
      sessionId: item.sessionId,
      quantity: item.quantity,
      unitPrice,
      itemTotal: Number(itemTotal.toFixed(2)),
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        color: item.variant.color,
        size: item.variant.size,
        price: unitPrice,
        stock: item.variant.stock,
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
          brand: item.variant.product.brand.name,
          category: item.variant.product.category.name,
          image: item.variant.product.images[0]?.url || null,
          altText: item.variant.product.images[0]?.altText || null,
        },
      },
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  });

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
  };
}

export default async function CartPage() {
  const session = await auth();
  const userId = session?.user?.id || null;
  const initialCart = await getInitialCart();

  return (
    <div className="min-h-screen bg-[#F4F8FC] text-[#0F1B2D]">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CartView initialCart={initialCart} isAuthenticated={Boolean(userId)} />
      </main>
    </div>
  );
}
