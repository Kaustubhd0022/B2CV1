import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { pageContext } from "@/lib/page";
import { cityStoryCounts, listAllPublishedStories, listCities, localName } from "@/lib/content/repo";
import { CityCard, StoryCard } from "@/components/cards";
import { FadeIn, MotionCard, StaggerContainer, StaggerItem } from "@/components/motion";
import {
  IconSearch,
  IconPlaces,
  IconPeople,
  IconFestivals,
  IconFood,
  IconCrafts,
  IconHistory,
  IconBeliefs,
  IconMusic,
  IconCommunities,
} from "@/components/icons";
import { Notice, Page, SectionTitle } from "@/components/ui";

export const metadata: Metadata = {
  title: "Explore by Theme · India's Cultural Ecosystems",
  description:
    "Explore humanity's cultural knowledge in one place. Discover traditions, architecture, music, rituals, and craft practices organized across nine foundational cultural categories and six geographic regions.",
};

const CATEGORIES = [
  {
    id: "places",
    label: "Places & Sacred Geography",
    Icon: IconPlaces,
    count: "42 Sites",
    desc: "Ancient riverfronts, stepped tanks, living temple sanctuaries, and sacred mandalas.",
    image: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "people",
    label: "People & Thinkers",
    Icon: IconPeople,
    count: "28 Masters",
    desc: "Mystic poets, saint-weavers, master astronomers, and visionary dynastic monarchs.",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "festivals",
    label: "Festivals & Rituals",
    Icon: IconFestivals,
    count: "34 Celebrations",
    desc: "Twilight Maha Aarti, grand car festivals, community Durga Puja, and seasonal equinoxes.",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "food",
    label: "Food Cultures",
    Icon: IconFood,
    count: "18 Traditions",
    desc: "Sacred temple prasad, Malabar spice routes, slow fermentation, and culinary philosophy.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "crafts",
    label: "Crafts & Master Guilds",
    Icon: IconCrafts,
    count: "26 Guilds",
    desc: "Kadhwa handloom silk, Sanganer natural block prints, Sungudi dyeing, and clay sculpting.",
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "history",
    label: "History & Epochs",
    Icon: IconHistory,
    count: "38 Chronologies",
    desc: "Vedic cosmology, Mauryan pillars, Vijayanagara grandeur, and Bengal intellectual adda.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "beliefs",
    label: "Beliefs & Philosophy",
    Icon: IconBeliefs,
    count: "24 Systems",
    desc: "Moksha and liberation circuits, Shaivite metaphysics, Buddhist Sangha, and syncretism.",
    image: "https://images.unsplash.com/photo-1598977123418-454555aa1641?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "art-music",
    label: "Art & Classical Music",
    Icon: IconMusic,
    count: "31 Lineages",
    desc: "Banaras Gharana tabla, Kathakali temple dramaturgy, acoustic columns, and ragas.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80",
  },
  {
    id: "communities",
    label: "Communities & Mohallas",
    Icon: IconCommunities,
    count: "22 Lineages",
    desc: "Ansari master weavers, Kumartuli clay palas, Paradesi Jews, and Chhipa artisans.",
    image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
  },
];

const FEATURED_COLLECTIONS = [
  {
    title: "Sacred Rivers of India",
    slug: "sacred-rivers",
    desc: "Hydrological lifeblood and sacred geography connecting civilisations from Ganga to Tungabhadra.",
    count: "Riverfront Circuits",
    img: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=800&q=80",
    query: "river",
  },
  {
    title: "Indian Handloom & Textiles",
    slug: "textiles",
    desc: "Ancient warp and weft: Banarasi Kadhwa silk, Sanganer woodblock calico, and Sungudi knot-dyeing.",
    count: "Master Guilds",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&q=80",
    query: "silk",
  },
  {
    title: "Living Temples of Stone",
    slug: "temples",
    desc: "Dravidian gopurams, Nagara spires, Vijayanagara monolithic granite, and acoustic pillars.",
    count: "Sacred Architecture",
    img: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80",
    query: "temple",
  },
  {
    title: "Classical Arts & Gharanas",
    slug: "arts",
    desc: "Acoustic lineages, guru-shishya paramparas, shehnai maestros, and Kerala ritual dramaturgy.",
    count: "Living Lineages",
    img: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=800&q=80",
    query: "music",
  },
  {
    title: "Monsoon & Hydraulic Engineering",
    slug: "water-engineering",
    desc: "Stepwells, cantilevered coastal nets, subterranean aqueducts, and sacred river ghat steps.",
    count: "Hydraulic Heritage",
    img: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80",
    query: "water",
  },
  {
    title: "Clay, Devotion & Public Art",
    slug: "clay-sculpture",
    desc: "From fertile river mud to divine effigies: Bengal's living Durga Puja sculpting tradition.",
    count: "Sculptural Arts",
    img: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=800&q=80",
    query: "clay",
  },
];

