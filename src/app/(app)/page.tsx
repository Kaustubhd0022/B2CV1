import Image from "next/image";
import Link from "next/link";
import { pageContext } from "@/lib/page";
import { cityStoryCounts, featuredConnection, featuredStories, listCities, localName } from "@/lib/content/repo";
import { languageInfo } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import { CityCard, ConnectionCard, StoryCard, ThematicCard } from "@/components/cards";
import { QuestionComposer } from "@/components/composer";
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
      {/* Hero: Where will your curiosity take you? (Master Spec §12 Screen 3) */}
      <section className="relative isolate overflow-hidden rounded-lg">
        <Image
          src={HERO.src}
          alt={HERO.alt}
          fill
          priority
          sizes="(min-width: 1024px) 960px, 100vw"
          className="-z-10 object-cover"
        />
        <div className="scrim absolute inset-0 -z-10" aria-hidden="true" />
        <div className="flex min-h-[520px] flex-col justify-between p-5 md:min-h-[560px] md:p-8">
          <div className="flex items-center gap-3">
            <span
              className="glass flex size-11 items-center justify-center rounded-full font-semibold text-white"
              aria-hidden="true"
            >
              {(session.email ?? "T").slice(0, 1).toUpperCase()}
            </span>
            <p className="text-support text-white/85">{t("home.greeting")}</p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-support text-white/85">
              <IconExplore width={18} height={18} /> {t("brand.tagline")}
            </p>
            <h1 className="mt-2 max-w-xl text-display font-semibold leading-[1.08] text-white md:text-display-lg">
              Where will your curiosity take you?
            </h1>
            <p className="mt-3 max-w-lg text-support text-white/80">
              Start with a place, a tradition, a person—or a question.
            </p>
            <div className="mt-6 max-w-2xl">
              <QuestionComposer
                variant="hero"
                label={t("home.askTitle")}
                placeholder="Ask anything about Indian culture, sacred geography, crafts or music…"
                languageNote={`${t("home.askLanguage")} · ${languageInfo(lang).native}`}
                submitLabel={t("ask.submit")}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-meta font-medium text-white/70">Try asking:</span>
                {[
                  "Why does Varanasi have 84 ghats?",
                  "How are Banarasi silks tied to the Ganga?",
                  "What makes Hampi's architecture acoustic?",
                ].map((sq) => (
                  <Link
                    key={sq}
                    href={`/ask?q=${encodeURIComponent(sq)}`}
                    className="inline-flex items-center rounded-full border border-border/80 bg-surface/80 px-3.5 py-1 text-meta text-white/90 backdrop-blur-md transition-colors hover:border-gold hover:text-gold"
                  >
                    {sq}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
        <p className="absolute right-4 top-4 hidden max-w-48 text-right text-[11px] leading-snug text-white/55 sm:block">
          {HERO.credit}
        </p>
      </section>

      {/* Explore India's Cultural Universe (Master Spec §12 Screen 3) */}
      <section className="mt-12" aria-labelledby="thematic-universe-title">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <SectionTitle id="thematic-universe-title">Explore India&apos;s Cultural Universe</SectionTitle>
            <p className="mt-1 text-support text-muted">
              Discover contextual relationships across geography, craft, philosophy and art
            </p>
          </div>
          <Link href="/explore" className="inline-flex min-h-11 items-center text-support font-medium text-gold hover:underline">
            View all 9 themes →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ThematicCard
            href="/explore?theme=places"
            category="Geography & Heritage"
            title="Places"
            subtitle="Cities, riverfronts, ancient landscapes and sacred geography"
            count="6 Cities"
          />
          <ThematicCard
            href="/explore?theme=crafts"
            category="Living Culture"
            title="Crafts & Guilds"
            subtitle="Materials, master weavers, stone carvers and living traditions"
            count="Handloom & Art"
          />
          <ThematicCard
            href="/explore?theme=traditions"
            category="Belief & Ritual"
            title="Traditions"
            subtitle="Pilgrimage circuits, sacred mandalas and philosophical thought"
            count="Living Rituals"
          />
          <ThematicCard
            href="/explore?theme=arts"
            category="Acoustic & Built"
            title="Arts & Music"
            subtitle="Hindustani & Carnatic gharanas, temple dance and acoustic shrines"
            count="Performing Arts"
          />
        </div>
      </section>

      {/* Start with a City (Pilot Cities) */}
      <section className="mt-10" aria-labelledby="cities-title">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <SectionTitle id="cities-title">Start with a city</SectionTitle>
            <p className="mt-1 text-support text-muted">Six pilot cultural ecosystems across India</p>
          </div>
          <Link href="/explore" className="inline-flex min-h-11 items-center text-support text-gold hover:text-gold-hover hover:underline">
            {t("home.viewAll", { count: cities.length })}
          </Link>
        </div>

        {/* City shortcut chips */}
        <nav aria-label={t("home.cities")} className="no-scrollbar -mx-4 mt-4 overflow-x-auto px-4">
          <ul className="flex w-max gap-2">
            <li>
              <Link
                href="/explore"
                className="inline-flex min-h-11 items-center rounded-full bg-forest px-5 text-support font-semibold text-on-forest shadow-xs"
              >
                {t("home.allCities")}
              </Link>
            </li>
            {cities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cities/${c.slug}`}
                  className="glass inline-flex min-h-11 items-center rounded-full px-5 text-support text-charcoal hover:bg-elevated hover:border-gold/50 transition-colors"
                >
                  {localName(c.names, lang)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <ul className="no-scrollbar -mx-4 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2">
          {cities.map((c, i) => {
            const n = counts.get(c.slug);
            return (
              <li key={c.slug} className="w-[68%] shrink-0 snap-start sm:w-[42%] lg:w-[23.5%]">
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
              </li>
            );
          })}
        </ul>
      </section>

      {/* Featured Flagship Stories (Master Spec §12 Screen 3) */}
      {stories.length > 0 && (
        <section className="mt-10" aria-labelledby="flagship-title">
          <div className="flex items-baseline justify-between gap-3">
            <div>
              <SectionTitle id="flagship-title">Stories of the Day</SectionTitle>
              <p className="mt-1 text-support text-muted">Curated, source-grounded cultural narratives</p>
            </div>
            <Link href="/explore" className="inline-flex min-h-11 items-center text-support text-muted hover:text-charcoal">
              Explore stories
            </Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {stories.slice(0, 2).map((s) => (
              <StoryCard
                key={s.slug}
                href={`/stories/${s.slug}`}
                eyebrow={s.citySlug ? s.citySlug.toUpperCase() : "FLAGSHIP STORY"}
                title={s.title}
                summary={s.orientation}
                meta="Approved Narrative · Verified Sources"
                fixtureLabel={s.isFixture ? t("common.devFixture") : undefined}
              />
            ))}
          </div>
        </section>
      )}

      {/* Meaningful Connections (Master Spec §12 Screen 3) */}
      <section className="mt-10" aria-labelledby="connection-title">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <SectionTitle id="connection-title">Follow an unexpected connection</SectionTitle>
            <p className="mt-1 text-support text-muted">
              Discover how places, craft guilds, astronomy and ritual cross paths
            </p>
          </div>
        </div>
        <div className="mt-4 max-w-2xl">
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
            <p className="rounded-md border border-dashed border-border p-4 text-support text-muted">
              {t("home.noConnection")}
            </p>
          )}
        </div>
      </section>

      {/* Prominent Ask TattvaCo Callout Module (Master Spec §12 Screen 3 Item 9) */}
      <section className="mt-14 rounded-2xl border border-forest/30 bg-gradient-to-br from-[#f1f6f2] via-[#eaf2ec] to-[#e1ede4] p-6 sm:p-8 md:p-10 shadow-xs">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-forest">
            <span>✦</span>
            <span>AI Cultural Discovery</span>
          </div>
          <h2 className="mt-2 font-serif text-page font-semibold text-charcoal md:text-page-lg">
            Have a question about India&apos;s living heritage?
          </h2>
          <p className="mt-2 text-body text-muted leading-relaxed">
            Ask open-ended questions about sacred geography, craft guilds, temple architecture or classical music. Every answer is grounded in statutory archives, academic research and verified sources.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/ask"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest transition-colors hover:bg-forest-hover shadow-xs"
            >
              Ask TattvaCo a Question →
            </Link>
            <Link
              href="/explore"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-border bg-surface px-6 text-support font-semibold text-charcoal hover:bg-surface-2 transition-colors"
            >
              Browse Pilot Collections
            </Link>
          </div>
        </div>
      </section>
    </Page>
  );
}
