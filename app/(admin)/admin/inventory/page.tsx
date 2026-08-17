import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { InventoryManagementView } from "@/components/admin/inventory-management-view";

export const metadata: Metadata = {
  title: "Inventory & Stock Control | EvoSport Admin",
  description: "Monitor product variant inventory levels and edit stock quantities.",
};

export default async function AdminInventoryPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/admin-login");
  }

  const [variantsRaw, inStockCount, lowStockCount, outOfStockCount] = await Promise.all([
    prisma.productVariant.findMany({
      orderBy: [{ stock: "asc" }, { sku: "asc" }],
      include: {
        product: { select: { id: true, name: true, slug: true, status: true } },
      },
    }),
    prisma.productVariant.count({ where: { OR: [{ stock: { gt: 10 } }, { stock: null }] } }),
    prisma.productVariant.count({ where: { stock: { lte: 10, gt: 0 } } }),
    prisma.productVariant.count({ where: { stock: 0 } }),
  ]);

  const formattedVariants = variantsRaw.map((v) => ({
    id: v.id,
    sku: v.sku,
    color: v.color,
    size: v.size,
    stock: v.stock,
    price: v.price ? Number(v.price) : null,
    productId: v.productId,
    productName: v.product.name,
    productSlug: v.product.slug,
    productStatus: v.product.status,
    createdAt: v.createdAt.toISOString(),
  }));

  const stats = {
    totalVariants: variantsRaw.length,
    inStockCount,
    lowStockCount,
    outOfStockCount,
  };

  return <InventoryManagementView initialVariants={formattedVariants} initialStats={stats} />;
}
