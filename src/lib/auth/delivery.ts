import "server-only";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { config } from "@/lib/config";
import { log } from "@/lib/log";

/** `demoCode` is returned only by the on-screen demo channel, so the verify page can display it. */
export type DeliveryResult = { ok: true; demoCode?: string } | { ok: false; reason: "not_configured" | "provider_error" };

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
  return (
    e.provider === "dev-outbox" ||
    e.provider === "screen" ||
    (e.provider === "resend" && !!e.resendApiKey) ||
    e.provider === "supabase" ||
    Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}

export function smsConfigured() {
  const s = config().auth.sms;
  return (
    s.provider === "dev-outbox" ||
    s.provider === "screen" ||
    (s.provider === "twilio" && !!s.twilioAccountSid && !!s.twilioAuthToken && !!s.twilioFrom)
  );
}

export async function sendEmailCode(
  to: string,
  code: string,
  minutes: number,
  confirmUrl?: string,
): Promise<DeliveryResult> {
  const e = config().auth.email;
  if (e.provider === "dev-outbox") return devOutbox("email", to, code);
  if (e.provider === "screen") return onScreen(code);

  const resendKey = e.resendApiKey || process.env.RESEND_API_KEY;

  // 1. Send via Resend with prominent 6-Digit Code AND 1-Tap Verification Link
  if (resendKey) {
    try {
      const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #141D18; color: #FFFFFF; padding: 32px 16px; margin: 0;">
  <div style="max-width: 500px; margin: 0 auto; background-color: #1A2620; border: 1px solid rgba(201,130,43,0.35); border-radius: 20px; padding: 32px 24px; text-align: center; box-shadow: 0 12px 40px rgba(0,0,0,0.6);">
    <div style="margin-bottom: 16px;">
      <span style="display: inline-block; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.15em; color: #F6D59E; background: rgba(201,130,43,0.15); border: 1px solid rgba(201,130,43,0.3); padding: 4px 14px; border-radius: 999px;">
        ✦ Cultural Explorer Passport
      </span>
    </div>
    <h1 style="font-size: 22px; font-weight: bold; margin: 0 0 8px 0; color: #FFFFFF;">
      Your Verification Code
    </h1>
    <p style="font-size: 13px; color: rgba(255,255,255,0.8); line-height: 1.5; margin: 0 0 20px 0;">
      Enter the 6-digit code below on your screen to verify your passport. It expires in ${minutes} minutes.
    </p>

    <!-- PROMINENT 6-DIGIT OTP BOX -->
    <div style="background-color: #0E1612; border: 2px solid #C9822B; border-radius: 14px; padding: 16px 24px; margin: 0 auto 20px auto; display: inline-block;">
      <span style="font-family: 'Courier New', Courier, monospace; font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #F6D59E; margin-left: 8px;">
        ${code}
      </span>
    </div>

    ${
      confirmUrl
        ? `
    <div style="margin: 18px 0; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 18px;">
      <p style="font-size: 12px; color: rgba(255,255,255,0.7); margin-bottom: 12px;">
        Opening on mobile phone? Tap below to verify and open directly on this device:
      </p>
      <a href="${confirmUrl}" style="display: inline-block; background: #C9822B; color: #141D18; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 24px; border-radius: 12px; box-shadow: 0 4px 14px rgba(201,130,43,0.4);">
        ✦ Verify on This Device
      </a>
    </div>
    `
        : ""
    }

    <p style="font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 14px;">
      If you did not request this verification, you can safely ignore this email.
      <br>
      © ${new Date().getFullYear()} TattvaCo · Culture Lives in Connections
    </p>
  </div>
</body>
</html>
`;
      const fromAddr = e.from || "TattvaCo <onboarding@resend.dev>";
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: fromAddr,
          to: [to],
          subject: `Your TattvaCo verification code: ${code}`,
          html,
          text: `Your TattvaCo verification code is ${code}. It expires in ${minutes} minutes. ${
            confirmUrl ? `Or verify directly on this device: ${confirmUrl}` : ""
          }`,
        }),
        signal: AbortSignal.timeout(10_000),
      });

      if (res.ok) {
        log.info("email.resend_delivered", { to });
        return { ok: true };
      }
      log.warn("email.resend_warn", { status: res.status });
    } catch (err) {
      log.warn("email.resend_error", { error: (err as Error).name });
    }
  }

  // 2. Supabase Auth Fallback
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      const appUrl = config().appUrl;
      const { error } = await supabase.auth.signInWithOtp({
        email: to,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${appUrl}/auth/callback`,
        },
      });
      if (!error) return { ok: true };
      log.warn("supabase.email_error", { error: error.message });
    } catch (err) {
      log.warn("supabase.email_error", { error: (err as Error).name });
    }
  }

  if (config().isProd) return { ok: false, reason: "not_configured" };
  return devOutbox("email", to, code);
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
