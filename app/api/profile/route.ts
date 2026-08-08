import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, image } = body || {};

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updateData: { name?: string; email?: string; image?: string | null } = {};

    if (name !== undefined) {
      updateData.name = name ? name.trim() : currentUser.name;
    }

    if (image !== undefined) {
      updateData.image = image ? image.trim() : null;
    }

    if (email && email.trim().toLowerCase() !== currentUser.email?.toLowerCase()) {
      const normalizedEmail = email.trim().toLowerCase();

      // Email uniqueness validation
      const existingUser = await prisma.user.findFirst({
        where: {
          email: normalizedEmail,
          id: { not: session.user.id },
        },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Email address is already in use by another account." },
          { status: 400 }
        );
      }

      updateData.email = normalizedEmail;
    }

    // Explicitly enforce that role CANNOT be changed via this endpoint
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
