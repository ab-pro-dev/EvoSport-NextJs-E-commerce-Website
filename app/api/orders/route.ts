import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const where = { userId: session.user.id };

    const [rawOrders, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
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
      }),
      prisma.order.count({ where }),
    ]);

    const orders = rawOrders.map((order) => {
      const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

      return {
        id: order.id,
        userId: order.userId,
        status: order.status,
        subtotal: Number(order.subtotal),
        shipping: Number(order.shipping),
        tax: Number(order.tax),
        total: Number(order.total),
        createdAt: order.createdAt,
        itemCount,
        shippingAddress: order.shippingAddress,
        payments: order.payments.map((p) => ({
          id: p.id,
          provider: p.provider,
          status: p.status,
          amount: Number(p.amount),
          transactionRef: p.transactionRef,
        })),
        items: order.items.map((item) => ({
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity,
          priceAtPurchase: Number(item.priceAtPurchase),
          productName: item.variant.product.name,
          slug: item.variant.product.slug,
          brandName: item.variant.product.brand?.name || "EvoSport",
          color: item.variant.color,
          size: item.variant.size,
          sku: item.variant.sku,
          image: item.variant.product.images[0]?.url || null,
        })),
      };
    });

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      orders,
      totalCount,
      page,
      totalPages,
    });
  } catch (error) {
    console.error("GET /api/orders error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
