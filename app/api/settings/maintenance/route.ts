import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/settings/maintenance — Public endpoint to check maintenance mode status
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "maintenanceMode" },
    });
    return NextResponse.json({ maintenanceMode: setting?.value === "true" });
  } catch (error) {
    console.error("GET /api/settings/maintenance error:", error);
    return NextResponse.json({ maintenanceMode: false });
  }
}
