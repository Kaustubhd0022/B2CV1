"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { requireEditor } from "@/lib/auth/session";
import { getDb, schema } from "@/lib/db/client";
import { approve, openCorrection, publish, requestChanges, submitForReview, withdraw, WorkflowError, type Actor } from "@/lib/content/workflow";
import { HUMAN_CHECKS } from "@/lib/content/checklist";
import { proposeConnection } from "@/lib/content/propose";

async function actor(): Promise<Actor> {
  const s = await requireEditor();
  return { id: s.userId, label: s.email ?? s.phone ?? s.userId, role: "editor" };
}

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();

async function run(itemId: string, fn: () => Promise<unknown>) {
  try {
    await fn();
  } catch (err) {
    if (err instanceof WorkflowError) {
      const detail = Array.isArray(err.details) ? err.details.map((d) => (typeof d === "string" ? d : (d as { id: string }).id)).join(",") : "";
      redirect(`/editorial/items/${itemId}?error=${err.code}&detail=${encodeURIComponent(detail)}`);
    }
    throw err;
  }
  revalidatePath(`/editorial/items/${itemId}`);
  redirect(`/editorial/items/${itemId}?ok=1`);
}

export async function submitAction(f: FormData) {
  const a = await actor();
  await run(str(f, "itemId"), () => submitForReview(str(f, "versionId"), a));
}

export async function requestChangesAction(f: FormData) {
  const a = await actor();
  await run(str(f, "itemId"), () => requestChanges(str(f, "versionId"), a, str(f, "notes").slice(0, 2000)));
}

export async function approveAction(f: FormData) {
  const a = await actor();
  const humanChecks = Object.fromEntries(HUMAN_CHECKS.map((h) => [h.id, f.get(`hc_${h.id}`) === "on"]));
  await run(str(f, "itemId"), () => approve(str(f, "versionId"), a, { notes: str(f, "notes").slice(0, 2000) || undefined, humanChecks }));
}

export async function publishAction(f: FormData) {
  const a = await actor();
  await run(str(f, "itemId"), () => publish(str(f, "versionId"), a));
}

export async function withdrawAction(f: FormData) {
  const a = await actor();
  const notes = str(f, "notes");
  if (notes.length < 5) redirect(`/editorial/items/${str(f, "itemId")}?error=notes_required`);
  await run(str(f, "itemId"), () => withdraw(str(f, "versionId"), a, notes.slice(0, 2000)));
}

export async function correctionAction(f: FormData) {
  const a = await actor();
  await run(str(f, "itemId"), () => openCorrection(str(f, "versionId"), a));
}

const REPORT_STATUSES = ["new", "triaged", "in_progress", "resolved", "dismissed"] as const;

export async function updateReportAction(f: FormData) {
  const a = await actor();
  const status = str(f, "status") as (typeof REPORT_STATUSES)[number];
  if (!REPORT_STATUSES.includes(status)) redirect("/editorial/reports?error=bad_status");
  const id = str(f, "reportId");
  const db = await getDb();
  await db
    .update(schema.reports)
    .set({ status, resolutionNote: str(f, "note").slice(0, 2000) || null, updatedAt: new Date() })
    .where(eq(schema.reports.id, id));
  await db.insert(schema.auditLog).values({ actorId: a.id, actorLabel: a.label, action: `report_${status}`, targetType: "report", targetId: id });
  revalidatePath("/editorial/reports");
  redirect("/editorial/reports?ok=1");
}

export async function proposeAction(f: FormData) {
  const a = await actor();
  const from = str(f, "from");
  const to = str(f, "to");
  if (!from || !to || from === to) redirect("/editorial/propose?error=pick_two");
  const r = await proposeConnection(from, to, a.label);
  if (!r.ok) redirect(`/editorial/propose?error=${r.error}&detail=${encodeURIComponent(r.detail ?? "")}`);
  redirect(`/editorial/items/${r.itemId}?ok=proposed`);
}
