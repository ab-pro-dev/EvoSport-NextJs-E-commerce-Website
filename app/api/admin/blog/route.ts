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

// GET /api/admin/blog — List all blog posts including DRAFT & PUBLISHED
export async function GET(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const posts = await prisma.blog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        author: { select: { id: true, name: true, email: true, image: true } },
      },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("GET /api/admin/blog error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/blog — Create new blog post
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { title, slug, content, excerpt, coverImageUrl, status } = body || {};

    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Required fields missing: title, slug, content." },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();
    const existing = await prisma.blog.findUnique({ where: { slug: normalizedSlug } });
    if (existing) {
      return NextResponse.json(
        { error: `Blog slug "${normalizedSlug}" already exists.` },
        { status: 400 }
      );
    }

    const postStatus = status === "PUBLISHED" ? "PUBLISHED" : "DRAFT";

    const post = await prisma.blog.create({
      data: {
        title,
        slug: normalizedSlug,
        content,
        excerpt: excerpt || null,
        coverImageUrl: coverImageUrl || null,
        status: postStatus as any,
        authorId: authResult.session.user.id,
        publishedAt: postStatus === "PUBLISHED" ? new Date() : null,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/blog error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
