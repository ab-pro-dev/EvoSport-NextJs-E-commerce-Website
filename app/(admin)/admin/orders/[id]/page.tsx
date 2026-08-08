import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderDetailView } from "@/components/admin/order-detail-view";

export const metadata: Metadata = {
  title: "Order Detail | EvoSport Admin",
  description: "View order line items, shipping address, and process fulfillment transitions.",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;

  const orderRaw = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      shippingAddress: true,
      payments: true,
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
                  name: true,
                  images: { take: 1, orderBy: { position: "asc" } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!orderRaw) {
    notFound();
  }

  const order = {
    id: orderRaw.id,
    status: orderRaw.status,
    subtotal: Number(orderRaw.subtotal),
    shipping: Number(orderRaw.shipping),
    tax: Number(orderRaw.tax),
    total: Number(orderRaw.total),
    createdAt: orderRaw.createdAt.toISOString(),
    customer: orderRaw.user,
    shippingAddress: orderRaw.shippingAddress,
    items: orderRaw.items.map((i) => ({
      id: i.id,
      quantity: i.quantity,
      priceAtPurchase: Number(i.priceAtPurchase),
      variant: {
        sku: i.variant.sku,
        color: i.variant.color,
        size: i.variant.size,
        product: {
          name: i.variant.product.name,
          images: i.variant.product.images.map((img) => ({ url: img.url })),
        },
      },
    })),
    payments: orderRaw.payments.map((p) => ({
      id: p.id,
      provider: p.provider,
      status: p.status,
      amount: Number(p.amount),
    })),
  };

  return <OrderDetailView order={order} />;
}
