import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// GET /api/homepage-banners — Public route to fetch active, scheduled homepage banners
export async function GET() {
  try {
    const now = new Date();

    const banners = await prisma.homepageBanner.findMany({
      where: {
        active: true,
        AND: [
          {
            OR: [
              { startsAt: null },
              { startsAt: { lte: now } },
            ],
          },
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error("GET /api/homepage-banners error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
