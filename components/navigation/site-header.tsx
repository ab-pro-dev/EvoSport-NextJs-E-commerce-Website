"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/components/navigation/navbar";

export function SiteHeader() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname === "/admin-login" || pathname === "/maintenance") {
    return null;
  }

  return <Navbar />;
}
