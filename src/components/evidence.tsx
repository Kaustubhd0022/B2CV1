import Link from "next/link";
import type { ClaimWithEvidence } from "@/lib/content/repo";
import type { Translate } from "@/lib/i18n/t";
import { languageInfo } from "@/lib/i18n/languages";
import { EpistemicLabel } from "./ui";

/**
 * A paragraph with its claims made inspectable at the point of reading (IA §4: source
 * inspection must be reachable from the claim it supports, not a generic bibliography).
 */
export function ClaimedParagraph({
  text,
  claimKeys,
  claims,
  t,
  from,
}: {
  text: string;
  claimKeys: string[];
  claims: Map<string, ClaimWithEvidence>;
  t: Translate;
  from: string;
}) {
  const list = claimKeys.map((k) => claims.get(k)).filter((c): c is ClaimWithEvidence => !!c);
  return (
    <div className="mt-4">
      <p className="text-body">{text}</p>
      {list.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-2">
          {list.map((c) => (
            <li key={c.key} className="w-full sm:w-auto">
              <ClaimDisclosure claim={c} t={t} from={from} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function ClaimDisclosure({ claim, t, from }: { claim: ClaimWithEvidence; t: Translate; from: string }) {
  const supports = claim.evidence.filter((e) => e.relation === "supports");
  return (
    <details className="group rounded-md border border-border bg-surface open:w-full open:shadow-md">
      <summary className="flex min-h-9 cursor-pointer list-none items-center gap-2 px-2.5 py-1 text-meta font-semibold text-gold [&::-webkit-details-marker]:hidden">
        <EpistemicLabel kind={claim.epistemic} label={t(`epistemic.${claim.epistemic}`)} />
        <span>
          {t("story.claimSources")} ({supports.length})
        </span>
      </summary>
      <div className="border-t border-border px-3 py-3 text-support">
        <p className="font-semibold text-charcoal">{claim.text}</p>
        {claim.scopeNote && <p className="mt-1 text-muted">{claim.scopeNote}</p>}
        <ul className="mt-2 space-y-3">
          {claim.evidence.map((e, i) => (
            <li key={i} className="border-l-2 border-gold/40 pl-3">
              <blockquote className="text-charcoal" lang={e.source.language}>
                “{e.excerpt}”
              </blockquote>
              <p className="mt-1 text-meta text-muted">
                {e.source.title}
                {e.source.publisher ? ` · ${e.source.publisher}` : ""}
                {e.locator ? ` · ${e.locator}` : ""}
              </p>
              {e.limitation && (
                <p className="mt-1 text-meta text-warning">
                  {t("source.limitation")}: {e.limitation}
                </p>
              )}
              <Link
                href={`/sources/${e.source.id}?from=${encodeURIComponent(from)}`}
                className="mt-1 inline-flex min-h-9 items-center text-meta font-semibold text-gold underline underline-offset-4 hover:text-gold-hover"
              >
                {t("source.title")} →
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </details>
  );
}

/** Compact list of all sources used, for the desktop side panel and page end. */
export function SourceList({ claims, t, from, uiLang }: { claims: Map<string, ClaimWithEvidence>; t: Translate; from: string; uiLang: string }) {
  const sources = new Map<string, ClaimWithEvidence["evidence"][number]["source"]>();
  for (const c of claims.values()) for (const e of c.evidence) sources.set(e.source.id, e.source);
  if (!sources.size) return null;
  return (
    <ol className="space-y-3">
      {[...sources.values()].map((s, i) => (
        <li key={s.id} className="text-support">
          <span className="mr-1 text-meta font-semibold text-muted">{i + 1}.</span>
          <Link href={`/sources/${s.id}?from=${encodeURIComponent(from)}`} className="font-semibold text-gold underline-offset-4 hover:underline">
            {s.title}
          </Link>
          <span className="block text-meta text-muted">
            {[s.publisher, t(`source.type.${s.sourceType}`)].filter(Boolean).join(" · ")}
            {s.language !== uiLang ? ` · ${t("source.language", { language: languageInfo(s.language).english })}` : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function EpistemicLegend({ t }: { t: Translate }) {
  return (
    <details className="rounded-md border border-border bg-surface-2 px-3 py-2 text-support">
      <summary className="cursor-pointer font-semibold text-gold">{t("epistemic.help")}</summary>
      <div className="mt-2 flex flex-wrap gap-2">
        {(["documented", "tradition", "interpretation", "contested", "uncertain"] as const).map((k) => (
          <EpistemicLabel key={k} kind={k} label={t(`epistemic.${k}`)} />
        ))}
      </div>
      <p className="mt-2 text-muted">{t("epistemic.helpBody")}</p>
    </details>
  );
}
