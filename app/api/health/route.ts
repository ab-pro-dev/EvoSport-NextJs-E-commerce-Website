import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  let dbConnected = false;

  try {
    await prisma.$queryRaw`SELECT 1`;
    dbConnected = true;
  } catch (error) {
    console.error("Database health check error:", error);
    dbConnected = false;
  }

  return NextResponse.json({
    status: "ok",
    db: dbConnected,
    timestamp: new Date().toISOString(),
  });
}
