import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { createSignedToken } from "@/lib/auth/session";

const USER_ID = "11111111-1111-4111-a111-111111111111";

function visit(path: string, cookie?: string) {
  const request = new NextRequest(new URL(path, "https://tattvaco.test"), {
    headers: cookie ? { cookie } : undefined,
  });
  const response = proxy(request);
  return {
    passedThrough: response.headers.get("x-middleware-next") === "1",
    location: response.headers.get("location"),
  };
}

function tamperedToken() {
  const [payload, sig] = createSignedToken(USER_ID).split(".");
  return `${payload}.${sig.split("").reverse().join("")}`;
}

describe("proxy session gate", () => {
  it.each([
    ["no cookies", undefined],
    ["a stale Supabase session cookie", "sb-project-auth-token=stale"],
    ["only a pending-signup PKCE cookie", "sb-project-auth-token-code-verifier=pending"],
    ["a badly signed session token", `tc_session=${tamperedToken()}`],
    ["an expired session token", `tc_session=${createSignedToken(USER_ID, "user", "en", -1)}`],
    ["a malformed session token", "tc_session=garbage"],
  ])("sends the home page to a plain /sign-in with %s", (_label, cookie) => {
    expect(visit("/", cookie).location).toBe("https://tattvaco.test/sign-in");
  });

  it("keeps the destination when a stale cookie is bounced from a deep link", () => {
    expect(visit("/explore?x=1", "sb-project-auth-token=stale").location).toBe(
      "https://tattvaco.test/sign-in?next=%2Fexplore%3Fx%3D1",
    );
  });

  it("lets a correctly signed session through", () => {
    expect(visit("/", `tc_session=${createSignedToken(USER_ID)}`).passedThrough).toBe(true);
  });

  it("shows the sign-in page to a visitor holding only stale cookies", () => {
    expect(visit("/sign-in", "sb-project-auth-token=stale").passedThrough).toBe(true);
    expect(visit("/sign-in", `tc_session=${tamperedToken()}`).passedThrough).toBe(true);
  });

  it("forwards a signed-in visitor away from the sign-in page", () => {
    expect(visit("/sign-in", `tc_session=${createSignedToken(USER_ID)}`).location).toBe("https://tattvaco.test/");
  });
});
