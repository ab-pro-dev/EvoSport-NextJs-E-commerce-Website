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

// PATCH /api/admin/categories/[id] — Update category
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
    const { name, slug, parentId } = body;

    const existing = await prisma.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (parentId !== undefined) {
      if (parentId === id) {
        return NextResponse.json({ error: "A category cannot be its own parent." }, { status: 400 });
      }
      updateData.parentId = parentId || null;
    }

    if (slug && slug.trim().toLowerCase() !== existing.slug) {
      const normalizedSlug = slug.trim().toLowerCase();
      const slugCheck = await prisma.category.findUnique({ where: { slug: normalizedSlug } });
      if (slugCheck) {
        return NextResponse.json({ error: "Slug already in use by another category" }, { status: 400 });
      }
      updateData.slug = normalizedSlug;
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    });

    return NextResponse.json({ category: updatedCategory });
  } catch (error) {
    console.error("PATCH /api/admin/categories/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/categories/[id] — Delete category (safeguarded against deleting attached data)
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
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true, children: true } },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Data integrity protection check
    if (category._count.products > 0 || category._count.children > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category "${category.name}". It has ${category._count.products} product(s) and ${category._count.children} subcategory(ies) attached. Please reassign or delete attached items first.`,
        },
        { status: 400 }
      );
    }

    await prisma.category.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/categories/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
