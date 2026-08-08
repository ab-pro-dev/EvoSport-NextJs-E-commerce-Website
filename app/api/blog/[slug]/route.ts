import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/blog/[slug] — Fetch single published post by slug (returns 404 for draft or non-existent)
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const normalizedSlug = slug.trim().toLowerCase();

    const post = await prisma.blog.findUnique({
      where: { slug: normalizedSlug },
      include: {
        author: { select: { name: true, image: true } },
      },
    });

    if (!post || post.status !== "PUBLISHED") {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error("GET /api/blog/[slug] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
