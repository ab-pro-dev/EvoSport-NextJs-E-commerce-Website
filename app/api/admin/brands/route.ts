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

// GET /api/admin/brands — List brands with product counts
export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ brands });
  } catch (error) {
    console.error("GET /api/admin/brands error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/brands — Create new brand
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const { name, slug, logoUrl } = body || {};

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Both name and slug are required." },
        { status: 400 }
      );
    }

    const normalizedSlug = slug.trim().toLowerCase();

    const existing = await prisma.brand.findUnique({
      where: { slug: normalizedSlug },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Brand slug already exists. Please choose a unique slug." },
        { status: 400 }
      );
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        logoUrl: logoUrl ? logoUrl.trim() : null,
      },
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/brands error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
