import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileDetailsView } from "@/components/dashboard/profile-details-view";

export const metadata: Metadata = {
  title: "My Profile | EvoSport",
  description: "Manage your personal profile information and contact details.",
};

export default async function UserProfilePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  return <ProfileDetailsView user={user} />;
}
