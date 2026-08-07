import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const addresses = await prisma.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });

    return NextResponse.json({ addresses }, { status: 200 });
  } catch (error) {
    console.error("GET /api/addresses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { fullName, phone, line1, line2, city, state, zip, country, isDefault } = body;

    if (!fullName || !phone || !line1 || !city || !state || !zip || !country) {
      return NextResponse.json(
        { error: "Required fields missing: fullName, phone, line1, city, state, zip, country" },
        { status: 400 }
      );
    }

    // Check if this is the user's first address, if so default to true
    const existingCount = await prisma.address.count({
      where: { userId: session.user.id },
    });

    const setAsDefault = isDefault || existingCount === 0;

    // If setAsDefault is true, unset default on all other addresses
    if (setAsDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: session.user.id,
        fullName,
        phone,
        line1,
        line2: line2 || null,
        city,
        state,
        zip,
        country,
        isDefault: setAsDefault,
      },
    });

    return NextResponse.json({ address }, { status: 201 });
  } catch (error) {
    console.error("POST /api/addresses error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
