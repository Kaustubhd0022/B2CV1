import { createHash, createHmac, randomBytes, randomInt, timingSafeEqual } from "node:crypto";

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Keyed hash: used for OTP codes and contact identifiers so DB leaks don't reveal them. */
export function hmac(secret: string, value: string) {
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function safeEqualHex(a: string, b: string) {
  const ab = Buffer.from(a, "hex");
  const bb = Buffer.from(b, "hex");
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function generateOtp() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

import { scryptSync } from "node:crypto";

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64);
  return `${salt}:${derivedKey.toString("hex")}`;
}

export function verifyPassword(password: string, combined: string | null | undefined): boolean {
  if (!combined) return false;
  const [salt, key] = combined.split(":");
  if (!salt || !key) return false;
  try {
    const keyBuffer = Buffer.from(key, "hex");
    const derivedKey = scryptSync(password, salt, 64);
    return keyBuffer.length === derivedKey.length && timingSafeEqual(keyBuffer, derivedKey);
  } catch {
    return false;
  }
}
