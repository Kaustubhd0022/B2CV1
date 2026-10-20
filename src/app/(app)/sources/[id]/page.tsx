import type { Metadata } from "next";
import Link from "next/link";
import { pageContext, formatDate } from "@/lib/page";
import { getSource, sourceUsage } from "@/lib/content/repo";
import { languageInfo } from "@/lib/i18n/languages";
import type { MessageKey } from "@/lib/i18n/t";
import { track } from "@/lib/analytics";
import { IconExternal, IconFlag } from "@/components/icons";
import { BackLink, EpistemicLabel, Notice, Page, SectionTitle } from "@/components/ui";
import { Unavailable } from "@/components/unavailable";

export const metadata: Metadata = { title: "Source" };

/** "story:slug" / "connection:slug" → back link to the claim's context. */
function backFrom(from: string | undefined) {
  const m = /^(story|connection):([a-z0-9-]+)$/.exec(from ?? "");
  return m ? { href: `/${m[1] === "story" ? "stories" : "connections"}/${m[2]}`, kind: m[1], slug: m[2] } : null;
}

export default async function SourcePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ from?: string }> }) {
  const { session, lang, t } = await pageContext();
  const { id } = await params;
  const from = backFrom((await searchParams).from);
  const source = await getSource(id);
  if (!source) return <Unavailable title={t("source.notFound")} body={t("story.unavailableBody")} t={t} />;
  const usage = await sourceUsage(id);
  // Claims from the item the reader came from are listed first.
  const isFrom = (u: (typeof usage)[number]) => !!from && u.kind === from.kind && u.slug === from.slug;
  const ordered = [...usage.filter(isFrom), ...usage.filter((u) => !isFrom(u))];
  await track("source_open", { source: id, context: from?.kind ?? "direct" }, session.analyticsId);

  return (
    <Page className="prose-reading">
      {from && <BackLink href={from.href} label={t("nav.back")} />}
      <p className="mt-2 text-meta font-semibold uppercase tracking-[0.12em] text-terracotta-text">{t("source.title")}</p>
      <h1 lang={source.language} className="mt-2 font-serif text-page font-semibold">
        {source.title}
      </h1>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-support">
        {(source.creator || source.publisher) && (
          <>
            <dt className="text-muted">{t("source.by")}</dt>
            <dd>{[source.creator, source.publisher].filter(Boolean).join(" · ")}</dd>
          </>
        )}
        <dt className="text-muted">{t("source.type")}</dt>
        <dd>{t(`source.type.${source.sourceType}` as MessageKey)}</dd>
        <dt className="text-muted">{t("source.languageLabel")}</dt>
        <dd>{languageInfo(source.language).english}</dd>
        {source.publishedDate && (
          <>
            <dt className="text-muted">{t("source.published")}</dt>
            <dd>{source.publishedDate}</dd>
          </>
        )}
        {source.accessedDate && (
          <>
            <dt className="text-muted">{t("source.accessedLabel")}</dt>
            <dd>{source.accessedDate}</dd>
          </>
        )}
      </dl>

      <div className="mt-4 space-y-2">
        {source.language !== lang && <Notice>{t("source.languageDiffers", { language: languageInfo(source.language).english })}</Notice>}
        {source.linkStatus === "broken" && (
          <Notice tone="warning" role="status">
            {t("source.linkBroken", { date: formatDate(source.linkCheckedAt, lang) })}
          </Notice>
        )}
      </div>

      {source.url ? (
        <a href={source.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-forest px-4 font-semibold text-on-forest hover:bg-forest-hover">
          {t("source.open")} <IconExternal width={18} height={18} />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      ) : (
        <p className="mt-4 text-support text-muted">{source.citation ?? t("source.noUrl")}</p>
      )}
      {source.linkStatus === "unchecked" && source.url && <p className="mt-1 text-meta text-muted">{t("source.linkUnchecked")}</p>}

      {source.assessment && (
        <section className="mt-8">
          <SectionTitle>{t("source.interpretTitle")}</SectionTitle>
          <p className="mt-2 text-body">{source.assessment}</p>
          <p className="mt-2 text-support text-muted">{t("source.interpretBody")}</p>
        </section>
      )}

      <section className="mt-8" aria-labelledby="claims-title">
        <SectionTitle id="claims-title">{t("source.claim")}</SectionTitle>
        <ul className="mt-4 space-y-4">
          {ordered.map((u, i) => (
            <li key={i} className="rounded-md border border-border bg-surface p-4">
              <div className="flex flex-wrap items-center gap-2">
                <EpistemicLabel kind={u.epistemic} label={t(`epistemic.${u.epistemic}`)} />
                <Link href={`/${u.kind === "story" ? "stories" : "connections"}/${u.slug}`} className="text-meta font-semibold text-forest underline-offset-4 hover:underline">
                  {(u.body as { title: string }).title}
                </Link>
              </div>
              <p className="mt-2 font-semibold">{u.claimText}</p>
              {u.excerpt && (
                <>
                  <p className="mt-2 text-meta font-semibold text-muted">{t("source.excerpt")}</p>
                  <blockquote lang={source.language} className="border-l-2 border-forest/40 pl-3 text-support">
                    “{u.excerpt}”{u.locator ? <span className="block text-meta text-muted">{u.locator}</span> : null}
                  </blockquote>
                </>
              )}
              {u.limitation && (
                <p className="mt-2 text-support text-warning">
                  {t("source.limitation")}: {u.limitation}
                </p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <Link href={`/report?type=source&ref=${encodeURIComponent(id)}`} className="mt-8 inline-flex min-h-11 items-center gap-2 text-support font-semibold text-forest underline-offset-4 hover:underline">
        <IconFlag width={18} height={18} /> {t("source.report")}
      </Link>
    </Page>
  );
}
