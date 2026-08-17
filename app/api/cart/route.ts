import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CART_COOKIE_NAME = "cart_session";

async function getCartSessionInfo() {
  const session = await auth();
  const userId = session?.user?.id || null;

  const cookieStore = await cookies();
  let sessionId = cookieStore.get(CART_COOKIE_NAME)?.value || null;
  let isNewSession = false;

  if (!userId && !sessionId) {
    sessionId = crypto.randomUUID();
    isNewSession = true;
  }

  // If user just logged in and has guest items in sessionId, merge them to userId
  if (userId && sessionId) {
    try {
      const guestItems = await prisma.cartItem.findMany({
        where: { sessionId },
      });

      for (const guestItem of guestItems) {
        const userExisting = await prisma.cartItem.findFirst({
          where: { userId, variantId: guestItem.variantId },
        });

        if (userExisting) {
          await prisma.cartItem.update({
            where: { id: userExisting.id },
            data: { quantity: userExisting.quantity + guestItem.quantity },
          });
          await prisma.cartItem.delete({ where: { id: guestItem.id } });
        } else {
          await prisma.cartItem.update({
            where: { id: guestItem.id },
            data: { userId, sessionId: null },
          });
        }
      }
    } catch (e) {
      console.error("Cart migration error:", e);
    }
  }

  return { userId, sessionId, isNewSession };
}

function applyCartCookie(response: NextResponse, sessionId: string | null, isNewSession: boolean) {
  if (isNewSession && sessionId) {
    response.cookies.set({
      name: CART_COOKIE_NAME,
      value: sessionId,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });
  }
  return response;
}

async function getCartData(userId: string | null, sessionId: string | null) {
  if (!userId && !sessionId) {
    return { items: [], subtotal: 0 };
  }

  const where = userId ? { userId } : { sessionId: sessionId! };

  const rawItems = await prisma.cartItem.findMany({
    where,
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
    const { userId, sessionId, isNewSession } = await getCartSessionInfo();
    const cart = await getCartData(userId, sessionId);

    const response = NextResponse.json(cart);
    return applyCartCookie(response, sessionId, isNewSession);
  } catch (error) {
    console.error("GET /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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

    const { userId, sessionId, isNewSession } = await getCartSessionInfo();
    const where = userId ? { userId } : { sessionId: sessionId! };

    const existingItem = await prisma.cartItem.findFirst({
      where: {
        ...where,
        variantId,
      },
    });

    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const targetQuantity = currentQtyInCart + quantity;

    // Enforce stock limits (if not unlimited / null)
    if (variant.stock !== null && targetQuantity > variant.stock) {
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
          sessionId: userId ? null : sessionId,
          variantId,
          quantity,
        },
      });
    }

    const cart = await getCartData(userId, sessionId);
    const response = NextResponse.json(cart, { status: 200 });
    return applyCartCookie(response, sessionId, isNewSession);
  } catch (error) {
    console.error("POST /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const cartItemId = body.cartItemId || body.id;
    const quantity = parseInt(body.quantity, 10);

    if (!cartItemId || isNaN(quantity)) {
      return NextResponse.json({ error: "cartItemId and valid quantity are required" }, { status: 400 });
    }

    const { userId, sessionId, isNewSession } = await getCartSessionInfo();
    const where = userId ? { userId } : { sessionId: sessionId! };

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        ...where,
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
      if (cartItem.variant.stock !== null && quantity > cartItem.variant.stock) {
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

    const cart = await getCartData(userId, sessionId);
    const response = NextResponse.json(cart);
    return applyCartCookie(response, sessionId, isNewSession);
  } catch (error) {
    console.error("PATCH /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
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

    const { userId, sessionId, isNewSession } = await getCartSessionInfo();
    const where = userId ? { userId } : { sessionId: sessionId! };

    const cartItem = await prisma.cartItem.findFirst({
      where: {
        id: cartItemId,
        ...where,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Cart item not found" }, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    const cart = await getCartData(userId, sessionId);
    const response = NextResponse.json(cart);
    return applyCartCookie(response, sessionId, isNewSession);
  } catch (error) {
    console.error("DELETE /api/cart error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
