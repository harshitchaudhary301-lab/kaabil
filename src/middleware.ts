import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const SESSION_COOKIE_NAME = "kaabil_session_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect student, institution, employer, and admin routes
  const protectedPrefixes = ["/student", "/institution", "/employer", "/admin"];
  const isProtected = protectedPrefixes.some((prefix) => pathname.startsWith(prefix));

  if (isProtected) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/student/:path*",
    "/institution/:path*",
    "/employer/:path*",
    "/admin/:path*",
  ],
};
