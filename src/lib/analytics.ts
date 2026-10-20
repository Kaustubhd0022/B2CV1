import "server-only";
import { getDb, schema } from "@/lib/db/client";
import { log } from "@/lib/log";

/**
 * Privacy-conscious analytics (FR-20). Allow-listed events and properties only.
 * Never: user ids, emails, phone numbers, question text, answer text.
 * sessionRef is the session's random analyticsId, so journey stages can be counted per
 * session without building a cross-session interest profile.
 */
export const EVENTS = {
  auth_start: ["method"],
  auth_success: ["method", "new_account"],
  auth_failure: ["method", "reason"],
  language_selected: ["language"],
  home_view: [],
  city_view: ["city"],
  story_view: ["story", "language", "fixture"],
  connection_view: ["connection", "language"],
  source_open: ["source", "context"],
  ask_submitted: ["language", "follow_up"],
  answer_outcome: ["outcome", "risk", "language"],
  share_click: ["kind", "method"],
  report_submitted: ["target_type", "category"],
} as const;

export type EventName = keyof typeof EVENTS;
type Props = Record<string, string | number | boolean>;

export function sanitizeProps(name: EventName, props: Props = {}): Props {
  const allowed = EVENTS[name] as readonly string[];
  const out: Props = {};
  for (const k of allowed) {
    const v = props[k];
    if (typeof v === "string") out[k] = v.slice(0, 80);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return out;
}

export async function track(name: EventName, props: Props = {}, sessionRef?: string | null) {
  try {
    const db = await getDb();
    await db.insert(schema.analyticsEvents).values({ name, props: sanitizeProps(name, props), sessionRef: sessionRef ?? null });
  } catch (err) {
    // Analytics must never break the user journey.
    log.warn("analytics.failed", { event: name, error: (err as Error).name });
  }
}
