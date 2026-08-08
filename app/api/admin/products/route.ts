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

// GET /api/admin/products — List all products (ACTIVE, DRAFT, ARCHIVED)
export async function GET(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          brand: { select: { id: true, name: true } },
          category: { select: { id: true, name: true } },
          images: { orderBy: { position: "asc" } },
          variants: true,
        },
      }),
      prisma.product.count(),
    ]);

    const formattedProducts = products.map((p) => {
      const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        status: p.status,
        brand: p.brand,
        category: p.category,
        image: p.images[0]?.url || null,
        imagesCount: p.images.length,
        variantsCount: p.variants.length,
        totalStock,
        createdAt: p.createdAt,
      };
    });

    return NextResponse.json({
      products: formattedProducts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/products — Create new product
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { name, slug, description, brandId, categoryId, basePrice, compareAtPrice, status } = body || {};

    if (!name || !slug || !brandId || !categoryId || basePrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, brandId, categoryId, basePrice" },
        { status: 400 }
      );
    }

    // Check slug uniqueness
    const existingSlug = await prisma.product.findUnique({
      where: { slug: slug.trim().toLowerCase() },
    });

    if (existingSlug) {
      return NextResponse.json(
        { error: "Product slug already exists. Please choose a unique slug." },
        { status: 400 }
      );
    }

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description ? description.trim() : "",
        brandId,
        categoryId,
        basePrice: Number(basePrice),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        status: status || "ACTIVE",
      },
      include: {
        brand: true,
        category: true,
        images: true,
        variants: true,
      },
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
