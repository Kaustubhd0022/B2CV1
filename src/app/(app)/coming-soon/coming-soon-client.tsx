"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import { FadeIn, StaggerContainer, StaggerItem, EASING_APPLE } from "@/components/motion";
import { IconAsk, IconDiscover, IconExplore, IconArrow } from "@/components/icons";
import { cx } from "@/components/ui";

interface FeatureDetail {
  id: string;
  title: string;
  badge: string;
  image: string;
  alt: string;
  description: string;
  tagline: string;
  problem: string;
  howItWorks: string[];
  routePoints?: { city: string; theme: string; desc: string }[];
  illustrativeSteps: { label: string; desc: string; image?: string }[];
}

const FEATURES: FeatureDetail[] = [
  {
    id: "cultural-connections",
    title: "Cultural Connections",
    badge: "Coming Soon",
    image: "/images/coming-soon/connections.jpg",
    alt: "Network constellation of cultural connections across India",
    description:
      "Discover how places, people, crafts, food, art, beliefs and history connect across India's cultural landscape.",
    tagline: "A multidimensional cultural graph connecting tangible and intangible heritage.",
    problem:
      "Cultural knowledge is often isolated by single monuments or regional boundaries, missing the deep reciprocal ties that link architectural styles, river systems, and living artisanal guilds.",
    routePoints: [
      { city: "DELHI", theme: "Sultanate & Mughal", desc: "Red sandstone & geometric courtyard gardens" },
      { city: "AGRA", theme: "Living Pietra Dura", desc: "Marble inlay workshops & craft guilds" },
      { city: "FATEHPUR SIKRI", theme: "Syncretic Architecture", desc: "Akbar's synthesis of Gujarati & Persian styles" },
      { city: "JAIPUR", theme: "Astronomy & City Planning", desc: "Pink sandstone & Jantar Mantar instruments" },
    ],
    howItWorks: [
      "Select any monument, craft tradition, or historical figure to reveal its hidden cultural web.",
      "Explore verified epistemic links connecting rituals to artisanal guilds, and architecture to astronomy.",
      "Follow historical exchange routes, shared lineages, and documented syncretic influences across centuries.",
    ],
    illustrativeSteps: [
      { label: "Heritage Landmark", desc: "Varanasi Ghats", image: "/images/coming-soon/hero.jpg" },
      { label: "Local Tradition", desc: "Silk Weavers", image: "/images/coming-soon/artisans.jpg" },
      { label: "Food & Craft", desc: "Zari & Paan Lineage", image: "/images/coming-soon/connections.jpg" },
      { label: "Related Destinations", desc: "Sarnath & Prayagraj", image: "/images/dev/jaipur.jpg" },
    ],
  },
  {
    id: "ai-cultural-trails",
    title: "AI Cultural Trails",
    badge: "Coming Soon",
    image: "/images/coming-soon/trails.jpg",
    alt: "Panoramic terrain showing connected journey route across Jaipur, Varanasi, Hampi, and Madurai",
    description:
      "Explore themed cultural journeys shaped around your interests, available time and places you want to discover.",
    tagline: "Turn your cultural interests into a meaningful journey through India.",
    problem:
      "Standard travel itineraries focus on logistics rather than cultural understanding, offering superficial bucket lists instead of connected historical narratives.",
    routePoints: [
      { city: "JAIPUR", theme: "Architecture", desc: "Royal astronomical observatories & pink sandstone palaces" },
      { city: "VARANASI", theme: "Living Traditions", desc: "Sacred Ganga ghats & age-old ritual guilds" },
      { city: "HAMPI", theme: "History", desc: "Vijayanagara monumental stone ruins & sacred hydrology" },
      { city: "MADURAI", theme: "Spirituality", desc: "Dravidian temple architecture & living rituals" },
    ],
    howItWorks: [
      "Choose a destination and your interests (e.g. temples, crafts, food, architecture).",
      "Explore a proposed cultural trail with connected places and stories.",
      "Review practical visitor information and plan your journey.",
    ],
    illustrativeSteps: [
      { label: "Heritage Landmark", desc: "Amber Fort & Jantar Mantar", image: "/images/dev/jaipur.jpg" },
      { label: "Local Tradition", desc: "Silk Weavers & Rituals", image: "/images/coming-soon/artisans.jpg" },
      { label: "Food & Craft", desc: "Deccan Culinary Heritage", image: "/images/coming-soon/connections.jpg" },
      { label: "Related Destinations", desc: "Hampi & Tungabhadra", image: "/images/dev/hampi.jpg" },
    ],
  },
  {
    id: "festivals-calendar",
    title: "Festival & Events Calendar",
    badge: "Coming Soon",
    image: "/images/coming-soon/festivals.jpg",
    alt: "Kathakali dancer and Indian festival celebration with brass lamps",
    description:
      "Discover festivals, cultural events and regional traditions, with verified dates and useful visitor information.",
    tagline: "Experience India's living rhythmic cycles and seasonal cultural celebrations.",
    problem:
      "Traditional festivals follow regional lunar, solar, and agrarian calendars that are difficult to track reliably and frequently lack authentic cultural etiquette guidance.",
    routePoints: [
      { city: "VARANASI", theme: "Dev Deepawali", desc: "Full moon lighting of 84 ghats" },
      { city: "THRISSUR", theme: "Pooram Festival", desc: "Temple percussion and pageant" },
      { city: "JAIPUR", theme: "Teej & Gangaur", desc: "Monsoon community rituals" },
      { city: "KOHIMA", theme: "Hornbill Festival", desc: "Inter-tribal heritage and music" },
    ],
    howItWorks: [
      "Browse cultural events synchronized to traditional panchangam and regional solar/lunar calendars.",
      "Understand the historical origin, ritual etiquette, and community significance of each celebration.",
      "Receive verified visitor advisories, optimal observation vantage points, and cultural conduct guidelines.",
    ],
    illustrativeSteps: [
      { label: "Sacred Pageant", desc: "Dev Deepawali Lights", image: "/images/coming-soon/festivals.jpg" },
      { label: "Temple Tradition", desc: "Percussion Guilds", image: "/images/coming-soon/hero.jpg" },
      { label: "Community Feast", desc: "Prasadam & Offerings", image: "/images/coming-soon/connections.jpg" },
      { label: "Seasonal Sites", desc: "Pilgrim Corridors", image: "/images/dev/jaipur.jpg" },
    ],
  },
  {
    id: "living-culture-artisans",
    title: "Living Culture & Artisans",
    badge: "Coming Soon",
    image: "/images/coming-soon/artisans.jpg",
    alt: "Craftsman shaping terracotta on pottery wheel",
    description:
      "Meet the artists, craftspeople, performers and communities who keep cultural traditions alive.",
    tagline: "Direct connection to master craftspeople, indigenous arts, and oral traditions.",
    problem:
      "Mass tourism frequently commercializes heritage while failing to sustain the traditional guilds, generational master artisans, and localized lineages.",
    routePoints: [
      { city: "VARANASI", theme: "Banarasi Weaving", desc: "Pit-loom silk brocade guilds" },
      { city: "THANJAVUR", theme: "Tanjore Painting", desc: "Gold-leaf sacred iconography" },
      { city: "BIDAR", theme: "Bidriware Craft", desc: "Zinc-copper alloy silver inlay" },
      { city: "BASTAR", theme: "Dhokra Metallurgy", desc: "4,000-year lost-wax casting" },
    ],
    howItWorks: [
      "Explore verified artisan profiles, traditional guild cooperatives, and studio workshops.",
      "Learn the labor-intensive ancestral techniques behind GI-tagged crafts and folk arts.",
      "Access contact details for ethical craft tours and direct artisan-community patronage.",
    ],
    illustrativeSteps: [
      { label: "Master Artisan", desc: "Generational Weaver", image: "/images/coming-soon/artisans.jpg" },
      { label: "Ancestral Tooling", desc: "Natural Pigments", image: "/images/coming-soon/connections.jpg" },
      { label: "Living Workshop", desc: "Guild Cooperatives", image: "/images/coming-soon/hero.jpg" },
      { label: "Heritage Market", desc: "GI-Protected Bazaars", image: "/images/dev/hampi.jpg" },
    ],
  },
  {
    id: "hidden-india",
    title: "Hidden India",
    badge: "Coming Soon",
    image: "/images/coming-soon/hidden-india.jpg",
    alt: "Ancient geometric stone stepwell ruins",
    description:
      "Find lesser-known cultural destinations through curated stories and responsible travel discovery.",
    tagline: "Uncover secluded heritage sites and untold community narratives.",
    problem:
      "Concentrated tourism strains famous monuments while spectacular heritage sites nearby remain unvisited, underfunded, and overlooked.",
    routePoints: [
      { city: "ABHANERI", theme: "Chand Baori", desc: "3,500 geometric stone steps" },
      { city: "MALUTI", theme: "Terracotta Shrines", desc: "72 surviving medieval temples" },
      { city: "KUMBHALGARH", theme: "Great Fortress", desc: "36 km contiguous stone rampart" },
      { city: "BADAMI", theme: "Chalukyan Caves", desc: "6th-century rock-cut shrines" },
    ],
    howItWorks: [
      "Discover ancient stepwells, cave monasteries, and medieval forts off the standard tourist trail.",
      "Access curated background notes derived from Archaeological Survey records and regional archives.",
      "Practice responsible discovery guidelines designed to respect sacred community spaces.",
    ],
    illustrativeSteps: [
      { label: "Stepwell Architecture", desc: "Chand Baori Abhaneri", image: "/images/coming-soon/hidden-india.jpg" },
      { label: "Terracotta Reliefs", desc: "Maluti Temples", image: "/images/coming-soon/hero.jpg" },
      { label: "Hill Fort System", desc: "Kumbhalgarh Ramparts", image: "/images/dev/jaipur.jpg" },
      { label: "Cave Sanctum", desc: "Badami Rock Shrines", image: "/images/dev/hampi.jpg" },
    ],
  },
  {
    id: "onsite-companion",
    title: "On-Site Cultural Companion",
    badge: "Coming Soon",
    image: "/images/coming-soon/companion.jpg",
    alt: "Hand holding smartphone scanning stone temple carving",
    description:
      "Imagine discovering the stories behind a heritage site through a contextual, mobile-friendly cultural guide.",
    tagline: "Contextual, non-intrusive cultural companion right where you stand.",
    problem:
      "Physical heritage sites often suffer from faded signs, misleading tourist guides, and lack of accessible scholarly context.",
    routePoints: [
      { city: "HAMPI", theme: "Musical Pillars", desc: "Vitthala Temple resonant stone columns" },
      { city: "KHAJURAHO", theme: "Chandela Carvings", desc: "Architectural symbolism & friezes" },
      { city: "ELLORA", theme: "Kailasa Monolith", desc: "Top-down single rock excavation" },
      { city: "KONARK", theme: "Sun Temple Chariot", desc: "Solar dial wheels & celestial riders" },
    ],
    howItWorks: [
      "Point your mobile camera at monument reliefs, temple mandapas, or historic gateways.",
      "Access contextual stories, iconographic interpretations, and architectural blueprints.",
      "Read verified citations and listen to narration in your preferred Indian language.",
    ],
    illustrativeSteps: [
      { label: "Sculptural Relief", desc: "Iconography Decoded", image: "/images/coming-soon/companion.jpg" },
      { label: "Temple Blueprint", desc: "Mandapa Acoustics", image: "/images/coming-soon/hero.jpg" },
      { label: "Archaeological Note", desc: "ASI Epigraphy Data", image: "/images/coming-soon/trails.jpg" },
      { label: "Voice Narration", desc: "Multilingual Audio", image: "/images/dev/jaipur.jpg" },
    ],
  },
];

