import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NotificationsView } from "@/components/dashboard/notifications-view";

export const metadata: Metadata = {
  title: "Notifications | EvoSport Dashboard",
  description: "View your order updates, restock alerts, and athletic store notifications.",
};

export default async function DashboardNotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const where = { userId: session.user.id };

  const [rawNotifications, totalCount, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { ...where, read: false } }),
  ]);

  const notifications = rawNotifications.map((n) => ({
    id: n.id,
    type: n.type,
    message: n.message,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <NotificationsView
      initialNotifications={notifications}
      totalCount={totalCount}
      unreadCount={unreadCount}
    />
  );
}
