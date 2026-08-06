import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const reviewStats = await prisma.review.aggregate({
      where: {
        productId: product.id,
        status: "APPROVED",
      },
      _avg: { rating: true },
      _count: { rating: true },
    });

    const avgRating = reviewStats._avg.rating
      ? Number(reviewStats._avg.rating.toFixed(1))
      : 0;
    const reviewCount = reviewStats._count.rating || 0;

    return NextResponse.json({
      ...product,
      avgRating,
      reviewCount,
    });
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
