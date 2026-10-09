import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminProfileView } from "@/components/admin/admin-profile-view";

export const metadata: Metadata = {
  title: "Admin Profile | EvoSport Admin",
  description: "Manage admin account profile, unique username, and security credentials.",
};

export default async function AdminProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      image: true,
      role: true,
      createdAt: true,
    },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/admin-login");
  }

  return (
    <AdminProfileView
      initialUser={{
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        username: dbUser.username,
        image: dbUser.image,
        role: dbUser.role,
        createdAt: dbUser.createdAt.toISOString(),
      }}
    />
  );
}
