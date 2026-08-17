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

// PATCH /api/admin/inventory/[variantId] — Adjust variant stock
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ variantId: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { variantId } = await params;
    const body = await req.json();
    const { stock, adjustment } = body || {};

    const existingVariant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { select: { name: true } } },
    });

    if (!existingVariant) {
      return NextResponse.json({ error: "Product variant not found" }, { status: 404 });
    }

    let newStock = existingVariant.stock;

    if (stock === null || stock === "") {
      newStock = null;
    } else if (stock !== undefined) {
      const stockInt = parseInt(stock, 10);
      if (isNaN(stockInt) || stockInt < 0) {
        return NextResponse.json({ error: "Invalid stock value. Must be a non-negative integer or null for unlimited." }, { status: 400 });
      }
      newStock = stockInt;
    } else if (adjustment !== undefined && adjustment !== null) {
      const adjInt = parseInt(adjustment, 10);
      if (isNaN(adjInt)) {
        return NextResponse.json({ error: "Invalid adjustment value." }, { status: 400 });
      }
      newStock = Math.max(0, (existingVariant.stock ?? 0) + adjInt);
    } else {
      return NextResponse.json({ error: "Must provide stock or adjustment field." }, { status: 400 });
    }

    const updatedVariant = await prisma.productVariant.update({
      where: { id: variantId },
      data: {
        stock: newStock,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return NextResponse.json({
      success: true,
      variant: {
        id: updatedVariant.id,
        sku: updatedVariant.sku,
        color: updatedVariant.color,
        size: updatedVariant.size,
        stock: updatedVariant.stock,
        previousStock: existingVariant.stock,
        productName: updatedVariant.product.name,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/admin/inventory/[variantId] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
