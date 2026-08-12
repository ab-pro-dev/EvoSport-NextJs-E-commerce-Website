import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const gender = searchParams.get("gender");
    const brand = searchParams.get("brand");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");
    const sort = searchParams.get("sort");
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");

    const page = Math.max(1, parseInt(pageParam || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(limitParam || "10", 10)));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: "ACTIVE",
    };

    const categoryConditions: Prisma.ProductWhereInput[] = [];

    if (gender && gender !== "all") {
      categoryConditions.push({
        category: {
          OR: [
            { slug: gender },
            { parent: { slug: gender } },
          ],
        },
      });
    }

    if (category && category !== "all") {
      categoryConditions.push({
        category: {
          OR: [
            { id: category },
            { slug: category },
            { slug: { endsWith: `-${category}` } },
            { parent: { slug: category } },
          ],
        },
      });
    }

    if (categoryConditions.length > 0) {
      where.AND = categoryConditions;
    }

    if (brand) {
      where.brand = {
        OR: [{ id: brand }, { slug: brand }],
      };
    }

    if (minPriceParam || maxPriceParam) {
      where.basePrice = {};
      if (minPriceParam) {
        where.basePrice.gte = parseFloat(minPriceParam);
      }
      if (maxPriceParam) {
        where.basePrice.lte = parseFloat(maxPriceParam);
      }
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput = { createdAt: "desc" };

    if (sort === "price_asc") {
      orderBy = { basePrice: "asc" };
    } else if (sort === "price_desc") {
      orderBy = { basePrice: "desc" };
    } else if (sort === "newest") {
      orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          brand: true,
          category: {
            include: {
              parent: true,
            },
          },
          images: {
            orderBy: { position: "asc" },
          },
          variants: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
