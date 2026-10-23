import type { Metadata } from "next";
import Link from "next/link";
import { pageContext } from "@/lib/page";
import { cardsBySlugs, claimsForVersion, getConnection } from "@/lib/content/repo";
import { languageInfo } from "@/lib/i18n/languages";
import type { MessageKey } from "@/lib/i18n/t";
import { track } from "@/lib/analytics";
import { StoryCard } from "@/components/cards";
import { ClaimedParagraph, EpistemicLegend, SourceList } from "@/components/evidence";
import { ShareButton } from "@/components/share";
import { IconConnect, IconFlag } from "@/components/icons";
import { Eyebrow, Notice, Page, SectionTitle } from "@/components/ui";
import { OtherLanguagesAvailable, Unavailable } from "@/components/unavailable";

export const metadata: Metadata = { title: "Connection" };

export default async function ConnectionPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ all?: string }> }) {
  const { session, lang, t } = await pageContext();
  const { slug } = await params;
  const res = await getConnection(slug, lang, (await searchParams).all === "1");
  if (res.status === "unavailable") return <Unavailable title={t("connection.unavailable")} body={t("story.unavailableBody")} t={t} />;
  if (res.status === "other_languages") return <OtherLanguagesAvailable available={res.available} selected={lang} href={`/connections/${slug}?all=1`} t={t} />;

  const { row, body, shownLanguage } = res;
  const [claims, related] = await Promise.all([claimsForVersion(row.versionId), cardsBySlugs("story", body.relatedStories, lang)]);
  const from = `connection:${slug}`;
  const typeLabel = t(`connection.type.${body.relationshipType}` as MessageKey);
  await track("connection_view", { connection: slug, language: shownLanguage }, session.analyticsId);

  const parentStory = related[0];

  return (
    <Page className="max-w-[1280px]">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-meta text-muted">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span>›</span>
        <Link href="/explore" className="hover:text-charcoal transition-colors">
          Stories
        </Link>
        {parentStory && (
          <>
            <span>›</span>
            <Link href={`/stories/${parentStory.slug}`} className="hover:text-charcoal transition-colors truncate max-w-xs">
              {parentStory.title}
            </Link>
          </>
        )}
        <span>›</span>
        <span className="font-semibold text-charcoal truncate max-w-xs">{body.title}</span>
      </nav>

      {/* Primary Return Button */}
      {parentStory && (
        <div className="mb-3">
          <Link
            href={`/stories/${parentStory.slug}`}
            className="inline-flex items-center gap-1.5 text-support font-semibold text-gold hover:underline"
          >
            ← Return to Story: {parentStory.title}
          </Link>
        </div>
      )}

      {row.isFixture && (
        <Notice tone="info" className="mt-2" title={t("common.devFixture")}>
          {t("common.devFixtureLong")}
        </Notice>
      )}
      {shownLanguage !== lang && (
        <Notice className="mt-2" role="status">
          {t("story.languageNote", { shown: languageInfo(shownLanguage).native, selected: languageInfo(lang).native })}
        </Notice>
      )}

      <article lang={shownLanguage} className="mt-4 lg:grid lg:grid-cols-[minmax(0,1fr)_18rem] lg:gap-10">
        <div className="prose-reading">
          <Eyebrow>{t("connection.title")}</Eyebrow>

          {/* Relationship diagram: two subjects and an explicitly typed, explained link — not a bare graph edge. */}
          <figure className="mt-4 rounded-lg border border-border bg-surface p-4" aria-label={`${body.from.label} — ${typeLabel} — ${body.to.label}`}>
            <div className="grid items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
              <div className="rounded-md border border-forest/30 bg-forest/5 p-3 text-center font-semibold text-forest">{body.from.label}</div>
              <div className="flex flex-col items-center text-meta font-semibold text-terracotta-text">
                <IconConnect width={22} height={22} className="rotate-90 sm:rotate-0" />
                {typeLabel}
              </div>
              <div className="rounded-md border border-forest/30 bg-forest/5 p-3 text-center font-semibold text-forest">{body.to.label}</div>
            </div>
            <figcaption className="mt-3 text-meta text-muted">
              {t("connection.verified")}
              {row.isFixture ? ` — ${t("common.devFixture")}` : ""}
            </figcaption>
          </figure>

          <h1 className="mt-6 font-serif text-page font-semibold leading-tight md:text-page-lg">{body.title}</h1>
          <p className="mt-2 text-body text-muted">{body.summary}</p>

          <div className="mt-5">
            <EpistemicLegend t={t} />
          </div>

          <section className="mt-8" aria-labelledby="rel-title">
            <SectionTitle id="rel-title">{t("connection.relationship")}</SectionTitle>
            {body.rationale.map((p, i) => (
              <ClaimedParagraph key={i} text={p.text} claimKeys={p.claims} claims={claims} t={t} from={from} />
            ))}
          </section>

          <section className="mt-8" aria-labelledby="why-title">
            <SectionTitle id="why-title">{t("connection.whyMatters")}</SectionTitle>
            {body.whyItMatters.map((p, i) => (
              <ClaimedParagraph key={i} text={p.text} claimKeys={p.claims} claims={claims} t={t} from={from} />
            ))}
          </section>

          <section className="mt-8" aria-labelledby="ev-title">
            <SectionTitle id="ev-title">{t("connection.evidence")}</SectionTitle>
            <div className="mt-4 rounded-md border border-warning/40 bg-warning/5 p-4">
              <h3 className="font-semibold">{t("connection.notEstablish")}</h3>
              <p className="mt-1 text-support">{body.doesNotEstablish}</p>
            </div>
            {body.uncertainty && (
              <div className="mt-3 rounded-md border border-border bg-surface p-4">
                <h3 className="font-semibold">{t("connection.uncertainty")}</h3>
                <p className="mt-1 text-support">{body.uncertainty}</p>
              </div>
            )}
          </section>

          <section className="mt-10" aria-labelledby="cont-title">
            <SectionTitle id="cont-title">{t("connection.continue")}</SectionTitle>
            <ul className="mt-4 grid gap-3">
              {related.map((s) => (
                <li key={s.slug}>
                  <StoryCard href={`/stories/${s.slug}`} eyebrow={t("connection.readStory")} title={s.title} summary={s.summary} fixtureLabel={s.isFixture ? t("common.devFixture") : undefined} />
                </li>
              ))}
              <li>
                <Link
                  href={`/ask?q=${encodeURIComponent(`${body.from.label} and ${body.to.label}: what is the evidence for this relationship?`)}&context=${encodeURIComponent(from)}`}
                  className="block rounded-md border border-border bg-surface p-4 hover:border-forest"
                >
                  <span className="font-serif text-card font-semibold text-forest">{t("connection.ask")}</span>
                </Link>
              </li>
            </ul>
          </section>

          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            {parentStory && (
              <Link
                href={`/stories/${parentStory.slug}`}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
              >
                ← Return to Story: {parentStory.title}
              </Link>
            )}
            <div className="flex flex-wrap items-center gap-3">
            <ShareButton
              path={`/s/connection/${slug}`}
              kind="connection"
              title={body.title}
              summary={body.summary}
              labels={{
                share: t("connection.share"),
                title: t("share.title"),
                preview: t("share.preview"),
                url: t("share.url"),
                copy: t("share.copy"),
                copied: t("share.copied"),
                native: t("share.native"),
                privacy: t("share.privacy"),
                close: t("common.close"),
              }}
            />
            <Link href={`/report?type=connection&ref=${encodeURIComponent(slug)}`} className="inline-flex min-h-11 items-center gap-2 px-1 text-support font-semibold text-forest underline-offset-4 hover:underline">
              <IconFlag width={18} height={18} /> {t("story.report")}
            </Link>
          </div>
        </div>
      </div>

        <aside className="mt-10 lg:mt-0" aria-labelledby="csources-title">
          <div className="rounded-lg border border-border bg-surface p-4 lg:sticky lg:top-4">
            <h2 id="csources-title" className="font-serif text-card font-semibold">
              {t("connection.supporting")}
            </h2>
            <div className="mt-3">
              <SourceList claims={claims} t={t} from={from} uiLang={lang} />
            </div>
          </div>
        </aside>
      </article>
    </Page>
  );
}
