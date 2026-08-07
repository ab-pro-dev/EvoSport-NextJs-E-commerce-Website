import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));
    const skip = (page - 1) * limit;

    const product = await prisma.product.findUnique({
      where: { slug },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const where = {
      productId: product.id,
      status: "APPROVED" as const,
    };

    const [rawReviews, totalCount, aggregate] = await Promise.all([
      prisma.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      }),
      prisma.review.count({ where }),
      prisma.review.aggregate({
        where,
        _avg: { rating: true },
      }),
    ]);

    const reviews = rawReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      verifiedPurchase: r.verifiedPurchase,
      createdAt: r.createdAt,
      userName: r.user.name || "Anonymous Athlete",
      userImage: r.user.image || null,
    }));

    const avgRating = aggregate._avg.rating ? Number(aggregate._avg.rating.toFixed(1)) : 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      reviews,
      totalCount,
      page,
      totalPages,
      avgRating,
    });
  } catch (error) {
    console.error("GET /api/products/[slug]/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
