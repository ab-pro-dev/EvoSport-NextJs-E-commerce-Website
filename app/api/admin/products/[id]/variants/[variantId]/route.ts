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

// PATCH /api/admin/products/[id]/variants/[variantId] — Update variant
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { variantId } = await params;
    const body = await req.json();
    const { sku, color, size, stock, price } = body;

    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (color !== undefined) updateData.color = color.trim();
    if (size !== undefined) updateData.size = size.trim();
    if (stock !== undefined) {
      updateData.stock =
        stock === null || stock === "" || isNaN(parseInt(stock.toString(), 10))
          ? null
          : parseInt(stock.toString(), 10);
    }
    if (price !== undefined) updateData.price = Number(price);

    if (sku && sku.trim() !== existingVariant.sku) {
      const skuCheck = await prisma.productVariant.findUnique({
        where: { sku: sku.trim() },
      });
      if (skuCheck) {
        return NextResponse.json({ error: "SKU already in use" }, { status: 400 });
      }
      updateData.sku = sku.trim();
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
    });

    return NextResponse.json({ variant: updatedVariant });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id]/variants/[variantId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/products/[id]/variants/[variantId] — Delete variant
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { variantId } = await params;
    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    await prisma.productVariant.delete({ where: { id: variantId } });

    return NextResponse.json({ success: true, message: "Variant deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id]/variants/[variantId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
