import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { adminPasswordChangeSchema } from "@/lib/validators/admin-profile";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate-limit: 5 attempts per 15 minutes per user
    const limiter = rateLimit(`admin-password:${session.user.id}`, 5, 15 * 60 * 1000);
    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many password change attempts. Please try again in 15 minutes." },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const body = await req.json();
    const parseResult = adminPasswordChangeSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Invalid password details";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const { currentPassword, newPassword } = parseResult.data;

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "Account does not have a local password configured." },
        { status: 400 }
      );
    }

    // Verify current password with bcrypt
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Incorrect current password." },
        { status: 400 }
      );
    }

    // Hash new password using bcrypt cost factor 10 (standard app cost factor)
    // NOTE: Passwords and hashes are never logged.
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash },
    });

    return NextResponse.json(
      { success: true, message: "Password updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    console.error("PATCH /api/admin/profile/password error:", error instanceof Error ? error.message : "Internal error");
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
