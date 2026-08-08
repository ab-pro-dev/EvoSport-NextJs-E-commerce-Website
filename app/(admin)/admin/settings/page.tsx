import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsManagementView } from "@/components/admin/settings-management-view";

export const metadata: Metadata = {
  title: "Store & System Settings | EvoSport Admin",
  description: "Configure store parameters, tax rates, free shipping rules, and maintenance mode.",
};

const DEFAULT_SETTINGS = {
  storeName: "EvoSport Performance",
  contactEmail: "support@evosport.com",
  supportPhone: "+1 (800) 555-EVO1",
  freeShippingThreshold: 100,
  flatRateShipping: 9.99,
  taxRate: 0.08,
  maintenanceMode: false,
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/admin-login");
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (!dbUser || dbUser.role !== "ADMIN") {
    redirect("/admin-login");
  }

  const settingsRows = await prisma.setting.findMany();
  const settingsMap: any = { ...DEFAULT_SETTINGS };

  for (const s of settingsRows) {
    if (s.key === "taxRate" || s.key === "freeShippingThreshold" || s.key === "flatRateShipping") {
      settingsMap[s.key] = parseFloat(s.value);
    } else if (s.key === "maintenanceMode") {
      settingsMap[s.key] = s.value === "true";
    } else {
      settingsMap[s.key] = s.value;
    }
  }

  return <SettingsManagementView initialSettings={settingsMap} />;
}
