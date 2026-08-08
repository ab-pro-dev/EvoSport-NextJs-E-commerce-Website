import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CouponsManagementView } from "@/components/admin/coupons-management-view";

export const metadata: Metadata = {
  title: "Coupons & Promotions | EvoSport Admin",
  description: "Manage promotional discount codes and usage limits.",
};

export default async function AdminCouponsPage() {
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

  const couponsRaw = await prisma.coupon.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { orders: true } },
    },
  });

  const formattedCoupons = couponsRaw.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: Number(c.value),
    usageLimit: c.usageLimit,
    usageCount: c.usageCount,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
    active: c.active,
    ordersCount: c._count.orders,
  }));

  return <CouponsManagementView initialCoupons={formattedCoupons} />;
}
