import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "tc_session";
const PUBLIC_PREFIXES = ["/sign-in", "/auth/", "/api/health", "/policies"];

/**
 * First line of FR-01: requests without a session cookie are sent to sign-in with the
 * intended destination preserved. Pages still validate the session server-side
 * (requireUser), because a cookie's presence is not proof of a valid session.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const headers = new Headers(request.headers);
  headers.set("x-tc-path", pathname + search);

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
  if (!isPublic && !request.cookies.get(SESSION_COOKIE)?.value) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|robots.txt).*)"],
};
