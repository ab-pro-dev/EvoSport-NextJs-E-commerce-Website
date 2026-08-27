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
      include: { category: true },
    });

    if (!currentProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    const mainCategoryId = currentProduct.category.parentId || currentProduct.categoryId;

    let relatedProducts = await prisma.product.findMany({
      where: {
        id: { not: currentProduct.id },
        status: "ACTIVE",
        categoryId: currentProduct.categoryId,
        gender: currentProduct.gender,
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

    if (relatedProducts.length < 4 && currentProduct.gender !== "UNISEX") {
      const existingIds = [currentProduct.id, ...relatedProducts.map((p) => p.id)];
      const stepB = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          status: "ACTIVE",
          categoryId: currentProduct.categoryId,
          gender: "UNISEX",
        },
        take: 4 - relatedProducts.length,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      });
      relatedProducts = [...relatedProducts, ...stepB];
    }

    if (relatedProducts.length < 4) {
      const existingIds = [currentProduct.id, ...relatedProducts.map((p) => p.id)];
      const stepC = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          status: "ACTIVE",
          gender: currentProduct.gender,
          category: {
            OR: [
              { id: mainCategoryId },
              { parentId: mainCategoryId },
            ],
          },
        },
        take: 4 - relatedProducts.length,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      });
      relatedProducts = [...relatedProducts, ...stepC];
    }

    if (relatedProducts.length < 4) {
      const existingIds = [currentProduct.id, ...relatedProducts.map((p) => p.id)];
      const stepD = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          status: "ACTIVE",
          category: {
            OR: [
              { id: mainCategoryId },
              { parentId: mainCategoryId },
            ],
          },
        },
        take: 4 - relatedProducts.length,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { position: "asc" } },
          variants: true,
        },
        orderBy: { createdAt: "desc" },
      });
      relatedProducts = [...relatedProducts, ...stepD];
    }

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
