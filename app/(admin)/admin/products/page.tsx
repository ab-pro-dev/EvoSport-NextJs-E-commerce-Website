import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductsListView } from "@/components/admin/products-list-view";

export const metadata: Metadata = {
  title: "Products Management | EvoSport Admin",
  description: "Manage catalog products, variants, and Cloudinary media assets.",
};

export default async function AdminProductsPage() {
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

  const [productsRaw, brands, categories] = await Promise.all([
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        brand: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
    }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  const formattedProducts = productsRaw.map((p) => {
    const totalStock = p.variants.reduce((sum, v) => sum + v.stock, 0);
    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      basePrice: Number(p.basePrice),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      status: p.status,
      brand: p.brand,
      category: p.category,
      image: p.images[0]?.url || null,
      imagesCount: p.images.length,
      variantsCount: p.variants.length,
      totalStock,
      createdAt: p.createdAt.toISOString(),
    };
  });

  return (
    <ProductsListView
      initialProducts={formattedProducts}
      brands={brands}
      categories={categories}
    />
  );
}
