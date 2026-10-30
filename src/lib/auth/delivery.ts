import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { config } from "@/lib/config";
import { log } from "@/lib/log";

/** `demoCode` is returned only by the on-screen demo channel, so the verify page can display it. */
export type DeliveryResult = { ok: true; demoCode?: string } | { ok: false; reason: "not_configured" | "provider_error" | "rate_limited" };

/** DEMO MODE only: nothing is sent; the code is shown on the verification screen. */
function onScreen(code: string): DeliveryResult {
  const c = config();
  if (c.isProd && !c.demoMode) return { ok: false, reason: "not_configured" };
  log.info("demo_screen.delivered");
  return { ok: true, demoCode: code };
}

export const DEV_OUTBOX = path.join(process.cwd(), ".dev-outbox", "outbox.jsonl");

/** Development only: writes the message to a local file instead of sending it. */
async function devOutbox(channel: "email" | "phone", to: string, code: string): Promise<DeliveryResult> {
  if (config().isProd) return { ok: false, reason: "not_configured" };
  await mkdir(path.dirname(DEV_OUTBOX), { recursive: true });
  await appendFile(DEV_OUTBOX, JSON.stringify({ channel, to, code, at: new Date().toISOString() }) + "\n");
  log.info("dev_outbox.delivered", { channel });
  return { ok: true };
}

export function emailConfigured() {
  const e = config().auth.email;
  return e.provider === "dev-outbox" || e.provider === "screen" || Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function smsConfigured() {
  const s = config().auth.sms;
  return (
    s.provider === "dev-outbox" ||
    s.provider === "screen" ||
    (s.provider === "twilio" && !!s.twilioAccountSid && !!s.twilioAuthToken && !!s.twilioFrom)
  );
}

/**
 * Real email goes through Supabase Auth, which generates its own code, so `code` is only used by
 * the dev-outbox and on-screen channels. verifyCode checks Supabase's code first.
 */
export async function sendEmailCode(to: string, code: string): Promise<DeliveryResult> {
  const e = config().auth.email;
  if (e.provider === "dev-outbox") return devOutbox("email", to, code);
  if (e.provider === "screen") return onScreen(code);
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return { ok: false, reason: "not_configured" };

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: to,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${config().appUrl}/auth/callback`,
      },
    });
    if (!error) return { ok: true };
    log.warn("supabase.email_error", { code: error.code, error: error.message });
    return { ok: false, reason: error.code === "over_email_send_rate_limit" ? "rate_limited" : "provider_error" };
  } catch (err) {
    log.warn("supabase.email_error", { error: (err as Error).name });
    return { ok: false, reason: "provider_error" };
  }
}

export async function sendSmsCode(to: string, code: string, minutes: number): Promise<DeliveryResult> {
  const s = config().auth.sms;
  if (s.provider === "dev-outbox") return devOutbox("phone", to, code);
  if (s.provider === "screen") return onScreen(code);
  if (s.provider !== "twilio" || !s.twilioAccountSid || !s.twilioAuthToken || !s.twilioFrom) {
    return { ok: false, reason: "not_configured" };
  }
  try {
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${s.twilioAccountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: "Basic " + Buffer.from(`${s.twilioAccountSid}:${s.twilioAuthToken}`).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: to,
        From: s.twilioFrom,
        Body: `TattvaCo code: ${code}. Expires in ${minutes} min.`,
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) {
      log.warn("sms.provider_error", { status: res.status });
      return { ok: false, reason: "provider_error" };
    }
    return { ok: true };
  } catch (err) {
    log.warn("sms.provider_error", { error: (err as Error).name });
    return { ok: false, reason: "provider_error" };
  }
}
