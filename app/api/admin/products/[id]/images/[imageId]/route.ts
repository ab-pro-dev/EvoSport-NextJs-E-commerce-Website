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

// DELETE /api/admin/products/[id]/images/[imageId] — Delete ProductImage
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id: productId, imageId } = await params;

    const existingImage = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!existingImage) {
      return NextResponse.json({ error: "Product image not found." }, { status: 404 });
    }

    // Try Cloudinary deletion if URL is from Cloudinary
    if (existingImage.url && existingImage.url.includes("cloudinary")) {
      try {
        const parts = existingImage.url.split("/");
        const filenameWithExt = parts.slice(-2).join("/");
        const publicId = filenameWithExt.split(".")[0];
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
        }
      } catch (cloudErr) {
        console.warn("Could not delete image from Cloudinary (non-fatal):", cloudErr);
      }
    }

    // Delete record from Prisma
    await prisma.productImage.delete({
      where: { id: imageId },
    });

    // Re-index remaining images for sequential positioning (0, 1, 2, ...)
    const remainingImages = await prisma.productImage.findMany({
      where: { productId },
      orderBy: [{ position: "asc" }, { createdAt: "asc" }],
    });

    for (let i = 0; i < remainingImages.length; i++) {
      if (remainingImages[i].position !== i) {
        await prisma.productImage.update({
          where: { id: remainingImages[i].id },
          data: { position: i },
        });
      }
    }

    const updatedImages = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "Product image deleted successfully.",
      images: updatedImages,
    });
  } catch (error) {
    console.error("DELETE /api/admin/products/[id]/images/[imageId] error:", error);
    return NextResponse.json({ error: "Failed to delete product image." }, { status: 500 });
  }
}

// PATCH /api/admin/products/[id]/images/[imageId] — Set as main (position: 0) or update position
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    const authResult = await verifyAdmin();
    if ("error" in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { id: productId, imageId } = await params;
    const body = await req.json().catch(() => ({}));

    const existingImage = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!existingImage) {
      return NextResponse.json({ error: "Product image not found." }, { status: 404 });
    }

    const isMain = body.isMain === true || body.position === 0;

    if (isMain) {
      const allImages = await prisma.productImage.findMany({
        where: { productId },
        orderBy: [{ position: "asc" }, { createdAt: "asc" }],
      });

      const otherImages = allImages.filter((img) => img.id !== imageId);

      // Set target image to position 0
      await prisma.productImage.update({
        where: { id: imageId },
        data: { position: 0 },
      });

      // Re-assign positions 1, 2, 3... to other images
      for (let i = 0; i < otherImages.length; i++) {
        await prisma.productImage.update({
          where: { id: otherImages[i].id },
          data: { position: i + 1 },
        });
      }
    } else if (typeof body.position === "number") {
      await prisma.productImage.update({
        where: { id: imageId },
        data: { position: body.position },
      });
    }

    const updatedImages = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({
      success: true,
      message: "Image position updated.",
      images: updatedImages,
    });
  } catch (error) {
    console.error("PATCH /api/admin/products/[id]/images/[imageId] error:", error);
    return NextResponse.json({ error: "Failed to update image position." }, { status: 500 });
  }
}
