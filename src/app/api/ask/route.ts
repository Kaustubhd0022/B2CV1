import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { config } from "@/lib/config";
import { currentSession } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { getConnection, getStory } from "@/lib/content/repo";
import { runAsk, validateQuestion } from "@/lib/ai/pipeline";
import { rateLimit } from "@/lib/ratelimit";
import { track } from "@/lib/analytics";
import { log } from "@/lib/log";

export const maxDuration = 120;

/**
 * POST /api/ask  { question, context?: "story:<slug>"|"connection:<slug>", newTopic?: boolean }
 * Streams NDJSON: {"type":"stage","stage":...}* then {"type":"result","result":...} or {"type":"error",...}.
 * Stages report progress only; they never imply verification.
 */
export async function POST(request: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!session.language) return NextResponse.json({ error: "language_required" }, { status: 400 });
  const lang = session.language;

  const body = (await request.json().catch(() => null)) as { question?: unknown; context?: unknown; newTopic?: unknown } | null;
  const v = validateQuestion(body?.question);
  if (!v.ok) return NextResponse.json({ error: v.error }, { status: 400 });

  const c = config().ai;
  const minute = rateLimit(`ask:m:${session.sessionId}`, c.rateLimitPerMinute, 60_000);
  const day = minute.ok ? rateLimit(`ask:d:${session.userId}`, c.rateLimitPerDay, 86_400_000) : minute;
  if (!minute.ok || !day.ok) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const db = await getDb();
  let context: typeof schema.sessions.$inferSelect.askContext = [];
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.sessionId);
  if (isUuid && body?.newTopic !== true) {
    try {
      const [row] = await db.select({ ctx: schema.sessions.askContext }).from(schema.sessions).where(eq(schema.sessions.id, session.sessionId));
      if (row?.ctx) context = row.ctx.slice(-c.sessionContextTurns);
    } catch {
      // In stateless or ephemeral mode, sessions table might not have this row
    }
  }

  let focus: string | undefined;
  const m = typeof body?.context === "string" ? /^(story|connection):([a-z0-9-]{1,120})$/.exec(body.context) : null;
  if (m) {
    const res = m[1] === "story" ? await getStory(m[2], lang, true) : await getConnection(m[2], lang, true);
    if (res.status === "ok") focus = res.body.title;
  }

  await track("ask_submitted", { language: lang, follow_up: context.length > 0 }, session.analyticsId);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (obj: unknown) => controller.enqueue(encoder.encode(JSON.stringify(obj) + "\n"));
      try {
        const { result, contextTurn } = await runAsk({ question: v.question, lang, context, focus, onStage: (stage) => send({ type: "stage", stage }) });
        // Session-only AI context (FR-17): stored on the session row, deleted with the session.
        if (isUuid) {
          try {
            const next = contextTurn ? [...context, contextTurn].slice(-c.sessionContextTurns) : context;
            await db.update(schema.sessions).set({ askContext: next }).where(eq(schema.sessions.id, session.sessionId));
          } catch {
            // DB session update non-blocking
          }
        }
        await track("answer_outcome", { outcome: result.outcome, risk: result.risk, language: lang }, session.analyticsId);
        send({ type: "result", result });
      } catch (err) {
        log.error("ask.unhandled", { error: (err as Error).name });
        send({ type: "error", error: "service_failure" });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "Content-Type": "application/x-ndjson; charset=utf-8", "Cache-Control": "no-store" } });
}

/** Clears the session's AI context ("Start a new topic"). */
export async function DELETE() {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.sessionId);
  if (isUuid) {
    try {
      const db = await getDb();
      await db.update(schema.sessions).set({ askContext: [] }).where(eq(schema.sessions.id, session.sessionId));
    } catch {}
  }
  return NextResponse.json({ ok: true });
}
