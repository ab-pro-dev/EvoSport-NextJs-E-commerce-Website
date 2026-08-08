import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/blog — List published blog posts publicly
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "10", 10)));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.blog.findMany({
        where: { status: "PUBLISHED" },
        skip,
        take: limit,
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
        include: {
          author: { select: { name: true, image: true } },
        },
      }),
      prisma.blog.count({ where: { status: "PUBLISHED" } }),
    ]);

    return NextResponse.json({
      posts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("GET /api/blog error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
