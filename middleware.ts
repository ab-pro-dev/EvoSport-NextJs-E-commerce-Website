import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // 1. Check Maintenance Mode for public customer-facing routes
  if (
    !isAdminDashboardPath &&
    !isAdminLoginPage &&
    pathname !== "/maintenance" &&
    !isPublicAssetOrApi
  ) {
    try {
      const maintenanceRes = await fetch(new URL("/api/settings/maintenance", request.url));
      if (maintenanceRes.ok) {
        const { maintenanceMode } = await maintenanceRes.json();
        if (maintenanceMode) {
          const hasAdminAuthCookie =
            request.cookies.has("authjs.session-token") ||
            request.cookies.has("__Secure-authjs.session-token");

          if (!hasAdminAuthCookie) {
            return NextResponse.redirect(new URL("/maintenance", request.url));
          }
        }
      }
    } catch (e) {
      // Ignore network errors in middleware fallback
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
