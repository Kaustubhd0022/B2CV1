const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function normalizeEmail(input: string): string | null {
  const v = input.trim().toLowerCase();
  return v.length <= 254 && EMAIL_RE.test(v) ? v : null;
}

/** Accepts E.164-style numbers ("+91 98765-43210" → "+919876543210"). */
export function normalizePhone(input: string): string | null {
  const v = input.trim().replace(/[\s().-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(v) ? v : null;
}

/** Shown on the verify screen without echoing the full identifier back. */
export function maskTarget(channel: "email" | "phone", target: string) {
  if (channel === "email") {
    const [user, domain] = target.split("@");
    return `${user.slice(0, 2)}${"•".repeat(Math.max(1, user.length - 2))}@${domain}`;
  }
  return `${target.slice(0, 3)}${"•".repeat(Math.max(1, target.length - 5))}${target.slice(-2)}`;
}

/** Only allow same-origin relative redirect targets (prevents open redirects). */
export function safeNext(next: unknown, fallback = "/"): string {
  if (typeof next !== "string" || !next.startsWith("/") || next.startsWith("//") || next.startsWith("/\\")) {
    return fallback;
  }
  if (next.startsWith("/sign-in") || next.startsWith("/api/")) return fallback;
  return next.slice(0, 512);
}
