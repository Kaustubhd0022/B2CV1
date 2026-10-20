import { NextResponse, type NextRequest } from "next/server";
import { currentSession } from "@/lib/auth/session";
import { createReport, ReportInputSchema } from "@/lib/reports";
import { rateLimit } from "@/lib/ratelimit";
import { track } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  const session = await currentSession();
  if (!session) return NextResponse.json({ error: "unauthenticated" }, { status: 401 });
  if (!rateLimit(`report:${session.sessionId}`, 10, 60 * 60_000).ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }
  const json = await request.json().catch(() => null);
  const parsed = ReportInputSchema.safeParse(json);
  if (!parsed.success) return NextResponse.json({ error: "invalid", fields: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 400 });
  const id = await createReport(parsed.data);
  await track("report_submitted", { target_type: parsed.data.targetType, category: parsed.data.category }, session.analyticsId);
  return NextResponse.json({ ok: true, id });
}
