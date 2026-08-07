import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AddressesView } from "@/components/dashboard/addresses-view";

export const metadata: Metadata = {
  title: "My Addresses | EvoSport",
  description: "Manage your saved shipping and billing addresses.",
};

export default async function UserAddressesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const initialAddresses = await prisma.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return <AddressesView initialAddresses={initialAddresses} />;
}
