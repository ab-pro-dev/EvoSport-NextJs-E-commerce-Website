import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsFormView } from "@/components/dashboard/settings-form-view";

export const metadata: Metadata = {
  title: "Account Settings | EvoSport",
  description: "Manage your account password, security, and notification sound preferences.",
};

export default async function UserSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      soundEnabled: true,
      notificationSound: true,
    },
  });

  return (
    <SettingsFormView
      initialSoundSettings={{
        soundEnabled: user?.soundEnabled ?? true,
        notificationSound: user?.notificationSound || "chime",
      }}
    />
  );
}
