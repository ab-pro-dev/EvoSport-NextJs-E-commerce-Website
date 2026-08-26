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

async function getCartData(userId: string) {
  // Merge any guest cart items from sessionId into userId
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("cart_session")?.value;

    if (sessionId) {
      const guestItems = await prisma.cartItem.findMany({
        where: { sessionId },
      });

      for (const guestItem of guestItems) {
        const userExisting = await prisma.cartItem.findFirst({
          where: { userId, variantId: guestItem.variantId },
        });

        if (userExisting) {
          await prisma.cartItem.update({
            where: { id: userExisting.id },
            data: { quantity: userExisting.quantity + guestItem.quantity },
          });
          await prisma.cartItem.delete({ where: { id: guestItem.id } });
        } else {
          await prisma.cartItem.update({
            where: { id: guestItem.id },
            data: { userId, sessionId: null },
          });
        }
      }
    }
  } catch (err) {
    console.error("Error migrating guest cart to user on checkout:", err);
  }

  const rawItems = await prisma.cartItem.findMany({
    where: { userId },
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
          brand: item.variant.product.brand?.name || "EvoSport",
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
  const session = await auth();

  // Login is required to access Checkout
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/checkout");
  }

  const cart = await getCartData(session.user.id);

  // If cart is empty, redirect back to /cart
  if (cart.items.length === 0) {
    redirect("/cart");
  }

  return (
    <div className="min-h-screen bg-[#F4F8FC] dark:bg-[#090E17] text-[#0F1B2D] dark:text-[#F1F5F9] transition-colors duration-200">
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <CheckoutView cart={cart} />
      </main>
    </div>
  );
}
