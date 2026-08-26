import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { HomepageBannersView } from "@/components/admin/homepage-banners-view";

export const metadata: Metadata = {
  title: "Homepage Banners | EvoSport Admin",
  description: "Manage homepage hero promotional banners, multi-banner sequence, and schedule dates.",
};

export const dynamic = "force-dynamic";

export default async function AdminHomepageBannersPage() {
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

  const rawBanners = await prisma.homepageBanner.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  const formattedBanners = rawBanners.map((b) => ({
    id: b.id,
    headline: b.headline,
    subtext: b.subtext,
    badgeText: b.badgeText,
    ctaText: b.ctaText,
    ctaLink: b.ctaLink,
    backgroundImageUrl: b.backgroundImageUrl,
    backgroundBlur: b.backgroundBlur ?? 0,
    lightModeOverlayOpacity: b.lightModeOverlayOpacity ?? 80,
    darkModeOverlayOpacity: b.darkModeOverlayOpacity ?? 85,
    order: b.order,
    active: b.active,
    startsAt: b.startsAt ? b.startsAt.toISOString() : null,
    endsAt: b.endsAt ? b.endsAt.toISOString() : null,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  }));

  return <HomepageBannersView initialBanners={formattedBanners} />;
}
