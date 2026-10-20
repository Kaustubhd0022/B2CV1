import { NextResponse, type NextRequest } from "next/server";
import { currentSession } from "@/lib/auth/session";
import { EVENTS, track, type EventName } from "@/lib/analytics";
import { rateLimit } from "@/lib/ratelimit";

/** Client-originated analytics (currently share clicks). Allow-listed names only. */
const CLIENT_EVENTS: EventName[] = ["share_click"];

export async function POST(request: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!rateLimit(`events:${session.sessionId}`, 60, 60_000).ok) return NextResponse.json({ ok: false }, { status: 429 });
  const body = (await request.json().catch(() => null)) as { name?: string; props?: Record<string, unknown> } | null;
  const name = body?.name as EventName;
  if (!name || !(name in EVENTS) || !CLIENT_EVENTS.includes(name)) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const props = Object.fromEntries(
    Object.entries(body?.props ?? {}).filter(([, v]) => ["string", "number", "boolean"].includes(typeof v)),
  ) as Record<string, string | number | boolean>;
  await track(name, props, session.analyticsId);
  return NextResponse.json({ ok: true });
}
