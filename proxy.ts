import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password"];

const API_PUBLIC_PATHS = ["/api/auth/login", "/api/auth/register", "/api/auth/me"];

const STATIC_EXT = /\.(?:png|jpe?g|gif|webp|avif|ico|svg|mp4|webm|woff2?|css|js)$/i;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get("nova_session")?.value;

  // Never intercept static assets (images, fonts, css, etc.)
  if (STATIC_EXT.test(pathname)) {
    return NextResponse.next();
  }

  const isApiRoute = pathname.startsWith("/api");
  const isPublicPage = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith("/_next")
  );
  const isApiPublic = API_PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (isApiRoute && isApiPublic) {
    return NextResponse.next();
  }

  if (isApiRoute && !sessionToken) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  if (!isPublicPage && !sessionToken && !isApiRoute) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(url);
  }

  if (isPublicPage && sessionToken && !pathname.startsWith("/_next")) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|mp4|webm|woff2?|css|js)$).*)",
  ],
};
