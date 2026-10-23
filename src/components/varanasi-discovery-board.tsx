"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
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
  IconConnect,
  IconArrow,
  IconExplore,
} from "./icons";
import { FadeIn, MotionCard, StaggerContainer, StaggerItem } from "./motion";
import {
  StatutoryEvidenceBadge,
  CulturalMediaReel,
  type CulturalMediaItem,
  AcousticShrinePlayer,
  type AcousticTrack,
} from "./media";

const VARANASI_MEDIA_ITEMS: CulturalMediaItem[] = [
  {
    id: "media-ghats",
    type: "photo",
    title: "Crescent Riverfront Stone Embankments & 84 Ghats",
    description:
      "Monumental stone stairs and bastions built under 18th-century Maratha patronage along the north-flowing sacred Ganga.",
    src: "/images/dev/varanasi-hero.jpg",
    institution: "Archaeological Survey of India (ASI) & Sahapedia",
    institutionUrl: "https://asi.nic.in/",
    licenseLabel: "Statutory Protected Heritage Survey",
    tierBadge: "Tier 1: Statutory Authority",
    yearOrPeriod: "18th Century CE",
  },
  {
    id: "media-aarti",
    type: "photo",
    title: "Ganga Twilight Maha Aarti Fire Offering",
    description:
      "Seven Hindu priests chant Vedic hymns while offering multi-tiered brass lamps at Dashashwamedh Ghat during dusk.",
    src: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80",
    institution: "UNESCO Intangible Cultural Heritage & Sahapedia",
    institutionUrl: "https://ich.unesco.org/en/state/india-IN",
    licenseLabel: "Living Heritage Documentation",
    tierBadge: "Tier 1: Statutory Authority",
    yearOrPeriod: "Unbroken Daily Ritual",
  },
  {
    id: "media-kadhwa",
    type: "photo",
    title: "Kadhwa Pure Gold Zari Brocade Pit-Loom Weaving",
    description:
      "Ansari master weavers in Madanpura hand-engrave pure gold zari motifs on pit looms without floating threads, meeting GI Application No. 99 standards.",
    src: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80",
    institution: "Geographical Indications Registry & Crafts Museum",
    institutionUrl: "https://ipindia.gov.in/",
    licenseLabel: "GI Registered Craft Application #99",
    tierBadge: "Tier 1: Statutory Authority",
    yearOrPeriod: "GI Tag Certified",
  },
  {
    id: "media-mandala",
    type: "archive_document",
    title: "Panchakroshi Cosmic Mandala Circumambulation Circuit",
    description:
      "Archival survey of the 50-mile sacred pilgrim trail encoding Varanasi as a cosmic yantra between Varuna and Assi rivers.",
    src: "https://images.unsplash.com/photo-1598977123418-454555aa1641?auto=format&fit=crop&w=1200&q=80",
    institution: "Indira Gandhi National Centre for the Arts (IGNCA)",
    institutionUrl: "https://ignca.gov.in/",
    licenseLabel: "Sacred Geography Research Monograph",
    tierBadge: "Tier 1: Statutory Authority",
    yearOrPeriod: "Puranic & Spatial Survey",
  },
];

const BANARAS_GHARANA_TRACK: AcousticTrack = {
  id: "track-banaras-gharana",
  title: "Morning River Ragas & Rhythmic Tala Lineage",
  tradition: "Banaras Gharana (Tabla & Shehnai)",
  scaleOrRaga: "Raga Bhairav · Subah-e-Banaras",
  sourceInstitution: "Sangeet Natak Akademi Archives",
  sourceUrl: "https://sangeetnatak.gov.in/",
};

export interface CulturalTileItem {
  id: string;
  category: string;
  categoryKey: "places" | "people" | "history" | "festivals" | "food" | "crafts" | "beliefs" | "music";
  title: string;
  description: string;
  image: string;
  badge: string;
  href: string;
  metric?: string;
  actionLabel: string;
}

