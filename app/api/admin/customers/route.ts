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

// GET /api/admin/customers — List all customer accounts with joined order counts and total spent
export async function GET(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where: { role: "CUSTOMER" },
        skip,
        take: limit,
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
              id: true,
              total: true,
              status: true,
            },
          },
          _count: { select: { orders: true, reviews: true } },
        },
      }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
    ]);

    const formattedCustomers = customers.map((c) => {
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
        createdAt: c.createdAt,
      };
    });

    return NextResponse.json({
      customers: formattedCustomers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/customers error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
