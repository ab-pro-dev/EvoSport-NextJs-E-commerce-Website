import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = {
  title: "Checkout | EvoSport",
  description: "Complete your order with secure checkout at EvoSport.",
};

async function getCartData() {
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
              brand: { select: { name: true } },
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
      quantity: item.quantity,
      unitPrice,
      itemTotal: Number(itemTotal.toFixed(2)),
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        color: item.variant.color,
        size: item.variant.size,
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
          brand: item.variant.product.brand.name,
          image: item.variant.product.images[0]?.url || null,
        },
      },
    };
  });

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
  };
}

export default async function CheckoutPage() {
  const cart = await getCartData();

  // Requirement 3: If cart is empty, redirect /checkout back to /cart
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CheckoutView cart={cart} />
      </main>
    </div>
  );
}
