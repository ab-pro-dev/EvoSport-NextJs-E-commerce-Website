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

// POST /api/admin/products/bulk-delete — Bulk delete products
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json().catch(() => ({}));
    const productIds: string[] = body.productIds;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: "No product IDs provided." }, { status: 400 });
    }

    const deleted: { id: string; name: string }[] = [];
    const failed: { id: string; name: string; reason: string }[] = [];

    for (const id of productIds) {
      const product = await prisma.product.findUnique({
        where: { id },
        select: { id: true, name: true },
      });

      if (!product) {
        failed.push({ id, name: "Unknown Product", reason: "Product not found" });
        continue;
      }

      // Check if product's variants are referenced in order items
      const hasOrderItems = await prisma.orderItem.findFirst({
        where: {
          variant: {
            productId: id,
          },
        },
      });

      if (hasOrderItems) {
        failed.push({
          id,
          name: product.name,
          reason: "Product is referenced in customer orders",
        });
        continue;
      }

      try {
        await prisma.product.delete({
          where: { id },
        });
        deleted.push({ id, name: product.name });
      } catch (err: any) {
        console.error(`Failed to delete product ${id}:`, err);
        failed.push({
          id,
          name: product.name,
          reason: err?.message || "Database deletion error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      deleted,
      failed,
      message: `${deleted.length} product(s) deleted successfully.${failed.length > 0 ? ` ${failed.length} failed.` : ""}`,
    });
  } catch (error) {
    console.error("POST /api/admin/products/bulk-delete error:", error);
    return NextResponse.json({ error: "Bulk delete operation failed." }, { status: 500 });
  }
}
