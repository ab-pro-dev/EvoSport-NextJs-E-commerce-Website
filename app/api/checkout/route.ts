import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const CART_COOKIE_NAME = "cart_session";

export async function POST(req: Request) {
  try {
    const session = await auth();
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(CART_COOKIE_NAME)?.value || null;

    let authUserId = session?.user?.id || null;

    if (!authUserId && !sessionId) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    const cartWhere = authUserId ? { userId: authUserId } : { sessionId: sessionId! };

    // 1. Read real cart from DB server-side (prevent price/cart tampering)
    const cartItems = await prisma.cartItem.findMany({
      where: cartWhere,
      include: {
        variant: {
          include: {
            product: true,
          },
        },
      },
    });

    if (cartItems.length === 0) {
      return NextResponse.json({ error: "Your cart is empty." }, { status: 400 });
    }

    // 2. Validate shipping address fields and optional coupon code
    const body = await req.json();
    const { shippingAddress, couponCode } = body || {};

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zip ||
      !shippingAddress.country
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid shipping address. Please provide fullName, phone, line1, city, state, zip, and country.",
        },
        { status: 400 }
      );
    }

    // 3. Re-check stock availability at checkout time
    for (const item of cartItems) {
      if (item.quantity > item.variant.stock) {
        return NextResponse.json(
          {
            error: `Stock unavailable for "${item.variant.product.name}" (${item.variant.color}/${item.variant.size}). Available: ${item.variant.stock}, requested: ${item.quantity}.`,
            availableStock: item.variant.stock,
          },
          { status: 400 }
        );
      }
    }

    // 4. Calculate subtotal, base shipping, tax server-side
    let subtotal = 0;
    const itemsToPurchase = cartItems.map((item) => {
      const unitPrice = item.variant.price
        ? Number(item.variant.price)
        : Number(item.variant.product.basePrice);
      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;
      return {
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: unitPrice,
        variant: item.variant,
      };
    });

    subtotal = Number(subtotal.toFixed(2));
    let baseShipping = subtotal >= 100 ? 0 : 9.99;
    const tax = Number((subtotal * 0.08).toFixed(2));

    // 5. Coupon validation and discount computation
    let couponRecord: any = null;
    let discountAmount = 0;
    let effectiveShipping = baseShipping;

    if (couponCode && typeof couponCode === "string" && couponCode.trim() !== "") {
      const normalizedCode = couponCode.trim().toUpperCase();
      couponRecord = await prisma.coupon.findUnique({
        where: { code: normalizedCode },
      });

      if (!couponRecord || !couponRecord.active) {
        return NextResponse.json({ error: `Coupon "${normalizedCode}" is invalid or inactive.` }, { status: 400 });
      }

      if (couponRecord.expiresAt && new Date(couponRecord.expiresAt) < new Date()) {
        return NextResponse.json({ error: `Coupon "${normalizedCode}" has expired.` }, { status: 400 });
      }

      if (couponRecord.usageLimit !== null && couponRecord.usageCount >= couponRecord.usageLimit) {
        return NextResponse.json({ error: `Coupon "${normalizedCode}" has reached its maximum usage limit.` }, { status: 400 });
      }

      const couponVal = Number(couponRecord.value);
      if (couponRecord.type === "PERCENTAGE") {
        discountAmount = Number(((subtotal * couponVal) / 100).toFixed(2));
      } else if (couponRecord.type === "FIXED") {
        discountAmount = Number(couponVal.toFixed(2));
      } else if (couponRecord.type === "FREE_SHIPPING") {
        effectiveShipping = 0;
        discountAmount = baseShipping;
      }
    }

    const rawTotal = subtotal + effectiveShipping + tax - (couponRecord?.type === "FREE_SHIPPING" ? 0 : discountAmount);
    const finalTotal = Math.max(0, Number(rawTotal.toFixed(2)));

    // 6. Execute DB transaction with explicit 20s timeout for remote DB latency
    const completedOrder = await prisma.$transaction(
      async (tx) => {
        let finalUserId = authUserId;

        // Handle guest user relation if user is unauthenticated
        if (!finalUserId) {
          const guestUser = await tx.user.upsert({
            where: { email: "guest@evosport.com" },
            update: {},
            create: {
              email: "guest@evosport.com",
              name: shippingAddress.fullName || "Guest Customer",
              role: "CUSTOMER",
            },
          });
          finalUserId = guestUser.id;
        }

        // Create Address
        const address = await tx.address.create({
          data: {
            userId: finalUserId,
            fullName: shippingAddress.fullName,
            phone: shippingAddress.phone,
            line1: shippingAddress.line1,
            line2: shippingAddress.line2 || null,
            city: shippingAddress.city,
            state: shippingAddress.state,
            zip: shippingAddress.zip,
            country: shippingAddress.country,
          },
        });

        // Create Order (initial PENDING status with linked couponId)
        const order = await tx.order.create({
          data: {
            userId: finalUserId,
            status: "PENDING",
            subtotal,
            shipping: effectiveShipping,
            tax,
            total: finalTotal,
            shippingAddressId: address.id,
            couponId: couponRecord?.id || null,
          },
        });

        // Create OrderItems & decrement stock
        for (const item of itemsToPurchase) {
          await tx.orderItem.create({
            data: {
              orderId: order.id,
              variantId: item.variantId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
            },
          });

          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }

        // Increment coupon usage count if coupon applied
        if (couponRecord?.id) {
          await tx.coupon.update({
            where: { id: couponRecord.id },
            data: {
              usageCount: {
                increment: 1,
              },
            },
          });
        }

        // Create Payment record with instant success simulation
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "MOCK" as any,
            status: "SUCCEEDED",
            amount: finalTotal,
            transactionRef: `MOCK_TX_${Date.now()}`,
          },
        });

        // Update Order status to PAID
        const paidOrder = await tx.order.update({
          where: { id: order.id },
          data: { status: "PAID" },
          include: {
            items: {
              include: {
                variant: {
                  include: {
                    product: true,
                  },
                },
              },
            },
            shippingAddress: true,
            payments: true,
            coupon: true,
          },
        });

        // Clear the cart
        await tx.cartItem.deleteMany({
          where: cartWhere,
        });

        // Trigger real notification for user
        await tx.notification.create({
          data: {
            userId: finalUserId,
            type: "ORDER_UPDATE",
            message: `Order #${order.id.slice(-8).toUpperCase()} confirmed`,
          },
        });

        return paidOrder;
      },
      {
        timeout: 20000,
        maxWait: 10000,
      }
    );

    const responseOrder = {
      id: completedOrder.id,
      userId: completedOrder.userId,
      status: completedOrder.status,
      subtotal: Number(completedOrder.subtotal),
      shipping: Number(completedOrder.shipping),
      tax: Number(completedOrder.tax),
      total: Number(completedOrder.total),
      couponCode: completedOrder.coupon?.code || null,
      createdAt: completedOrder.createdAt,
      shippingAddress: completedOrder.shippingAddress,
      payments: completedOrder.payments.map((p) => ({
        id: p.id,
        provider: p.provider,
        status: p.status,
        amount: Number(p.amount),
        transactionRef: p.transactionRef,
      })),
      items: completedOrder.items.map((item) => ({
        id: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
        priceAtPurchase: Number(item.priceAtPurchase),
        productName: item.variant.product.name,
        color: item.variant.color,
        size: item.variant.size,
        sku: item.variant.sku,
      })),
    };

    return NextResponse.json({ order: responseOrder }, { status: 200 });
  } catch (error) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
