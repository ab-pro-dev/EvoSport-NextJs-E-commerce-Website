import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BrandsManagementView } from "@/components/admin/brands-management-view";

export const metadata: Metadata = {
  title: "Brands Management | EvoSport Admin",
  description: "Manage product manufacturer brands.",
};

export default async function AdminBrandsPage() {
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

  const brandsRaw = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  const formattedBrands = brandsRaw.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl,
    _count: b._count,
  }));

  return <BrandsManagementView initialBrands={formattedBrands} />;
}
