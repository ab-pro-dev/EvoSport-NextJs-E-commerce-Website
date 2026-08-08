import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  const isAdminDomain =
    host.includes("evosport-admin") ||
    host.startsWith("admin.") ||
    host.includes("admin.localhost");

  // Check exact /admin path or subpaths under /admin/, distinct from /admin-login
  const isAdminDashboardPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginPage = pathname === "/admin-login";
  const isPublicAssetOrApi =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|webp|css|js|ico)$/.test(pathname);

  // Allow local development (localhost) to access /admin and /admin-login seamlessly
  const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");

  // 1. If hitting the ADMIN domain (e.g. evosport-admin.vercel.app or admin.localhost)
  if (isAdminDomain) {
    if (!isAdminDashboardPath && !isAdminLoginPage && !isPublicAssetOrApi) {
      // Redirect customer-facing requests on the admin domain to /admin
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else if (!isLocalhost) {
    // 2. On production customer domain (e.g. evo-sport.vercel.app), block /admin/* routes
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
