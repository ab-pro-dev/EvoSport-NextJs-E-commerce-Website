import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  const isAdminDomain =
    host.includes("evosport-admin") ||
    host.startsWith("admin.");

  // Check exact /admin path or subpaths under /admin/, distinct from /admin-login
  const isAdminDashboardPath = pathname === "/admin" || pathname.startsWith("/admin/");
  const isAdminLoginPage = pathname === "/admin-login";
  const isPublicAssetOrApi =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|webp|css|js|ico)$/.test(pathname);

  // 1. If hitting the ADMIN domain (e.g. evosport-admin.vercel.app)
  if (isAdminDomain) {
    if (!isAdminDashboardPath && !isAdminLoginPage && !isPublicAssetOrApi) {
      // Redirect customer-facing requests on the admin domain to /admin
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else {
    // 2. If hitting the MAIN customer domain (e.g. localhost:3000, evo-sport.vercel.app)
    // /admin-login is allowed to render normally for local testing
    // Only block direct access to /admin/* dashboard routes on the main domain
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
