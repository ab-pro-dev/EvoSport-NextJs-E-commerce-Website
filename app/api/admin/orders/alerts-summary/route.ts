import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!dbUser || dbUser.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const where = {
      status: { in: ["PENDING", "PAID"] },
    };

    const [pendingCount, latestOrder] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findFirst({
        where,
        orderBy: { createdAt: "desc" },
        select: { createdAt: true },
      }),
    ]);

    return NextResponse.json({
      pendingCount,
      latestOrderTimestamp: latestOrder?.createdAt ? latestOrder.createdAt.toISOString() : null,
    });
  } catch (error) {
    console.error("GET /api/admin/orders/alerts-summary error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