const CULTURAL_TILES: CulturalTileItem[] = [
  {
    id: "places-ghats",
    category: "Places & Heritage",
    categoryKey: "places",
    title: "The Crescent Riverfront",
    description: "84 stepped stone tirthas along the sacred Ganga, built by Maratha and Rajput monarchs.",
    image: "/images/dev/varanasi-ghats.jpg",
    badge: "Sacred Geography",
    href: "/stories/varanasi-ghats",
    metric: "84 Ghats",
    actionLabel: "Read Story",
  },
  {
    id: "crafts-kadhwa",
    category: "Arts, Crafts & Guilds",
    categoryKey: "crafts",
    title: "Kadhwa Silk Handloom Guilds",
    description: "Master Muslim Ansari weavers hand-engraving pure gold zari motifs on pit looms without floating threads.",
    image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=700&q=80",
    badge: "GI Protected Handloom",
    href: "/stories/varanasi-ghats",
    metric: "1,000+ Looms",
    actionLabel: "Explore Craft",
  },
  {
    id: "tradition-aarti",
    category: "Festivals & Living Traditions",
    categoryKey: "festivals",
    title: "Ganga Twilight Maha Aarti",
    description: "Choreographed multi-tiered brass lamp offering performed at dusk on Dashashwamedh Ghat.",
    image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=700&q=80",
    badge: "Unbroken Ritual",
    href: "/places?city=varanasi&place=dashashwamedh-ghat",
    metric: "Sunset Ritual",
    actionLabel: "Inspect Site",
  },
  {
    id: "music-gharana",
    category: "Arts & Classical Music",
    categoryKey: "music",
    title: "Banaras Gharana & Sitar Lines",
    description: "The rhythmic lineage of Pandit Ravi Shankar and Ustad Bismillah Khan echoing across riverside mohallas.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=700&q=80",
    badge: "UNESCO City of Music",
    href: "/ask?q=Tell%20me%20about%20the%20Banaras%20Gharana%20music%20tradition",
    metric: "200+ Yrs Tradition",
    actionLabel: "Ask Copilot",
  },
  {
    id: "people-kabir",
    category: "People & Cultural Thinkers",
    categoryKey: "people",
    title: "Sant Kabir & Goswami Tulsidas",
    description: "Mystic saint-weavers who challenged orthodoxy and translated cosmic truths into vernacular poetry.",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=700&q=80",
    badge: "Bhakti Renaissance",
    href: "/ask?q=How%20did%20Sant%20Kabir%20and%20Tulsidas%20shape%20Varanasi%20culture?",
    metric: "15th–16th Century",
    actionLabel: "Explore Thinkers",
  },
  {
    id: "history-moksha",
    category: "History & Ancient Epochs",
    categoryKey: "history",
    title: "Three Millennia of Continuous Memory",
    description: "The Mahashmashana at Manikarnika Ghat functioning as an unbroken site of liberation and cosmic continuity.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=700&q=80",
    badge: "Oldest Living City",
    href: "/places?city=varanasi&place=manikarnika-ghat",
    metric: "3,000+ Yrs",
    actionLabel: "View Heritage",
  },
  {
    id: "food-malaiyyo",
    category: "Food & Culinary Culture",
    categoryKey: "food",
    title: "Winter Malaiyyo & Banarasi Paan",
    description: "Dew-whipped saffron milk foam prepared under the open winter night sky, and age-old betel leaf mastery.",
    image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=700&q=80",
    badge: "Slow Food Heritage",
    href: "/ask?q=What%20is%20the%20cultural%20history%20behind%20Banarasi%20Malaiyyo%20and%20Paan?",
    metric: "Seasonal Alchemy",
    actionLabel: "Culinary Notes",
  },
  {
    id: "beliefs-mandala",
    category: "Beliefs & Sacred Geography",
    categoryKey: "beliefs",
    title: "Panchakroshi Cosmic Mandala",
    description: "A 50-mile sacred circumambulation circuit encoding Kashi as a cosmic yantra between Varuna and Assi rivers.",
    image: "https://images.unsplash.com/photo-1598977123418-454555aa1641?auto=format&fit=crop&w=700&q=80",
    badge: "Sacred Geometry",
    href: "/connections/varanasi-ghats-and-ganga-river",
    metric: "Cosmic Yantra",
    actionLabel: "Follow Link",
  },
];

