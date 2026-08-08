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

// GET /api/admin/categories — List categories with product counts and hierarchy
export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("GET /api/admin/categories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/categories — Create new category
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { name, slug, parentId } = body || {};

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Both name and slug are required." },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    const existing = await prisma.category.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Category slug already exists. Please choose a unique slug." },
        { status: 400 }
      );
    }

    if (parentId) {
      const parentCheck = await prisma.category.findUnique({ where: { id: parentId } });
      if (!parentCheck) {
        return NextResponse.json({ error: "Parent category not found." }, { status: 400 });
      }
    }

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        parentId: parentId || null,
      },
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/categories error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
