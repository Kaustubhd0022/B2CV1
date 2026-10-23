import Image from "next/image";
import Link from "next/link";
import { pageContext } from "@/lib/page";
import { cityStoryCounts, featuredConnection, featuredStories, listCities, localName } from "@/lib/content/repo";
import { languageInfo } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import { CityCard, ConnectionCard, StoryCard, ThematicCard } from "@/components/cards";
import { QuestionComposer } from "@/components/composer";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/motion";
import { IconExplore } from "@/components/icons";
import { Page, SectionTitle } from "@/components/ui";

const HERO = {
  src: "/images/dev/varanasi-hero.jpg",
  alt: "The riverfront of Varanasi at sunrise",
  credit: "Placeholder from design document — usage rights not verified",
};

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
    <Page className="pt-2">
      {/* Hero: Where will your curiosity take you? */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-border/70 shadow-sm">
        <Image
          src={HERO.src}
          alt={HERO.alt}
          fill
          priority
          sizes="(min-width: 1200px) 1152px, 100vw"
          className="-z-10 object-cover object-center transition-transform duration-1000 ease-out hover:scale-[1.02]"
        />
        <div className="scrim absolute inset-0 -z-10" aria-hidden="true" />
        <div className="flex min-h-[540px] flex-col justify-between p-6 sm:p-8 md:min-h-[580px] md:p-12">
          <FadeIn delay={0.05}>
            {session.email ? (
              <div className="flex items-center gap-3">
                <span
                  className="glass-white flex size-10 items-center justify-center rounded-full font-serif text-sm font-semibold text-gold shadow-xs"
                  aria-hidden="true"
                >
                  {session.email.slice(0, 1).toUpperCase()}
                </span>
                <p className="text-support font-medium text-white/90">{t("home.greeting")}</p>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-[#12100E]/85 px-3.5 py-1 text-meta font-semibold uppercase tracking-[0.2em] text-gold shadow-sm backdrop-blur-md">
                <span className="text-xs">✦</span>
                <span>TATTVACO · CULTURAL DISCOVERY</span>
              </div>
            )}
          </FadeIn>
          <div>
            <FadeIn delay={0.1}>
              <p className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.18em] text-sandstone">
                <IconExplore width={16} height={16} className="text-sandstone" /> {t("brand.tagline")}
              </p>
              <h1 className="mt-3 max-w-2xl font-serif text-display font-semibold leading-[1.08] text-white md:text-display-lg tracking-tight drop-shadow-xs">
                Where will your curiosity take you?
              </h1>
              <p className="mt-3 max-w-xl text-body-lead text-white/90 leading-relaxed">
                Start with a place, a living craft, a philosopher—or a question.
              </p>
            </FadeIn>
            <FadeIn delay={0.18} className="mt-8 max-w-2xl">
              <QuestionComposer
                variant="hero"
                label={t("home.askTitle")}
                placeholder="Ask anything about sacred geography, craft guilds, temple acoustic shrines…"
                languageNote={`${t("home.askLanguage")} · ${languageInfo(lang).native}`}
                submitLabel={t("ask.submit")}
              />
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-meta font-medium text-sandstone">Try asking:</span>
                {[
                  "Why does Varanasi have 84 ghats?",
                  "How are Banarasi silks tied to the Ganga?",
                  "What makes Hampi's architecture acoustic?",
                ].map((sq) => (
                  <Link
                    key={sq}
                    href={`/ask?q=${encodeURIComponent(sq)}`}
                    className="inline-flex min-h-9 items-center rounded-full border border-white/25 bg-black/25 px-4 py-1.5 text-meta font-medium text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/50"
                  >
                    {sq}
                  </Link>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Explore India's Cultural Universe */}
      <section className="mt-16 md:mt-20" aria-labelledby="thematic-universe-title">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <SectionTitle id="thematic-universe-title">Explore India&apos;s Cultural Universe</SectionTitle>
            <p className="mt-1 text-support text-secondary-text">
              Discover contextual relationships across geography, craft, philosophy and art
            </p>
          </div>
          <Link href="/explore" className="inline-flex min-h-10 items-center text-support font-semibold text-forest hover:text-forest-hover hover:underline">
            View all 9 themes →
          </Link>
        </div>
        <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.06}>
          <StaggerItem>
            <ThematicCard
              href="/explore?theme=places"
              category="Geography & Heritage"
              title="Places"
              subtitle="Cities, riverfronts, ancient landscapes and sacred geography"
              count="6 Cities"
            />
          </StaggerItem>
          <StaggerItem>
            <ThematicCard
              href="/explore?theme=crafts"
              category="Living Culture"
              title="Crafts & Guilds"
              subtitle="Materials, master weavers, stone carvers and living traditions"
              count="Handloom & Art"
            />
          </StaggerItem>
          <StaggerItem>
            <ThematicCard
              href="/explore?theme=traditions"
              category="Belief & Ritual"
              title="Traditions"
              subtitle="Pilgrimage circuits, sacred mandalas and philosophical thought"
              count="Living Rituals"
            />
          </StaggerItem>
          <StaggerItem>
            <ThematicCard
              href="/explore?theme=arts"
              category="Acoustic & Built"
              title="Arts & Music"
              subtitle="Hindustani & Carnatic gharanas, temple dance and acoustic shrines"
              count="Performing Arts"
            />
          </StaggerItem>
        </StaggerContainer>
      </section>

      {/* Start with a City (Pilot Cities) */}
      <section className="mt-16 md:mt-20" aria-labelledby="cities-title">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <SectionTitle id="cities-title">Start with a city</SectionTitle>
            <p className="mt-1 text-support text-secondary-text">Six pilot cultural ecosystems across India</p>
          </div>
          <Link href="/explore" className="inline-flex min-h-10 items-center text-support font-semibold text-forest hover:text-forest-hover hover:underline">
            {t("home.viewAll", { count: cities.length })}
          </Link>
        </div>

        {/* City shortcut chips */}
        <nav aria-label={t("home.cities")} className="no-scrollbar -mx-4 mt-5 overflow-x-auto px-4">
          <ul className="flex w-max items-center gap-2">
            <li>
              <Link
                href="/explore"
                className="inline-flex min-h-10 items-center rounded-full bg-forest px-5 text-support font-semibold text-on-forest shadow-xs hover:bg-forest-hover transition-colors"
              >
                {t("home.allCities")}
              </Link>
            </li>
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cities/${c.slug}`}
                  className="inline-flex min-h-10 items-center rounded-full border border-border bg-surface px-5 text-support font-medium text-charcoal shadow-2xs hover:bg-surface-2 hover:border-forest/40 transition-all duration-200"
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

      {/* Featured Flagship Stories */}
      {stories.length > 0 && (
        <section className="mt-16 md:mt-20" aria-labelledby="flagship-title">
          <div className="flex items-baseline justify-between gap-4">
            <div>
              <SectionTitle id="flagship-title">Stories of the Day</SectionTitle>
              <p className="mt-1 text-support text-secondary-text">Curated, source-grounded cultural narratives</p>
            </div>
            <Link href="/explore" className="inline-flex min-h-10 items-center text-support font-semibold text-forest hover:text-forest-hover hover:underline">
              Explore stories →
            </Link>
          </div>
          <StaggerContainer className="mt-6 grid gap-5 md:grid-cols-2" staggerDelay={0.08}>
            {stories.slice(0, 2).map((s) => (
              <StaggerItem key={s.slug}>
                <StoryCard
                  key={s.slug}
                  href={`/stories/${s.slug}`}
                  eyebrow={s.citySlug ? s.citySlug.toUpperCase() : "FLAGSHIP STORY"}
                  title={s.title}
                  summary={s.orientation}
                  meta="Approved Narrative · Verified Sources"
                  fixtureLabel={s.isFixture ? t("common.devFixture") : undefined}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>
      )}

      {/* Meaningful Connections */}
      <section className="mt-16 md:mt-20" aria-labelledby="connection-title">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <SectionTitle id="connection-title">Follow an unexpected connection</SectionTitle>
            <p className="mt-1 text-support text-secondary-text">
              Discover how places, craft guilds, astronomy and ritual cross paths
            </p>
          </div>
        </div>
        <FadeIn delay={0.08} className="mt-6 max-w-2xl">
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
            <p className="rounded-2xl border border-dashed border-border bg-surface p-5 text-support text-muted">
              {t("home.noConnection")}
            </p>
          )}
        </FadeIn>
      </section>

      {/* Spatial Cultural Discovery Module (Interactive Map & Upcoming Trails) */}
      <FadeIn delay={0.12}>
        <section className="mt-16 md:mt-24 rounded-3xl border border-gold/25 bg-gradient-to-br from-[#171512] via-[#1a1714] to-[#12100d] p-8 sm:p-10 md:p-12 shadow-md">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.16em] text-gold">
              <span>✦</span>
              <span>Spatial Cultural Discovery</span>
            </div>
            <h2 className="mt-2.5 font-serif text-page font-semibold text-charcoal md:text-page-lg tracking-tight">
              Experience India&apos;s Living Heritage on the Map
            </h2>
            <p className="mt-3 text-body text-secondary-text leading-relaxed">
              Trace ancient riverfronts, monumental temple mandapas, and generational artisan quarters across our interactive cultural atlas. Connect physical places with the stories and traditions that brought them to life.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <Link
                href="/places"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 text-support font-semibold text-on-gold transition-all hover:bg-gold-hover shadow-xs active:scale-[0.985]"
              >
                Explore Cultural Map →
              </Link>
              <Link
                href="/coming-soon"
                className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-support font-semibold text-charcoal shadow-2xs hover:bg-elevated hover:border-gold/40 transition-all active:scale-[0.985]"
              >
                Preview AI Cultural Trails
              </Link>
            </div>
          </div>
        </section>
      </FadeIn>
    </Page>
  );
}
