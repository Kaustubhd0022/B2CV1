import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageContext } from "@/lib/page";
import { cityStories, getCity, localName, listCities } from "@/lib/content/repo";
import { getCityCulturalData } from "@/lib/content/city-data";
import { getPilotPlaces } from "@/lib/data/pilot-places";
import { languageInfo } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import { StoryCard } from "@/components/cards";
import { CityCultureLens } from "@/components/city-culture-lens";
import { StoryMiniMap } from "@/components/story-mini-map";
import { Notice, Page, SectionTitle } from "@/components/ui";
import { IconExplore } from "@/components/icons";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const c = await getCity((await params).city);
  return { title: c ? `${c.names.en} · Cultural Ecosystem · TattvaCo` : "City Ecosystem" };
}

export default async function CityPage({
  params,
  searchParams,
}: {
  params: Promise<{ city: string }>;
  searchParams: Promise<{ all?: string }>;
}) {
  const { session, lang, t } = await pageContext();
  const { city: slug } = await params;
  const [city, allCities] = await Promise.all([getCity(slug), listCities()]);
  if (!city) notFound();

  const showOther = (await searchParams).all === "1";
  const [stories, storiesAny] = await Promise.all([
    cityStories(slug, lang),
    cityStories(slug, lang, true),
  ]);
  const list = showOther || stories.length === 0 ? storiesAny : stories;
  const name = localName(city.names, lang);
  const culturalData = getCityCulturalData(slug);
  const pilotPlaces = getPilotPlaces(slug);
  await track("city_view", { city: slug }, session.analyticsId);

  const otherCities = allCities.filter((c) => c.slug !== slug);

  // 4 Top quantitative city stat cards matching Reference Page 6
  const cityStats: Record<string, { val: string; label: string; sublabel?: string }[]> = {
    varanasi: [
      { val: "3,000+ Yrs", label: "Continuous Living Memory", sublabel: "Oldest living sacred city" },
      { val: "84 Ghats", label: "Crescent Riverfront", sublabel: "Stepped stone tirthas" },
      { val: "1,000+ Looms", label: "Kadhwa Silk Weavers", sublabel: "Master Ansari mohallas" },
      { val: "UNESCO", label: "City of Music", sublabel: "Banaras Gharana acoustic seat" },
    ],
    jaipur: [
      { val: "1727 CE", label: "Planned Renaissance", sublabel: "Vastu Shastra nine-square grid" },
      { val: "19 Devices", label: "Jantar Mantar Observatories", sublabel: "Stone astronomical devices" },
      { val: "UNESCO", label: "World Heritage City", sublabel: "Royal architectural precinct" },
      { val: "Chhipa Guilds", label: "Natural Block Printing", sublabel: "Sanganer handcraft legacy" },
    ],
    hampi: [
      { val: "1336 CE", label: "Imperial Capital", sublabel: "Vijayanagara Empire" },
      { val: "4,100 Ha", label: "Monument Complex", sublabel: "UNESCO granite landscape" },
      { val: "1,300+ Yrs", label: "Unbroken Worship", sublabel: "Virupaksha sacred continuity" },
      { val: "56 Pillars", label: "Resonant Stone Colonnade", sublabel: "Acoustic architecture" },
    ],
    kochi: [
      { val: "1341 CE", label: "Maritime Port Genesis", sublabel: "Post-flood Periyar opening" },
      { val: "1568 CE", label: "Paradesi Synagogue", sublabel: "Oldest in Commonwealth" },
      { val: "Spice Axis", label: "Malabar Global Emporium", sublabel: "Black gold trade winds" },
      { val: "Cantilevered", label: "Chinese Fishing Nets", sublabel: "14th-century coastal icon" },
    ],
    kolkata: [
      { val: "1690 CE", label: "Riverine Metropole", sublabel: "Hooghly tidal lifeline" },
      { val: "UNESCO", label: "Durga Puja Public Art", sublabel: "Inscribed in 2021" },
      { val: "250+ Yrs", label: "Kumartuli Clay Guilds", sublabel: "River clay idol masters" },
      { val: "Adda Culture", label: "Intellectual Renaissance", sublabel: "College Street coffee houses" },
    ],
    madurai: [
      { val: "2,500+ Yrs", label: "Sangam Literary Capital", sublabel: "Tamil poetic civilization" },
      { val: "14 Gopurams", label: "Meenakshi Temple City", sublabel: "South tower rises 51.9m" },
      { val: "Lotus Mandala", label: "Concentric City Plan", sublabel: "Sacred Tamil urbanism" },
      { val: "Sungudi", label: "Solar Knot Weaving", sublabel: "Saurashtrian migrant guilds" },
    ],
  };

  const currentStats = cityStats[slug] ?? [
    { val: "Historic", label: "Cultural Ecosystem", sublabel: "Pilot Phase 1 Geography" },
    { val: `${list.length} Stories`, label: "Curated Content", sublabel: "Epistemically grounded" },
    { val: `${pilotPlaces.length} Places`, label: "Cultural Sites", sublabel: "Mapped in Atlas" },
    { val: "Verified", label: "Statutory Grounding", sublabel: "ASI & archival citations" },
  ];

  const cityPromptQuestions: Record<string, string[]> = {
    varanasi: [
      "Why does Varanasi have 84 ghats along the riverfront?",
      "How is Banarasi silk weaving tied to the sacred geography of Kashi?",
      "What is the significance of the Subah-e-Banaras morning ritual at Assi Ghat?",
    ],
    jaipur: [
      "Why did Sawai Jai Singh build stone instruments instead of brass astrolabes at Jantar Mantar?",
      "How do Sanganer block printers use river minerals for natural dyes?",
      "How does the nine-square Vastu grid define the Pink City?",
    ],
    hampi: [
      "Why do the stone pillars of Vijaya Vittala temple ring with musical notes?",
      "How did the Tungabhadra River shape the defense and sacred topography of Vijayanagara?",
      "How did Virupaksha Temple survive the 1565 destruction of the capital?",
    ],
    kochi: [
      "How did maritime trade shape the cantilevered fishing nets of Fort Kochi?",
      "What historical artifacts are preserved in Mattancherry's Paradesi Synagogue?",
      "How did Kathakali evolve from Kerala temple theaters?",
    ],
    kolkata: [
      "How do the clay sculptors of Kumartuli use Hooghly river silt for Durga Puja?",
      "What role did College Street Coffee House addas play in the Bengal Renaissance?",
      "What is the history of the Victoria Memorial and Marble Palace?",
    ],
    madurai: [
      "How does the Chithirai Festival unite Shaivite and Vaishnavite traditions along the Vaigai?",
      "How did Saurashtrian migrant weavers develop the Sungudi tie-and-dye craft in Madurai?",
      "What is the architectural symbolism of Meenakshi Temple's 14 gopurams?",
    ],
  };

  const prompts = cityPromptQuestions[slug] ?? cityPromptQuestions.varanasi;

  return (
    <Page className="max-w-[1440px] px-3 sm:px-6 pt-2 pb-16">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 text-meta text-muted">
        <Link href="/" className="hover:text-charcoal transition-colors">
          Home
        </Link>
        <span>›</span>
        <Link href="/explore" className="hover:text-charcoal transition-colors">
          Pilot Cities
        </Link>
        <span>›</span>
        <span className="font-semibold text-charcoal">{name}</span>
      </nav>

      {/* 1. Large Photographic Hero matching Reference Page 6 */}
      <header className="relative isolate overflow-hidden rounded-3xl border border-border/80 bg-[#14110e]">
        <div className="relative min-h-[420px] md:min-h-[480px] flex flex-col justify-end p-6 sm:p-10 md:p-12 text-white">
          {city.image ? (
            <Image
              src={city.image.src}
              alt={city.image.alt}
              fill
              priority
              sizes="(min-width: 1200px) 1440px, 100vw"
              className="-z-20 object-cover object-center"
            />
          ) : (
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#1c1813] via-[#14120f] to-[#0c0a09]" />
          )}
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#0c0a09] via-[#0c0a09]/75 to-transparent" />

          {/* Floating Pill at top */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gold/20 border border-gold/40 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md">
              ✦ Pilot Ecosystem · {culturalData?.region ?? "Cultural Geography"}
            </span>
            <span className="rounded-full bg-surface/80 border border-border px-3 py-1 text-[11px] text-muted backdrop-blur-md">
              {list.length} Curated Stories · {pilotPlaces.length} Mapped Heritage Sites
            </span>
          </div>

          <h1 className="mt-4 font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-sm">
            {name}
          </h1>

          <p className="mt-3 max-w-3xl text-body text-white/90 leading-relaxed font-light md:text-lg">
            {city.taglines[lang] ?? city.taglines.en}
          </p>

          {/* Action Button Row matching Reference Page 6 */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/places?city=${slug}`}
              className="inline-flex min-h-11 items-center gap-2 justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-colors"
            >
              <IconExplore className="size-4 shrink-0 text-white" />
              <span>Explore on Cultural Atlas</span>
            </Link>

            <Link
              href={`/ask?q=${encodeURIComponent(`Tell me about the sacred geography and history of ${name}`)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-gold/40 bg-gold/15 px-5 text-support font-semibold text-gold hover:bg-gold/25 backdrop-blur-xs transition-colors"
            >
              <span>✦ Ask TattvaCo AI</span>
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Top-line 4 Stat Cards matching Reference Page 6 */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="City vital metrics">
        {currentStats.map((stat) => (
          <div
            key={stat.label}
            className="group relative overflow-hidden rounded-2xl border border-border/80 bg-surface p-4 sm:p-5 shadow-xs transition-all hover:border-gold/50 hover:bg-surface-2"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="font-serif text-2xl sm:text-3xl font-bold text-gold tracking-tight">
              {stat.val}
            </p>
            <p className="mt-1 text-meta font-semibold text-charcoal leading-snug">
              {stat.label}
            </p>
            {stat.sublabel && (
              <p className="mt-1 text-[11px] text-muted line-clamp-1 leading-tight">
                {stat.sublabel}
              </p>
            )}
          </div>
        ))}
      </section>

      {/* 3. Two-Column Main City Layout matching Reference Page 6 */}
      <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] xl:grid-cols-[minmax(0,1fr)_25rem]">
        {/* Left Main Column */}
        <div className="min-w-0 space-y-12">
          {/* Cultural Themes Horizontal Rail */}
          {culturalData?.culturalThemes && (
            <section aria-labelledby="themes-heading">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold mb-3">
                <span>✦</span>
                <span>Ecosystem Themes</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {culturalData.culturalThemes.map((theme) => (
                  <span
                    key={theme}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/80 bg-surface px-4 py-1.5 text-meta font-medium text-charcoal shadow-2xs hover:border-gold/40 transition-colors"
                  >
                    <span className="text-gold">✦</span>
                    {theme}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Featured Flagship Stories */}
          <section aria-labelledby="stories-heading">
            <div className="flex items-baseline justify-between gap-4 border-b border-border/60 pb-3">
              <div>
                <h2 id="stories-heading" className="font-serif text-2xl font-semibold text-charcoal">
                  Curated Flagship Stories ({list.length})
                </h2>
                <p className="mt-1 text-meta text-muted">
                  Grounded narrative deep-dives into {name}&apos;s living heritage
                </p>
              </div>
            </div>

            {list.length === 0 ? (
              <Notice className="mt-4" tone="info" role="status">
                No curated stories are currently published for {name}.
              </Notice>
            ) : (
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                {list.map((s) => (
                  <StoryCard
                    key={s.slug}
                    href={`/stories/${s.slug}`}
                    eyebrow={`${name.toUpperCase()} · FLAGSHIP NARRATIVE`}
                    title={s.title}
                    summary={s.orientation}
                    meta="Verified Primary Evidence · Statutory Grounding"
                    fixtureLabel={s.isFixture ? t("common.devFixture") : undefined}
                  />
                ))}
              </div>
            )}
          </section>

          {/* "Plan Your Visit (Culture Lens)" Accordion matching Reference Page 6 */}
          <CityCultureLens citySlug={slug} />

          {/* Living Traditions & Cultural Figures */}
          {culturalData && (
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Cultural Figures */}
              <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Cultural Figures & Thinkers
                  </h3>
                </div>
                <ul className="space-y-3">
                  {culturalData.culturalFigures.map((fig) => (
                    <li key={fig.name} className="border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-serif text-support font-semibold text-charcoal">{fig.name}</span>
                        <span className="text-[11px] font-mono text-gold">{fig.era}</span>
                      </div>
                      <p className="text-meta text-muted mt-0.5">{fig.role}</p>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Living Traditions */}
              <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2 border-b border-border/70 pb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                  <h3 className="font-serif text-lg font-semibold text-charcoal">
                    Living Traditions & Rites
                  </h3>
                </div>
                <ul className="space-y-3">
                  {culturalData.livingTraditions.map((trad) => (
                    <li key={trad.name} className="border-b border-border/40 pb-2.5 last:border-0 last:pb-0">
                      <span className="font-serif text-support font-semibold text-charcoal">{trad.name}</span>
                      <p className="text-meta text-muted mt-0.5 leading-snug">{trad.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Mini-Map, Must Explore Places, Ask AI */}
        <aside className="min-w-0 space-y-6">
          {/* 1. Geographical Context Mini-Map Card matching Reference Page 6 */}
          <StoryMiniMap
            cityName={name}
            citySlug={slug}
            coordinates={culturalData?.coordinates}
            tagline={city.taglines[lang] ?? city.taglines.en}
          />

          {/* 2. Must-Explore Heritage Sites matching Reference Page 6 */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h3 className="font-serif text-card font-semibold text-charcoal">
                Must-Explore Heritage Sites
              </h3>
              <span className="text-[11px] font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full border border-gold/25">
                {pilotPlaces.length} mapped
              </span>
            </div>

            <ul className="mt-3 space-y-2.5">
              {pilotPlaces.slice(0, 5).map((place) => (
                <li key={place.id}>
                  <Link
                    href={`/places?city=${slug}&place=${place.id}`}
                    className="group block rounded-xl border border-border/70 bg-surface-2/60 p-3 hover:border-gold/40 hover:bg-surface-2 transition-all"
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="font-serif text-support font-semibold text-charcoal group-hover:text-gold transition-colors">
                        {place.name}
                      </span>
                      <span className="text-[10px] uppercase font-semibold text-gold bg-gold/10 px-1.5 py-0.5 rounded-xs border border-gold/20">
                        {place.typeLabel}
                      </span>
                    </div>
                    <p className="mt-1 text-meta text-muted line-clamp-1">
                      {place.subtitle}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-border/60">
              <Link
                href={`/places?city=${slug}`}
                className="w-full inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border bg-surface text-meta font-semibold text-charcoal hover:border-gold/50 hover:bg-surface-2 transition-colors"
              >
                <span>View All Sites on Interactive Map →</span>
              </Link>
            </div>
          </div>

          {/* 3. Ask TattvaCo AI Module matching Reference Page 6 */}
          <div className="rounded-2xl border border-[#F0DCE4] bg-white/80 backdrop-blur-md p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
              <span>✦</span>
              <span>Ask TattvaCo About {name}</span>
            </div>
            <p className="text-meta text-[#5A4450] leading-relaxed">
              Inquire into historical disputes, architectural secrets, or ritual philosophies.
            </p>

            <ul className="space-y-2 pt-1">
              {prompts.map((q) => (
                <li key={q}>
                  <Link
                    href={`/ask?q=${encodeURIComponent(q)}`}
                    className="block rounded-lg border border-[#F0DCE4] bg-white/90 p-2 text-meta text-[#20101B] hover:border-amber-600/40 hover:text-amber-800 transition-colors shadow-2xs leading-snug"
                  >
                    {q} →
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 4. Other Pilot Ecosystems Switcher */}
          {otherCities.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs">
              <h3 className="font-serif text-card font-semibold text-charcoal mb-3">
                Other Pilot Ecosystems
              </h3>
              <div className="flex flex-wrap gap-2">
                {otherCities.map((oc) => (
                  <Link
                    key={oc.slug}
                    href={`/cities/${oc.slug}`}
                    className="rounded-full border border-border/70 bg-surface-2 px-3.5 py-1 text-meta font-medium text-secondary-text hover:border-gold/40 hover:text-charcoal transition-colors"
                  >
                    {localName(oc.names, lang)}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </Page>
  );
}
