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

// GET /api/admin/orders — List all customer orders, paginated and filterable
export async function GET(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "10", 10)));
    const status = searchParams.get("status") as string | null;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true, email: true } },
          shippingAddress: true,
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
      }),
      prisma.order.count({ where }),
    ]);

    const formattedOrders = orders.map((o) => ({
      id: o.id,
      status: o.status,
      subtotal: Number(o.subtotal),
      shipping: Number(o.shipping),
      tax: Number(o.tax),
      total: Number(o.total),
      customer: o.user,
      shippingAddress: o.shippingAddress,
      itemCount: o.items.reduce((sum, item) => sum + item.quantity, 0),
      items: o.items.map((i) => ({
        id: i.id,
        quantity: i.quantity,
        priceAtPurchase: Number(i.priceAtPurchase),
        variant: i.variant,
      })),
      createdAt: o.createdAt,
    }));

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