const REGIONS = [
  {
    name: "North India",
    states: "Uttar Pradesh · Delhi · Rajasthan",
    cities: "Varanasi · Jaipur",
    desc: "Gangetic sacred geography, pink sandstone masonry, astronomical observatories, and Mughal-Rajput synthesis.",
    query: "varanasi",
  },
  {
    name: "South India",
    states: "Karnataka · Kerala · Tamil Nadu",
    cities: "Hampi · Kochi · Madurai",
    desc: "Granite temple cities, maritime spice ports, Sangam literature, and living Dravidian temple rituals.",
    query: "madurai",
  },
  {
    name: "East India",
    states: "West Bengal · Odisha · Bihar",
    cities: "Kolkata",
    desc: "Hooghly clay sculptors, terracotta temple architecture, intellectual adda, and the Bengal Renaissance.",
    query: "kolkata",
  },
  {
    name: "West India",
    states: "Rajasthan · Gujarat · Maharashtra",
    cities: "Jaipur",
    desc: "Ancient stepwells, desert textile printing guilds, Maratha riverfront patronage, and coastal trade.",
    query: "jaipur",
  },
  {
    name: "Central India",
    states: "Madhya Pradesh · Chhattisgarh",
    cities: "Indore · Ujjain · Sanchi",
    desc: "Ahilyabai Holkar's architectural renaissance, ancient rock-shelters, and Narmada sacred riverfronts.",
    query: "ahilyabai",
  },
  {
    name: "North East India",
    states: "Assam · Meghalaya · Manipur",
    cities: "Majuli · Guwahati",
    desc: "Living root bridges, golden Muga silk weaving, Brahmaputra island monasteries, and sacred groves.",
    query: "assam",
  },
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
    <Page className="max-w-[1440px] px-3 sm:px-6 pt-2">
      {/* 1. Master Editorial Theme Hero matching Reference Page 4 */}
      <FadeIn delay={0.05}>
        <section className="relative overflow-hidden rounded-3xl border border-gold/30 bg-gradient-to-br from-[#171411] via-[#1b1714] to-[#12100d] p-8 sm:p-10 md:p-12 shadow-md">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
              <span>✦</span>
              <span>Explore by Cultural Dimension</span>
            </div>
            <h1 className="mt-3 font-serif text-3xl sm:text-4xl md:text-5xl font-bold leading-tight text-white tracking-tight">
              Explore Humanity&apos;s Cultural Knowledge
            </h1>
            <p className="mt-3 text-body text-secondary-text leading-relaxed font-light md:text-lg">
              Discover sacred geography, ancient astronomy, master craft guilds, and classical music traditions organized across nine foundational cultural categories and six geographic regions.
            </p>

            {/* Integrated Search Bar inside Hero */}
            <form method="get" role="search" className="mt-8 flex max-w-xl items-center gap-2.5">
              <label htmlFor="explore-search" className="sr-only">
                Search themes, stories, and cultural sites
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
                  placeholder="Search stories, traditions, places, or crafts…"
                  className="block w-full min-h-12 rounded-full border border-border/80 bg-surface-2/90 py-2.5 pl-11 pr-4 text-body text-charcoal placeholder:text-muted shadow-2xs focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/25"
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

      {/* 2. 9 Cultural Taxonomy Categories Grid matching Reference Page 4 */}
      <section className="mt-14 sm:mt-16" aria-labelledby="categories-grid-title">
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
              <span>✦</span>
              <span>Foundational Taxonomy</span>
            </div>
            <h2 id="categories-grid-title" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
              Explore 9 Cultural Categories
            </h2>
          </div>
          {activeCategory !== "all" && (
            <Link
              href="/explore"
              className="text-meta font-semibold text-gold hover:underline"
            >
              Reset filter (show all categories)
            </Link>
          )}
        </div>

        <StaggerContainer className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" staggerDelay={0.03}>
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <StaggerItem key={cat.id}>
                <MotionCard className="h-full">
                  <Link
                    href={
                      isSelected
                        ? "/explore"
                        : `/explore?category=${cat.id}${q ? `&q=${encodeURIComponent(q)}` : ""}`
                    }
                    className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-5 transition-all duration-300 ${
                      isSelected
                        ? "border-gold bg-[#1c1814] ring-2 ring-gold/40 shadow-md"
                        : "border-border/80 bg-surface hover:border-gold/50 hover:bg-surface-2 shadow-2xs"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="flex size-11 items-center justify-center rounded-xl bg-surface-2 border border-border/80 text-gold group-hover:bg-gold group-hover:text-[#12100e] transition-colors shadow-2xs">
                          <cat.Icon width={22} height={22} />
                        </span>
                        <span className="rounded-full bg-gold/10 border border-gold/30 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
                          {cat.count}
                        </span>
                      </div>
                      <h3 className="mt-4 font-serif text-xl font-semibold text-charcoal group-hover:text-gold transition-colors tracking-tight">
                        {cat.label}
                      </h3>
                      <p className="mt-2 text-support text-secondary-text leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>

                    <div className="mt-5 flex items-center justify-between text-meta font-medium pt-3 border-t border-border/60">
                      <span className={isSelected ? "text-gold font-semibold" : "text-muted group-hover:text-charcoal transition-colors"}>
                        {isSelected ? "Active Dimension ✓" : "Explore Category →"}
                      </span>
                    </div>
                  </Link>
                </MotionCard>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </section>

      {/* 3. Filtered Curated Flagship Stories matching Selected Category */}
      <section className="mt-14 sm:mt-16" aria-labelledby="theme-stories-title">
        <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <h2 id="theme-stories-title" className="font-serif text-2xl font-semibold text-charcoal">
              {activeCategory === "all"
                ? "Curated Flagship Stories"
                : `Stories in ${CATEGORIES.find((c) => c.id === activeCategory)?.label ?? activeCategory}`} ({filteredStories.length})
            </h2>
            <p className="mt-1 text-meta text-muted">
              Source-grounded cultural narratives across India&apos;s pilot ecosystems
            </p>
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <Notice className="mt-6" tone="info" role="status">
            No stories match this filter in the current pilot selection. Try selecting another category or clearing search filters.
          </Notice>
        ) : (
          <StaggerContainer className="mt-6 grid gap-5 md:grid-cols-2" staggerDelay={0.05}>
            {filteredStories.map((s) => (
              <StaggerItem key={s.slug}>
                <StoryCard
                  href={`/stories/${s.slug}`}
                  eyebrow={s.citySlug ? s.citySlug.toUpperCase() : "CULTURAL NARRATIVE"}
                  title={s.title}
                  summary={s.orientation}
                  meta="Grounded Narrative · Primary Evidence"
                  fixtureLabel={s.isFixture ? t("common.devFixture") : undefined}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* 4. Featured Thematic Collections Rail matching Reference Page 4 */}
      <section className="mt-16 sm:mt-20" aria-labelledby="thematic-collections-title">
        <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
              <span>✦</span>
              <span>Curated Thematic Modules</span>
            </div>
            <h2 id="thematic-collections-title" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
              Featured Thematic Collections
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURED_COLLECTIONS.map((col) => (
            <div
              key={col.title}
              className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-xs transition-all duration-300 hover:border-gold/50 hover:shadow-md"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-stone">
                <Image
                  src={col.img}
                  alt={col.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-3 left-3 rounded-full bg-forest/90 border border-white/20 px-3 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                  {col.count}
                </span>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-gold transition-colors">
                    {col.title}
                  </h3>
                  <p className="mt-1.5 text-meta text-muted leading-relaxed">
                    {col.desc}
                  </p>
                </div>
                <div className="pt-2 border-t border-border/60">
                  <Link
                    href={`/explore?q=${encodeURIComponent(col.query)}`}
                    className="inline-flex items-center gap-1 text-meta font-semibold text-gold hover:underline"
                  >
                    Explore Collection Stories →
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Explore by Region matching Reference Page 4 */}
      <section className="mt-16 sm:mt-20" aria-labelledby="regions-title">
        <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
              <span>✦</span>
              <span>Geographic Portals</span>
            </div>
            <h2 id="regions-title" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
              Explore by Geographic Region
            </h2>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {REGIONS.map((reg) => (
            <Link
              key={reg.name}
              href={`/explore?q=${encodeURIComponent(reg.query)}`}
              className="group rounded-2xl border border-border/80 bg-surface p-5 shadow-xs transition-all duration-300 hover:border-gold/50 hover:bg-surface-2"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold text-charcoal group-hover:text-gold transition-colors">
                  {reg.name}
                </h3>
                <span className="text-gold text-xs">✦</span>
              </div>
              <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
                {reg.states}
              </p>
              <p className="mt-2 text-support text-secondary-text leading-relaxed">
                {reg.desc}
              </p>
              <div className="mt-3.5 flex items-center justify-between pt-2 border-t border-border/60 text-[11px] text-muted">
                <span>Pilot: {reg.cities}</span>
                <span className="text-gold font-semibold group-hover:translate-x-1 transition-transform">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 6. Pilot Cities Section */}
      <section className="mt-16 sm:mt-20 border-t border-border/70 pt-12" aria-labelledby="cities-section-title">
        <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
              <span>✦</span>
              <span>Pilot Ecosystems</span>
            </div>
            <h2 id="cities-section-title" className="mt-1 font-serif text-2xl sm:text-3xl font-semibold text-charcoal">
              Six Pilot Cities ({filteredCities.length})
            </h2>
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

      {/* 7. Bottom Editorial Quote Banner matching Reference Page 4 */}
      <section className="mt-16 sm:mt-20 mb-8 rounded-3xl border border-gold/30 bg-gradient-to-br from-[#161310] via-[#1a1714] to-[#12100d] p-8 sm:p-12 text-center shadow-md">
        <div className="max-w-3xl mx-auto space-y-3">
          <span className="text-gold text-lg">✦</span>
          <blockquote className="font-serif text-xl sm:text-2xl md:text-3xl italic font-normal text-white leading-relaxed">
            &ldquo;Culture is not a monument of the past, but an active memory lived every day in sacred water, woven silk, and resonant stone.&rdquo;
          </blockquote>
          <p className="text-meta font-semibold uppercase tracking-widest text-gold pt-2">
            TattvaCo Cultural Discovery Engine
          </p>
        </div>
      </section>
    </Page>
  );
}
