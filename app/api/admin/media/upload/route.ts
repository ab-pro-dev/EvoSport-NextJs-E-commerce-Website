import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cloudinary } from "@/lib/cloudinary";

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

// POST /api/admin/media/upload — Generic Cloudinary image upload endpoint
export async function POST(req: Request) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const imageUrlParam = formData.get("url") as string | null;

    let secureUrl = "";
    let publicId = "";

    if (file && typeof file !== "string") {
      // Validate image MIME type only
      if (!file.type || !file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files (JPEG, PNG, WEBP, GIF, SVG) are supported." },
          { status: 400 }
        );
      }

      // Check max size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json(
          { error: "Image file exceeds maximum allowed size of 5MB." },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type || "image/jpeg"};base64,${buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64, {
        folder: "evosport/media",
      });

      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else if (imageUrlParam && typeof imageUrlParam === "string" && imageUrlParam.trim() !== "") {
      const uploadResult = await cloudinary.uploader.upload(imageUrlParam.trim(), {
        folder: "evosport/media",
      });

      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      return NextResponse.json(
        { error: "No file or image URL provided in request payload." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: secureUrl,
      secure_url: secureUrl,
      public_id: publicId,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/media/upload error:", error);
    return NextResponse.json({ error: "Cloudinary upload failed: " + String(error) }, { status: 500 });
  }
}
