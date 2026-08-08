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

// PATCH /api/admin/coupons/[id] — Update coupon
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
    const { code, type, value, usageLimit, expiresAt, active } = body;

    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (value !== undefined) updateData.value = Number(value);
    if (usageLimit !== undefined) updateData.usageLimit = usageLimit ? parseInt(usageLimit, 10) : null;
    if (expiresAt !== undefined) updateData.expiresAt = expiresAt ? new Date(expiresAt) : null;
    if (active !== undefined) updateData.active = Boolean(active);

    if (code && code.trim().toUpperCase() !== existing.code) {
      const normalizedCode = code.trim().toUpperCase();
      const codeCheck = await prisma.coupon.findUnique({ where: { code: normalizedCode } });
      if (codeCheck) {
        return NextResponse.json({ error: "Code already in use by another coupon" }, { status: 400 });
      }
      updateData.code = normalizedCode;
    }

    const updatedCoupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      coupon: {
        ...updatedCoupon,
        value: Number(updatedCoupon.value),
        expiresAt: updatedCoupon.expiresAt ? updatedCoupon.expiresAt.toISOString() : null,
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/coupons/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/coupons/[id] — Delete coupon
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const existing = await prisma.coupon.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Coupon deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/coupons/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
