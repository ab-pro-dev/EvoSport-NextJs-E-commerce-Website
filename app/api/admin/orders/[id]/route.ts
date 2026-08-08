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

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  PENDING: ["PAID", "CANCELLED"],
  PAID: ["PROCESSING", "SHIPPED", "CANCELLED", "REFUNDED"],
  PROCESSING: ["SHIPPED", "CANCELLED", "REFUNDED"],
  SHIPPED: ["DELIVERED", "CANCELLED", "REFUNDED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

// GET /api/admin/orders/[id] — Full single order details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const order = await prisma.order.findUnique({
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
                    id: true,
                    name: true,
                    slug: true,
                    images: { take: 1, orderBy: { position: "asc" } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error("GET /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/orders/[id] — Update order status with strict transition rules
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const body = await req.json();
    const { status: newStatus } = body || {};

    if (!newStatus) {
      return NextResponse.json({ error: "Status field is required." }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const currentStatus = order.status;

    if (currentStatus === newStatus) {
      return NextResponse.json({ message: "Status unchanged", order });
    }

    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Invalid status transition from ${currentStatus} to ${newStatus}. Allowed next states: ${allowed.length ? allowed.join(", ") : "none (terminal state)"}.`,
        },
        { status: 400 }
      );
    }

    // Update status in DB
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status: newStatus as any },
      include: {
        user: { select: { id: true, name: true, email: true } },
        shippingAddress: true,
        items: true,
      },
    });

    // Send real in-app Notification to customer
    await prisma.notification.create({
      data: {
        userId: order.userId,
        message: `Order #${order.id.slice(-8).toUpperCase()}: Status updated to ${newStatus}.`,
        type: "ORDER_UPDATE",
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error("PATCH /api/admin/orders/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
