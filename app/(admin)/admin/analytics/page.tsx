import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsDashboardView } from "@/components/admin/analytics-dashboard-view";

export const metadata: Metadata = {
  title: "Business Analytics | EvoSport Admin",
  description: "Real database aggregate metrics for revenue over time, sales by category, and customer lifetime spend.",
};

const VALID_ORDER_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

export default async function AdminAnalyticsPage() {
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

  const orders = await prisma.order.findMany({
    where: { status: { in: VALID_ORDER_STATUSES as any } },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  category: { select: { id: true, name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

  const revenueByDateMap: Record<string, { date: string; revenue: number; ordersCount: number }> = {};
  for (const o of orders) {
    const dateStr = o.createdAt.toISOString().split("T")[0];
    if (!revenueByDateMap[dateStr]) {
      revenueByDateMap[dateStr] = { date: dateStr, revenue: 0, ordersCount: 0 };
    }
    revenueByDateMap[dateStr].revenue += Number(o.total);
    revenueByDateMap[dateStr].ordersCount += 1;
  }

  const revenueOverTime = Object.values(revenueByDateMap).map((d) => ({
    date: d.date,
    revenue: Number(d.revenue.toFixed(2)),
    ordersCount: d.ordersCount,
  }));

  const categoryMap: Record<string, { categoryName: string; revenue: number; itemsSold: number }> = {};
  for (const o of orders) {
    for (const item of o.items) {
      const categoryName = item.variant?.product?.category?.name || "Uncategorized";
      if (!categoryMap[categoryName]) {
        categoryMap[categoryName] = { categoryName, revenue: 0, itemsSold: 0 };
      }
      const lineRevenue = Number(item.priceAtPurchase) * item.quantity;
      categoryMap[categoryName].revenue += lineRevenue;
      categoryMap[categoryName].itemsSold += item.quantity;
    }
  }

  const salesByCategory = Object.values(categoryMap).map((c) => ({
    categoryName: c.categoryName,
    revenue: Number(c.revenue.toFixed(2)),
    itemsSold: c.itemsSold,
  }));

  const customerMap: Record<string, { id: string; name: string; email: string; totalSpent: number; ordersCount: number }> = {};
  for (const o of orders) {
    const userId = o.userId;
    if (!customerMap[userId]) {
      customerMap[userId] = {
        id: userId,
        name: o.user?.name || "Customer",
        email: o.user?.email || "",
        totalSpent: 0,
        ordersCount: 0,
      };
    }
    customerMap[userId].totalSpent += Number(o.total);
    customerMap[userId].ordersCount += 1;
  }

  const topCustomers = Object.values(customerMap)
    .map((c) => ({
      ...c,
      totalSpent: Number(c.totalSpent.toFixed(2)),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const analyticsData = {
    summary: {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders,
      averageOrderValue,
    },
    revenueOverTime,
    salesByCategory,
    topCustomers,
  };

  return <AnalyticsDashboardView data={analyticsData} />;
}
