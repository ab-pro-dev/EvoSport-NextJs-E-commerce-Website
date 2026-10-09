import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

interface MaintenanceCache {
  value: boolean;
  timestamp: number;
}

let maintenanceCache: MaintenanceCache | null = null;
const MAINTENANCE_CACHE_TTL_MS = 60 * 1000; // 60 seconds

export async function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  const isAdminDomain =
    host.includes("evosport-admin") ||
    host.startsWith("admin.") ||
    host.includes("admin.localhost");

  const isAdminDashboardPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginPage = pathname === "/admin-login";
  const isPublicAssetOrApi =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|webp|css|js|ico)$/.test(pathname);

  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  // 1. Check Maintenance Mode for public customer-facing routes (skip /_next, static assets, and /api/ping)
  if (
    !isAdminDashboardPath &&
    !isAdminLoginPage &&
    pathname !== "/maintenance" &&
    !isPublicAssetOrApi &&
    pathname !== "/api/ping" &&
    !pathname.startsWith("/_next")
  ) {
    let maintenanceMode = false;
    const now = Date.now();

    if (maintenanceCache && now - maintenanceCache.timestamp < MAINTENANCE_CACHE_TTL_MS) {
      maintenanceMode = maintenanceCache.value;
    } else {
      try {
        const maintenanceRes = await fetch(new URL("/api/settings/maintenance", request.url));
        if (maintenanceRes.ok) {
          const data = await maintenanceRes.json();
          maintenanceMode = Boolean(data?.maintenanceMode);
          maintenanceCache = { value: maintenanceMode, timestamp: now };
        } else {
          // Fail open: if response is not ok (e.g. 500 / DB unreachable), do not block site
          maintenanceMode = false;
        }
      } catch (e) {
        // Fail open: if lookup throws or network/DB error, site must NOT be blocked
        maintenanceMode = false;
      }
    }

    if (maintenanceMode) {
      const hasAdminAuthCookie =
        request.cookies.has("authjs.session-token") ||
        request.cookies.has("__Secure-authjs.session-token");

      if (!hasAdminAuthCookie) {
        return NextResponse.redirect(new URL("/maintenance", request.url));
      }
    }
  }

  // 2. Admin Domain vs Customer Domain routing
  if (isAdminDomain) {
    if (!isAdminDashboardPath && !isAdminLoginPage && !isPublicAssetOrApi) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else if (!isLocalhost) {
    if (isAdminDashboardPath) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
