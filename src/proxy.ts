import { NextResponse, type NextRequest } from "next/server";

const SESSION_COOKIE = "tc_session";

const PUBLIC_PREFIXES = [
  "/sign-in",
  "/auth/",
  "/api/health",
  "/policies",
  "/language",
  "/stories",
  "/places",
  "/cities",
  "/connections",
  "/explore",
  "/sources",
  "/s/",
  "/ask",
  "/api/ask",
];

/**
 * First line of FR-01: protected administrative and user account requests without a session cookie
 * are sent to sign-in with the intended destination preserved. Cultural discovery surfaces
 * (stories, places, cities, connections, explore, ask) are open to public guest exploration.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const headers = new Headers(request.headers);
  headers.set("x-tc-path", pathname + search);

  const isHome = pathname === "/";
  const isPublic = isHome || PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
  const hasAuth = Boolean(request.cookies.get(SESSION_COOKIE)?.value || request.cookies.get("tc-language")?.value);
  if (!isPublic && !hasAuth) {
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
