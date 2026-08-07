import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: addressId } = await params;
    const body = await req.json();

    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    const { fullName, phone, line1, line2, city, state, zip, country, isDefault } = body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: session.user.id, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    const updatedAddress = await prisma.address.update({
      where: { id: addressId },
      data: {
        fullName: fullName !== undefined ? fullName : existingAddress.fullName,
        phone: phone !== undefined ? phone : existingAddress.phone,
        line1: line1 !== undefined ? line1 : existingAddress.line1,
        line2: line2 !== undefined ? line2 : existingAddress.line2,
        city: city !== undefined ? city : existingAddress.city,
        state: state !== undefined ? state : existingAddress.state,
        zip: zip !== undefined ? zip : existingAddress.zip,
        country: country !== undefined ? country : existingAddress.country,
        isDefault: isDefault !== undefined ? isDefault : existingAddress.isDefault,
      },
    });

    return NextResponse.json({ address: updatedAddress }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/addresses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: addressId } = await params;

    const existingAddress = await prisma.address.findFirst({
      where: { id: addressId, userId: session.user.id },
    });

    if (!existingAddress) {
      return NextResponse.json({ error: "Address not found" }, { status: 404 });
    }

    await prisma.address.delete({
      where: { id: addressId },
    });

    // If the deleted address was default, set the latest remaining address as default
    if (existingAddress.isDefault) {
      const remainingAddress = await prisma.address.findFirst({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
      });
      if (remainingAddress) {
        await prisma.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true },
        });
      }
    }

    return NextResponse.json({ success: true, message: "Address deleted" }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/addresses/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
