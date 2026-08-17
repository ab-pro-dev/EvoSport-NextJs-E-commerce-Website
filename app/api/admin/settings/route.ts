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

const DEFAULT_SETTINGS: Record<string, string> = {
  storeName: "EvoSport Performance",
  contactEmail: "support@evosport.com",
  supportPhone: "+1 (800) 555-EVO1",
  freeShippingThreshold: "100",
  flatRateShipping: "9.99",
  taxRate: "0.08",
  maintenanceMode: "false",
  showDiscountBadge: "false",
};

// GET /api/admin/settings — List all settings dictionary
export async function GET() {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const settingsRows = await prisma.setting.findMany();
    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const s of settingsRows) {
      if (s.key === "taxRate" || s.key === "freeShippingThreshold" || s.key === "flatRateShipping") {
        settingsMap[s.key] = parseFloat(s.value);
      } else if (s.key === "maintenanceMode" || s.key === "showDiscountBadge") {
        settingsMap[s.key] = s.value === "true";
      } else {
        settingsMap[s.key] = s.value;
      }
    }

    return NextResponse.json({ settings: settingsMap });
  } catch (error) {
    console.error("GET /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/settings — Update settings key-value pairs
export async function PATCH(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const body = await req.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
    }

    for (const [key, val] of Object.entries(body)) {
      const strVal = String(val);
      await prisma.setting.upsert({
        where: { key },
        update: { value: strVal },
        create: { key, value: strVal },
      });
    }

    const settingsRows = await prisma.setting.findMany();
    const settingsMap: Record<string, any> = { ...DEFAULT_SETTINGS };

    for (const s of settingsRows) {
      if (s.key === "taxRate" || s.key === "freeShippingThreshold" || s.key === "flatRateShipping") {
        settingsMap[s.key] = parseFloat(s.value);
      } else if (s.key === "maintenanceMode" || s.key === "showDiscountBadge") {
        settingsMap[s.key] = s.value === "true";
      } else {
        settingsMap[s.key] = s.value;
      }
    }

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error) {
    console.error("PATCH /api/admin/settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
