import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SettingsFormView } from "@/components/dashboard/settings-form-view";

export const metadata: Metadata = {
  title: "Account Settings | EvoSport",
  description: "Manage your account password and security settings.",
};

export default async function UserSettingsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return <SettingsFormView />;
}
