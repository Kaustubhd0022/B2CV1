import "server-only";
import { z } from "zod";
import { getDb, schema } from "@/lib/db/client";
import { isLanguageCode } from "@/lib/i18n/languages";

export const REPORT_CATEGORIES = schema.reportCategory.enumValues;

/** Design's six categories mapped onto the PRD FR-19 four (factual, source, cultural context, translation). */
export const CATEGORY_TO_PRD: Record<(typeof REPORT_CATEGORIES)[number], string> = {
  unsupported_claim: "factual",
  broken_source: "source",
  misleading_connection: "cultural_context",
  missing_perspective: "cultural_context",
  translation: "translation",
  other: "other",
};

const SnapshotSchema = z
  .object({
    question: z.string().max(500),
    answer: z.string().max(8000),
    sources: z.array(z.object({ title: z.string().max(300), url: z.string().max(1000).nullable() })).max(20),
    outcome: z.string().max(40),
  })
  .strict();

export const ReportInputSchema = z.object({
  targetType: z.enum(["story", "connection", "answer", "source", "product"]),
  targetRef: z.string().min(1).max(160).regex(/^[A-Za-z0-9:_-]+$/),
  category: z.enum(REPORT_CATEGORIES),
  details: z.string().max(2000).optional().default(""),
  language: z.string().refine(isLanguageCode),
  snapshot: SnapshotSchema.nullable().optional(),
});
export type ReportInput = z.infer<typeof ReportInputSchema>;

/** Stores a report. No user id is attached: reports are anonymous by design (FR-19). */
export async function createReport(input: ReportInput) {
  const db = await getDb();
  const [row] = await db
    .insert(schema.reports)
    .values({
      targetType: input.targetType,
      targetRef: input.targetRef,
      category: input.category,
      details: input.details?.trim() || null,
      snapshot: input.targetType === "answer" ? (input.snapshot ?? null) : null,
      language: input.language,
    })
    .returning({ id: schema.reports.id });
  return row.id;
}
