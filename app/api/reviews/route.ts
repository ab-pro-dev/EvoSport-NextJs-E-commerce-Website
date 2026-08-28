import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/reviews — Fetch all reviews submitted by the current authenticated user
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const reviews = await prisma.review.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            basePrice: true,
            images: {
              take: 1,
              orderBy: { position: "asc" },
            },
          },
        },
      },
    });

    const serializedReviews = reviews.map((r) => ({
      ...r,
      product: {
        ...r.product,
        basePrice: Number(r.product.basePrice),
      },
    }));

    return NextResponse.json({ reviews: serializedReviews }, { status: 200 });
  } catch (error) {
    console.error("GET /api/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/reviews — Submit a new product review
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId, rating, comment } = body || {};

    if (!productId || typeof productId !== "string") {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Validate rating is integer between 1 and 5
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    // Prevent duplicate reviews from the same user on the same product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: session.user.id,
        productId,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product." },
        { status: 400 }
      );
    }

    // Check if verified purchase: user has a PAID order containing this product
    const paidOrderItem = await prisma.orderItem.findFirst({
      where: {
        order: {
          userId: session.user.id,
          status: "PAID",
        },
        variant: {
          productId,
        },
      },
    });

    const verifiedPurchase = Boolean(paidOrderItem);

    // Create review with default PENDING status (moderation queue)
    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        productId,
        rating,
        comment: comment || null,
        verifiedPurchase,
        status: "PENDING",
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error) {
    console.error("POST /api/reviews error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
