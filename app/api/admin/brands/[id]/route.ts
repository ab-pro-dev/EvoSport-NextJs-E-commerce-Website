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

// PATCH /api/admin/brands/[id] — Update brand details
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const body = await req.json();
    const { name, slug, logoUrl } = body;

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl ? logoUrl.trim() : null;

    if (slug && slug.trim().toLowerCase() !== existing.slug) {
      const normalizedSlug = slug.trim().toLowerCase();
      const slugCheck = await prisma.brand.findUnique({ where: { slug: normalizedSlug } });
      if (slugCheck) {
        return NextResponse.json({ error: "Slug already in use by another brand" }, { status: 400 });
      }
      updateData.slug = normalizedSlug;
    }

    const updatedBrand = await prisma.brand.update({
      where: { id },
      data: updateData,
      include: {
        _count: { select: { products: true } },
      },
    });

    return NextResponse.json({ brand: updatedBrand });
  } catch (error) {
    console.error("PATCH /api/admin/brands/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/brands/[id] — Delete brand (safeguarded against attached products)
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const brand = await prisma.brand.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    // Data integrity protection check
    if (brand._count.products > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete brand "${brand.name}". It has ${brand._count.products} product(s) attached. Please reassign or delete attached products first.`,
        },
        { status: 400 }
      );
    }

    await prisma.brand.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Brand deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/brands/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
