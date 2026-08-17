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

// POST /api/admin/products/[id]/variants — Add variant to product
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id: productId } = await params;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const { sku, color, size, stock, price } = body || {};

    if (!sku || !color || !size) {
      return NextResponse.json(
        { error: "Missing required variant fields: sku, color, size" },
        { status: 400 }
      );
    }

    // Check SKU uniqueness
    const existingSku = await prisma.productVariant.findUnique({
      where: { sku: sku.trim() },
    });

    if (existingSku) {
      return NextResponse.json(
        { error: "Variant SKU already exists. Please choose a unique SKU." },
        { status: 400 }
      );
    }

    const parsedStock =
      stock !== undefined && stock !== null && stock !== "" && !isNaN(parseInt(stock.toString(), 10))
        ? parseInt(stock.toString(), 10)
        : null;

    const variant = await prisma.productVariant.create({
      data: {
        productId,
        sku: sku.trim(),
        color: color.trim(),
        size: size.trim(),
        stock: parsedStock,
        price: price ? Number(price) : Number(product.basePrice),
      },
    });

    return NextResponse.json({ variant }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products/[id]/variants error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
