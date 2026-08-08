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

// GET /api/admin/media — List all media images referenced across products and blog posts
export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const [productImages, blogPosts] = await Promise.all([
      prisma.productImage.findMany({
        orderBy: { id: "desc" },
        include: {
          product: { select: { id: true, name: true, slug: true } },
        },
      }),
      prisma.blog.findMany({
        where: { coverImageUrl: { not: null } },
        select: { id: true, title: true, slug: true, coverImageUrl: true, createdAt: true },
      }),
    ]);

    const mediaList = [
      ...productImages.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText || img.product.name,
        source: "PRODUCT",
        referenceName: `Product: ${img.product.name}`,
        referenceLink: `/admin/products`,
      })),
      ...blogPosts.map((post) => ({
        id: post.id,
        url: post.coverImageUrl!,
        altText: post.title,
        source: "BLOG",
        referenceName: `Blog: ${post.title}`,
        referenceLink: `/admin/blog`,
      })),
    ];

    return NextResponse.json({ media: mediaList, total: mediaList.length });
  } catch (error) {
    console.error("GET /api/admin/media error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
