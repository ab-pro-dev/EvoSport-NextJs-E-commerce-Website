import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getAuthUserId() {
  const session = await auth();
  return session?.user?.id || null;
}

async function getCartData(userId: string) {
  const rawItems = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      variant: {
        include: {
          product: {
            include: {
              brand: { select: { name: true, slug: true } },
              category: { select: { name: true, slug: true } },
              images: { orderBy: { position: "asc" }, take: 1 },
            },
          },
        },
      },
    },
  });

  let subtotal = 0;
  const items = rawItems.map((item) => {
    const unitPrice = item.variant.price
      ? Number(item.variant.price)
      : Number(item.variant.product.basePrice);
    const itemTotal = unitPrice * item.quantity;
    subtotal += itemTotal;

    return {
      id: item.id,
      userId: item.userId,
      sessionId: item.sessionId,
      quantity: item.quantity,
      unitPrice,
      itemTotal: Number(itemTotal.toFixed(2)),
      variant: {
        id: item.variant.id,
        sku: item.variant.sku,
        color: item.variant.color,
        size: item.variant.size,
        price: unitPrice,
        stock: item.variant.stock,
        product: {
          id: item.variant.product.id,
          name: item.variant.product.name,
          slug: item.variant.product.slug,
          brand: item.variant.product.brand.name,
          category: item.variant.product.category.name,
          image: item.variant.product.images[0]?.url || null,
          altText: item.variant.product.images[0]?.altText || null,
        },
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  return {
    items,
    subtotal: Number(subtotal.toFixed(2)),
  };
}

export async function GET() {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json({ items: [], subtotal: 0, requiresLogin: true });
    }

    const cart = await getCartData(userId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Please log in to add items to your cart." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { variantId, quantity: requestedQty } = body;
    const quantity = Math.max(1, parseInt(requestedQty || "1", 10));

    if (!variantId) {
      return NextResponse.json({ error: "variantId is required" }, { status: 400 });
    }

    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!variant) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        userId,
        variantId,
      },
    });

    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const targetQuantity = currentQtyInCart + quantity;

    // Enforce stock limits
    if (targetQuantity > variant.stock) {
      return NextResponse.json(
        {
          error: `Requested quantity (${targetQuantity}) exceeds available stock (${variant.stock}).`,
          availableStock: variant.stock,
        },
        { status: 400 }
      );
    }

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: targetQuantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          userId,
          variantId,
          quantity,
        },
      });
    }

    const cart = await getCartData(userId);
    return NextResponse.json(cart, { status: 200 });
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Please log in to update your cart." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const cartItemId = body.cartItemId || body.id;
    const quantity = parseInt(body.quantity, 10);

    if (!cartItemId || isNaN(quantity)) {
      return NextResponse.json({ error: "cartItemId and valid quantity are required" }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
      include: { variant: true },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });
    } else {
      if (quantity > cartItem.variant.stock) {
        return NextResponse.json(
          {
            error: `Requested quantity (${quantity}) exceeds available stock (${cartItem.variant.stock}).`,
            availableStock: cartItem.variant.stock,
          },
          { status: 400 }
        );
      }

      await prisma.cartItem.update({
        where: { id: cartItem.id },
        data: { quantity },
      });
    }

    const cart = await getCartData(userId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("PATCH /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const userId = await getAuthUserId();
    if (!userId) {
      return NextResponse.json(
        { error: "Please log in to remove items from your cart." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    let cartItemId = searchParams.get("id") || searchParams.get("cartItemId");

    if (!cartItemId) {
      try {
        const body = await req.json();
        cartItemId = body.cartItemId || body.id;
      } catch {
        // Body reading optional
      }
    }

    if (!cartItemId) {
      return NextResponse.json({ error: "cartItemId parameter is required" }, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        userId,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    const cart = await getCartData(userId);
    return NextResponse.json(cart);
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
