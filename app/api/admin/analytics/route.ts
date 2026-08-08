import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function verifyAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }

  return { session };
}

const VALID_ORDER_STATUSES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"];

// GET /api/admin/analytics — Real database aggregate analytics
export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    // 1. Fetch all valid orders with user and order items
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

    // Summary KPIs
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
    const averageOrderValue = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

    // 2. Revenue over time (Grouped by Date YYYY-MM-DD)
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

    // 3. Sales by Category
    const categoryMap: Record<string, { categoryName: string; revenue: number; itemsSold: number }> = {};
    for (const o of orders) {
      for (const item of o.items) {
        const categoryName = item.variant.product.category?.name || "Uncategorized";
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

    // 4. Top Customers by Spend
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

    return NextResponse.json({
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        averageOrderValue,
      },
      revenueOverTime,
      salesByCategory,
      topCustomers,
    });
  } catch (error) {
    console.error("GET /api/admin/analytics error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
