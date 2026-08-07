import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const currentProduct = await prisma.product.findUnique({
      where: { slug },
      select: { id: true, categoryId: true },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: currentProduct.categoryId,
        id: { not: currentProduct.id },
        status: "ACTIVE",
      },
      take: 4,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const productsWithReviews = await Promise.all(
      relatedProducts.map(async (p) => {
        const reviewStats = await prisma.review.aggregate({
          where: { productId: p.id, status: "APPROVED" },
          _avg: { rating: true },
          _count: { rating: true },
        });

        return {
          ...p,
          avgRating: reviewStats._avg.rating ? Number(reviewStats._avg.rating.toFixed(1)) : 0,
          reviewCount: reviewStats._count.rating || 0,
        };
      })
    );

    return NextResponse.json({
      products: productsWithReviews,
    });
  } catch (error) {
    console.error("Error fetching related products:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
