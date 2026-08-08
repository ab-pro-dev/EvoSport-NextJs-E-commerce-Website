import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CustomersListView } from "@/components/admin/customers-list-view";

export const metadata: Metadata = {
  title: "Customer Management | EvoSport Admin",
  description: "View customer profiles, total spend, and account suspension controls.",
};

export default async function AdminCustomersPage() {
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

  const customersRaw = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      isBanned: true,
      createdAt: true,
      orders: {
        select: {
          total: true,
          status: true,
        },
      },
      _count: { select: { orders: true, reviews: true } },
    },
  });

  const formattedCustomers = customersRaw.map((c) => {
    const validOrders = c.orders.filter((o) =>
      ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(o.status)
    );
    const totalSpent = validOrders.reduce((sum, o) => sum + Number(o.total), 0);

    return {
      id: c.id,
      name: c.name || "Customer User",
      email: c.email,
      image: c.image,
      isBanned: c.isBanned,
      ordersCount: c._count.orders,
      reviewsCount: c._count.reviews,
      totalSpent,
      createdAt: c.createdAt.toISOString(),
    };
  });

  return <CustomersListView initialCustomers={formattedCustomers} />;
}
