import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CategoriesManagementView } from "@/components/admin/categories-management-view";

export const metadata: Metadata = {
  title: "Categories Management | EvoSport Admin",
  description: "Manage product categories and subcategory trees.",
};

export default async function AdminCategoriesPage() {
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

  const categoriesRaw = await prisma.category.findMany({
    orderBy: { name: "asc" },
    include: {
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  const formattedCategories = categoriesRaw.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    parentId: c.parentId,
    parent: c.parent,
    _count: c._count,
  }));

  return <CategoriesManagementView initialCategories={formattedCategories} />;
}