const INFOGRAPHIC_STEPS = [
  {
    step: "01",
    title: "Place",
    subtitle: "Discover the destination",
    icon: (
      <svg className="size-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    step: "02",
    title: "History",
    subtitle: "Understand its past",
    icon: (
      <svg className="size-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  {
    step: "03",
    title: "People",
    subtitle: "Meet the people",
    icon: (
      <svg className="size-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    step: "04",
    title: "Living Tradition",
    subtitle: "Experience culture today",
    icon: (
      <svg className="size-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
      </svg>
    ),
  },
  {
    step: "05",
    title: "Food & Craft",
    subtitle: "Taste & create with local traditions",
    icon: (
      <svg className="size-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    step: "06",
    title: "Related Destinations",
    subtitle: "Explore more connected places",
    icon: (
      <svg className="size-6 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function ComingSoonClient({ lang }: { lang: string }) {
  const [selectedFeature, setSelectedFeature] = useState<FeatureDetail | null>(null);
  const modalCloseRef = useRef<HTMLButtonElement>(null);

  // Close modal on Escape key & manage focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSelectedFeature(null);
      }
    }
    if (selectedFeature) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      modalCloseRef.current?.focus();
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedFeature]);

  return (
    <div className="min-h-screen bg-[#0C0B0A] text-[#F5F0E8] py-4">
      <div className="relative mx-auto w-full max-w-6xl space-y-16 px-4 pb-28 pt-2 sm:px-6 md:space-y-24 md:px-8">
      {/* ---------------- SECTION B: CINEMATIC HERO ---------------- */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-[#302C25] bg-[#171512] shadow-2xl">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <Image
            src="/images/coming-soon/hero.jpg"
            alt="Ancient Indian temple stone architecture at golden sunset"
            fill
            priority
            sizes="(min-width: 1200px) 1152px, 100vw"
            className="object-cover object-center scale-[1.01] transition-transform duration-1000 ease-out"
          />
          {/* Refined gradient scrim for 100% WCAG contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C0B0A] via-[#0C0B0A]/75 to-[#0C0B0A]/40" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C0B0A]/90 via-[#0C0B0A]/50 to-transparent" />
        </div>

        <div className="flex min-h-[520px] flex-col justify-between p-6 sm:p-10 md:min-h-[580px] md:p-14">
          {/* Eyebrow */}
          <FadeIn delay={0.05}>
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-[#12100E]/85 px-3.5 py-1 text-meta font-semibold uppercase tracking-[0.2em] text-gold shadow-sm backdrop-blur-md">
              <span className="text-xs">✦</span>
              <span>TATTVACO · WHAT&apos;S NEXT</span>
            </div>
          </FadeIn>

          {/* Hero Content with side badge */}
          <div className="mt-auto grid grid-cols-1 items-end gap-8 pt-12 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <FadeIn delay={0.1}>
                <h1 className="font-serif text-display font-semibold leading-[1.08] text-white drop-shadow-md md:text-display-lg">
                  The Next Chapter of <br className="hidden sm:inline" />
                  Cultural Discovery
                </h1>
                <p className="mt-4 max-w-xl text-body-lead text-[#F5F0E8]/90 leading-relaxed drop-shadow-sm">
                  Go beyond places. Discover the stories, people and traditions that connect India&apos;s cultural universe.
                </p>

                {/* CTAs */}
                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <a
                    href="#upcoming-features"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-support font-semibold text-[#0c0b0a] shadow-md transition-all duration-200 hover:bg-gold-hover active:scale-[0.985]"
                  >
                    <span>Explore What&apos;s Coming</span>
                    <span className="text-xs font-bold">↓</span>
                  </a>

                  <Link
                    href="/explore"
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-gold/40 bg-[#12100e]/80 px-6 py-2.5 text-support font-medium text-[#F5F0E8] shadow-sm backdrop-blur-md transition-all duration-200 hover:border-gold hover:bg-[#12100e] active:scale-[0.985]"
                  >
                    <span>Discover Today</span>
                    <span className="text-xs text-gold">→</span>
                  </Link>
                </div>
              </FadeIn>
            </div>

            {/* Right side connected badge (matching reference image) */}
            <div className="hidden lg:col-span-4 lg:flex lg:justify-end">
              <FadeIn delay={0.15}>
                <div className="rounded-2xl border border-gold/25 bg-[#171512]/90 p-5 text-right backdrop-blur-md shadow-lg space-y-1.5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-gold/90">PLACES</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#F5F0E8]/85">PEOPLE</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#F5F0E8]/85">TRADITIONS</p>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-[#F5F0E8]/85">STORIES</p>
                  <div className="pt-1 border-t border-gold/20">
                    <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold">ALL CONNECTED</p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION C: UPCOMING FEATURE CARDS ---------------- */}
      <section id="upcoming-features" className="scroll-mt-24 space-y-8">
        <div>
          <h2 className="font-serif text-section md:text-section-lg font-semibold text-[#F5F0E8] tracking-tight">
            Coming to TattvaCo
          </h2>
          <p className="mt-1 text-body text-[#B7B0A5]">
            Six experiences. One deeper way to discover India.
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feat) => (
            <StaggerItem key={feat.id}>
              <article
                onClick={() => setSelectedFeature(feat)}
                className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-[#302C25] bg-[#171512] transition-all duration-300 hover:border-gold/50 hover:shadow-2xl hover:-translate-y-1 cursor-pointer focus-within:ring-2 focus-within:ring-gold"
              >
                {/* Card Media with Coming Soon Badge */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone">
                  <Image
                    src={feat.image}
                    alt={feat.alt}
                    fill
                    sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#171512] via-transparent to-transparent opacity-80" />

                  {/* Gold Pill Badge */}
                  <div className="absolute right-3.5 top-3.5 z-10">
                    <span className="inline-flex items-center rounded-full border border-gold/40 bg-[#12100e]/90 px-3 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-gold shadow-sm backdrop-blur-md">
                      {feat.badge}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <h3 className="font-serif text-card font-semibold text-[#F5F0E8] group-hover:text-gold transition-colors duration-200">
                      {feat.title}
                    </h3>
                    <p className="mt-2.5 text-support text-[#B7B0A5] leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {/* Card Action Button */}
                  <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#302C25]/80">
                    <span className="text-meta font-medium text-gold group-hover:underline">
                      Explore Preview
                    </span>
                    <button
                      type="button"
                      aria-label={`Preview ${feat.title}`}
                      className="flex size-9 items-center justify-center rounded-full border border-[#302C25] bg-[#12100e] text-gold transition-all duration-200 group-hover:border-gold group-hover:bg-gold group-hover:text-[#0c0b0a] shadow-xs"
                    >
                      <IconArrow width={16} height={16} />
                    </button>
                  </div>
                </div>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ---------------- SECTION E: CULTURAL CONNECTIONS INFOGRAPHIC ---------------- */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-gold/30 bg-[#14120f] shadow-2xl">
        {/* Infographic Panoramic Background */}
        <div className="absolute inset-0 -z-10 overflow-hidden opacity-35">
          <Image
            src="/images/coming-soon/infographic-bg.jpg"
            alt="Panoramic sunset silhouette of Indian temple spires and domes"
            fill
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#14120f]/95 via-[#14120f]/80 to-[#14120f]/95" />
        </div>

        <div className="p-6 sm:p-10 md:p-12">
          {/* Header */}
          <div className="max-w-3xl">
            <h2 className="font-serif text-section sm:text-section-lg font-semibold text-[#F5F0E8] tracking-tight">
              One Journey. Many Cultural Connections.
            </h2>
            <p className="mt-2 text-body text-[#B7B0A5]">
              A place is just the beginning. Explore the people, traditions and stories that bring it to life.
            </p>
          </div>

          {/* Desktop Fluid Sequence (Horizontal flow with connectors) */}
          <div className="mt-12 hidden lg:grid lg:grid-cols-6 lg:gap-3">
            {INFOGRAPHIC_STEPS.map((item, idx) => (
              <div key={item.step} className="relative flex flex-col items-center text-center">
                {/* Connecting arrow line */}
                {idx < INFOGRAPHIC_STEPS.length - 1 && (
                  <div
                    className="absolute left-[calc(50%+28px)] right-[calc(-50%+28px)] top-7 -z-10 border-t border-dashed border-gold/40"
                    aria-hidden="true"
                  />
                )}

                {/* Node Circle */}
                <div className="flex size-14 items-center justify-center rounded-full border border-gold/50 bg-[#1e1c18] shadow-md transition-transform duration-300 hover:scale-110 hover:border-gold">
                  {item.icon}
                </div>

                {/* Step Info */}
                <h3 className="mt-4 font-serif text-[15px] font-semibold text-[#F5F0E8]">
                  {item.title}
                </h3>
                <p className="mt-1 text-[13px] text-[#B7B0A5] leading-snug px-1">
                  {item.subtitle}
                </p>
              </div>
            ))}
          </div>

          {/* Mobile Reflow (2x3 connected node sequence matching Reference B Mobile Inset) */}
          <div className="mt-8 rounded-2xl border border-gold/25 bg-[#171512]/90 p-5 lg:hidden">
            <h3 className="text-center font-serif text-[15px] font-semibold text-gold mb-6 tracking-wide">
              One Journey. Many Connections.
            </h3>
            <div className="space-y-4">
              {/* Row 1: Place -> History -> People */}
              <div className="grid grid-cols-3 items-center gap-2 text-center">
                {INFOGRAPHIC_STEPS.slice(0, 3).map((item) => (
                  <div key={item.step} className="flex flex-col items-center">
                    <div className="flex size-12 items-center justify-center rounded-full border border-gold/50 bg-[#1E1C18] text-gold shadow-xs">
                      {item.icon}
                    </div>
                    <span className="mt-2 font-serif text-[12px] font-semibold text-[#F5F0E8]">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[#B7B0A5] line-clamp-1">
                      {item.subtitle}
                    </span>
                  </div>
                ))}
              </div>

              {/* Connecting vertical indicator between Row 1 and Row 2 */}
              <div className="flex justify-end pr-10 text-gold/60 text-xs">
                <span>↓</span>
              </div>

              {/* Row 2: Living Tradition -> Food & Craft -> Related Destinations */}
              <div className="grid grid-cols-3 items-center gap-2 text-center">
                {INFOGRAPHIC_STEPS.slice(3, 6).map((item) => (
                  <div key={item.step} className="flex flex-col items-center">
                    <div className="flex size-12 items-center justify-center rounded-full border border-gold/50 bg-[#1E1C18] text-gold shadow-xs">
                      {item.icon}
                    </div>
                    <span className="mt-2 font-serif text-[12px] font-semibold text-[#F5F0E8]">
                      {item.title}
                    </span>
                    <span className="text-[10px] text-[#B7B0A5] line-clamp-1">
                      {item.subtitle}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION F: RETURN TO DISCOVERY (BOTTOM CTA) ---------------- */}
      <section className="rounded-3xl border border-[#302C25] bg-[#171512] p-8 sm:p-12 text-center shadow-xl">
        <div className="mx-auto max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 text-meta font-semibold uppercase tracking-widest text-gold">
            <span>✦</span>
            <span>EXPERIENCE TATTVACO TODAY</span>
          </div>
          <h2 className="font-serif text-section sm:text-section-lg font-semibold text-[#F5F0E8]">
            Begin Your Discovery With What Exists Today
          </h2>
          <p className="text-body text-[#B7B0A5] leading-relaxed">
            While these upcoming experiences are being crafted, immerse yourself in our curated flagship stories, explore the interactive river corridor atlas, or consult our AI cultural copilot grounded in statutory archives.
          </p>

          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/explore"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-gold px-6 py-2.5 text-support font-semibold text-[#0c0b0a] shadow-xs transition-all duration-200 hover:bg-gold-hover active:scale-[0.985]"
            >
              <IconDiscover width={18} height={18} />
              <span>Explore Cultural Stories</span>
            </Link>

            <Link
              href="/places"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#302C25] bg-[#1E1C18] px-6 py-2.5 text-support font-medium text-[#F5F0E8] shadow-2xs transition-all duration-200 hover:border-gold/40 hover:bg-[#25221D] active:scale-[0.985]"
            >
              <IconExplore width={18} height={18} />
              <span>Interactive Atlas</span>
            </Link>

            <Link
              href="/ask"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#302C25] bg-[#1E1C18] px-6 py-2.5 text-support font-medium text-[#F5F0E8] shadow-2xs transition-all duration-200 hover:border-gold/40 hover:bg-[#25221D] active:scale-[0.985]"
            >
              <IconAsk width={18} height={18} />
              <span>Ask AI Copilot</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- SECTION D: INTERACTIVE FEATURE PREVIEW MODAL ---------------- */}
      <AnimatePresence>
        {selectedFeature && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="preview-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8"
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedFeature(null)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
              aria-hidden="true"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: EASING_APPLE }}
              className="relative z-10 flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gold/40 bg-[#14120f] shadow-2xl text-charcoal"
            >
              {/* Modal Top Header */}
              <div className="flex items-center justify-between border-b border-border/80 bg-[#1a1714] px-6 py-4 sm:px-8">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-gold animate-pulse" />
                  <span className="text-meta font-bold uppercase tracking-[0.2em] text-gold">
                    FEATURE PREVIEW
                  </span>
                </div>
                <button
                  ref={modalCloseRef}
                  onClick={() => setSelectedFeature(null)}
                  type="button"
                  aria-label="Close preview"
                  className="flex size-9 items-center justify-center rounded-full border border-[#302C25] bg-[#1E1C18] text-[#B7B0A5] transition-colors hover:border-gold/50 hover:bg-[#25221D] hover:text-[#F5F0E8] focus:outline-none focus:ring-2 focus:ring-gold"
                >
                  ✕
                </button>
              </div>

              {/* Modal Scrollable Body */}
              <div className="overflow-y-auto p-6 sm:p-8 md:p-10 space-y-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                  {/* Left Column: Visual Map / Route preview */}
                  <div className="lg:col-span-6 space-y-4">
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-border/80 bg-stone shadow-md">
                      <Image
                        src={selectedFeature.image}
                        alt={selectedFeature.alt}
                        fill
                        sizes="(min-width: 1024px) 480px, 100vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#14120f] via-[#14120f]/40 to-transparent" />

                      {/* Route overlay pins for AI Cultural Trails */}
                      {selectedFeature.id === "ai-cultural-trails" ? (
                        <div className="absolute inset-0 pointer-events-none p-4">
                          {/* Jaipur pin */}
                          <div className="absolute left-[12%] top-[18%] flex flex-col items-start">
                            <span className="size-2 rounded-full bg-gold shadow-[0_0_8px_#D6B36A] animate-ping" />
                            <div className="mt-1 rounded-md border border-gold/40 bg-[#0C0B0A]/85 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold backdrop-blur-md">
                              JAIPUR <span className="font-normal text-muted">· Architecture</span>
                            </div>
                          </div>
                          {/* Varanasi pin */}
                          <div className="absolute right-[14%] top-[22%] flex flex-col items-start">
                            <span className="size-2 rounded-full bg-gold shadow-[0_0_8px_#D6B36A]" />
                            <div className="mt-1 rounded-md border border-gold/40 bg-[#0C0B0A]/85 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold backdrop-blur-md">
                              VARANASI <span className="font-normal text-muted">· Living Traditions</span>
                            </div>
                          </div>
                          {/* Hampi pin */}
                          <div className="absolute left-[18%] bottom-[20%] flex flex-col items-start">
                            <span className="size-2 rounded-full bg-gold shadow-[0_0_8px_#D6B36A]" />
                            <div className="mt-1 rounded-md border border-gold/40 bg-[#0C0B0A]/85 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold backdrop-blur-md">
                              HAMPI <span className="font-normal text-muted">· History</span>
                            </div>
                          </div>
                          {/* Madurai pin */}
                          <div className="absolute right-[16%] bottom-[14%] flex flex-col items-start">
                            <span className="size-2 rounded-full bg-gold shadow-[0_0_8px_#D6B36A]" />
                            <div className="mt-1 rounded-md border border-gold/40 bg-[#0C0B0A]/85 px-2 py-0.5 text-[10px] font-bold tracking-wider text-gold backdrop-blur-md">
                              MADURAI <span className="font-normal text-muted">· Spirituality</span>
                            </div>
                          </div>
                        </div>
                      ) : selectedFeature.routePoints ? (
                        <div className="absolute inset-x-4 bottom-4 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-1 text-[11px] font-semibold text-gold bg-[#12100e]/90 p-2.5 rounded-xl border border-gold/30 backdrop-blur-md">
                            {selectedFeature.routePoints.map((pt, i) => (
                              <div key={pt.city} className="flex items-center gap-1.5">
                                <span className="size-1.5 rounded-full bg-gold" />
                                <span>{pt.city}</span>
                                {i < (selectedFeature.routePoints?.length ?? 0) - 1 && (
                                  <span className="text-muted">→</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 id="preview-modal-title" className="font-serif text-section font-semibold text-[#F5F0E8]">
                          {selectedFeature.title}
                        </h3>
                        <span className="rounded-full border border-gold/40 bg-gold/15 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
                          {selectedFeature.badge}
                        </span>
                      </div>
                      <p className="text-support text-gold font-medium">
                        {selectedFeature.tagline}
                      </p>
                      <p className="text-support text-[#B7B0A5] leading-relaxed">
                        {selectedFeature.problem}
                      </p>
                    </div>
                  </div>

                  {/* Right Column: How it could work + Illustrative Journey */}
                  <div className="lg:col-span-6 space-y-6">
                    {/* How it could work */}
                    <div className="rounded-2xl border border-[#302C25] bg-[#191714] p-5 space-y-3.5">
                      <h4 className="text-support font-semibold uppercase tracking-wider text-[#F5F0E8]">
                        How it could work
                      </h4>
                      <ol className="space-y-2.5">
                        {selectedFeature.howItWorks.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-3 text-support text-[#B7B0A5] leading-snug">
                            <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-gold/40 bg-[#12100e] text-[11px] font-bold text-gold">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Illustrative journey */}
                    <div className="space-y-3">
                      <h4 className="text-support font-semibold uppercase tracking-wider text-[#F5F0E8]">
                        Illustrative journey
                      </h4>
                      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                        {selectedFeature.illustrativeSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className="group flex flex-col overflow-hidden rounded-xl border border-[#302C25] bg-[#171512] text-left shadow-xs transition-colors hover:border-gold/50"
                          >
                            {step.image && (
                              <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone">
                                <Image
                                  src={step.image}
                                  alt={step.label}
                                  fill
                                  sizes="160px"
                                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#171512] via-transparent to-transparent opacity-60" />
                              </div>
                            )}
                            <div className="p-2.5 space-y-0.5">
                              <span className="text-[9px] font-bold uppercase tracking-widest text-gold">
                                Step {idx + 1}
                              </span>
                              <h5 className="font-serif text-[12px] font-semibold text-[#F5F0E8] leading-snug line-clamp-1">
                                {step.label}
                              </h5>
                              <p className="text-[10px] text-[#89847C] line-clamp-2 leading-tight">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Coming Soon Callout Note */}
                    <div className="flex items-start gap-3 rounded-2xl border border-gold/30 bg-[#181511] p-4 text-left shadow-xs">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gold/20 text-gold text-xs">
                        ✦
                      </span>
                      <div className="space-y-1">
                        <p className="text-support font-semibold text-gold">Coming Soon</p>
                        <p className="text-meta text-[#B7B0A5] leading-relaxed">
                          We&apos;re building this experience to help you explore India more meaningfully. In the meantime, discover the cultural stories available today.
                        </p>
                      </div>
                    </div>

                    {/* Modal Bottom CTA */}
                    <div className="pt-2">
                      <Link
                        href="/explore"
                        onClick={() => setSelectedFeature(null)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gold py-3 px-6 text-support font-semibold text-[#0c0b0a] shadow-md transition-all duration-200 hover:bg-gold-hover active:scale-[0.985]"
                      >
                        <span>Continue Exploring TattvaCo</span>
                        <span className="text-xs">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      </div>
    </div>
  );
}
