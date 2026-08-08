import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrdersListView } from "@/components/admin/orders-list-view";

export const metadata: Metadata = {
  title: "Order Management | EvoSport Admin",
  description: "Monitor customer orders and fulfillments.",
};

export default async function AdminOrdersPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/admin-login");
  }

  const ordersRaw = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { select: { quantity: true } },
    },
  });

  const formattedOrders = ordersRaw.map((o) => ({
    id: o.id,
    status: o.status,
    subtotal: Number(o.subtotal),
    shipping: Number(o.shipping),
    tax: Number(o.tax),
    total: Number(o.total),
    customer: o.user,
    itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
    createdAt: o.createdAt.toISOString(),
  }));

  return <OrdersListView initialOrders={formattedOrders} />;
}
