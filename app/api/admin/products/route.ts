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
          category: { select: { id: true, name: true, slug: true, parentId: true } },
          images: { orderBy: { position: "asc" } },
          variants: true,
        },
      }),
      prisma.product.count(),
    ]);

    const formattedProducts = products.map((p) => {
      const isUnlimited = p.variants.some((v) => v.stock === null);
      const totalStock = p.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        gender: p.gender,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        status: p.status,
        brand: p.brand,
        category: p.category,
        image: p.images[0]?.url || null,
        imagesCount: p.images.length,
        variantsCount: p.variants.length,
        totalStock: isUnlimited ? null : totalStock,
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

// POST /api/admin/products — Create new product with image attachment and variant support
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const {
      name,
      slug,
      description,
      brandId,
      categoryId,
      gender,
      basePrice,
      compareAtPrice,
      status,
      stock,
      imageUrl,
      images,
      variants,
    } = body || {};

    // name, slug, categoryId, basePrice are required. Brand and Description are OPTIONAL.
    if (!name || !slug || !categoryId || basePrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, categoryId, basePrice" },
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

    // Validate categoryId
    const categoryExists = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Selected category does not exist." },
        { status: 400 }
      );
    }

    // Validate brandId if provided
    if (brandId && brandId.trim()) {
      const brandExists = await prisma.brand.findUnique({
        where: { id: brandId.trim() },
      });
      if (!brandExists) {
        return NextResponse.json(
          { error: "Selected brand does not exist." },
          { status: 400 }
        );
      }
    }

    // Validate gender enum
    const validGenders = ["MEN", "WOMEN", "KIDS", "UNISEX"];
    const parsedGender =
      gender && validGenders.includes(gender.toString().toUpperCase())
        ? (gender.toString().toUpperCase() as "MEN" | "WOMEN" | "KIDS" | "UNISEX")
        : "UNISEX";

    // Aggregate images (support any number of images, no limit)
    const imageList: string[] = [];
    if (imageUrl && typeof imageUrl === "string" && imageUrl.trim()) {
      imageList.push(imageUrl.trim());
    }
    if (Array.isArray(images)) {
      images.forEach((img) => {
        if (typeof img === "string" && img.trim() && !imageList.includes(img.trim())) {
          imageList.push(img.trim());
        } else if (img && typeof img === "object" && typeof img.url === "string" && img.url.trim() && !imageList.includes(img.url.trim())) {
          imageList.push(img.url.trim());
        }
      });
    }

    // Parse stock (null means unlimited)
    const parsedStock =
      stock !== undefined && stock !== null && stock !== "" && !isNaN(parseInt(stock.toString(), 10))
        ? parseInt(stock.toString(), 10)
        : null;

    const variantsCreate = Array.isArray(variants) && variants.length > 0
      ? {
          create: variants.map((v, i) => ({
            sku: v.sku ? v.sku.trim() : `${slug.trim().toLowerCase()}-${v.color || 'std'}-${v.size || 'os'}-${i}`,
            color: v.color ? v.color.trim() : "Standard",
            size: v.size ? v.size.trim() : "One Size",
            price: v.price ? Number(v.price) : Number(basePrice),
            stock: v.stock !== undefined && v.stock !== null && v.stock !== "" ? parseInt(v.stock.toString(), 10) : null,
          })),
        }
      : {
          create: [
            {
              sku: `${slug.trim().toLowerCase()}-std`,
              color: "Standard",
              size: "One Size",
              price: Number(basePrice),
              stock: parsedStock,
            },
          ],
        };

    const newProduct = await prisma.product.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description && description.trim() ? description.trim() : null,
        brandId: brandId && brandId.trim() ? brandId.trim() : null,
        categoryId,
        gender: parsedGender,
        basePrice: Number(basePrice),
        compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
        status: status || "ACTIVE",
        images:
          imageList.length > 0
            ? {
                create: imageList.map((url, index) => ({
                  url,
                  altText: name.trim(),
                  position: index,
                })),
              }
            : undefined,
        variants: variantsCreate,
      },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
    });

    return NextResponse.json({ product: newProduct }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
