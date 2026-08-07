import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const rawOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: {
                  include: {
                    images: { orderBy: { position: "asc" }, take: 1 },
                    brand: { select: { name: true } },
                  },
                },
              },
            },
          },
        },
        shippingAddress: true,
        payments: true,
      },
    });

    if (!rawOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify order belongs to the requesting user
    if (rawOrder.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: Order does not belong to user" }, { status: 403 });
    }

    const order = {
      id: rawOrder.id,
      userId: rawOrder.userId,
      status: rawOrder.status,
      subtotal: Number(rawOrder.subtotal),
      shipping: Number(rawOrder.shipping),
      tax: Number(rawOrder.tax),
      total: Number(rawOrder.total),
      createdAt: rawOrder.createdAt,
      shippingAddress: rawOrder.shippingAddress,
      payments: rawOrder.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        status: p.status,
        amount: Number(p.amount),
        transactionRef: p.transactionRef,
      })),
      items: rawOrder.items.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase),
        productName: item.variant.product.name,
        slug: item.variant.product.slug,
        brandName: item.variant.product.brand.name,
        color: item.variant.color,
        size: item.variant.size,
        sku: item.variant.sku,
        image: item.variant.product.images[0]?.url || null,
      })),
    };

    return NextResponse.json({ order }, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
