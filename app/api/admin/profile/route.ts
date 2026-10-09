import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { adminProfileUpdateSchema } from "@/lib/validators/admin-profile";

export const dynamic = "force-dynamic";

async function verifyAdminSession() {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized", status: 401 as const };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    return { error: "User not found", status: 404 as const };
  }

  if (user.role !== "ADMIN") {
    return { error: "Forbidden: Admin access required", status: 403 as const };
  }

  return { session, user };
}

// GET /api/admin/profile
export async function GET() {
  try {
    const authResult = await verifyAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { user } = authResult;
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      username: user.username,
      image: user.image,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    console.error("GET /api/admin/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/admin/profile
export async function PATCH(req: Request) {
  try {
    const authResult = await verifyAdminSession();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { session } = authResult;
    const body = await req.json();
    const parseResult = adminProfileUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Invalid input";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const validatedData = parseResult.data;

    // Check username uniqueness if username is being changed/set
    if (validatedData.username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username: validatedData.username,
          NOT: { id: session.user.id },
        },
        select: { id: true },
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "That username is already taken" },
          { status: 400 }
        );
      }
    }

    const updateData: {
      name?: string;
      username?: string;
      image?: string | null;
    } = {};

    if (validatedData.name !== undefined) {
      updateData.name = validatedData.name;
    }
    if (validatedData.username !== undefined) {
      updateData.username = validatedData.username;
    }
    if (validatedData.image !== undefined) {
      updateData.image = validatedData.image;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      user: updatedUser,
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      username: updatedUser.username,
      image: updatedUser.image,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
    });
  } catch (error) {
    console.error("PATCH /api/admin/profile error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