const JOURNEY_STEPS = [
  {
    step: "01",
    label: "Sacred Place",
    title: "Dashashwamedh Ghat",
    desc: "Ancient riverfront tirtha where the north-flowing Ganga embraces the sacred city.",
    tag: "Riverfront",
    href: "/places?city=varanasi&place=dashashwamedh-ghat",
  },
  {
    step: "02",
    label: "Living Ritual",
    title: "Twilight Maha Aarti",
    desc: "Multi-tiered brass fire lamps offered nightly by seven priests chanting Vedic mantras.",
    tag: "Tradition",
    href: "/stories/varanasi-ghats",
  },
  {
    step: "03",
    label: "Master Craft",
    title: "Kadhwa Brocade Weaving",
    desc: "Ansari master weavers threading gold zari into pure mulberry silks in Madanpura mohallas.",
    tag: "Handloom Guild",
    href: "/stories/varanasi-ghats",
  },
  {
    step: "04",
    label: "Classical Sound",
    title: "Banaras Gharana Ragas",
    desc: "Acoustic riverfront morning scales bridging temple chanting and classical shehnai.",
    tag: "Acoustic Seat",
    href: "/ask?q=What%20defines%20the%20Banaras%20Gharana%20musical%20style?",
  },
  {
    step: "05",
    label: "Curated Synthesis",
    title: "The Crescent Riverfront",
    desc: "Explore the complete verified flagship story connecting 84 ghats to sacred liberation.",
    tag: "Flagship Story",
    href: "/stories/varanasi-ghats",
  },
];

const CATEGORY_SCRUBBERS = [
  { id: "all", label: "All Dimensions", count: 8 },
  { id: "places", label: "Places & Ghats", count: 2 },
  { id: "crafts", label: "Living Crafts", count: 2 },
  { id: "festivals", label: "Traditions & Rituals", count: 2 },
  { id: "music", label: "Music & Art", count: 1 },
  { id: "food", label: "Food Cultures", count: 1 },
];

