import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  const isAdminDomain =
    host.includes("evosport-admin") ||
    host.startsWith("admin.");

  const isAdminPath = pathname.startsWith("/admin") || pathname.startsWith("/admin-login");
  const isPublicAssetOrApi =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico" ||
    /\.(png|jpg|jpeg|svg|webp|css|js|ico)$/.test(pathname);

  // 1. If hitting the ADMIN domain (e.g. evosport-admin.vercel.app)
  if (isAdminDomain) {
    if (!isAdminPath && !isPublicAssetOrApi) {
      // Redirect customer-facing requests on the admin domain to /admin
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  } else {
    // 2. If hitting the MAIN customer domain (e.g. localhost:3000, evo-sport.vercel.app)
    if (isAdminPath) {
      // Block direct access to /admin and /admin-login on customer domain -> redirect to home / 404
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
