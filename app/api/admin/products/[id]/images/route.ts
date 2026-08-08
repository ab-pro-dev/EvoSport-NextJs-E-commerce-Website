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

// POST /api/admin/products/[id]/images — Upload image to Cloudinary and create ProductImage
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id: productId } = await params;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const imageUrlParam = formData.get("url") as string | null;

    let secureUrl = "";
    let publicId = "";

    if (file && typeof file !== "string") {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

      const uploadResult = await cloudinary.uploader.upload(base64, {
        folder: "evosport/products",
      });

      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else if (imageUrlParam) {
      const uploadResult = await cloudinary.uploader.upload(imageUrlParam.trim(), {
        folder: "evosport/products",
      });

      secureUrl = uploadResult.secure_url;
      publicId = uploadResult.public_id;
    } else {
      return NextResponse.json(
        { error: "No file or image URL provided for upload." },
        { status: 400 }
      );
    }

    // Get current image count for positioning
    const currentImagesCount = await prisma.productImage.count({
      where: { productId },
    });

    const newImage = await prisma.productImage.create({
      data: {
        productId,
        url: secureUrl,
        altText: product.name,
        position: currentImagesCount,
      },
    });

    return NextResponse.json({
      success: true,
      image: newImage,
      secure_url: secureUrl,
      public_id: publicId,
    }, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/products/[id]/images error:", error);
    return NextResponse.json({ error: "Cloudinary upload failed: " + String(error) }, { status: 500 });
  }
}
