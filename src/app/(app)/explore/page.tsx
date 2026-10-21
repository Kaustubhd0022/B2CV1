import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageContext } from "@/lib/page";
import { cityStoryCounts, listAllPublishedStories, listCities, localName } from "@/lib/content/repo";
import { CityCard, StoryCard } from "@/components/cards";
import { FadeIn, MotionCard, StaggerContainer, StaggerItem } from "@/components/motion";
import { IconSearch } from "@/components/icons";
import { Notice, Page, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Explore by Theme · India's Culture, Many Dimensions" };

const CATEGORIES = [
  { id: "places", label: "Places", icon: "🏛️", count: "6 Cities", desc: "Cities, landscapes, sacred geography & riverfronts" },
  { id: "people", label: "People", icon: "👤", count: "Masters", desc: "Saints, poets, master weavers & cultural visionaries" },
  { id: "festivals", label: "Festivals", icon: "🪔", count: "Living", desc: "Seasonal cycles, sacred processions & community rites" },
  { id: "food", label: "Food", icon: "🍲", count: "Cuisines", desc: "Sacred offerings, regional spice routes & culinary heritage" },
  { id: "crafts", label: "Crafts", icon: "🧵", count: "Guilds", desc: "Banarasi brocade, stone masonry & metallurgy" },
  { id: "history", label: "History", icon: "📜", count: "Chronology", desc: "Archaeological sites, dynasties & historical archives" },
  { id: "beliefs", label: "Beliefs", icon: "🕉️", count: "Philosophy", desc: "Philosophical traditions, sacred mandalas & ritual order" },
  { id: "art-music", label: "Art & Music", icon: "🎶", count: "Gharanas", desc: "Classical ragas, acoustic shrines & temple dance" },
  { id: "communities", label: "Communities", icon: "👥", count: "Lineages", desc: "Artisanal guilds, living lineages & oral cultures" },
];

const FEATURED_COLLECTIONS = [
  { title: "Sacred Rivers of India", slug: "sacred-rivers", desc: "Ecological lifeblood and sacred geography connecting civilisations.", count: "Riverfront Stories", img: "/images/dev/varanasi-hero.jpg" },
  { title: "Indian Handloom & Textiles", slug: "textiles", desc: "Ancient weaves, master guild techniques and silk traditions.", count: "Living Guilds", img: "/images/dev/varanasi-card.jpg" },
  { title: "Temples of South India", slug: "temples", desc: "Dravidian sacred geometry, towering gopurams and acoustic stone shrines.", count: "Sacred Architecture", img: "/images/dev/hampi.jpg" },
  { title: "Classical Arts & Gharanas", slug: "arts", desc: "Acoustic lineages, guru-shishya paramparas and temple dance.", count: "Performing Lineages", img: "/images/dev/jaipur.jpg" },
];

const REGIONS = [
  { name: "North India", states: "Uttar Pradesh, Rajasthan, Punjab", desc: "Gangetic sacred geography, pink sandstone and Mughal-Rajput synthesis." },
  { name: "South India", states: "Karnataka, Kerala, Tamil Nadu", desc: "Granite temple monuments, maritime spice corridors and classical Carnatic arts." },
  { name: "East India", states: "West Bengal, Odisha, Bihar", desc: "River deltas, terracotta temple architecture and philosophical renaissance." },
  { name: "West India", states: "Gujarat, Maharashtra", desc: "Ancient stepwells, coastal trade routes and artisanal textile printing." },
  { name: "Central India", states: "Madhya Pradesh, Chhattisgarh", desc: "Rock-shelter art, tribal traditions and ancient stupa complexes." },
  { name: "North East", states: "Assam, Meghalaya, Manipur", desc: "Living root bridges, golden muga silk and sacred grove conservation." },
];

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; theme?: string; category?: string }>;
}) {
  const { lang, t } = await pageContext();
  const sp = await searchParams;
  const q = (sp.q ?? "").trim().slice(0, 60);
  const activeCategory = sp.category ?? sp.theme ?? "all";

  const [cities, counts, allStories] = await Promise.all([
    listCities(),
    cityStoryCounts(lang),
    listAllPublishedStories(lang),
  ]);

  const needle = q.toLocaleLowerCase();
  const filteredCities = needle
    ? cities.filter((c) =>
        [...Object.values(c.names), ...Object.values(c.taglines)].some((v) =>
          v.toLocaleLowerCase().includes(needle),
        ),
      )
    : cities;

  // Filter stories by search query and active category
  const filteredStories = allStories.filter((s) => {
    const matchesSearch = needle
      ? s.title.toLocaleLowerCase().includes(needle) || s.orientation.toLocaleLowerCase().includes(needle)
      : true;

    if (!matchesSearch) return false;
    if (activeCategory === "all") return true;

    const categoryKeywords: Record<string, string[]> = {
      places: ["places", "geography", "ghats", "river", "city", "architecture"],
      people: ["people", "saint", "poet", "king", "weaver", "artist"],
      festivals: ["festival", "celebration", "aarti", "ritual", "utsav"],
      food: ["food", "cuisine", "spice", "prasad"],
      crafts: ["craft", "silk", "handloom", "weaving", "brocade", "textile"],
      history: ["history", "timeline", "dynasty", "ancient", "century"],
      beliefs: ["belief", "sacred", "moksha", "liberation", "philosophy", "tradition"],
      "art-music": ["art", "music", "gharana", "sound", "performance"],
      communities: ["community", "guild", "lineage", "weaver", "people"],
    };

    const targetKeywords = categoryKeywords[activeCategory] ?? [activeCategory];
    const textCorpus = `${s.title} ${s.orientation} ${s.themes?.join(" ") ?? ""}`.toLocaleLowerCase();
    return targetKeywords.some((kw) => textCorpus.includes(kw));
  });

  return (
    <Page className="pt-2">
      {/* Editorial Theme Hero */}
      <FadeIn delay={0.05}>
        <section className="rounded-3xl border border-border bg-gradient-to-br from-[#EFE9DC] via-[#E7DDCA] to-[#DFD7C7] p-8 sm:p-10 md:p-12 shadow-xs">
          <div className="max-w-2xl">
            <p className="text-meta font-semibold uppercase tracking-[0.18em] text-terracotta">
              ✦ Explore by Dimension
            </p>
            <h1 className="mt-2.5 font-serif text-display leading-tight text-charcoal md:text-display-lg tracking-tight">
              India&apos;s Culture, Many Dimensions
            </h1>
            <p className="mt-3 text-body text-secondary-text leading-relaxed">
              Step beyond geography. Discover how craft, philosophy, ritual, architecture and living lineages form a single interconnected universe.
            </p>

            {/* Search bar inside hero */}
            <form method="get" role="search" className="mt-7 flex max-w-md items-center gap-2.5">
              <label htmlFor="explore-search" className="sr-only">
                Search themes, stories, and places
              </label>
              <div className="relative flex-1">
                <IconSearch
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                  width={18}
                  height={18}
                />
                <input
                  id="explore-search"
                  name="q"
                  defaultValue={q}
                  placeholder="Search stories, traditions, places or crafts…"
                  className="block w-full min-h-12 rounded-full border border-border bg-surface py-2.5 pl-11 pr-4 text-body text-charcoal placeholder:text-muted shadow-2xs focus:border-forest focus:outline-none focus:ring-2 focus:ring-forest/20"
                />
                {activeCategory !== "all" && <input type="hidden" name="category" value={activeCategory} />}
              </div>
              <button
                type="submit"
                className="inline-flex min-h-12 items-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-all active:scale-[0.985]"
              >
                Search
              </button>
            </form>
          </div>
        </section>
      </FadeIn>

      {/* 9 Category Cards Grid */}
      <section className="mt-16 md:mt-20" aria-labelledby="categories-grid-title">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <SectionTitle id="categories-grid-title">Explore 9 Cultural Categories</SectionTitle>
            <p className="mt-1 text-support text-secondary-text">
              Select any category to view curated cultural stories and evidence
            </p>
          </div>
          {activeCategory !== "all" && (
            <Link href="/explore" className="text-support font-semibold text-forest hover:underline">
              Reset filter (show all)
            </Link>
          )}
        </div>

        <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3" staggerDelay={0.04}>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <StaggerItem key={cat.id}>
                <MotionCard className="h-full">
                  <Link
                    href={isSelected ? "/explore" : `/explore?category=${cat.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
                    className={`group relative flex h-full flex-col justify-between rounded-2xl border p-6 transition-all duration-300 ${
                      isSelected
                        ? "border-forest bg-[#F1EBE1] ring-2 ring-forest/30 shadow-xs"
                        : "border-border/80 bg-surface hover:border-forest/40 hover:shadow-md shadow-2xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 border border-border/80 text-sm font-semibold text-terracotta">
                          {cat.icon}
                        </span>
                        <span className="rounded-full bg-surface-2 border border-border/70 px-2.5 py-0.5 text-[11px] font-medium text-secondary-text">
                          {cat.count}
                        </span>
                      </div>
                      <h3 className="mt-3.5 font-serif text-card md:text-section font-semibold text-charcoal group-hover:text-forest transition-colors tracking-tight">
                        {cat.label}
                      </h3>
                      <p className="mt-1.5 text-support text-secondary-text leading-relaxed">{cat.desc}</p>
                    </div>
                    <div className="mt-5 flex items-center justify-between text-meta font-medium pt-3 border-t border-border-subtle">
                      <span className={isSelected ? "text-forest font-semibold" : "text-muted group-hover:text-forest"}>
                        {isSelected ? "Active Filter ✓" : "Explore dimension →"}
                      </span>
                    </div>
                  </Link>
                </MotionCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* Filtered Stories under Selected Dimension */}
      <section className="mt-16 md:mt-20" aria-labelledby="theme-stories-title">
        <div className="flex items-baseline justify-between gap-4 border-b border-border pb-3">
          <div>
            <SectionTitle id="theme-stories-title">
              {activeCategory === "all" ? "Curated Flagship Stories" : `Stories in ${CATEGORIES.find((c) => c.id === activeCategory)?.label ?? activeCategory}`} ({filteredStories.length})
            </SectionTitle>
            <p className="mt-0.5 text-support text-secondary-text">
              Source-grounded cultural narratives across pilot ecosystems
            </p>
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <Notice className="mt-6" tone="info" role="status">
            No stories match this filter in the current pilot selection. Try selecting another category or resetting the search.
          </Notice>
        ) : (
          <StaggerContainer className="mt-6 grid gap-5 md:grid-cols-2" staggerDelay={0.06}>
            {filteredStories.map((s) => (
              <StaggerItem key={s.slug}>
                <StoryCard
                  href={`/stories/${s.slug}`}
                  eyebrow={s.citySlug ? s.citySlug.toUpperCase() : "CULTURAL NARRATIVE"}
                  title={s.title}
                  summary={s.orientation}
                  meta="Grounded Narrative · Verified Evidence"
                  fixtureLabel={s.isFixture ? t("common.devFixture") : undefined}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* Featured Thematic Collections */}
      <section className="mt-16 md:mt-20" aria-labelledby="thematic-collections-title">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <SectionTitle id="thematic-collections-title">Featured Thematic Collections</SectionTitle>
            <p className="mt-1 text-support text-secondary-text">
              Deep-dive cultural modules bridging multiple pilot cities
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_COLLECTIONS.map((col) => (
            <div
              key={col.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-2xs transition-all duration-300 hover:border-forest/40 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
                <Image
                  src={col.img}
                  alt={col.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="scrim-bottom absolute inset-0" />
                <span className="absolute bottom-2.5 left-3 rounded-full bg-forest/85 border border-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
                  {col.count}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-serif text-card font-semibold text-charcoal group-hover:text-forest transition-colors tracking-tight">
                    {col.title}
                  </h3>
                  <p className="mt-1.5 text-support text-secondary-text leading-snug">{col.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border-subtle">
                  <Link
                    href={`/explore?q=${encodeURIComponent(col.title)}`}
                    className="inline-flex items-center text-support font-semibold text-forest hover:underline"
                  >
                    View Stories →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Explore by Region */}
      <section className="mt-16 md:mt-20" aria-labelledby="regions-title">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <SectionTitle id="regions-title">Explore by Region</SectionTitle>
            <p className="mt-1 text-support text-secondary-text">
              Cultural landscapes across India&apos;s geographic zones
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((reg) => (
            <div
              key={reg.name}
              className="rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs transition-all duration-300 hover:border-forest/40 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-card font-semibold text-charcoal tracking-tight">{reg.name}</h3>
                <span className="text-terracotta text-sm">✦</span>
              </div>
              <p className="mt-1 text-meta font-medium text-terracotta">{reg.states}</p>
              <p className="mt-2 text-support text-secondary-text leading-relaxed">{reg.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pilot Cities Section */}
      <section className="mt-16 md:mt-20 border-t border-border pt-12" aria-labelledby="cities-section-title">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <SectionTitle id="cities-section-title">Pilot Cities ({filteredCities.length})</SectionTitle>
            <p className="mt-1 text-support text-secondary-text">Geographic hubs and their connected cultural ecosystems</p>
          </div>
        </div>

        {filteredCities.length === 0 ? (
          <Notice className="mt-5" tone="info" role="status">
            {t("explore.noMatch", { query: q })}
          </Notice>
        ) : (
          <ul className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCities.map((c) => {
              const n = counts.get(c.slug);
              return (
                <li key={c.slug}>
                  <CityCard
                    href={`/cities/${c.slug}`}
                    name={localName(c.names, lang)}
                    tagline={c.taglines[lang] ?? c.taglines.en}
                    taglineNote={c.taglineReviewed ? undefined : t("common.illustrative")}
                    image={c.image}
                    badge={t("city.label")}
                    meta={t("lang.storiesAvailable", { count: n?.inLang ?? 0 })}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <p className="mt-10 text-meta text-muted">{t("explore.pilotNote")}</p>
    </Page>
  );
}
