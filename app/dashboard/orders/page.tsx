import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrdersListView } from "@/components/dashboard/orders-list-view";

export const metadata: Metadata = {
  title: "My Orders | EvoSport",
  description: "View and track all your sportswear and gear purchases.",
};

export default async function UserOrdersPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const rawOrders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: { select: { name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  const orders = rawOrders.map((order) => {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      id: order.id,
      status: order.status,
      subtotal: Number(order.subtotal),
      shipping: Number(order.shipping),
      tax: Number(order.tax),
      total: Number(order.total),
      createdAt: order.createdAt.toISOString(),
      itemCount,
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.variant.product.name,
        slug: item.variant.product.slug,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase),
        color: item.variant.color,
        size: item.variant.size,
      })),
    };
  });

  return <OrdersListView orders={orders} />;
}
