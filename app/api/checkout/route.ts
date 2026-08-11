import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(req: Request) {
  try {
    const clientIp = getClientIp(req);
    const limiter = rateLimit(`checkout:${clientIp}`, 15, 60000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many checkout attempts. Please try again later." },
        { status: 429 }
      );
    }

    const session = await auth();
    const authUserId = session?.user?.id;

    if (!authUserId) {
      return NextResponse.json(
        { error: "Please log in with your account to complete checkout and place an order." },
        { status: 401 }
      );
    }

    // Merge any lingering guest items from sessionId into authUserId
    try {
      const cookieStore = await cookies();
      const sessionId = cookieStore.get("cart_session")?.value;
      if (sessionId) {
        const guestItems = await prisma.cartItem.findMany({ where: { sessionId } });
        for (const guestItem of guestItems) {
          const userExisting = await prisma.cartItem.findFirst({
            where: { userId: authUserId, variantId: guestItem.variantId },
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
              data: { userId: authUserId, sessionId: null },
            });
          }
        }
      }
    } catch (e) {
      console.error("Checkout cart merge error:", e);
    }

    // 1. Read real cart from DB for this authenticated user
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: authUserId },
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

    // 4. Calculate subtotal server-side
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

    // 5. Fetch dynamic store settings (Tax Rate, Shipping Threshold)
    const [taxSetting, freeShippingSetting, flatRateShippingSetting] = await Promise.all([
      prisma.setting.findUnique({ where: { key: "taxRate" } }),
      prisma.setting.findUnique({ where: { key: "freeShippingThreshold" } }),
      prisma.setting.findUnique({ where: { key: "flatRateShipping" } }),
    ]);

    const activeTaxRate = taxSetting?.value ? parseFloat(taxSetting.value) : 0.08;
    const activeFreeShippingThreshold = freeShippingSetting?.value ? parseFloat(freeShippingSetting.value) : 100;
    const activeFlatRateShipping = flatRateShippingSetting?.value ? parseFloat(flatRateShippingSetting.value) : 9.99;

    // Coupon validation and discount computation
    let couponRecord: any = null;
    let discountAmount = 0;
    let effectiveShipping = subtotal >= activeFreeShippingThreshold ? 0 : activeFlatRateShipping;

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
      }
    }

    // Compute discounted subtotal first
    const discountedSubtotal = Math.max(
      0,
      Number((subtotal - (couponRecord?.type === "FREE_SHIPPING" ? 0 : discountAmount)).toFixed(2))
    );

    // Calculate tax on the DISCOUNTED subtotal using dynamic store tax rate
    const tax = Number((discountedSubtotal * activeTaxRate).toFixed(2));

    // Calculate final total: discounted subtotal + shipping + tax
    const finalTotal = Number((discountedSubtotal + effectiveShipping + tax).toFixed(2));

    // 6. Execute atomic DB transaction
    const completedOrder = await prisma.$transaction(
      async (tx) => {
        // Create Address linked to authenticated user
        const address = await tx.address.create({
          data: {
            userId: authUserId,
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

        // Create Order with nested OrderItems and Payment in ONE atomic query
        const order = await tx.order.create({
          data: {
            userId: authUserId,
            status: "PAID",
            subtotal,
            shipping: effectiveShipping,
            tax,
            total: finalTotal,
            shippingAddressId: address.id,
            couponId: couponRecord?.id || null,
            items: {
              create: itemsToPurchase.map((item) => ({
                variantId: item.variantId,
                quantity: item.quantity,
                priceAtPurchase: item.priceAtPurchase,
              })),
            },
            payments: {
              create: {
                provider: "MOCK",
                status: "SUCCEEDED",
                amount: finalTotal,
                transactionRef: `MOCK_TX_${Date.now()}`,
              },
            },
          },
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

        // Decrement stock in parallel
        await Promise.all(
          itemsToPurchase.map((item) =>
            tx.productVariant.update({
              where: { id: item.variantId },
              data: {
                stock: {
                  decrement: item.quantity,
                },
              },
            })
          )
        );

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

        // Clear the user's cart
        await tx.cartItem.deleteMany({
          where: { userId: authUserId },
        });

        // Trigger notification for user
        await tx.notification.create({
          data: {
            userId: authUserId,
            type: "ORDER_UPDATE",
            message: `Order #${order.id.slice(-8).toUpperCase()} confirmed`,
          },
        });

        return order;
      },
      {
        timeout: 45000,
        maxWait: 20000,
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
  } catch (error: any) {
    console.error("POST /api/checkout error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process checkout. Please try again." },
      { status: 500 }
    );
  }
}
