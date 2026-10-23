import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageContext, formatDate } from "@/lib/page";
import { cardsBySlugs, claimsForVersion, getCity, getStory, localName } from "@/lib/content/repo";
import { CITIES_CULTURAL_DATA } from "@/lib/content/city-data";
import { languageInfo } from "@/lib/i18n/languages";
import type { MessageKey } from "@/lib/i18n/t";
import { ConnectionCard } from "@/components/cards";
import { ClaimedParagraph, EpistemicLegend, SourceList } from "@/components/evidence";
import { QuestionComposer } from "@/components/composer";
import { ShareButton } from "@/components/share";
import { IconFlag, IconExplore } from "@/components/icons";
import { Notice, Page, SectionTitle } from "@/components/ui";
import { OtherLanguagesAvailable, Unavailable } from "@/components/unavailable";
import { StoryStatCards } from "@/components/story-stat-cards";
import { StoryTimeline } from "@/components/story-timeline";
import { StoryContextualAsk } from "@/components/story-contextual-ask";
import { StoryTableOfContents } from "@/components/story-table-of-contents";
import { StoryMiniMap } from "@/components/story-mini-map";

export const metadata: Metadata = { title: "Flagship Story · TattvaCo Cultural Discovery" };

export default async function StoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ all?: string }>;
}) {
  const { lang, t } = await pageContext();
  const { slug } = await params;
  const allowOther = (await searchParams).all === "1";
  const res = await getStory(slug, lang, allowOther);

  if (res.status === "unavailable") {
    return (
      <Unavailable
        title={t("story.unavailable")}
        body={t("story.unavailableBody")}
        t={t}
        back={{ href: "/explore", label: t("explore.title") }}
      />
    );
  }
  if (res.status === "other_languages") {
    return (
      <OtherLanguagesAvailable
        available={res.available}
        selected={lang}
        href={`/stories/${slug}?all=1`}
        t={t}
      />
    );
  }

  const { row, body, shownLanguage } = res;
  const [claims, city, connections, related] = await Promise.all([
    claimsForVersion(row.versionId),
    row.citySlug ? getCity(row.citySlug) : null,
    cardsBySlugs("connection", body.connections, lang),
    cardsBySlugs("story", body.relatedStories, lang),
  ]);
  const cityName = city ? localName(city.names, lang) : "";
  const from = `story:${slug}`;
  const sourceCount = new Set([...claims.values()].flatMap((c) => c.evidence.map((e) => e.sourceId))).size;

  // Build table of contents items
  const tocItems = [
    ...body.sections.map((sec) => ({
      id: `sec-${sec.id}`,
      label: sec.heading,
    })),
    { id: "timeline-section", label: "A River Through Time (Chronology)" },
    { id: "themes-section", label: "Key Cultural Themes" },
    { id: "connections-section", label: "Cultural Connections" },
    { id: "sources-panel", label: "Statutory Evidence & Sources" },
  ];

  return (
    <Page className="max-w-[1400px] px-3 sm:px-6 pt-2">
      {/* Breadcrumb Navigation matching Reference Page 1 */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-meta text-muted">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span>›</span>
        <Link href="/explore" className="hover:text-charcoal transition-colors">
          Stories
        </Link>
        <span>›</span>
        {city && (
          <>
            <Link href={`/cities/${city.slug}`} className="hover:text-charcoal transition-colors">
              {cityName}
            </Link>
            <span>›</span>
          </>
        )}
        <span className="font-semibold text-charcoal truncate max-w-xs">{body.title}</span>
      </nav>

      {/* 1. Large Hero Header matching Reference Page 1 */}
      <header className="relative isolate overflow-hidden rounded-3xl border border-border bg-[#14110e]">
        <div className="relative min-h-[440px] md:min-h-[500px] flex flex-col justify-end p-6 sm:p-10 md:p-12 text-white">
          {body.hero ? (
            <Image
              src={body.hero.src}
              alt={body.hero.alt}
              fill
              priority
              sizes="(min-width: 1200px) 1400px, 100vw"
              className="-z-20 object-cover"
            />
          ) : city?.image ? (
            <Image
              src={city.image.src}
              alt={city.image.alt}
              fill
              priority
              sizes="(min-width: 1200px) 1400px, 100vw"
              className="-z-20 object-cover"
            />
          ) : (
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#1c1813] via-[#14120f] to-[#0c0a09]" />
          )}
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/75 to-transparent" />

          {/* Top Pill Row */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-gold/20 border border-gold/40 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md">
              ✦ Flagship Story {cityName ? `· ${cityName}` : ""}
            </span>
            <span className="rounded-full bg-surface/80 border border-border px-3 py-1 text-[11px] text-muted backdrop-blur-md">
              {body.sections.length} Curated Sections · {sourceCount} Institutional Sources
            </span>
          </div>

          {/* Story Title & Dek */}
          <h1 className="mt-4 max-w-4xl font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-sm">
            {body.title}
          </h1>

          <p className="mt-3.5 max-w-3xl text-body text-white/90 leading-relaxed font-light md:text-lg">
            {body.orientation}
          </p>

          {/* Metadata Row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-meta text-white/75 border-t border-white/15 pt-3">
            <span>Verified by TattvaCo Editorial Registry</span>
            <span>·</span>
            <span>Version {row.versionNo} ({formatDate(row.approvedAt, lang)})</span>
            <span>·</span>
            <span className="rounded-full bg-forest/80 px-2.5 py-0.5 text-[11px] font-semibold text-white">
              Primary Sources Grounded
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#story-text"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
            >
              Read Narrative ↓
            </a>
            {city && (
              <Link
                href={`/places?city=${city.slug}`}
                className="inline-flex min-h-11 items-center gap-2 justify-center rounded-full border border-white/30 bg-black/40 px-5 text-support font-semibold text-white hover:bg-black/60 backdrop-blur-xs transition-colors"
              >
                <IconExplore className="size-4 shrink-0 text-white" />
                <span>Explore on Cultural Atlas</span>
              </Link>
            )}
            <Link
              href={`/ask?context=${encodeURIComponent(from)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/40 bg-gold/15 px-5 text-support font-semibold text-gold hover:bg-gold/25 backdrop-blur-xs transition-colors"
            >
              Ask TattvaCo AI ✦
            </Link>
            <div className="ml-auto flex items-center gap-2">
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
            </div>
          </div>
        </div>
      </header>

      {/* 2. Top-line 4 Stat Cards matching Reference Page 1 */}
      <div className="mt-6">
        <StoryStatCards slug={slug} />
      </div>

      {/* 3. Key Cultural Themes Horizontal Rail matching Reference Page 1 */}
      {body.themes && body.themes.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-2 rounded-2xl border border-border/80 bg-surface p-3.5 shadow-2xs">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gold mr-1">
            Key Themes:
          </span>
          {body.themes.map((th) => (
            <span
              key={th}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface-2 px-3.5 py-1 text-meta font-medium text-charcoal hover:border-gold/40 transition-colors"
            >
              <span className="text-gold">✦</span>
              {th}
            </span>
          ))}
        </div>
      )}

      {/* Notices */}
      {row.isFixture && (
        <Notice tone="info" className="mt-4" title={t("common.devFixture")}>
          {t("common.devFixtureLong")}
        </Notice>
      )}
      {shownLanguage !== lang && (
        <Notice className="mt-4" role="status">
          {t("story.languageNote", { shown: languageInfo(shownLanguage).native, selected: languageInfo(lang).native })}
        </Notice>
      )}

      {/* 4. Main Two-Column Editorial Layout matching Reference Page 1 & 3 */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
        {/* Left Column: Deep Reading Experience */}
        <article lang={shownLanguage} className="min-w-0 prose-reading">
          {/* Epistemic Legend - Expandable Disclosure */}
          <details className="rounded-xl border border-border/70 bg-surface-2/60 p-3.5 text-meta text-muted">
            <summary className="cursor-pointer font-semibold text-charcoal hover:text-gold transition-colors flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="text-gold">✦</span>
                <span>Epistemic Grounding Guide (Documented · Tradition · Interpretation)</span>
              </span>
              <span className="text-xs text-gold">Explain markers ▾</span>
            </summary>
            <div className="mt-3 pt-3 border-t border-border/60">
              <EpistemicLegend t={t} />
            </div>
          </details>

          {/* Narrative Sections */}
          <div id="story-text" className="mt-8 space-y-12">
            {body.sections.map((sec, sIdx) => (
              <section key={sec.id} id={`sec-${sec.id}`} aria-labelledby={`sec-heading-${sec.id}`}>
                <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                  <span className="font-mono text-xs font-semibold text-gold">0{sIdx + 1}</span>
                  <SectionTitle id={`sec-heading-${sec.id}`}>{sec.heading}</SectionTitle>
                </div>
                <div className="mt-4 space-y-4">
                  {sec.paragraphs.map((p, pIdx) => (
                    <ClaimedParagraph
                      key={pIdx}
                      text={p.text}
                      claimKeys={p.claims}
                      claims={claims}
                      t={t}
                      from={from}
                    />
                  ))}
                </div>

                {/* Contextual Ask after Section 1 & Section 2 (Reference Page 3) */}
                {sIdx === 0 && body.followUpQuestions[0] && (
                  <StoryContextualAsk
                    question={body.followUpQuestions[0]}
                    contextRef={from}
                    topic="Curious about this historical practice?"
                  />
                )}
                {sIdx === 1 && body.followUpQuestions[1] && (
                  <StoryContextualAsk
                    question={body.followUpQuestions[1]}
                    contextRef={from}
                    topic="Explore deeper with TattvaCo AI"
                  />
                )}
              </section>
            ))}
          </div>

          {/* Historical Timeline Node Chain ("A River Through Time") */}
          <StoryTimeline slug={slug} />

          {/* Key Cultural Themes Section */}
          {body.themes && body.themes.length > 0 && (
            <section id="themes-section" className="mt-14" aria-labelledby="story-themes-title">
              <SectionTitle id="story-themes-title">Cultural Concepts & Living Traditions</SectionTitle>
              <div className="mt-4 flex flex-wrap gap-2.5">
                {body.themes.map((th) => (
                  <span
                    key={th}
                    className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-4 py-2 text-support font-medium text-charcoal shadow-2xs"
                  >
                    <span className="text-gold">✦</span>
                    {th}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Cultural Connections */}
          <section id="connections-section" className="mt-14" aria-labelledby="connections-title">
            <SectionTitle id="connections-title">{t("story.connections")}</SectionTitle>
            <p className="mt-1 text-support text-muted">
              Explore how this narrative connects to other cultural entities across India
            </p>
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

          {/* Continue Journey · Next Story in this Collection */}
          {related[0] && (
            <section className="mt-14 rounded-3xl border border-gold/30 bg-gradient-to-br from-[#1a1714] via-[#161310] to-[#12100e] p-6 sm:p-8 shadow-md">
              <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-gold">
                <span>✦</span>
                <span>Continue Your Journey · Next Story</span>
              </div>
              <h2 className="mt-2 font-serif text-2xl font-bold text-charcoal sm:text-3xl">
                {related[0].title}
              </h2>
              <p className="mt-2 text-body text-secondary-text leading-relaxed">
                {related[0].summary}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href={`/stories/${related[0].slug}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
                >
                  Read Next Story →
                </Link>
                {city && (
                  <Link
                    href={`/places?city=${city.slug}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface px-5 text-support font-semibold text-charcoal hover:border-gold/40 transition-colors"
                  >
                    Explore {cityName} on Cultural Map
                  </Link>
                )}
              </div>
            </section>
          )}

          {/* Curiosity-Led Question Composer */}
          <section className="mt-14 rounded-3xl border border-gold/30 bg-gradient-to-br from-[#171512] via-[#1a1714] to-[#12100d] p-6 sm:p-8 shadow-md">
            <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-gold">
              <span>✦</span>
              <span>Curiosity-Led Exploration</span>
            </div>
            <h2 className="mt-2 font-serif text-2xl font-semibold text-charcoal">
              {t("story.goDeeper")}
            </h2>
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
              <div className="mt-4">
                <p className="text-meta font-medium text-muted">Curated inquiry seeds:</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {body.followUpQuestions.map((q) => (
                    <li key={q}>
                      <Link
                        href={`/ask?q=${encodeURIComponent(q)}&context=${encodeURIComponent(from)}`}
                        className="inline-flex min-h-9 items-center rounded-full border border-border bg-surface-2 px-3.5 py-1 text-meta text-charcoal hover:border-gold hover:text-gold transition-colors shadow-2xs"
                      >
                        {q} →
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Story Actions & Report Footer */}
          <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
            <div className="flex items-center gap-3">
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
              <Link
                href={`/report?type=story&ref=${encodeURIComponent(slug)}`}
                className="inline-flex min-h-10 items-center gap-1.5 px-2 text-support font-semibold text-gold underline-offset-4 hover:underline"
              >
                <IconFlag width={16} height={16} /> {t("story.report")}
              </Link>
            </div>
            <Link
              href={city ? `/cities/${city.slug}` : "/explore"}
              className="text-support font-medium text-muted hover:text-charcoal"
            >
              ← Back to {cityName || "Explore"}
            </Link>
          </div>
        </article>

        {/* Right Sidebar: TOC, Geographical Mini-Map, Evidence Panel & Collections */}
        <aside className="min-w-0 space-y-6">
          {/* 1. On This Page Table of Contents (Reference Page 3) */}
          <StoryTableOfContents items={tocItems} />

          {/* 2. Geographical Mini-Map Context (Reference Page 1) */}
          {city && (
            <StoryMiniMap
              cityName={cityName}
              citySlug={city.slug}
              coordinates={CITIES_CULTURAL_DATA[city.slug]?.coordinates}
              tagline={city.taglines[lang] ?? city.taglines.en}
            />
          )}

          {/* 3. Statutory Evidence & Further Reading Panel (Reference Page 1 & 3) */}
          <div id="sources-panel" className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h2 className="font-serif text-card font-semibold text-charcoal">
                Statutory Evidence & Sources
              </h2>
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold border border-gold/30">
                {sourceCount} Verified
              </span>
            </div>
            <div className="mt-4">
              <SourceList claims={claims} t={t} from={from} uiLang={lang} />
            </div>

            {/* Academic Institutions Citation Banner */}
            <div className="mt-5 rounded-xl border border-border/70 bg-surface-2/60 p-3.5 space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                Institutional Verification
              </span>
              <p className="text-meta text-muted leading-relaxed">
                Grounding drawn from the Archaeological Survey of India (ASI), Sahitya Akademi, and Indira Gandhi National Centre for the Arts (IGNCA).
              </p>
            </div>
          </div>

          {/* 4. Stories in this Collection (Reference Page 1) */}
          {related.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
              <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                <h3 className="font-serif text-card font-semibold text-charcoal">
                  Stories in this Collection
                </h3>
              </div>
              <ul className="mt-3 space-y-3">
                {related.map((s) => (
                  <li key={s.slug} className="border-t border-border/60 pt-3 first:border-0 first:pt-0">
                    <Link href={`/stories/${s.slug}`} className="group block">
                      <p className="font-serif text-support font-semibold text-charcoal group-hover:text-gold transition-colors">
                        {s.title}
                      </p>
                      <p className="mt-1 text-meta text-muted line-clamp-2 leading-relaxed">
                        {s.summary}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </Page>
  );
}
