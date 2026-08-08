import { Metadata } from "next";
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductDetailEditView } from "@/components/admin/product-detail-edit-view";

export const metadata: Metadata = {
  title: "Edit Product | EvoSport Admin",
  description: "Edit product details, manage variants, and upload Cloudinary media.",
};

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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

  const { id } = await params;

  const [productRaw, brands, categories] = await Promise.all([
    prisma.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
    }),
    prisma.brand.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ select: { id: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  if (!productRaw) {
    notFound();
  }

  const product = {
    id: productRaw.id,
    name: productRaw.name,
    slug: productRaw.slug,
    description: productRaw.description,
    basePrice: Number(productRaw.basePrice),
    compareAtPrice: productRaw.compareAtPrice ? Number(productRaw.compareAtPrice) : null,
    status: productRaw.status,
    brandId: productRaw.brandId,
    categoryId: productRaw.categoryId,
    images: productRaw.images.map((img) => ({
      id: img.id,
      url: img.url,
      altText: img.altText,
      position: img.position,
    })),
    variants: productRaw.variants.map((v) => ({
      id: v.id,
      sku: v.sku,
      color: v.color,
      size: v.size,
      stock: v.stock,
      price: Number(v.price),
    })),
  };

  return (
    <ProductDetailEditView
      product={product}
      brands={brands}
      categories={categories}
    />
  );
}
