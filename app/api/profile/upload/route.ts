import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { cloudinary } from "@/lib/cloudinary";

// POST /api/profile/upload — Authenticated user avatar upload to Cloudinary
export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const imageUrlParam = formData.get("url") as string | null;

    let secureUrl = "";
    let publicId = "";

    if (file && typeof file !== "string") {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          { error: "Only image files (JPEG, PNG, WEBP, GIF) are supported." },
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
        folder: "evosport/avatars",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });

      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else if (imageUrlParam && typeof imageUrlParam === "string" && imageUrlParam.trim() !== "") {
      const uploadResult = await cloudinary.uploader.upload(imageUrlParam.trim(), {
        folder: "evosport/avatars",
        transformation: [
          { width: 400, height: 400, crop: "fill", gravity: "face" },
          { quality: "auto", fetch_format: "auto" },
        ],
      });

      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      return NextResponse.json(
        { error: "No image file or URL provided in upload request." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        url: secureUrl,
        secure_url: secureUrl,
        public_id: publicId,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/profile/upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload image to Cloudinary: " + String(error) },
      { status: 500 }
    );
  }
}
