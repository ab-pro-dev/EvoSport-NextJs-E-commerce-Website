"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/navigation/footer";

export function SiteFooter() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/admin") ||
    pathname === "/admin-login" ||
    pathname === "/maintenance"
  ) {
    return null;
  }

  return <Footer />;
}