export function VaranasiDiscoveryBoard({ userEmail }: { userEmail?: string | null } = {}) {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [inquiryText, setInquiryText] = useState("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [ritualPhase, setRitualPhase] = useState<{ name: string; phase: string }>({
    name: "Living Ghats Atmosphere",
    phase: "Riverfront Contemplation",
  });

  // Calculate live Varanasi Indian Standard Time (IST) & ritual phase
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Formatter for IST (Asia/Kolkata)
      const istTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setCurrentTime(istTime);

      // Get IST hours
      const istHour = parseInt(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hour12: false,
        }).format(now),
        10,
      );

      if (istHour >= 4 && istHour < 7) {
        setRitualPhase({
          name: "Subah-e-Banaras",
          phase: "Dawn Vedic Chanting & Assi Ghat Ragas",
        });
      } else if (istHour >= 7 && istHour < 12) {
        setRitualPhase({
          name: "Morning Snana",
          phase: "Riverfront Pilgrimage & Temple Shringar",
        });
      } else if (istHour >= 12 && istHour < 17) {
        setRitualPhase({
          name: "Mohalla Craft Life",
          phase: "Handloom Weavers & Artisan Alleyways",
        });
      } else if (istHour >= 17 && istHour < 20) {
        setRitualPhase({
          name: "Sandhya Maha Aarti",
          phase: "Twilight Multi-Tiered Brass Lamps",
        });
      } else {
        setRitualPhase({
          name: "Ganga Ratri",
          phase: "Nocturnal River Silence & Cosmic Vigil",
        });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const filteredTiles = useMemo(() => {
    if (activeCategory === "all") return CULTURAL_TILES;
    if (activeCategory === "places") return CULTURAL_TILES.filter((t) => t.categoryKey === "places" || t.categoryKey === "history");
    if (activeCategory === "crafts") return CULTURAL_TILES.filter((t) => t.categoryKey === "crafts");
    if (activeCategory === "festivals") return CULTURAL_TILES.filter((t) => t.categoryKey === "festivals" || t.categoryKey === "beliefs");
    if (activeCategory === "music") return CULTURAL_TILES.filter((t) => t.categoryKey === "music" || t.categoryKey === "people");
    if (activeCategory === "food") return CULTURAL_TILES.filter((t) => t.categoryKey === "food");
    return CULTURAL_TILES;
  }, [activeCategory]);

  return (
    <div className="space-y-12">
      {/* ── 1. Varanasi-Led Hero & Floating Frosted Discovery Board ────────────── */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-gold/30 bg-[#12100e] shadow-xl">
        {/* Full-bleed authentic Varanasi riverfront photographic backdrop */}
        <div className="absolute inset-0 -z-20">
          <Image
            src="/images/dev/varanasi-hero.jpg"
            alt="The sacred crescent riverfront of Varanasi at sunrise with wooden boats on the Ganga"
            fill
            priority
            sizes="(min-width: 1200px) 1400px, 100vw"
            className="object-cover object-center scale-[1.02] filter contrast-[1.05]"
          />
          {/* Deep cinematic frosted overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0c0a] via-[#0d0c0a]/80 to-[#0d0c0a]/35" />
          <div className="scrim absolute inset-0" aria-hidden="true" />
        </div>

        {/* Content container */}
        <div className="relative z-10 p-5 sm:p-8 md:p-12">
          {/* Top Badge & Live Ritual Clock Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-6 border-b border-white/15">
            <div className="flex flex-wrap items-center gap-3">
              {userEmail && (
                <div className="flex items-center gap-2 rounded-full border border-gold/40 bg-black/60 px-3 py-1 backdrop-blur-md">
                  <span className="flex size-5 items-center justify-center rounded-full bg-gold/20 font-serif text-[11px] font-bold text-gold">
                    {userEmail.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="text-[11px] font-medium text-white/90">
                    {userEmail.split("@")[0]}
                  </span>
                </div>
              )}
              <div className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-[#14120f]/85 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold shadow-sm backdrop-blur-md">
                <span className="text-xs">✦</span>
                <span>VARANASI CULTURAL ANCHOR · UTTAR PRADESH</span>
              </div>
            </div>

            {/* Live Clock & Ritual Phase Widget (Adapted from template visitor clock) */}
            <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-black/45 px-4 py-1.5 text-meta text-white/90 backdrop-blur-md">
              <span className="size-2 rounded-full bg-gold animate-pulse" aria-hidden="true" />
              <span className="font-mono text-xs font-semibold text-gold">
                {currentTime || "10:45:00 AM"} IST
              </span>
              <span className="text-white/40">·</span>
              <span className="text-white/90 font-medium hidden sm:inline">
                {ritualPhase.name}: <span className="text-gold/90">{ritualPhase.phase}</span>
              </span>
            </div>
          </div>

          {/* Master Headline and Dek */}
          <div className="mt-8 max-w-3xl">
            <p className="flex items-center gap-2 text-meta font-semibold uppercase tracking-[0.2em] text-sandstone">
              <IconExplore width={15} height={15} className="text-gold" />
              <span>India, Connected Through Culture</span>
            </p>
            <h1 className="mt-3 font-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.08] text-white tracking-tight drop-shadow-sm">
              Discover the Stories Behind India
            </h1>
            <p className="mt-3 max-w-2xl text-body-lead text-white/90 leading-relaxed font-light">
              Explore the sacred riverfronts, master craft guilds, and living philosophies that bring India&apos;s cultural heritage to life.
            </p>
          </div>

          {/* ── Floating Frosted-Glass Discovery Board (Template Signature Element) ── */}
          <div className="mt-10 rounded-3xl border border-white/25 bg-[#171410]/85 p-5 sm:p-7 md:p-8 shadow-2xl backdrop-blur-xl">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
              {/* Left Column: Featured Varanasi Story Prop Card with Gold Star Accent */}
              <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-gold/30 bg-[#1e1a15]/90 p-5 shadow-lg">
                {/* Decorative Gold Star Sticker Accent */}
                <div className="absolute top-4 right-4 flex items-center justify-center size-8 rounded-full bg-gold/15 border border-gold/40 text-gold text-sm shadow-xs backdrop-blur-md">
                  ✦
                </div>

                <div>
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
                    <span>✦</span>
                    <span>Curated Flagship Narrative</span>
                  </div>
                  <h2 className="mt-2.5 font-serif text-2xl font-bold text-white group-hover:text-gold transition-colors leading-tight">
                    The Crescent Riverfront: Sacred Geometry of Varanasi&apos;s 84 Ghats
                  </h2>
                  <p className="mt-2 text-support text-white/80 leading-relaxed">
                    Trace how 84 monumental stone tirthas, master silk guilds, and twilight fire rituals form an unbroken civilizational axis along the north-flowing Ganga.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatutoryEvidenceBadge type="asi" title="ASI Protected Riverfront" />
                    <StatutoryEvidenceBadge type="gi" title="GI Registry #99" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href="/stories/varanasi-ghats"
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gold px-5 text-support font-semibold text-on-gold hover:bg-gold-hover shadow-xs transition-colors"
                    >
                      Read Narrative →
                    </Link>
                    <Link
                      href="/places?city=varanasi"
                      className="inline-flex min-h-10 items-center justify-center rounded-full border border-white/30 bg-black/40 px-4 text-support font-medium text-white hover:bg-black/60 transition-colors"
                    >
                      View on Map
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Cultural Command Widgets (Search, Stats & Quick Links) */}
              <div className="flex flex-col justify-between space-y-5">
                {/* Cultural AI Copilot Inquiry Box */}
                <form
                  action="/ask"
                  method="get"
                  className="rounded-2xl border border-border/80 bg-surface-2/95 p-4 shadow-sm"
                >
                  <label htmlFor="board-inquiry" className="block text-meta font-semibold uppercase tracking-wider text-gold">
                    Ask TattvaCo Cultural AI
                  </label>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="relative flex-1">
                      <IconSearch
                        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
                        width={17}
                        height={17}
                      />
                      <input
                        id="board-inquiry"
                        name="q"
                        value={inquiryText}
                        onChange={(e) => setInquiryText(e.target.value)}
                        placeholder="Ask anything about Varanasi's ghats, silks, or music…"
                        className="block w-full min-h-11 rounded-full border border-border/70 bg-surface pl-10 pr-4 text-support text-charcoal placeholder:text-muted focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex min-h-11 items-center justify-center rounded-full bg-forest px-5 text-support font-semibold text-on-forest hover:bg-forest-hover transition-colors shadow-xs"
                    >
                      Ask ✦
                    </button>
                  </div>

                  {/* Seed prompts */}
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-muted">Try:</span>
                    {[
                      "Why does Varanasi have 84 ghats?",
                      "How are Banarasi silks tied to the Ganga?",
                      "Banaras Gharana music history",
                    ].map((seed) => (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => setInquiryText(seed)}
                        className="rounded-full border border-border/60 bg-surface px-2.5 py-0.5 text-[11px] text-secondary-text hover:text-gold hover:border-gold/40 transition-colors"
                      >
                        {seed}
                      </button>
                    ))}
                  </div>
                </form>

                {/* Quantitative Cultural Vital Metrics (2x2 Grid) */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-border/70 bg-surface/80 p-3.5">
                    <span className="font-serif text-2xl font-bold text-gold">84 Ghats</span>
                    <p className="text-meta text-muted mt-0.5">Crescent stone riverfront axis</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-surface/80 p-3.5">
                    <span className="font-serif text-2xl font-bold text-gold">3,000+ Yrs</span>
                    <p className="text-meta text-muted mt-0.5">Unbroken living urban memory</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-surface/80 p-3.5">
                    <span className="font-serif text-2xl font-bold text-gold">1,000+ Looms</span>
                    <p className="text-meta text-muted mt-0.5">Ansari master silk weavers</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-surface/80 p-3.5">
                    <span className="font-serif text-2xl font-bold text-gold">UNESCO</span>
                    <p className="text-meta text-muted mt-0.5">Creative city of musical heritage</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Pill Scrubber / Category Filter Bar ───────────────────────── */}
      <section aria-label="Cultural category scrubber">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gold flex items-center gap-1.5">
              <span>✦</span> Curated Dimensions
            </span>
            <h2 className="mt-1 font-serif text-2xl font-semibold text-charcoal">
              Explore India&apos;s Cultural Ecosystems
            </h2>
          </div>
          <Link href="/explore" className="text-support font-semibold text-forest hover:underline">
            View all categories →
          </Link>
        </div>

        {/* Pill scrubber */}
        <div className="no-scrollbar mt-5 flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORY_SCRUBBERS.map((scrubber) => {
            const isActive = activeCategory === scrubber.id;
            return (
              <button
                key={scrubber.id}
                type="button"
                onClick={() => setActiveCategory(scrubber.id)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-support font-semibold transition-all shadow-2xs flex items-center gap-2 ${
                  isActive
                    ? "bg-gold text-on-gold shadow-xs"
                    : "border border-border/80 bg-surface text-charcoal hover:border-gold/40 hover:bg-surface-2"
                }`}
              >
                <span>{scrubber.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    isActive ? "bg-black/20 text-on-gold" : "bg-surface-2 text-muted"
                  }`}
                >
                  {scrubber.count}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. 8 Cultural Discovery Tiles (Subject-Specific Imagery) ─────── */}
      <section aria-label="Cultural discovery tiles">
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.04}>
          {filteredTiles.map((tile) => (
            <StaggerItem key={tile.id}>
              <MotionCard className="h-full">
                <Link
                  href={tile.href}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-2xs transition-all duration-300 hover:border-gold/50 hover:shadow-lg"
                >
                  {/* Photo Container with Scrim */}
                  <div className="relative aspect-[16/11] w-full overflow-hidden bg-stone">
                    <Image
                      src={tile.image}
                      alt={tile.title}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/30 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-surface/90 border border-gold/40 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-gold backdrop-blur-md">
                        {tile.badge}
                      </span>
                    </div>
                    {tile.metric && (
                      <div className="absolute bottom-2.5 right-3">
                        <span className="rounded-full bg-black/60 border border-white/20 px-2.5 py-0.5 text-[11px] font-mono font-medium text-white backdrop-blur-md">
                          {tile.metric}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Tile Content */}
                  <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                        {tile.category}
                      </span>
                      <h3 className="mt-1 font-serif text-lg font-bold text-charcoal group-hover:text-gold transition-colors leading-snug">
                        {tile.title}
                      </h3>
                      <p className="mt-2 text-support text-secondary-text leading-relaxed line-clamp-2">
                        {tile.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-meta font-semibold text-gold group-hover:text-gold-hover">
                      <span>{tile.actionLabel}</span>
                      <IconArrow width={14} height={14} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </Link>
              </MotionCard>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </section>

      {/* ── 3.5 Living Empirical Media Reel & Acoustic Shrine Player ─────── */}
      <section aria-label="Living Empirical Media Reel" className="space-y-6">
        <CulturalMediaReel
          items={VARANASI_MEDIA_ITEMS}
          title="Living Photographic & Archival Evidence"
          subtitle="Curated primary evidence from the Archaeological Survey of India (ASI), UNESCO Intangible Cultural Heritage, Sahapedia, and the GI Registry."
        />
        <AcousticShrinePlayer track={BANARAS_GHARANA_TRACK} />
      </section>

      {/* ── 4. Interactive Connected Cultural Journey (Place → Living Tradition → Craft → Story) ── */}
      <section className="rounded-3xl border border-gold/25 bg-gradient-to-br from-[#171411] via-[#1b1713] to-[#12100d] p-6 sm:p-8 md:p-10 shadow-md">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-gold">
            <IconConnect width={17} height={17} className="text-gold" />
            <span>Connected Discovery Chain</span>
          </div>
          <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-charcoal">
            Follow a Live Cultural Connection
          </h2>
          <p className="mt-2 text-support text-secondary-text leading-relaxed">
            Discover how Varanasi&apos;s sacred river geography directly breathes life into living temple rituals, master silk handloom mohallas, and classical music gharanas.
          </p>
        </div>

        {/* 5-Step Connected Node Chain */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {JOURNEY_STEPS.map((step, idx) => (
            <Link
              key={step.step}
              href={step.href}
              className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/90 p-4 transition-all duration-300 hover:border-gold hover:bg-surface-2 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-gold bg-gold/10 px-2 py-0.5 rounded-md border border-gold/25">
                    Step {step.step}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-muted tracking-wider">
                    {step.tag}
                  </span>
                </div>
                <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-muted">
                  {step.label}
                </p>
                <h3 className="mt-0.5 font-serif text-support font-bold text-charcoal group-hover:text-gold transition-colors leading-snug">
                  {step.title}
                </h3>
                <p className="mt-2 text-meta text-secondary-text leading-relaxed line-clamp-3">
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-border/50 flex items-center justify-between text-meta font-semibold text-gold">
                <span>Explore</span>
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
