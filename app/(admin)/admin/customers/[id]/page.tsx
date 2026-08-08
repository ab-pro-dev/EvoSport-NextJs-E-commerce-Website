import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomerDetailView } from "@/components/admin/customer-detail-view";

export const metadata: Metadata = {
  title: "Customer Detail | EvoSport Admin",
  description: "View customer details, address book, order history, and manage ban status.",
};

export default async function AdminCustomerDetailPage({
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

  const customerRaw = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isBanned: true,
      createdAt: true,
      addresses: true,
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          items: { select: { quantity: true } },
        },
      },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      },
    },
  });

  if (!customerRaw) {
    notFound();
  }

  const validOrders = customerRaw.orders.filter((o) =>
    ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status)
  );
  const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.total), 0);

  const customer = {
    id: customerRaw.id,
    name: customerRaw.name,
    email: customerRaw.email,
    image: customerRaw.image,
    isBanned: customerRaw.isBanned,
    totalSpent,
    createdAt: customerRaw.createdAt.toISOString(),
    addresses: customerRaw.addresses,
    orders: customerRaw.orders.map((o) => ({
      id: o.id,
      status: o.status,
      total: Number(o.total),
      createdAt: o.createdAt.toISOString(),
      itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    })),
    reviews: customerRaw.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
      product: r.product,
    })),
  };

  return <CustomerDetailView customer={customer} />;
}
