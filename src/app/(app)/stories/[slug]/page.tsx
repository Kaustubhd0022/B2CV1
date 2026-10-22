import type { Metadata } from "next";
import Image from "next/image";
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
import { IconFlag, IconExplore } from "@/components/icons";
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
  const sourceCount = new Set([...claims.values()].flatMap((c) => c.evidence.map((e) => e.sourceId))).size;

  const storyStats: Record<string, { val: string; label: string }[]> = {
    "varanasi-ghats": [
      { val: "2,500+ Years", label: "Sacred History" },
      { val: "84 Ghats", label: "Continuous Riverfront" },
      { val: "Millions", label: "Pilgrims Annually" },
      { val: "Sacred & Living", label: "Epistemic Status" },
    ],
    "varanasi-silk-craft": [
      { val: "1,000+ Years", label: "Guild Lineage" },
      { val: "GI Tagged", label: "Geographical Indication" },
      { val: "Jacquard & Pit Loom", label: "Master Craft Technique" },
      { val: "Syncretic", label: "Ganga-Jamuni Culture" },
    ],
    "jaipur-jantar-mantar": [
      { val: "1734 CE", label: "Year Completed" },
      { val: "19 Instruments", label: "Stone Architectural Devices" },
      { val: "UNESCO", label: "World Heritage" },
      { val: "2 Seconds", label: "Vrihat Samrat Yantra Accuracy" },
    ],
  };

  const currentStats = storyStats[slug] ?? [
    { val: `${body.sections.length} Sections`, label: "Curated Narrative" },
    { val: `${sourceCount} Sources`, label: "Verified Citations" },
    { val: `${connections.length} Connections`, label: "Cultural Relations" },
    { val: languageInfo(shownLanguage).native, label: "Narrative Language" },
  ];

  // Curated historical timeline milestones for flagship stories
  const timelineMilestones: Record<string, { era: string; period: string; desc: string }[]> = {
    "varanasi-ghats": [
      { era: "Ancient Foundations", period: "1500–500 BCE", desc: "Vedic hymns and Upanishadic texts revere the Ganga as the sacred river of celestial descent and liberation (Moksha)." },
      { era: "Classical Consolidation", period: "500–1500 CE", desc: "Pilgrimage circuits and stone shrines formalise around Dashashwamedh, Manikarnika, and Panchganga ghats." },
      { era: "Maratha Architectural Golden Age", period: "1700–1850 CE", desc: "Ahilyabai Holkar and Maratha rulers rebuild the stone tiered ghats, riverfront palaces, and the Kashi Vishwanath temple." },
      { era: "Modern Living Heritage", period: "1947–Present", desc: "National riverfront conservation, daily Maha Aarti, and ongoing nomination for UNESCO World Heritage cultural landscape status." },
    ],
  };

  const timeline = timelineMilestones[slug];

  return (
    <Page className="pt-2">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-meta text-muted">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
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

      {/* 1. Large Photographic Story Hero (Master Spec §12 Screen 6/7) */}
      <div className="relative isolate overflow-hidden rounded-2xl border border-border bg-stone">
        <div className="relative min-h-[420px] md:min-h-[480px] flex flex-col justify-end p-6 md:p-10 text-white">
          {body.hero ? (
            <Image
              src={body.hero.src}
              alt={body.hero.alt}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="-z-20 object-cover"
            />
          ) : city?.image ? (
            <Image
              src={city.image.src}
              alt={city.image.alt}
              fill
              priority
              sizes="(min-width: 1024px) 1024px, 100vw"
              className="-z-20 object-cover"
            />
          ) : (
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#173D32] via-[#1E4D40] to-[#122F26]" />
          )}
          <div className="scrim absolute inset-0 -z-10" aria-hidden="true" />

          {/* Eyebrow & Attribution */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="rounded-full bg-forest/85 border border-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
              Flagship Story {cityName ? `· ${cityName}` : ""}
            </span>
            {body.hero && !body.hero.rightsCleared && (
              <span className="text-[10px] text-white/60">Demo photo · Reference rights</span>
            )}
          </div>

          <h1 className="mt-4 max-w-3xl font-serif text-display leading-tight text-white md:text-display-lg">
            {body.title}
          </h1>

          <p className="mt-3 max-w-2xl text-body text-white/90 leading-relaxed font-light md:text-lg">
            {body.orientation}
          </p>

          {/* Action Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="#story-text"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
            >
              Read Story ↓
            </a>
            {city && (
              <Link
                href={`/cities/${city.slug}#map-section`}
                className="inline-flex min-h-11 items-center gap-2 justify-center rounded-full border border-white/30 bg-black/40 px-5 text-support font-semibold text-white hover:bg-black/60 backdrop-blur-xs transition-colors"
              >
                <IconExplore className="size-4 shrink-0 text-white" />
                <span>Explore Map</span>
              </Link>
            )}
            <Link
              href={`/ask?context=${encodeURIComponent(from)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/40 bg-gold/15 px-5 text-support font-semibold text-gold hover:bg-gold/25 backdrop-blur-xs transition-colors"
            >
              Ask TattvaCo ✦
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
      </div>

      {/* 2. Sub-navigation tabs */}
      <nav aria-label="Story sub-sections" className="no-scrollbar -mx-4 mt-4 overflow-x-auto px-4 border-b border-border pb-2">
        <ul className="flex w-max gap-2 text-support font-medium">
          <li>
            <a href="#overview" className="rounded-full bg-forest text-on-forest px-4 py-1.5 shadow-xs">
              Overview
            </a>
          </li>
          <li>
            <a href="#story-text" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5">
              Narrative ({body.sections.length} Sections)
            </a>
          </li>
          {timeline && (
            <li>
              <a href="#timeline-section" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5">
                Timeline
              </a>
            </li>
          )}
          <li>
            <a href="#connections-title" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5">
              Connections ({connections.length})
            </a>
          </li>
          <li>
            <a href="#sources-panel" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5">
              Sources & Evidence ({sourceCount})
            </a>
          </li>
        </ul>
      </nav>

      {/* 3. 4 Story Stat Cards (Master Spec §12 Screen 6) */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Key story facts">
        {currentStats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-surface p-4 shadow-xs">
            <p className="font-serif text-section font-semibold text-forest md:text-section-lg">{stat.val}</p>
            <p className="mt-1 text-meta text-muted leading-tight">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Notices */}
      {row.isFixture && (
        <Notice tone="warning" className="mt-4" title={t("common.devFixture")}>
          {t("common.devFixtureLong")}
        </Notice>
      )}
      {shownLanguage !== lang && (
        <Notice className="mt-4" role="status">
          {t("story.languageNote", { shown: languageInfo(shownLanguage).native, selected: languageInfo(lang).native })}
        </Notice>
      )}

      {/* 4. Two-Column Editorial Layout */}
      <article lang={shownLanguage} className="mt-8 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        {/* Main Reading Column */}
        <div className="prose-reading">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <p className="text-meta text-muted">
              {t("story.version", { version: row.versionNo, date: formatDate(row.approvedAt, lang) })}
            </p>
            <span className="text-[11px] font-semibold text-forest bg-forest/10 rounded-full px-2.5 py-0.5">
              Statutory Evidence Grounded
            </span>
          </div>

          {/* Epistemic Legend */}
          <div className="mt-5">
            <EpistemicLegend t={t} />
          </div>

          {/* Story Narrative Sections */}
          <div id="story-text" className="mt-6 space-y-10">
            {body.sections.map((sec) => (
              <section key={sec.id} aria-labelledby={`sec-${sec.id}`}>
                <SectionTitle id={`sec-${sec.id}`}>{sec.heading}</SectionTitle>
                <div className="mt-3 space-y-4">
                  {sec.paragraphs.map((p, i) => (
                    <ClaimedParagraph key={i} text={p.text} claimKeys={p.claims} claims={claims} t={t} from={from} />
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Historical Timeline (Master Spec §12 Screen 6 / Reference Page 2) */}
          {timeline && (
            <section id="timeline-section" className="mt-14 rounded-2xl border border-border bg-surface p-6 shadow-md">
              <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-gold">
                <span>✦</span>
                <span>A River Through Time</span>
              </div>
              <h2 className="mt-2 font-serif text-section font-semibold text-charcoal">
                Historical & Cultural Timeline
              </h2>
              <div className="mt-6 space-y-6">
                {timeline.map((m, idx) => (
                  <div key={m.era} className="relative flex gap-4 pl-2">
                    <div className="flex flex-col items-center">
                      <span className="flex size-7 items-center justify-center rounded-full bg-forest text-[11px] font-bold text-on-forest shadow-xs">
                        {idx + 1}
                      </span>
                      {idx < timeline.length - 1 && <span className="h-full w-0.5 bg-border my-1" />}
                    </div>
                    <div className="pb-4">
                      <div className="flex items-baseline gap-2">
                        <h3 className="font-serif text-support font-semibold text-charcoal">{m.era}</h3>
                        <span className="text-[11px] font-mono text-gold font-medium">({m.period})</span>
                      </div>
                      <p className="mt-1 text-support text-muted leading-relaxed">{m.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Key Themes & Concepts */}
          {body.themes && body.themes.length > 0 && (
            <section className="mt-12" aria-labelledby="story-themes-title">
              <SectionTitle id="story-themes-title">Key Themes & Concepts</SectionTitle>
              <div className="mt-4 flex flex-wrap gap-2">
                {body.themes.map((th) => (
                  <span
                    key={th}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-1.5 text-support font-medium text-charcoal shadow-2xs"
                  >
                    <span className="text-gold">✦</span>
                    {th}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Cultural Connections (Screen 6/7) */}
          <section className="mt-12" aria-labelledby="connections-title">
            <SectionTitle id="connections-title">{t("story.connections")}</SectionTitle>
            <p className="mt-1 text-support text-muted">Explore how this narrative connects to other cultural entities</p>
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

          {/* Go Deeper / Follow-up Questions */}
          <section className="mt-12 rounded-3xl border border-gold/25 bg-gradient-to-br from-[#171512] via-[#1a1714] to-[#12100d] p-7 md:p-8 shadow-md" aria-labelledby="deeper-title">
            <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-gold">
              <span>✦</span>
              <span>Curiosity-Led Exploration</span>
            </div>
            <h2 id="deeper-title" className="mt-2 font-serif text-section font-semibold text-charcoal">
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
                <p className="text-meta font-medium text-muted">Follow-up inquiries:</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {body.followUpQuestions.map((q) => (
                    <li key={q}>
                      <Link
                        href={`/ask?q=${encodeURIComponent(q)}&context=${encodeURIComponent(from)}`}
                        className="inline-flex min-h-10 items-center rounded-full border border-border bg-elevated px-3.5 py-1 text-meta text-charcoal hover:border-gold hover:text-gold transition-colors shadow-2xs"
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
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
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
                className="inline-flex min-h-11 items-center gap-2 px-1 text-support font-semibold text-gold underline-offset-4 hover:underline"
              >
                <IconFlag width={18} height={18} /> {t("story.report")}
              </Link>
            </div>
            <Link
              href={city ? `/cities/${city.slug}` : "/explore"}
              className="text-support font-medium text-muted hover:text-charcoal"
            >
              ← Back to {cityName || "Explore"}
            </Link>
          </div>
        </div>

        {/* Right Sidebar: Evidence & Further Reading, Location & Related */}
        <aside className="mt-12 space-y-6 lg:mt-0" aria-labelledby="sources-title">
          {/* City / Geography Pin */}
          {city && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
              <span className="text-meta font-semibold uppercase tracking-wider text-gold">Location</span>
              <h3 className="mt-1 font-serif text-card font-semibold text-charcoal">{cityName}</h3>
              <p className="mt-1 text-support text-muted leading-snug">{city.taglines[lang] ?? city.taglines.en}</p>
              <Link
                href={`/cities/${city.slug}`}
                className="mt-3 inline-flex items-center text-support font-semibold text-gold hover:underline"
              >
                Explore City Ecosystem →
              </Link>
            </div>
          )}

          {/* Consolidated Evidence & Further Reading Panel (FR-09 & Reference Page 3) */}
          <div id="sources-panel" className="rounded-xl border border-border bg-surface p-5 shadow-xs lg:sticky lg:top-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h2 id="sources-title" className="font-serif text-card font-semibold text-charcoal">
                {t("story.sources")}
              </h2>
              <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold">
                {sourceCount} Grounded
              </span>
            </div>
            <div className="mt-4">
              <SourceList claims={claims} t={t} from={from} uiLang={lang} />
            </div>
            <p className="mt-4 border-t border-border/80 pt-3 text-[11px] text-muted leading-relaxed">
              {t("source.interpretBody")}
            </p>
          </div>

          {/* Related Stories in this Collection */}
          {related.length > 0 && (
            <div className="rounded-xl border border-border bg-surface p-5 shadow-xs">
              <h3 className="font-serif text-card font-semibold text-charcoal mb-3">Stories in this Collection</h3>
              <ul className="space-y-3">
                {related.map((s) => (
                  <li key={s.slug} className="border-t border-border/60 pt-2.5 first:border-0 first:pt-0">
                    <Link href={`/stories/${s.slug}`} className="group block">
                      <p className="text-support font-semibold text-charcoal group-hover:text-gold transition-colors">
                        {s.title}
                      </p>
                      <p className="mt-0.5 text-meta text-muted line-clamp-2">{s.summary}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </article>
    </Page>
  );
}
