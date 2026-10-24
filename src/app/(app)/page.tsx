import Link from "next/link";
import { pageContext } from "@/lib/page";
import { cityStoryCounts, featuredConnection, featuredStories, listCities, localName } from "@/lib/content/repo";
import { track } from "@/lib/analytics";
import { CityCard, ConnectionCard, StoryCard } from "@/components/cards";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { Page, SectionTitle } from "@/components/ui";
import {
  CulturalHeroSection,
  CulturalConnectedChainSection,
  CulturalBentoSection,
  CulturalExpeditionSection,
  CulturalEvidenceReelSection,
  CulturalFaqSection,
  CulturalClosingCtaSection,
} from "@/components/cultural-meadow-board";
import { TOPIC_IMAGES } from "@/lib/content/topic-images";

export default async function HomePage() {
  const { session, lang, t } = await pageContext();
  const [cities, counts, featured, stories] = await Promise.all([
    listCities(),
    cityStoryCounts(lang),
    featuredConnection(lang),
    featuredStories(lang, 4),
  ]);
  await track("home_view", {}, session.analyticsId);

  return (
    <Page className="pt-2 space-y-16 md:space-y-24">
      {/* 1. Hero & AI Cultural Search Box */}
      <CulturalHeroSection userEmail={session.email} />

      {/* 2. Start with a City (Pilot Cultural Ecosystems) */}
      <section aria-labelledby="cities-title">
        <div className="flex items-baseline justify-between gap-4 border-b border-[#F0DCE4] pb-3">
          <div>
            <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.16em] text-amber-800">
              <span>✦</span>
              <span>Geographic Portals</span>
            </div>
            <div className="mt-1">
              <SectionTitle id="cities-title">Start with a city</SectionTitle>
            </div>
            <p className="mt-1 text-support text-[#5A4450]">Six pilot cultural ecosystems across India</p>
          </div>
          <Link href="/explore" className="inline-flex min-h-10 items-center text-support font-semibold text-amber-800 hover:text-amber-900 hover:underline">
            {t("home.viewAll", { count: cities.length })} →
          </Link>
        </div>

        {/* City shortcut chips */}
        <nav aria-label={t("home.cities")} className="no-scrollbar -mx-4 mt-5 overflow-x-auto px-4">
          <ul className="flex w-max items-center gap-2">
            <li>
              <Link
                href="/explore"
                className="inline-flex min-h-10 items-center rounded-full bg-[#24131E] px-5 text-support font-semibold text-white shadow-xs hover:bg-[#381C2E] transition-colors"
              >
                {t("home.allCities")}
              </Link>
            </li>
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cities/${c.slug}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-[#F0DCE4] bg-white px-5 text-support font-medium text-[#20101B] shadow-2xs hover:bg-[#FAF0F4] hover:border-amber-600/40 transition-all duration-200"
                >
                  {localName(c.names, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <StaggerContainer className="no-scrollbar -mx-4 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2" staggerDelay={0.06}>
          {cities.map((c, i) => {
            const n = counts.get(c.slug);
            return (
              <StaggerItem key={c.slug} className="w-[72%] shrink-0 snap-start sm:w-[44%] lg:w-[23.5%]">
                <CityCard
                  href={`/cities/${c.slug}`}
                  name={localName(c.names, lang)}
                  tagline={c.taglines[lang] ?? c.taglines.en}
                  taglineNote={c.taglineReviewed ? undefined : t("common.illustrative")}
                  image={c.image}
                  badge={t("city.label")}
                  meta={n?.inLang ? t("lang.storiesAvailable", { count: n.inLang }) : undefined}
                  priority={i < 2}
                />
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* 3. Featured Flagship Stories (Stories of the Day) */}
      {stories.length > 0 && (
        <section aria-labelledby="flagship-title">
          <div className="flex items-baseline justify-between gap-4 border-b border-[#F0DCE4] pb-3">
            <div>
              <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.16em] text-amber-800">
                <span>✦</span>
                <span>Curated Narratives</span>
              </div>
              <div className="mt-1">
                <SectionTitle id="flagship-title">Stories of the Day</SectionTitle>
              </div>
              <p className="mt-1 text-support text-[#5A4450]">Source-grounded, verified cultural narratives across India</p>
            </div>
            <Link href="/explore" className="inline-flex min-h-10 items-center text-support font-semibold text-amber-800 hover:text-amber-900 hover:underline">
              Explore stories →
            </Link>
          </div>
          <StaggerContainer className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-2" staggerDelay={0.08}>
            {stories.slice(0, 2).map((s) => (
              <StaggerItem key={s.slug}>
                <StoryCard
                  key={s.slug}
                  href={`/stories/${s.slug}`}
                  eyebrow={s.citySlug ? s.citySlug.toUpperCase() : "FLAGSHIP STORY"}
                  title={s.title}
                  summary={s.orientation}
                  image={TOPIC_IMAGES[s.slug] || s.hero}
                  meta="Approved Narrative · Verified Sources"
                  fixtureLabel={s.isFixture ? t("common.devFixture") : undefined}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* 4. Follow an Unexpected Connection (Cross-disciplinary Syntheses) */}
      <section className="space-y-8" aria-labelledby="connection-title">
        <div className="flex items-baseline justify-between gap-4 border-b border-[#F0DCE4] pb-3">
          <div>
            <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.16em] text-amber-800">
              <span>✦</span>
              <span>Living Syntheses</span>
            </div>
            <div className="mt-1">
              <SectionTitle id="connection-title">Follow an unexpected connection</SectionTitle>
            </div>
            <p className="mt-1 text-support text-[#5A4450]">
              Discover how physical places, craft guilds, astronomy, and sacred rituals cross paths
            </p>
          </div>
          {featured && (
            <Link href={`/connections/${featured.slug}`} className="text-support font-semibold text-amber-800 hover:text-amber-900 hover:underline">
              View featured connection →
            </Link>
          )}
        </div>

        <FadeIn delay={0.08} className="max-w-3xl">
          {featured ? (
            <ConnectionCard
              featured
              href={`/connections/${featured.slug}`}
              title={featured.title}
              summary={featured.summary}
              typeLabel={t("connection.verified")}
              cta={t("home.exploreConnection")}
              fixtureLabel={featured.isFixture ? t("common.devFixture") : undefined}
            />
          ) : (
            <p className="rounded-2xl border border-dashed border-[#F0DCE4] bg-white p-5 text-support text-muted">
              {t("home.noConnection")}
            </p>
          )}
        </FadeIn>

        {/* 5-Step Connected Discovery Node Chain */}
        <CulturalConnectedChainSection />
      </section>

      {/* 5. Multi-Dimensional Living Heritage Bento Grid & Category Scrubber */}
      <CulturalBentoSection />

      {/* 6. Deep Cultural Immersion: Panchakroshi Sacred Circuit Expedition Calculator */}
      <CulturalExpeditionSection />

      {/* 7. Spatial Cultural Discovery Module (Interactive Map & Upcoming Trails) */}
      <FadeIn delay={0.12}>
        <section className="rounded-[2.5rem] border border-[#F0DCE4] bg-white p-8 sm:p-10 md:p-14 shadow-sm text-[#20101B]">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.16em] text-amber-700">
              <span>✦</span>
              <span>Spatial Cultural Discovery</span>
            </div>
            <h2 className="mt-2.5 font-serif text-page font-semibold text-[#20101B] md:text-page-lg tracking-tight">
              Experience India&apos;s Living Heritage on the Map
            </h2>
            <p className="mt-3 text-body text-[#5A4450] leading-relaxed">
              Trace ancient riverfronts, monumental temple mandapas, and generational artisan quarters across our interactive cultural atlas. Connect physical places with the stories and traditions that brought them to life.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Link
                href="/places"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-[#24131E] px-6 text-support font-semibold text-white transition-all hover:bg-[#381C2E] shadow-sm active:scale-[0.985]"
              >
                Explore Cultural Map →
              </Link>
              <Link
                href="/coming-soon"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-[#24131E]/15 bg-white px-6 text-support font-semibold text-[#20101B] shadow-2xs hover:bg-[#FAF0F4] transition-all active:scale-[0.985]"
              >
                Preview AI Cultural Trails
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* 8. Statutory Photographic Evidence Archive Reel */}
      <CulturalEvidenceReelSection />

      {/* 9. Methodology & Platform FAQs */}
      <CulturalFaqSection />

      {/* 10. Grand Editorial Closing Banner */}
      <CulturalClosingCtaSection />
    </Page>
  );
}
