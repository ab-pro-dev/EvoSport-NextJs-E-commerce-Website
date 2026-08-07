import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const rawItems = await prisma.wishlistItem.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            images: { orderBy: { position: "asc" } },
            variants: true,
          },
        },
      },
    });

    const items = rawItems.map((item) => ({
      id: item.id,
      userId: item.userId,
      productId: item.productId,
      createdAt: item.createdAt,
      product: {
        ...item.product,
        basePrice: Number(item.product.basePrice),
        compareAtPrice: item.product.compareAtPrice ? Number(item.product.compareAtPrice) : null,
        variants: item.product.variants.map((v) => ({
          ...v,
          price: v.price ? Number(v.price) : null,
        })),
      },
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("GET /api/wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check unique constraint gracefully
    const existing = await prisma.wishlistItem.findUnique({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId,
        },
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            images: { orderBy: { position: "asc" } },
            variants: true,
          },
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Product is already in your wishlist",
          item: {
            ...existing,
            product: {
              ...existing.product,
              basePrice: Number(existing.product.basePrice),
              compareAtPrice: existing.product.compareAtPrice ? Number(existing.product.compareAtPrice) : null,
            },
          },
        },
        { status: 200 }
      );
    }

    const newItem = await prisma.wishlistItem.create({
      data: {
        userId: session.user.id,
        productId,
      },
      include: {
        product: {
          include: {
            brand: true,
            category: true,
            images: { orderBy: { position: "asc" } },
            variants: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        item: {
          ...newItem,
          product: {
            ...newItem.product,
            basePrice: Number(newItem.product.basePrice),
            compareAtPrice: newItem.product.compareAtPrice ? Number(newItem.product.compareAtPrice) : null,
          },
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    let productId = searchParams.get("productId") || searchParams.get("id");

    if (!productId) {
      try {
        const body = await req.json();
        productId = body.productId || body.id;
      } catch {
        // Body reading optional
      }
    }

    if (!productId) {
      return NextResponse.json({ error: "productId parameter is required" }, { status: 400 });
    }

    const wishlistItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: session.user.id,
        OR: [{ productId }, { id: productId }],
      },
    });

    if (!wishlistItem) {
      return NextResponse.json({ error: "Wishlist item not found" }, { status: 404 });
    }

    await prisma.wishlistItem.delete({
      where: { id: wishlistItem.id },
    });

    return NextResponse.json({ success: true, message: "Item removed from wishlist" });
  } catch (error) {
    console.error("DELETE /api/wishlist error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
