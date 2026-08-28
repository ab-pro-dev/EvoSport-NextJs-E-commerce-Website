import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const VALID_SOUNDS = ["chime", "crystal", "pulse", "pop", "bell", "fanfare"];

// GET /api/user/notification-settings — Fetch current user's sound preferences
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        notificationSound: true,
        soundEnabled: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      soundEnabled: user.soundEnabled ?? true,
      notificationSound: user.notificationSound || "chime",
    });
  } catch (error) {
    console.error("GET /api/user/notification-settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/user/notification-settings — Update current user's sound preferences in database
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { soundEnabled, notificationSound } = body || {};

    const updateData: { soundEnabled?: boolean; notificationSound?: string } = {};

    if (soundEnabled !== undefined) {
      updateData.soundEnabled = Boolean(soundEnabled);
    }

    if (notificationSound !== undefined) {
      if (typeof notificationSound === "string" && VALID_SOUNDS.includes(notificationSound)) {
        updateData.notificationSound = notificationSound;
      } else {
        return NextResponse.json(
          { error: `Invalid sound choice. Must be one of: ${VALID_SOUNDS.join(", ")}` },
          { status: 400 }
        );
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        notificationSound: true,
        soundEnabled: true,
      },
    });

    return NextResponse.json({
      success: true,
      soundEnabled: updatedUser.soundEnabled,
      notificationSound: updatedUser.notificationSound,
    });
  } catch (error) {
    console.error("PATCH /api/user/notification-settings error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
