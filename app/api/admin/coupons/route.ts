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

// GET /api/admin/coupons — List all promotional coupons
export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: { select: { orders: true } },
      },
    });

    const formattedCoupons = coupons.map((c) => ({
      id: c.id,
      code: c.code,
      type: c.type,
      value: Number(c.value),
      usageLimit: c.usageLimit,
      usageCount: c.usageCount,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      active: c.active,
      ordersCount: c._count.orders,
    }));

    return NextResponse.json({ coupons: formattedCoupons });
  } catch (error) {
    console.error("GET /api/admin/coupons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/coupons — Create new coupon
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { code, type, value, usageLimit, expiresAt, active } = body || {};

    if (!code || !type || value === undefined) {
      return NextResponse.json(
        { error: "Required fields missing: code, type, value." },
        { status: 400 }
      );
    }

    if (!["PERCENTAGE", "FIXED", "FREE_SHIPPING"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Must be PERCENTAGE, FIXED, or FREE_SHIPPING." },
        { status: 400 }
      );
    }

    const normalizedCode = code.trim().toUpperCase();

    const existing = await prisma.coupon.findUnique({
      where: { code: normalizedCode },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Coupon code "${normalizedCode}" already exists.` },
        { status: 400 }
      );
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: normalizedCode,
        type: type as any,
        value: Number(value),
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        active: active !== undefined ? Boolean(active) : true,
      },
    });

    return NextResponse.json({
      coupon: {
        ...coupon,
        value: Number(coupon.value),
        expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/coupons error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
