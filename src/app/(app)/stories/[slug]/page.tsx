import type { Metadata } from "next";
import Link from "next/link";
import { pageContext, formatDate } from "@/lib/page";
import { cardsBySlugs, claimsForVersion, getCity, getStory, localName } from "@/lib/content/repo";
import { languageInfo } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import type { MessageKey } from "@/lib/i18n/t";
import { ConnectionCard, StoryCard } from "@/components/cards";
import { ClaimedParagraph, EpistemicLegend, SourceList } from "@/components/evidence";
import { QuestionComposer } from "@/components/composer";
import { ShareButton } from "@/components/share";
import { IconFlag } from "@/components/icons";
import { Notice, Page, SectionTitle } from "@/components/ui";
import { FactPills, PhotoHero } from "@/components/hero";
import { OtherLanguagesAvailable, Unavailable } from "@/components/unavailable";

export const metadata: Metadata = { title: "Story" };

export default async function StoryPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ all?: string }> }) {
  const { session, lang, t } = await pageContext();
  const { slug } = await params;
  const allowOther = (await searchParams).all === "1";
  const res = await getStory(slug, lang, allowOther);

  if (res.status === "unavailable") return <Unavailable title={t("story.unavailable")} body={t("story.unavailableBody")} t={t} back={{ href: "/explore", label: t("explore.title") }} />;
  if (res.status === "other_languages") return <OtherLanguagesAvailable available={res.available} selected={lang} href={`/stories/${slug}?all=1`} t={t} />;

  const { row, body, shownLanguage } = res;
  const [claims, city, connections, related] = await Promise.all([
    claimsForVersion(row.versionId),
    row.citySlug ? getCity(row.citySlug) : null,
    cardsBySlugs("connection", body.connections, lang),
    cardsBySlugs("story", body.relatedStories, lang),
  ]);
  const cityName = city ? localName(city.names, lang) : "";
  const from = `story:${slug}`;
  await track("story_view", { story: slug, language: shownLanguage, fixture: row.isFixture }, session.analyticsId);

  return (
    <Page className="pt-0 sm:pt-4">
      <PhotoHero
        image={body.hero ?? city?.image}
        back={city ? { href: `/cities/${city.slug}`, label: cityName } : { href: "/explore", label: t("nav.back") }}
        eyebrow={t("story.label", { city: cityName })}
        title={body.title}
        lang={shownLanguage}
      >
        {body.orientation}
      </PhotoHero>
      <FactPills
        items={[
          { label: t("story.factSections"), value: body.sections.length },
          { label: t("story.factSources"), value: new Set([...claims.values()].flatMap((c) => c.evidence.map((e) => e.sourceId))).size },
          { label: t("story.factConnections"), value: connections.length },
          { label: t("story.factLanguage"), value: languageInfo(shownLanguage).native },
        ]}
      />

      {row.isFixture && (
        <Notice tone="warning" className="mt-2" title={t("common.devFixture")}>
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
          <p className="text-meta text-muted">{t("story.version", { version: row.versionNo, date: formatDate(row.approvedAt, lang) })}</p>

          <div className="mt-5">
            <EpistemicLegend t={t} />
          </div>

          {body.sections.map((sec) => (
            <section key={sec.id} className="mt-8" aria-labelledby={`sec-${sec.id}`}>
              <SectionTitle id={`sec-${sec.id}`}>{sec.heading}</SectionTitle>
              {sec.paragraphs.map((p, i) => (
                <ClaimedParagraph key={i} text={p.text} claimKeys={p.claims} claims={claims} t={t} from={from} />
              ))}
            </section>
          ))}

          <section className="mt-10" aria-labelledby="connections-title">
            <SectionTitle id="connections-title">{t("story.connections")}</SectionTitle>
            {connections.length ? (
              <ul className="mt-4 grid gap-3">
                {connections.map((c) => (
                  <li key={c.slug}>
                    <ConnectionCard
                      href={`/connections/${c.slug}`}
                      title={c.title}
                      summary={c.summary}
                      typeLabel={c.relationshipType ? t(`connection.type.${c.relationshipType}` as MessageKey) : undefined}
                      cta={t("home.exploreConnection")}
                      fixtureLabel={c.isFixture ? t("common.devFixture") : undefined}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-support text-muted">{t("story.noConnections")}</p>
            )}
          </section>

          <section className="mt-10" aria-labelledby="deeper-title">
            <SectionTitle id="deeper-title">{t("story.goDeeper")}</SectionTitle>
            <div className="mt-4">
              <QuestionComposer
                label={t("story.goDeeperHint")}
                placeholder={body.followUpQuestions[0] ?? t("ask.placeholder")}
                languageNote={t("ask.responseLanguage", { language: languageInfo(lang).native })}
                submitLabel={t("ask.submit")}
                context={from}
              />
            </div>
            {body.followUpQuestions.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {body.followUpQuestions.map((q) => (
                  <li key={q}>
                    <Link href={`/ask?q=${encodeURIComponent(q)}&context=${encodeURIComponent(from)}`} className="inline-flex min-h-11 items-center rounded-full border border-border bg-surface px-3 text-support text-forest hover:border-forest">
                      {q}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {related.length > 0 && (
            <section className="mt-10" aria-labelledby="related-title">
              <SectionTitle id="related-title">{t("story.related")}</SectionTitle>
              <ul className="mt-4 grid gap-3">
                {related.map((s) => (
                  <li key={s.slug}>
                    <StoryCard href={`/stories/${s.slug}`} title={s.title} summary={s.summary} fixtureLabel={s.isFixture ? t("common.devFixture") : undefined} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="sticky bottom-24 z-30 mt-10 md:bottom-6">
            <Link href={`/ask?context=${encodeURIComponent(from)}`} className="glass flex min-h-14 items-center justify-center rounded-full text-support font-semibold text-charcoal shadow-2xl shadow-black/50 hover:bg-surface-2">
              {t("story.askAbout")}
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-border pt-6">
            <ShareButton
              path={`/s/story/${slug}`}
              kind="story"
              title={body.title}
              summary={body.orientation}
              labels={{
                share: t("story.share"),
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
            <Link href={`/report?type=story&ref=${encodeURIComponent(slug)}`} className="inline-flex min-h-11 items-center gap-2 px-1 text-support font-semibold text-forest underline-offset-4 hover:underline">
              <IconFlag width={18} height={18} /> {t("story.report")}
            </Link>
          </div>
        </div>

        <aside className="mt-10 lg:mt-0" aria-labelledby="sources-title">
          <div className="rounded-lg border border-border bg-surface p-4 lg:sticky lg:top-4">
            <h2 id="sources-title" className="font-serif text-card font-semibold">
              {t("story.sources")}
            </h2>
            <div className="mt-3">
              <SourceList claims={claims} t={t} from={from} uiLang={lang} />
            </div>
            <p className="mt-4 text-meta text-muted">{t("source.interpretBody")}</p>
          </div>
        </aside>
      </article>
    </Page>
  );
}
