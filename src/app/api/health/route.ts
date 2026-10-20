import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { getDb } from "@/lib/db/client";
import { config } from "@/lib/config";

/** Liveness/readiness. Reports which integrations are configured — never their values. */
export async function GET() {
  const c = config();
  let database = "ok";
  try {
    const db = await getDb();
    await db.execute(sql`select 1`);
  } catch {
    database = "error";
  }
  const body = {
    status: database === "ok" ? "ok" : "degraded",
    database,
    integrations: {
      llm: c.ai.provider,
      retrieval: c.ai.retrievalProviders,
      email: c.auth.email.provider || "none",
      sms: c.auth.sms.provider || "none",
      google: !!c.auth.google.clientId,
      apple: !!c.auth.apple.clientId,
    },
  };
  return NextResponse.json(body, { status: database === "ok" ? 200 : 503 });
}
