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

// PATCH /api/admin/homepage-banners/[id] — Update homepage banner
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
    const existing = await prisma.homepageBanner.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Homepage banner not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      headline,
      subtext,
      badgeText,
      ctaText,
      ctaLink,
      backgroundImageUrl,
      order,
      active,
      startsAt,
      endsAt,
    } = body;

    const dataToUpdate: any = {};

    if (headline !== undefined) dataToUpdate.headline = String(headline).trim();
    if (subtext !== undefined) dataToUpdate.subtext = String(subtext).trim();
    if (badgeText !== undefined) dataToUpdate.badgeText = badgeText ? String(badgeText).trim() : null;
    if (ctaText !== undefined) dataToUpdate.ctaText = String(ctaText).trim();
    if (ctaLink !== undefined) dataToUpdate.ctaLink = String(ctaLink).trim();
    if (backgroundImageUrl !== undefined) dataToUpdate.backgroundImageUrl = backgroundImageUrl ? String(backgroundImageUrl).trim() : null;
    if (order !== undefined) dataToUpdate.order = typeof order === "number" ? order : parseInt(order, 10) || 0;
    if (active !== undefined) dataToUpdate.active = Boolean(active);
    if (startsAt !== undefined) dataToUpdate.startsAt = startsAt ? new Date(startsAt) : null;
    if (endsAt !== undefined) dataToUpdate.endsAt = endsAt ? new Date(endsAt) : null;

    const updatedBanner = await prisma.homepageBanner.update({
      where: { id },
      data: dataToUpdate,
    });

    return NextResponse.json({ banner: updatedBanner });
  } catch (error) {
    console.error("PATCH /api/admin/homepage-banners/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/homepage-banners/[id] — Delete homepage banner
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id } = await params;
    const existing = await prisma.homepageBanner.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Homepage banner not found" }, { status: 404 });
    }

    await prisma.homepageBanner.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Homepage banner deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/admin/homepage-banners/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
