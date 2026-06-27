import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must stay in sync with COOKIE_KEYS.username in lib/cookies.ts
const USERNAME_COOKIE = "tgb_username";

export function middleware(request: NextRequest) {
  const username = request.cookies.get(USERNAME_COOKIE)?.value;
  const { pathname } = request.nextUrl;

  // Root: send to welcome if authenticated, else to auth
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(username ? "/welcome" : "/auth", request.url)
    );
  }

  // Skip auth page if already authenticated
  if (pathname === "/auth" && username) {
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  // Guard all /welcome/* routes
  if (pathname.startsWith("/welcome") && !username) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/auth", "/welcome/:path*"],
};
