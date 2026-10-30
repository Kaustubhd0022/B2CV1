import { NextResponse, type NextRequest } from "next/server";
import { readSignedToken } from "@/lib/auth/signed-token";

const SESSION_COOKIE = "tc_session";

const PUBLIC_PREFIXES = [
  "/sign-in",
  "/sign-up",
  "/auth/",
  "/api/health",
  "/policies",
];

/**
 * First line of defense: All product pages (including home page /) are protected.
 * Unauthenticated users are redirected to /sign-in (preserving the intended destination in ?next=).
 * Only authentication routes, oauth callbacks, health check, and policies are publicly accessible.
 * Every sign-in path issues tc_session, so a verified tc_session is the only proof of auth here;
 * sb-* cookies can outlive the session or belong to an unconfirmed signup, so they don't count.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const headers = new Headers(request.headers);
  headers.set("x-tc-path", pathname + search);

  const isPublic = PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p));
  const rawToken = request.cookies.get(SESSION_COOKIE)?.value;
  const hasAuth = Boolean(rawToken && readSignedToken(rawToken));

  if (!isPublic && !hasAuth) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
    }
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    if (pathname !== "/") {
      url.search = `?next=${encodeURIComponent(pathname + search)}`;
    } else {
      url.search = "";
    }
    return NextResponse.redirect(url);
  }

  // If already authenticated and visiting /sign-in or /sign-up without explicit reason or error, redirect to product
  const hasReasonOrError = request.nextUrl.searchParams.has("reason") || request.nextUrl.searchParams.has("error");
  if (hasAuth && (pathname === "/sign-in" || pathname === "/sign-up") && !hasReasonOrError) {
    const next = request.nextUrl.searchParams.get("next");
    const dest = next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images/|robots.txt).*)"],
};

