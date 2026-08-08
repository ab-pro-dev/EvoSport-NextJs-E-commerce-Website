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

// GET /api/admin/inventory — List all product variants with stock levels & low stock filtering
export async function GET(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const lowStockParam = searchParams.get("lowStock");
    const thresholdParam = parseInt(searchParams.get("threshold") || "10", 10);
    const search = searchParams.get("search")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (lowStockParam === "true") {
      where.stock = { lte: thresholdParam };
    }

    if (search) {
      where.OR = [
        { sku: { contains: search, mode: "insensitive" } },
        { color: { contains: search, mode: "insensitive" } },
        { size: { contains: search, mode: "insensitive" } },
        { product: { name: { contains: search, mode: "insensitive" } } },
      ];
    }

    const variants = await prisma.productVariant.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ stock: "asc" }, { sku: "asc" }],
      include: {
        product: { select: { id: true, name: true, slug: true, status: true } },
      },
    });

    const total = await prisma.productVariant.count({ where });

    // Compute status counts sequentially to avoid connection pool exhaustion
    const allStockValues = await prisma.productVariant.findMany({
      select: { stock: true },
    });

    const inStockCount = allStockValues.filter((v) => v.stock > 10).length;
    const lowStockCount = allStockValues.filter((v) => v.stock <= 10 && v.stock > 0).length;
    const outOfStockCount = allStockValues.filter((v) => v.stock === 0).length;

    const formattedVariants = variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color,
      size: v.size,
      stock: v.stock,
      price: v.price ? Number(v.price) : null,
      productId: v.productId,
      productName: v.product.name,
      productSlug: v.product.slug,
      productStatus: v.product.status,
      createdAt: v.createdAt.toISOString(),
    }));

    return NextResponse.json({
      inventory: formattedVariants,
      stats: {
        totalVariants: allStockValues.length,
        inStockCount,
        lowStockCount,
        outOfStockCount,
      },
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/inventory error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
