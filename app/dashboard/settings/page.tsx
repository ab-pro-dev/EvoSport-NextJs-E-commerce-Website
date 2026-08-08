import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileFormView } from "@/components/dashboard/profile-form-view";

export const metadata: Metadata = {
  title: "Account Settings | EvoSport",
  description: "Manage your personal profile and security settings.",
};

export default async function UserSettingsPage() {
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

  return <ProfileFormView user={user} />;
}
