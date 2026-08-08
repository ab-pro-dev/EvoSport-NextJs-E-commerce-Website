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
    select: { id: true, role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    return { error: "Forbidden: Admin access required", status: 403 };
  }

  return { session, dbUser };
}

// PATCH /api/admin/customers/[id]/ban — Toggle or update customer ban status
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
    const body = await req.json().catch(() => ({}));
    const { isBanned } = body;

    // Prevent admin self-banning
    if (id === authResult.dbUser.id) {
      return NextResponse.json({ error: "You cannot ban your own administrative account." }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, email: true, role: true, isBanned: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User account not found" }, { status: 404 });
    }

    // Prevent banning another ADMIN
    if (targetUser.role === "ADMIN") {
      return NextResponse.json({ error: "Administrative accounts cannot be suspended." }, { status: 400 });
    }

    const newBanState = isBanned !== undefined ? Boolean(isBanned) : !targetUser.isBanned;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { isBanned: newBanState },
      select: { id: true, name: true, email: true, role: true, isBanned: true },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      message: newBanState
        ? `Account ${updatedUser.email} has been suspended.`
        : `Account ${updatedUser.email} has been un-suspended.`,
    });
  } catch (error) {
    console.error("PATCH /api/admin/customers/[id]/ban error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
