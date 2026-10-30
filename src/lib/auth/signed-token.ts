import { config } from "@/lib/config";
import { hmac, safeEqualHex } from "./crypto";

export function signingSecret() {
  return config().auth.secret || "dev-only-secret-do-not-use-in-production";
}

/** Checks signature and expiry. Shared by src/proxy.ts and session.ts so the two can't disagree about a token. */
export function readSignedToken(token: string) {
  try {
    if (!token.startsWith("tc_") || !token.includes(".")) return null;
    const [prefixedPayload, sig] = token.split(".");
    const b64 = prefixedPayload.replace(/^tc_/, "");
    const payload = Buffer.from(b64, "base64url").toString("utf-8");
    const [userId, role, lang, expStr] = payload.split(":");
    const expiresAt = Number(expStr);
    if (!userId || !expStr || Number.isNaN(expiresAt) || expiresAt < Date.now()) return null;
    if (!safeEqualHex(sig, hmac(signingSecret(), payload))) return null;
    return { userId, role, lang, sig };
  } catch {
    return null;
  }
}
