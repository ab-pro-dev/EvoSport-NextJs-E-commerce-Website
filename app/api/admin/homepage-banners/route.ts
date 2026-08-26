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

// GET /api/admin/homepage-banners — List all homepage banners (admin view)
export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const banners = await prisma.homepageBanner.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("GET /api/admin/homepage-banners error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/admin/homepage-banners — Create new homepage banner
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    const {
      headline,
      subtext,
      badgeText,
      ctaText,
      ctaLink,
      backgroundImageUrl,
      backgroundBlur,
      order,
      active,
      startsAt,
      endsAt,
    } = body;

    if (!headline || typeof headline !== "string" || !headline.trim()) {
      return NextResponse.json({ error: "Headline is required" }, { status: 400 });
    }

    if (!subtext || typeof subtext !== "string" || !subtext.trim()) {
      return NextResponse.json({ error: "Subtext is required" }, { status: 400 });
    }

    if (!ctaText || typeof ctaText !== "string" || !ctaText.trim()) {
      return NextResponse.json({ error: "CTA Text is required" }, { status: 400 });
    }

    if (!ctaLink || typeof ctaLink !== "string" || !ctaLink.trim()) {
      return NextResponse.json({ error: "CTA Link is required" }, { status: 400 });
    }

    const banner = await prisma.homepageBanner.create({
      data: {
        headline: headline.trim(),
        subtext: subtext.trim(),
        badgeText: badgeText && typeof badgeText === "string" ? badgeText.trim() : null,
        ctaText: ctaText.trim(),
        ctaLink: ctaLink.trim(),
        backgroundImageUrl: backgroundImageUrl && typeof backgroundImageUrl === "string" ? backgroundImageUrl.trim() : null,
        backgroundBlur: typeof backgroundBlur === "number" ? Math.max(0, Math.min(20, backgroundBlur)) : parseInt(backgroundBlur, 10) || 0,
        order: typeof order === "number" ? order : parseInt(order, 10) || 0,
        active: active === undefined ? true : Boolean(active),
        startsAt: startsAt ? new Date(startsAt) : null,
        endsAt: endsAt ? new Date(endsAt) : null,
      },
    });

    return NextResponse.json({ banner }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/homepage-banners error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
