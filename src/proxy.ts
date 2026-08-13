import { NextRequest, NextResponse } from "next/server";
import { BACKSTAGE_COOKIE_NAME, sessionCookieIsValid } from "@/lib/backstageAuth";

// The login page and the login/logout endpoint must stay reachable while logged out --
// everything else under /backstage and /api/backstage requires a valid session cookie.
const PUBLIC_PATHS = new Set(["/backstage/login", "/api/backstage/auth"]);

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const isAuthenticated = sessionCookieIsValid(request.cookies.get(BACKSTAGE_COOKIE_NAME)?.value);
  if (isAuthenticated) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/backstage")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loginUrl = new URL("/backstage/login", request.url);
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/backstage", "/backstage/:path*", "/api/backstage/:path*"],
};
