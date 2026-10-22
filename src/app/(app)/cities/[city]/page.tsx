import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { pageContext } from "@/lib/page";
import { cityStories, getCity, localName, listCities } from "@/lib/content/repo";
import { getCityCulturalData } from "@/lib/content/city-data";
import { languageInfo } from "@/lib/i18n/languages";
import { track } from "@/lib/analytics";
import { ConnectionCard, StoryCard } from "@/components/cards";
import { CityMapPanel } from "@/components/city-map";
import { Notice, Page, SectionTitle } from "@/components/ui";
import { PhotoHero } from "@/components/hero";
import { IconExternal } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const c = await getCity((await params).city);
  return { title: c ? `${c.names.en} · Cultural Ecosystem` : "City" };
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
  const [stories, storiesAny] = await Promise.all([cityStories(slug, lang), cityStories(slug, lang, true)]);
  const list = showOther || stories.length === 0 ? storiesAny : stories;
  const name = localName(city.names, lang);
  const culturalData = getCityCulturalData(slug);
  await track("city_view", { city: slug }, session.analyticsId);

  // Other cities for exploration
  const otherCities = allCities.filter((c) => c.slug !== slug);

  const cityStats: Record<string, { val: string; label: string }[]> = {
    varanasi: [
      { val: "3,000+ Years", label: "Continuous Habitation" },
      { val: "84 Ghats", label: "Sacred Riverfront" },
      { val: "Living", label: "Spiritual Capital" },
      { val: "Global", label: "UNESCO Music City" },
    ],
    jaipur: [
      { val: "1727 CE", label: "Planned Renaissance" },
      { val: "UNESCO", label: "World Heritage City" },
      { val: "19 Instruments", label: "Jantar Mantar Stone Observatory" },
      { val: "Royal Guilds", label: "Gem Cutting & Block Print" },
    ],
    hampi: [
      { val: "1336 CE", label: "Vijayanagara Capital" },
      { val: "UNESCO", label: "Monument Complex" },
      { val: "Tungabhadra", label: "Sacred River Axis" },
      { val: "Granite", label: "Monolithic Architecture" },
    ],
    kochi: [
      { val: "1341 CE", label: "Historic Floods & Port Origin" },
      { val: "Spice Route", label: "Malabar Maritime Hub" },
      { val: "Pluralistic", label: "Syncretic Communities" },
      { val: "Living Nets", label: "Cantilevered Fishing Culture" },
    ],
    kolkata: [
      { val: "1690 CE", label: "Riverine Metropole" },
      { val: "Renaissance", label: "Intellectual & Literary Epicenter" },
      { val: "Kumartuli", label: "Living Clay Sculpting Guild" },
      { val: "Hooghly River", label: "Tidal Cultural Lifeline" },
    ],
    madurai: [
      { val: "2,500+ Years", label: "Sangam Literary Capital" },
      { val: "Vaigai River", label: "Ancient Urban Axis" },
      { val: "Meenakshi", label: "Dravidian Temple Geometry" },
      { val: "Chungidi", label: "Tie & Dye Weaving Lineage" },
    ],
  };

  const cityPromptQuestions: Record<string, string[]> = {
    varanasi: [
      "Why does Varanasi have 84 ghats along the riverfront?",
      "How is Banarasi silk weaving tied to the Ganga?",
    ],
    jaipur: [
      "Why did Sawai Jai Singh build stone instruments at Jantar Mantar?",
      "How do Sanganer block printers use river minerals for natural dyes?",
    ],
    hampi: [
      "Why do the stone pillars of Vijaya Vittala temple ring with musical notes?",
      "How did the Tungabhadra River shape the defense and sacred topography of Vijayanagara?",
    ],
    kochi: [
      "How did maritime trade shape the cantilevered fishing nets of Kochi?",
      "What historical artifacts are preserved in Mattancherry's Paradesi Synagogue?",
    ],
    kolkata: [
      "How do the clay sculptors of Kumartuli use Hooghly river silt for Durga Puja?",
      "What role did College Street Coffee House addas play in the Bengal Renaissance?",
    ],
    madurai: [
      "How does the Chithirai Festival unite Shaivite and Vaishnavite traditions along the Vaigai?",
      "How did Saurashtrian migrant weavers develop the Sungudi tie-and-dye craft in Madurai?",
    ],
  };

  const currentStats = cityStats[slug] ?? [
    { val: "Historic", label: "Cultural Ecosystem" },
    { val: "Pilot", label: "Phase 1 Geography" },
    { val: `${list.length} Stories`, label: "Curated Content" },
    { val: "Verified", label: "Statutory Grounding" },
  ];

  return (
    <Page className="pt-2">
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

      {/* 1. Photographic Hero with Action Bar */}
      <div className="relative isolate overflow-hidden rounded-3xl border border-border/80 bg-stone shadow-sm">
        <div className="relative min-h-[400px] md:min-h-[460px] flex flex-col justify-end p-6 sm:p-8 md:p-12 text-white">
          {city.image ? (
            <Image
              src={city.image.src}
              alt={city.image.alt}
              fill
              priority
              sizes="(min-width: 1200px) 1152px, 100vw"
              className="-z-20 object-cover object-center transition-transform duration-1000 ease-out hover:scale-[1.02]"
            />
          ) : (
            <div className="absolute inset-0 -z-20 bg-gradient-to-br from-[#173D32] via-[#1E4D40] to-[#122F26]" />
          )}
          <div className="scrim absolute inset-0 -z-10" aria-hidden="true" />

          {/* Eyebrow & Region */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-forest/85 border border-white/20 px-3.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white backdrop-blur-xs">
              {culturalData?.region ?? "Cultural Ecosystem"}
            </span>
            {city.image && !city.image.rightsCleared && (
              <span className="text-[10px] text-white/70">Demo photo · Reference rights</span>
            )}
          </div>

          <h1 className="mt-3 font-serif text-display leading-tight text-white md:text-display-lg tracking-tight drop-shadow-xs">
            {name}
          </h1>

          <p className="mt-2.5 max-w-2xl text-body-lead text-white/90 leading-relaxed font-normal">
            {city.taglines[lang] ?? city.taglines.en ?? "A living cultural ecosystem of India"}
          </p>

          {/* Primary Actions Strip */}
          <div className="mt-7 flex flex-wrap items-center gap-3.5">
            <a
              href="#stories-section"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-6 text-support font-semibold text-on-forest hover:bg-forest-hover shadow-xs transition-all active:scale-[0.985]"
            >
              Explore Stories ({list.length}) ↓
            </a>
            <a
              href="#map-section"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 bg-black/35 px-6 text-support font-semibold text-white hover:bg-white/20 backdrop-blur-xs transition-all active:scale-[0.985]"
            >
              Interactive Map
            </a>
            <Link
              href={`/ask?q=${encodeURIComponent(`Tell me about the sacred cultural geography of ${name}`)}`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-sandstone/40 bg-sandstone/20 px-6 text-support font-semibold text-white hover:bg-sandstone/30 backdrop-blur-xs transition-all active:scale-[0.985]"
            >
              Ask TattvaCo ✦
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Sub-navigation tabs */}
      <nav aria-label="City sub-sections" className="no-scrollbar -mx-4 mt-6 overflow-x-auto px-4 border-b border-border pb-3">
        <ul className="flex w-max items-center gap-2 text-support font-medium">
          <li>
            <a href="#overview" className="rounded-full bg-forest text-on-forest px-4 py-1.5 shadow-xs font-semibold">
              Overview
            </a>
          </li>
          <li>
            <a href="#stories-section" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5 transition-colors">
              Stories ({list.length})
            </a>
          </li>
          <li>
            <a href="#map-section" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5 transition-colors">
              Map & Landmarks
            </a>
          </li>
          <li>
            <a href="#themes-section" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5 transition-colors">
              Cultural Themes
            </a>
          </li>
          <li>
            <a href="#traditions-section" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5 transition-colors">
              Living Traditions
            </a>
          </li>
          <li>
            <a href="#travel-lens" className="rounded-full bg-surface border border-border text-charcoal hover:bg-surface-2 px-4 py-1.5 transition-colors">
              Cultural Lens Tips
            </a>
          </li>
        </ul>
      </nav>

      {/* 3. 4 Verified Stat Cards */}
      <section className="mt-8 grid grid-cols-2 gap-3.5 sm:grid-cols-4" aria-label="Key facts">
        {currentStats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border/80 bg-surface p-5 shadow-2xs">
            <p className="font-serif text-section md:text-section-lg font-semibold text-forest tracking-tight">{stat.val}</p>
            <p className="mt-1 text-meta text-muted leading-tight">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* 4. Two-Column Editorial Layout */}
      <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-10">
        {/* Left Column: Main Narrative Content */}
        <div className="space-y-14">
          {/* Overview */}
          <section id="overview" aria-labelledby="overview-title">
            <SectionTitle id="overview-title">About {name}</SectionTitle>
            <p className="mt-3.5 text-body text-charcoal leading-relaxed">
              {culturalData?.region ? `${name} is situated in ${culturalData.region}. ` : ""}
              As one of India&apos;s oldest living cultural nodes, it represents a profound synthesis of sacred geography, artisanal guilds, musical traditions, and philosophical lineages. Every riverfront step, temple corridor, and handloom workshop carries centuries of cumulative craftsmanship and ritual devotion.
            </p>
          </section>

          {/* Cultural Themes Grid */}
          {culturalData && (
            <section id="themes-section" aria-labelledby="themes-title">
              <SectionTitle id="themes-title">Key Cultural Themes</SectionTitle>
              <p className="mt-1 text-support text-secondary-text">The core civilisational threads defining {name}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {culturalData.culturalThemes.map((theme) => (
                  <div
                    key={theme}
                    className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface p-4 hover:border-forest/40 transition-colors shadow-2xs"
                  >
                    <span className="text-terracotta text-sm">✦</span>
                    <span className="text-support font-semibold text-charcoal">{theme}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Flagship Stories */}
          <section id="stories-section" aria-labelledby="stories-title">
            <div className="flex items-baseline justify-between gap-4">
              <div>
                <SectionTitle id="stories-title">{t("city.stories")}</SectionTitle>
                <p className="mt-1 text-support text-secondary-text">{t("city.startIntro")}</p>
              </div>
            </div>

            {list.length === 0 && (
              <Notice className="mt-5" role="status">
                {t("city.empty", { city: name })}
              </Notice>
            )}

            <div className="mt-6 grid gap-5">
              {list.map((s) => (
                <StoryCard
                  key={s.slug}
                  href={`/stories/${s.slug}${s.language !== lang ? "?all=1" : ""}`}
                  eyebrow={name.toUpperCase()}
                  title={s.title}
                  summary={s.orientation}
                  meta="Grounded Narrative · Verified Evidence"
                  languageNote={s.language !== lang ? languageInfo(s.language).native : undefined}
                  fixtureLabel={s.isFixture ? t("common.devFixture") : undefined}
                />
              ))}
            </div>
          </section>

          {/* Living Traditions & Cultural Figures */}
          {culturalData && (
            <section id="traditions-section" aria-labelledby="traditions-title">
              <SectionTitle id="traditions-title">Living Traditions & Custodians</SectionTitle>
              <p className="mt-1 text-support text-secondary-text">Intangible heritage and historical torchbearers</p>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs">
                  <h3 className="font-serif text-card font-semibold text-charcoal">Living Traditions</h3>
                  <ul className="mt-4 space-y-3.5">
                    {culturalData.livingTraditions.map((trad) => (
                      <li key={trad.name} className="border-t border-border-subtle pt-3 first:border-0 first:pt-0">
                        <p className="text-support font-semibold text-forest">{trad.name}</p>
                        <p className="mt-1 text-meta text-secondary-text leading-relaxed">{trad.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs">
                  <h3 className="font-serif text-card font-semibold text-charcoal">Cultural Figures</h3>
                  <ul className="mt-4 space-y-3.5">
                    {culturalData.culturalFigures.map((fig) => (
                      <li key={fig.name} className="border-t border-border-subtle pt-3 first:border-0 first:pt-0">
                        <p className="text-support font-semibold text-charcoal">{fig.name}</p>
                        <p className="mt-0.5 text-meta text-terracotta font-medium">{fig.role} · {fig.era}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Culture-Lens Travel Tips */}
          <section id="travel-lens" className="rounded-3xl border border-gold/25 bg-gradient-to-br from-[#171512] via-[#1a1714] to-[#12100d] p-7 md:p-8 shadow-md" aria-labelledby="tips-title">
            <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.16em] text-gold">
              <span>✦</span>
              <span>Cultural-Lens Exploration Tips</span>
            </div>
            <h2 id="tips-title" className="mt-2.5 font-serif text-section md:text-section-lg font-semibold text-charcoal tracking-tight">
              Visiting {name} with Cultural Context
            </h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-3 text-support text-secondary-text">
              <div className="rounded-2xl bg-surface/70 border border-border/70 p-4">
                <p className="font-semibold text-charcoal">Sacred Etiquette</p>
                <p className="mt-1 text-meta leading-relaxed">Remove footwear at ghats and shrines. Always request permission before photographing rituals or artisans at work.</p>
              </div>
              <div className="rounded-2xl bg-surface/70 border border-border/70 p-4">
                <p className="font-semibold text-charcoal">Living Craft Quarters</p>
                <p className="mt-1 text-meta leading-relaxed">Visit master weaver workshops and GI-registered cooperatives directly to witness traditional pit-looms in action.</p>
              </div>
              <div className="rounded-2xl bg-surface/70 border border-border/70 p-4">
                <p className="font-semibold text-charcoal">Acoustic & Morning Rhythm</p>
                <p className="mt-1 text-meta leading-relaxed">Experience sunrise along the riverfront to hear morning ragas and the ancient call-and-response of temple bells.</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Spatial Orientation, Must-Explore Sites & AI Prompt */}
        <aside className="mt-14 space-y-6 lg:mt-0 min-w-0" aria-label="City discovery tools">
          {/* Spatial Geography Quickcard */}
          {culturalData && (
            <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="inline-block size-2 rounded-full bg-terracotta" aria-hidden="true" />
                <span className="text-meta font-semibold uppercase tracking-wider text-muted">Geography & Spatial Hub</span>
              </div>
              <h3 className="mt-2 font-serif text-card font-semibold text-charcoal">{name}</h3>
              <p className="mt-1 text-meta text-muted leading-relaxed">
                {culturalData.region} · {culturalData.coordinates.lat.toFixed(4)}° N, {culturalData.coordinates.lng.toFixed(4)}° E
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                <a
                  href="#map-section"
                  className="inline-flex min-h-10 items-center justify-center rounded-xl bg-forest/10 border border-forest/20 px-4 text-support font-semibold text-forest hover:bg-forest/15 transition-colors"
                >
                  View on Interactive Map ↓
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${culturalData.coordinates.lat},${culturalData.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-border px-4 text-meta font-semibold text-charcoal hover:bg-surface-2 transition-colors"
                >
                  Open in Google Maps <IconExternal width={13} height={13} />
                </a>
              </div>
            </div>
          )}

          {/* Must-Explore Landmarks */}
          {culturalData && culturalData.landmarks.length > 0 && (
            <div className="rounded-2xl border border-border/80 bg-surface p-6 shadow-2xs">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-card font-semibold text-charcoal">Must-Explore Sites</h3>
                <span className="text-[11px] font-semibold text-terracotta">{culturalData.landmarks.length} sites</span>
              </div>
              <ul className="mt-4 space-y-3.5">
                {culturalData.landmarks.slice(0, 5).map((lm) => (
                  <li key={lm.id} className="border-t border-border-subtle pt-3 first:border-0 first:pt-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="text-support font-semibold text-charcoal">{lm.name}</p>
                      <span className="rounded-full bg-surface-2 border border-border/70 px-2 py-0.5 text-[10px] uppercase font-semibold text-muted">
                        {lm.type.replace("_", " ")}
                      </span>
                    </div>
                    <p className="mt-1 text-meta text-secondary-text leading-snug">{lm.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ask TattvaCo Prompt Card */}
          <div className="rounded-2xl border border-gold/25 bg-gradient-to-br from-[#171512] via-[#1a1714] to-[#12100d] p-6 shadow-md">
            <span className="text-meta font-semibold uppercase tracking-[0.16em] text-gold">✦ Ask TattvaCo</span>
            <h3 className="mt-1.5 font-serif text-card font-semibold text-charcoal">
              Curious about {name}?
            </h3>
            <p className="mt-1 text-meta text-secondary-text leading-relaxed">
              Ask any source-grounded question about monuments, weaving techniques, or living traditions.
            </p>
            <div className="mt-4 space-y-2">
              {((cityPromptQuestions[slug] ?? [
                `What is the cultural significance of ${name}?`,
                `What historical traditions are preserved in ${name}?`,
              ])).map((qText) => (
                <Link
                  key={qText}
                  href={`/ask?q=${encodeURIComponent(qText)}`}
                  className="block rounded-xl border border-border/80 bg-surface p-3 text-meta font-medium text-charcoal hover:border-forest hover:text-forest transition-all shadow-2xs"
                >
                  “{qText}” →
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* 5. Full-Width Interactive Cultural Map Section */}
      {culturalData && (
        <section id="map-section" className="mt-16 scroll-mt-6" aria-labelledby="city-map-title">
          <CityMapPanel
            city={culturalData}
            cityName={name}
            googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}
          />
        </section>
      )}

      {/* 6. Other Pilot Cities Strip */}
      <section className="mt-16 border-t border-border pt-10" aria-labelledby="other-cities-title">
        <div className="flex items-baseline justify-between gap-3">
          <div>
            <SectionTitle id="other-cities-title">Explore Other Pilot Cities</SectionTitle>
            <p className="mt-1 text-support text-muted">Continue discovering India&apos;s diverse cultural ecosystems</p>
          </div>
          <Link href="/explore" className="text-support font-semibold text-terracotta hover:underline">
            View all 6 cities →
          </Link>
        </div>

        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {otherCities.map((c) => (
            <li key={c.slug}>
              <Link
                href={`/cities/${c.slug}`}
                className="group relative block aspect-[3/4] overflow-hidden rounded-xl border border-border bg-surface transition-all hover:border-forest/50 hover:shadow-xs"
              >
                {c.image ? (
                  <Image
                    src={c.image.src}
                    alt={c.image.alt}
                    fill
                    sizes="200px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-stone" />
                )}
                <div className="scrim-bottom absolute inset-0" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="font-serif text-support font-semibold text-white">{localName(c.names, lang)}</p>
                  <p className="text-[11px] text-white/75 line-clamp-1">{c.taglines[lang] ?? c.taglines.en}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </Page>
  );
}
