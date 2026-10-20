import { ConnectionBodySchema, StoryBodySchema, type ClaimDef } from "./types";

/**
 * Automated part of the flagship story checklist (PRD Appendix A) and connection
 * quality rules (Design §10). Any failing item blocks approval. Human-judgement items
 * (cultural nuance, language review) are confirmed separately by the reviewer.
 */
export type ChecklistItem = { id: string; ok: boolean; detail?: string };

type SourceLookup = (id: string) => { url: string | null; citation: string | null } | undefined;

function paragraphs(kind: "story" | "connection", body: unknown) {
  if (kind === "story") return StoryBodySchema.parse(body).sections.flatMap((s) => s.paragraphs);
  const c = ConnectionBodySchema.parse(body);
  return [...c.rationale, ...c.whyItMatters];
}

export function runChecklist(
  kind: "story" | "connection",
  body: unknown,
  claims: Pick<ClaimDef, "key" | "evidence">[],
  sources: SourceLookup,
): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  const schema = kind === "story" ? StoryBodySchema : ConnectionBodySchema;
  const parsed = schema.safeParse(body);
  items.push({ id: "structure_valid", ok: parsed.success, detail: parsed.success ? undefined : parsed.error.issues[0]?.message });
  if (!parsed.success) return items;

  const keys = new Set(claims.map((c) => c.key));
  const referenced = paragraphs(kind, body).flatMap((p) => p.claims);
  const dangling = referenced.filter((k) => !keys.has(k));
  items.push({ id: "claim_refs_resolve", ok: dangling.length === 0, detail: dangling.join(", ") || undefined });

  const unsupported = claims.filter((c) => !c.evidence.some((e) => e.relation === "supports")).map((c) => c.key);
  items.push({ id: "claims_have_support", ok: unsupported.length === 0, detail: unsupported.join(", ") || undefined });

  const missingSources = claims.flatMap((c) => c.evidence).filter((e) => !sources(e.source)).map((e) => e.source);
  items.push({ id: "sources_exist", ok: missingSources.length === 0, detail: [...new Set(missingSources)].join(", ") || undefined });

  const unlocatable = claims
    .flatMap((c) => c.evidence)
    .filter((e) => {
      const s = sources(e.source);
      return s && !s.url && !s.citation;
    })
    .map((e) => e.source);
  items.push({ id: "sources_locatable", ok: unlocatable.length === 0, detail: [...new Set(unlocatable)].join(", ") || undefined });

  items.push({ id: "has_claims", ok: claims.length > 0 });

  if (kind === "story") {
    const s = StoryBodySchema.parse(body);
    const kinds = new Set(s.sections.map((x) => x.kind));
    items.push({ id: "has_narrative", ok: kinds.has("narrative") });
    items.push({ id: "has_significance", ok: kinds.has("significance") });
  } else {
    const c = ConnectionBodySchema.parse(body);
    items.push({ id: "has_rationale", ok: c.rationale.some((p) => p.claims.length > 0), detail: "rationale must cite claims" });
    items.push({ id: "has_does_not_establish", ok: c.doesNotEstablish.trim().length >= 10 });
    items.push({ id: "distinct_subjects", ok: c.from.entity !== c.to.entity });
  }
  return items;
}

export const HUMAN_CHECKS = [
  { id: "read_sources", label: "I have read the cited sources and they support the linked claims." },
  { id: "epistemic_labels", label: "Evidence, tradition and interpretation are distinguished appropriately." },
  { id: "perspectives", label: "Credible disagreement and regional variation are represented where relevant." },
  { id: "language_review", label: "This language version has been reviewed for terminology and nuance." },
] as const;
