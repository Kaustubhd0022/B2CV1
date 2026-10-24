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
  AcousticShrinePlayer,
  type AcousticTrack,
  CulturalMediaReel,
  type CulturalMediaItem,
} from "./media";

const BANARAS_GHARANA_TRACK: AcousticTrack = {
  id: "track-banaras-gharana",
  title: "Morning River Ragas & Rhythmic Tala Lineage",
  tradition: "Banaras Gharana (Tabla & Shehnai)",
  scaleOrRaga: "Raga Bhairav · Subah-e-Banaras",
  sourceInstitution: "Sangeet Natak Akademi Archives",
  sourceUrl: "https://sangeetnatak.gov.in/",
};

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
    href: "/stories/varanasi-ghats-architecture-and-river",
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
    href: "/stories/varanasi-silk-weaving-craft-and-living-tradition",
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
    actionLabel: "Inspect Site on Atlas",
  },
  {
    id: "music-gharana",
    category: "Arts & Classical Music",
    categoryKey: "music",
    title: "Banaras Gharana & Sitar Lines",
    description: "The rhythmic lineage of Pandit Ravi Shankar and Ustad Bismillah Khan echoing across riverside mohallas.",
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=700&q=80",
    badge: "UNESCO City of Music",
    href: "/stories/varanasi-music-banaras-gharana",
    metric: "200+ Yrs Tradition",
    actionLabel: "Listen Lineage",
  },
  {
    id: "people-kabir",
    category: "People & Cultural Thinkers",
    categoryKey: "people",
    title: "Sant Kabir & Goswami Tulsidas",
    description: "Mystic saint-weavers who challenged orthodoxy and translated cosmic truths into vernacular poetry.",
    image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=700&q=80",
    badge: "Bhakti Renaissance",
    href: "/places?city=varanasi&place=kashi-vishwanath",
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
    href: "/places?city=varanasi&place=assi-ghat",
    metric: "Seasonal Alchemy",
    actionLabel: "Culinary Notes",
  },
  {
    id: "beliefs-mandala",
    category: "Beliefs & Sacred Geography",
    categoryKey: "beliefs",
    title: "Panchakroshi Cosmic Mandala",
    description: "A 50-mile sacred circumambulation circuit encoding Kashi as a cosmic yantra between Varuna and Assi rivers.",
    image: "/images/dev/varanasi-hero.jpg",
    badge: "Sacred Geometry",
    href: "/stories/varanasi-panchakroshi-yatra",
    metric: "Cosmic Yantra",
    actionLabel: "Explore Mandala",
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
    href: "/stories/varanasi-ghats-architecture-and-river",
  },
  {
    step: "03",
    label: "Master Craft",
    title: "Kadhwa Brocade Weaving",
    desc: "Ansari master weavers threading gold zari into pure mulberry silks in Madanpura mohallas.",
    tag: "Handloom Guild",
    href: "/stories/varanasi-silk-weaving-craft-and-living-tradition",
  },
  {
    step: "04",
    label: "Classical Sound",
    title: "Banaras Gharana Ragas",
    desc: "Acoustic riverfront morning scales bridging temple chanting and classical shehnai.",
    tag: "Acoustic Seat",
    href: "/stories/varanasi-music-banaras-gharana",
  },
  {
    step: "05",
    label: "Curated Synthesis",
    title: "The Crescent Riverfront",
    desc: "Explore the complete verified flagship story connecting 84 ghats to sacred liberation.",
    tag: "Flagship Story",
    href: "/stories/varanasi-ghats-architecture-and-river",
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

const PANCHAKROSHI_STATIONS = [
  {
    num: 1,
    name: "Kardameshwar",
    deity: "Kardama Muni Lingam",
    distance: "Day 1 · Assi to Kandwa (14 km)",
    statutory: "12th Century Gahadavala Stone Temple · ASI State Protected",
    description: "The initial sanctum beside Kardam Lake featuring intact pre-Mughal architectural spires and sacred stepped tank.",
    highlight: "Pre-Mughal Architecture",
  },
  {
    num: 2,
    name: "Bhimchandi",
    deity: "Devi Bhimchandi Shrine",
    distance: "Day 2 · Kandwa to Bhimchandi (18 km)",
    statutory: "Puranic Tirtha Inscription · Kashi Khanda Reference",
    description: "Pilgrims cross sacred agricultural hinterlands to offer water at the ancient Gandharva Kund reservoir.",
    highlight: "Solar Solstice Alignment",
  },
  {
    num: 3,
    name: "Rameshwar",
    deity: "Rameshwar Mahadeva",
    distance: "Day 3 · Along Varuna River (16 km)",
    statutory: "Archaeological Survey of India Inventory #UP-542",
    description: "The serene riverbank station where pilgrims offer symbolic barley grains beside the flowing waters of the Varuna.",
    highlight: "Varuna River Bank Tirtha",
  },
  {
    num: 4,
    name: "Shivpur",
    deity: "Pancha Pandava Shrines",
    distance: "Day 4 · Shivpur Oasis (15 km)",
    statutory: "Dharmashala Historical Archive · Banaras District Gazette",
    description: "An urban-rural boundary sanctuary with five sacred reservoirs, symbolizing cosmic elemental balance.",
    highlight: "Panchatatva Tanks",
  },
  {
    num: 5,
    name: "Kapildhara",
    deity: "Kapil Muni Ashram",
    distance: "Day 5 · Final Descent to Assi (17 km)",
    statutory: "Statutory Sacred Circuit Marker #05 · ASI Documentation",
    description: "The concluding spring and cascade where pilgrims complete the 50-mile yantra circuit, offering sesame seed libations.",
    highlight: "Circuit Climax & Liberation",
  },
];

const FAQS = [
  {
    q: "How does TattvaCo verify its cultural stories and heritage data?",
    a: "Every narrative on TattvaCo is anchored in statutory records from the Archaeological Survey of India (ASI), UNESCO Intangible Cultural Heritage registers, the Geographical Indications (GI) Registry of India, and peer-reviewed cultural research institutions like Sahapedia and IGNCA. Our AI synthesizer is strictly grounded to these primary authorities.",
  },
  {
    q: "What is the flower meadow & astrolabe metaphor in Indian heritage?",
    a: "In Vedic cosmology and Indian sacred geography, botanical offerings (Nelumbo sacred lotus, marigolds, and jasmine) represent terrestrial purity and living devotion, while the brass astrolabe (Yantra-Raj) symbolizes cosmic celestial observation and solar equinox alignments pioneered at Jantar Mantar and Kashi.",
  },
  {
    q: "How do I navigate the Panchakroshi Cosmic Circuit on the Interactive Atlas?",
    a: "You can explore all five sacred staging posts, ancient water kunds, and ASI-protected Gahadavala temples with GPS coordinates, elevation profiles, and oral histories directly on our Cultural Map (/places).",
  },
  {
    q: "Can I query the AI Copilot in Indian regional languages?",
    a: "Yes. TattvaCo's AI Knowledge Engine supports multi-lingual queries across Hindi, Bengali, Tamil, Telugu, Marathi, and English, retaining vernacular cultural terminology such as Tirthas, Mohallas, Gharanas, and Kadhwa pit-loom weaves.",
  },
];

export function CulturalHeroSection({ userEmail }: { userEmail?: string | null } = {}) {
  const [inquiryText, setInquiryText] = useState("");
  const [currentTime, setCurrentTime] = useState<string>("");
  const [ritualPhase, setRitualPhase] = useState<{ name: string; phase: string }>({
    name: "Subah-e-Banaras",
    phase: "Dawn Riverfront Ragas & Chanting",
  });

  // Calculate live Varanasi Indian Standard Time (IST)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const istTime = new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(now);
      setCurrentTime(istTime);

      const istHour = parseInt(
        new Intl.DateTimeFormat("en-IN", {
          timeZone: "Asia/Kolkata",
          hour: "numeric",
          hour12: false,
        }).format(now),
        10,
      );

      if (istHour >= 4 && istHour < 7) {
        setRitualPhase({ name: "Subah-e-Banaras", phase: "Dawn Vedic Chanting & Assi Ragas" });
      } else if (istHour >= 7 && istHour < 12) {
        setRitualPhase({ name: "Morning Snana", phase: "Riverfront Pilgrimage & Temple Shringar" });
      } else if (istHour >= 12 && istHour < 17) {
        setRitualPhase({ name: "Mohalla Craft Life", phase: "Handloom Weavers & Artisan Alleyways" });
      } else if (istHour >= 17 && istHour < 20) {
        setRitualPhase({ name: "Sandhya Maha Aarti", phase: "Twilight Multi-Tiered Brass Lamps" });
      } else {
        setRitualPhase({ name: "Ganga Ratri", phase: "Nocturnal River Silence & Cosmic Vigil" });
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (

      <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-[#F0DCE4] bg-gradient-to-b from-[#FFF5F8] via-[#FDF0F4] to-[#FCE7EF] p-6 sm:p-10 md:p-14 shadow-xl transition-all">
        {/* Soft atmospheric ambient light rings */}
        <div className="pointer-events-none absolute -top-40 -left-40 size-[500px] rounded-full bg-rose-200/40 blur-3xl" aria-hidden="true" />
        <div className="pointer-events-none absolute top-1/3 -right-40 size-[450px] rounded-full bg-amber-100/50 blur-3xl" aria-hidden="true" />

        {/* Top Header Row: Sparkle Badge & IST Ritual Clock */}
        <div className="relative z-20 flex flex-wrap items-center justify-between gap-3 pb-8 border-b border-[#24131E]/10">
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#24131E]/15 bg-white/70 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#24131E] shadow-sm backdrop-blur-md">
              <span className="text-amber-600">✦</span>
              <span>INDIA&apos;S LIVING CULTURAL ARCHIVE & ATLAS</span>
            </div>
            {userEmail && (
              <div className="hidden sm:inline-flex items-center gap-2 rounded-full border border-[#24131E]/10 bg-white/60 px-3 py-1 text-[11px] font-medium text-[#24131E]">
                <span className="size-2 rounded-full bg-emerald-600" />
                <span>{userEmail.split("@")[0]}</span>
              </div>
            )}
          </div>

          <div className="inline-flex items-center gap-2.5 rounded-full border border-[#24131E]/12 bg-white/75 px-4 py-1.5 text-xs font-medium text-[#24131E] shadow-xs backdrop-blur-md">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-mono font-semibold">{currentTime || "10:45:00 AM"} IST</span>
            <span className="text-[#24131E]/30">·</span>
            <span className="hidden sm:inline font-sans text-[#24131E]/80">
              {ritualPhase.name}: <span className="font-semibold text-amber-700">{ritualPhase.phase}</span>
            </span>
          </div>
        </div>

        {/* Hero Title & Refined Editorial Typography */}
        <div className="relative z-20 mt-8 max-w-3xl text-left">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-amber-800">
            <span className="size-1.5 rounded-full bg-amber-600" />
            <span>Sacred Geography · Living Crafts · Acoustic Traditions</span>
          </p>
          <h1 className="mt-4 font-serif text-3xl sm:text-5xl md:text-6xl font-bold leading-[1.08] text-[#20101B] tracking-tight">
            Discover the Sacred Geographies & Living Heritage of India
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-[#5A4550] leading-relaxed font-normal">
            Trace 84 riverfront tirthas, master handloom guilds, ancient astronomical observatories, and Vedic acoustic traditions across verified statutory sources.
          </p>
        </div>

        {/* ── Discovery Board Columns: Featured Story + AI Inquiry + Vital Metrics ── */}
        <div className="relative z-20 mt-10 rounded-3xl border border-white/80 bg-white/75 p-5 sm:p-7 md:p-8 shadow-xl backdrop-blur-xl">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
            {/* Left Column: Featured Varanasi Story Prop Card with Gold Star Accent */}
            <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-[#24131E]/12 bg-white p-5 sm:p-6 shadow-sm">
              <div className="absolute top-4 right-4 flex items-center justify-center size-8 rounded-full bg-amber-500/10 border border-amber-600/30 text-amber-700 text-sm shadow-xs backdrop-blur-md">
                ✦
              </div>

              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                  <span>✦</span>
                  <span>Curated Flagship Narrative</span>
                </div>
                <h2 className="mt-2.5 font-serif text-2xl font-bold text-[#20101B] group-hover:text-amber-800 transition-colors leading-tight">
                  The Crescent Riverfront: Sacred Geometry of Varanasi&apos;s 84 Ghats
                </h2>
                <p className="mt-2 text-support text-[#5A4550] leading-relaxed">
                  Trace how 84 monumental stone tirthas, master silk guilds, and twilight fire rituals form an unbroken civilizational axis along the north-flowing Ganga.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#F0DCE4] flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <StatutoryEvidenceBadge type="asi" title="ASI Protected Riverfront" />
                  <StatutoryEvidenceBadge type="gi" title="GI Registry #99" />
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href="/stories/varanasi-ghats-architecture-and-river"
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#24131E] px-5 text-support font-semibold text-white hover:bg-[#381C2E] shadow-xs transition-colors"
                  >
                    Read Narrative →
                  </Link>
                  <Link
                    href="/places?city=varanasi"
                    className="inline-flex min-h-10 items-center justify-center rounded-full border border-[#24131E]/15 bg-white px-4 text-support font-medium text-[#24131E] hover:bg-[#FAF0F4] transition-colors"
                  >
                    View on Map
                  </Link>
                </div>
              </div>
            </div>

            {/* Right Column: Cultural AI Inquiry Box + 2x2 Vital Cultural Metrics */}
            <div className="flex flex-col justify-between space-y-5">
              {/* Cultural AI Copilot Inquiry Box with Seed Prompts */}
              <form
                action="/ask"
                method="get"
                onSubmit={(e) => {
                  if (!inquiryText.trim()) e.preventDefault();
                }}
                className="rounded-2xl border border-[#F0DCE4] bg-[#FAF0F4]/60 p-4 shadow-xs"
              >
                <label htmlFor="board-inquiry" className="block text-meta font-semibold uppercase tracking-wider text-amber-800">
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
                      className="block w-full min-h-11 rounded-full border border-[#F0DCE4] bg-white pl-10 pr-4 text-support text-[#20101B] placeholder:text-[#8D7882] focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#24131E] px-5 text-support font-semibold text-white hover:bg-[#381C2E] transition-colors shadow-xs shrink-0"
                  >
                    Ask ✦
                  </button>
                </div>

                {/* Seed prompts */}
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] text-[#7E6674]">Try:</span>
                  {[
                    "Why does Varanasi have 84 ghats?",
                    "How are Banarasi silks tied to the Ganga?",
                    "Banaras Gharana music history",
                  ].map((seed) => (
                    <button
                      key={seed}
                      type="button"
                      onClick={() => setInquiryText(seed)}
                      className="cursor-pointer rounded-full border border-[#F0DCE4] bg-white px-2.5 py-0.5 text-[11px] text-[#5A4450] hover:text-amber-800 hover:border-amber-600/40 transition-colors"
                    >
                      {seed}
                    </button>
                  ))}
                </div>
              </form>

              {/* Quantitative Cultural Vital Metrics (2x2 Grid) */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#F0DCE4] bg-white p-3.5 shadow-2xs">
                  <span className="font-serif text-2xl font-bold text-amber-700">84 Ghats</span>
                  <p className="text-meta text-[#5A4450] mt-0.5">Crescent stone riverfront axis</p>
                </div>
                <div className="rounded-xl border border-[#F0DCE4] bg-white p-3.5 shadow-2xs">
                  <span className="font-serif text-2xl font-bold text-amber-700">3,000+ Yrs</span>
                  <p className="text-meta text-[#5A4450] mt-0.5">Unbroken living urban memory</p>
                </div>
                <div className="rounded-xl border border-[#F0DCE4] bg-white p-3.5 shadow-2xs">
                  <span className="font-serif text-2xl font-bold text-amber-700">1,000+ Looms</span>
                  <p className="text-meta text-[#5A4450] mt-0.5">Ansari master silk weavers</p>
                </div>
                <div className="rounded-xl border border-[#F0DCE4] bg-white p-3.5 shadow-2xs">
                  <span className="font-serif text-2xl font-bold text-amber-700">UNESCO</span>
                  <p className="text-meta text-[#5A4450] mt-0.5">Creative city of musical heritage</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Flower Meadow Base Stage with Floating 3D Antique Brass Elements ── */}
        <div className="relative mt-10 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 md:-mx-14 md:-mb-14 overflow-hidden rounded-b-[2.5rem] pt-32 sm:pt-48 md:pt-60">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/flower-meadow-hero.jpg"
              alt="Lush botanical flower meadow with pink lotus, marigolds, and floating antique brass astrolabes"
              fill
              priority
              sizes="(min-width: 1200px) 1400px, 100vw"
              className="object-cover object-bottom"
            />
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#FFF5F8] to-transparent" />
          </div>

          {/* Floating Pill Highlights over the meadow */}
          <div className="relative z-10 px-6 pb-8 sm:px-10 sm:pb-12 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-xs font-semibold text-[#24131E] shadow-lg backdrop-blur-md animate-float-slow">
                <span className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-800 text-[11px] font-bold">
                  84
                </span>
                <span>Sacred Stone Tirthas</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-xs font-semibold text-[#24131E] shadow-lg backdrop-blur-md animate-float-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-800 text-[11px] font-bold">
                  GI
                </span>
                <span>Application #99 Standards</span>
              </div>
              <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/85 px-4 py-2 text-xs font-semibold text-[#24131E] shadow-lg backdrop-blur-md animate-float-reverse">
                <span className="flex size-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-800 text-[11px] font-bold">
                  50
                </span>
                <span>Puranic Miles Cosmic Yantra</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/stories/varanasi-panchakroshi-yatra"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#24131E] px-6 text-xs font-semibold text-white shadow-xl hover:bg-[#381C2E] transition-all active:scale-95"
              >
                <span>Explore Flagship Story</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
  );
}

{/* ─────────────────────────────────────────────────────────────────────────
    2. THE ASYMMETRIC BENTO GRID OF CULTURAL DIMENSIONS & CATEGORY SCRUBBER
────────────────────────────────────────────────────────────────────────── */}
export function CulturalBentoSection() {
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [selectedStation, setSelectedStation] = useState(0);

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
    <div className="space-y-16">
      {/* 2. PILL SCRUBBER & 8 CULTURAL DISCOVERY TILES (Original Subject-Specific Grid) */}
      <section aria-label="Cultural category scrubber" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#F0DCE4] pb-4">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-800 flex items-center gap-1.5">
              <span>✦</span> Curated Dimensions
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-bold text-[#20101B]">
              Explore India&apos;s Cultural Ecosystems
            </h2>
          </div>

          <Link href="/explore" className="text-support font-semibold text-amber-800 hover:text-amber-900 hover:underline">
            View all categories →
          </Link>
        </div>

        {/* Pill scrubber */}
        <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
          {CATEGORY_SCRUBBERS.map((scrubber) => {
            const isActive = activeCategory === scrubber.id;
            return (
              <button
                key={scrubber.id}
                type="button"
                onClick={() => setActiveCategory(scrubber.id)}
                className={`cursor-pointer whitespace-nowrap rounded-full px-4 py-2 text-support font-semibold transition-all shadow-2xs flex items-center gap-2 ${
                  isActive
                    ? "bg-[#24131E] text-white shadow-xs"
                    : "border border-[#F0DCE4] bg-white text-[#20101B] hover:border-amber-600/40 hover:bg-[#FAF0F4]"
                }`}
              >
                <span>{scrubber.label}</span>
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full ${
                    isActive ? "bg-white/20 text-white" : "bg-[#FAF0F4] text-[#7E6674]"
                  }`}
                >
                  {scrubber.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 8 Cultural Discovery Tiles */}
        <StaggerContainer className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4" staggerDelay={0.04}>
          {filteredTiles.map((tile) => (
            <StaggerItem key={tile.id}>
              <MotionCard className="h-full">
                <Link
                  href={tile.href}
                  className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.75rem] border border-[#F0DCE4] bg-white shadow-xs transition-all duration-300 hover:border-amber-600/40 hover:shadow-lg hover:-translate-y-1"
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute top-3 left-3">
                      <span className="rounded-full bg-white/90 border border-white/80 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#24131E] backdrop-blur-md">
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
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-800">
                        {tile.category}
                      </span>
                      <h3 className="mt-1 font-serif text-lg font-bold text-[#20101B] group-hover:text-amber-800 transition-colors leading-snug">
                        {tile.title}
                      </h3>
                      <p className="mt-2 text-support text-[#5A4450] leading-relaxed line-clamp-2">
                        {tile.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-[#F0DCE4] flex items-center justify-between text-meta font-semibold text-amber-800 group-hover:text-amber-900">
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

      {/* ─────────────────────────────────────────────────────────────────────────
          4. THE ASYMMETRIC BENTO GRID OF CULTURAL DIMENSIONS (Matching 21st.dev)
      ────────────────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="bento-title" className="space-y-6">

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
              <span>✦</span>
              <span>LIVING HERITAGE BENTO</span>
            </div>
            <h2 id="bento-title" className="mt-2 font-serif text-2xl sm:text-4xl font-bold text-[#20101B] tracking-tight">
              Four Dimensions of Civilizational Memory
            </h2>
          </div>
          <p className="max-w-md text-support text-[#5A4450]">
            Each card provides an interactive window into statutory evidence, artisanal physics, and unbroken traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Massive Dark Plum Bento Card (Sacred Geography of Panchakroshi) */}
          <div className="md:col-span-7 flex flex-col justify-between rounded-[2rem] border border-[#24131E]/20 bg-[#1E101A] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
            <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-gold/10 blur-3xl" />

            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-gold">
                  <span>✦</span>
                  <span>Sacred Geography</span>
                </span>
                <span className="text-meta text-white/50 font-mono">ASI Protected Circuit</span>
              </div>

              <h3 className="mt-4 font-serif text-2xl sm:text-3xl font-bold leading-tight text-white group-hover:text-gold transition-colors">
                The Panchakroshi Cosmic Mandala
              </h3>
              <p className="mt-2 text-support text-white/70 leading-relaxed max-w-xl">
                The 50-mile circumambulation circuit encoding Varanasi as a living cosmic yantra between the Varuna and Assi rivers, featuring five traditional night halts.
              </p>

              {/* Interactive Station Switcher */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs text-white/60 pb-3 border-b border-white/10">
                  <span className="font-semibold text-gold">Select Yatra Staging Post:</span>
                  <span className="font-mono">{selectedStation + 1} of 5 Stations</span>
                </div>
                <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {PANCHAKROSHI_STATIONS.map((s, idx) => (
                    <button
                      key={s.num}
                      type="button"
                      onClick={() => setSelectedStation(idx)}
                      className={`cursor-pointer shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                        selectedStation === idx
                          ? "bg-gold text-[#12100E] shadow-sm scale-105"
                          : "bg-white/10 text-white/80 hover:bg-white/20"
                      }`}
                    >
                      {s.num}. {s.name}
                    </button>
                  ))}
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 space-y-1.5">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="font-serif text-base font-semibold text-white">
                      {PANCHAKROSHI_STATIONS[selectedStation].name} ({PANCHAKROSHI_STATIONS[selectedStation].deity})
                    </span>
                    <span className="text-gold font-mono text-[11px]">
                      {PANCHAKROSHI_STATIONS[selectedStation].highlight}
                    </span>
                  </div>
                  <p className="text-xs text-white/70 leading-relaxed">
                    {PANCHAKROSHI_STATIONS[selectedStation].description}
                  </p>
                  <p className="text-[11px] text-white/50 italic pt-1">
                    Statutory Evidence: {PANCHAKROSHI_STATIONS[selectedStation].statutory}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <span className="size-2 rounded-full bg-emerald-400" />
                <span>Verified by IGNCA Sacred Geography Monographs</span>
              </div>
              <Link
                href="/stories/varanasi-panchakroshi-yatra"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-gold px-5 text-support font-semibold text-on-gold hover:bg-gold-hover transition-colors shadow-xs"
              >
                <span>Read Full Yatra Story</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 2: Luminous Rose/Ivory Bento Card (Kadhwa Handloom Weaving) */}
          <div className="md:col-span-5 flex flex-col justify-between rounded-[2rem] border border-[#F0DCE4] bg-white p-6 sm:p-8 shadow-xl text-[#24131E] relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#24131E]/20 bg-[#FAF0F4] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#24131E]">
                  <span>✦</span>
                  <span>Living Crafts & GI Tag</span>
                </span>
                <span className="text-meta text-[#6E5863] font-mono">GI Registry #99</span>
              </div>

              <h3 className="mt-4 font-serif text-2xl font-bold leading-tight text-[#20101B] group-hover:text-amber-800 transition-colors">
                Kadhwa Brocade Pit-Looms
              </h3>
              <p className="mt-2 text-support text-[#5B4551] leading-relaxed">
                Ansari master weavers in Madanpura hand-engrave pure gold zari motifs on pit looms without floating threads, taking up to 6 months per textile.
              </p>

              {/* Handloom Metrics Widget */}
              <div className="mt-6 space-y-3 rounded-2xl border border-[#F0DCE4] bg-[#FAF0F4]/70 p-4 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#24131E]">Thread Craftsmanship</span>
                  <span className="font-mono text-amber-800 font-bold">Pure Zari + Mulberry Silk</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] text-[#6E5863]">
                    <span>Warp Density (Taana)</span>
                    <span className="font-semibold text-[#24131E]">9,600 Threads</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#EAD5DE] overflow-hidden">
                    <div className="h-full w-[92%] rounded-full bg-amber-600" />
                  </div>
                </div>
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between text-[11px] text-[#6E5863]">
                    <span>Weft Technique (Baana)</span>
                    <span className="font-semibold text-[#24131E]">Individually Hand-Cut (No Float)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#EAD5DE] overflow-hidden">
                    <div className="h-full w-[85%] rounded-full bg-[#24131E]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[#F0DCE4] flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-medium text-[#6E5863]">Application #99 Certified</span>
              <Link
                href="/stories/varanasi-silk-weaving-craft-and-living-tradition"
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-[#24131E] px-5 text-support font-semibold text-white hover:bg-[#381C2E] transition-colors shadow-sm"
              >
                <span>Inspect Craft Archive</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Card 3: Acoustic Sanctuary & Banaras Gharana */}
          <div className="md:col-span-6 flex flex-col justify-between rounded-[2rem] border border-[#24131E]/20 bg-[#161219] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/30 bg-purple-900/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-purple-300">
                  <span>✦</span>
                  <span>Acoustic Tradition</span>
                </span>
                <span className="text-meta text-white/50 font-mono">UNESCO City of Music</span>
              </div>

              <h3 className="mt-4 font-serif text-2xl font-bold leading-tight text-white group-hover:text-purple-300 transition-colors">
                Banaras Gharana & River Ragas
              </h3>
              <p className="mt-2 text-support text-white/70 leading-relaxed">
                The 200-year rhythmic lineage of Pandit Kanthe Maharaj, Kishan Maharaj, and Bismillah Khan, whose shehnai sounded the dawn over the Ganga.
              </p>

              <div className="mt-6">
                <AcousticShrinePlayer track={BANARAS_GHARANA_TRACK} />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>Source: Sangeet Natak Akademi Archives</span>
              <Link href="/stories/varanasi-music-banaras-gharana" className="text-purple-300 font-semibold hover:underline">
                Explore Gharana Lineage →
              </Link>
            </div>
          </div>

          {/* Card 4: Cosmic Solar Observatory & Samrat Yantra */}
          <div className="md:col-span-6 flex flex-col justify-between rounded-[2rem] border border-[#24131E]/20 bg-[#1E1417] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-900/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-300">
                  <span>✦</span>
                  <span>Observational Astronomy</span>
                </span>
                <span className="text-meta text-white/50 font-mono">ASI Protected Monument</span>
              </div>

              <h3 className="mt-4 font-serif text-2xl font-bold leading-tight text-white group-hover:text-amber-300 transition-colors">
                Man Mahal Astronomical Observatory
              </h3>
              <p className="mt-2 text-support text-white/70 leading-relaxed">
                Erected by Maharaja Sawai Jai Singh II atop Man Mandir Ghat in 1737 CE, featuring massive masonry sundials tracking equatorial time to two-second precision.
              </p>

              <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-300">Samrat Yantra Solar Gnomon</span>
                  <span className="font-mono text-white/70">Latitude 25° 18&apos; N</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-[10px] text-white/50 uppercase">Gnomon Angle</div>
                    <div className="font-mono font-bold text-amber-400 mt-1">25° 18&apos;</div>
                  </div>
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-[10px] text-white/50 uppercase">Time Accuracy</div>
                    <div className="font-mono font-bold text-emerald-400 mt-1">± 2 Seconds</div>
                  </div>
                  <div className="rounded-xl bg-black/40 p-2.5 border border-white/10">
                    <div className="text-[10px] text-white/50 uppercase">Solstice Readout</div>
                    <div className="font-mono font-bold text-purple-400 mt-1">Dakshinayana</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
              <span>Survey: Archaeological Survey of India</span>
              <Link href="/places?city=varanasi&place=man-mandir-ghat" className="text-amber-300 font-semibold hover:underline">
                View on Map Atlas →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

{/* ─────────────────────────────────────────────────────────────────────────
    3. THE 5-STEP CONNECTED DISCOVERY CHAIN (Bridging Place, Ritual, Craft & Music)
────────────────────────────────────────────────────────────────────────── */}
export function CulturalConnectedChainSection() {
  return (
    <section className="rounded-[2.5rem] border border-[#24131E]/20 bg-gradient-to-br from-[#2B1522] via-[#24131E] to-[#1A0E16] p-6 sm:p-8 md:p-10 shadow-xl text-white">
      <div className="max-w-2xl">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-amber-300">
          <IconConnect width={17} height={17} className="text-amber-300" />
          <span>Connected Discovery Chain</span>
        </div>
        <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-white">
          Follow a Live Cultural Connection
        </h2>
        <p className="mt-2 text-support text-white/80 leading-relaxed">
          Discover how sacred river geography directly breathes life into living temple rituals, master silk handloom mohallas, and classical music gharanas.
        </p>
      </div>

      {/* 5-Step Connected Node Chain */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {JOURNEY_STEPS.map((step) => (
          <Link
            key={step.step}
            href={step.href}
            className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:border-amber-400/50 hover:bg-white/10 hover:shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/25">
                  Step {step.step}
                </span>
                <span className="text-[10px] uppercase font-semibold text-white/60 tracking-wider">
                  {step.tag}
                </span>
              </div>
              <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-white/60">
                {step.label}
              </p>
              <h3 className="mt-0.5 font-serif text-support font-bold text-white group-hover:text-amber-300 transition-colors leading-snug">
                {step.title}
              </h3>
              <p className="mt-2 text-meta text-white/70 leading-relaxed line-clamp-3">
                {step.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-meta font-semibold text-amber-300">
              <span>Explore</span>
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

{/* ─────────────────────────────────────────────────────────────────────────
    4. THE INTERACTIVE EXPEDITION SLIDER (Panchakroshi Circuit Immersion)
────────────────────────────────────────────────────────────────────────── */}
export function CulturalExpeditionSection() {
  const [expeditionDays, setExpeditionDays] = useState(5);

  const expeditionMetrics = useMemo(() => {
    if (expeditionDays <= 1) {
      return {
        label: "1 Day · Riverfront Parikrama",
        tirthas: "12 Primary Ghats",
        citations: "14 ASI & UNESCO Citations",
        guilds: "4 Master Weaving Karkhanas",
        distance: "6.5 km walking",
        intensity: "Introductory Riverfront",
      };
    } else if (expeditionDays <= 3) {
      return {
        label: "3 Days · Heritage & Mohalla Circuit",
        tirthas: "36 Sacred Shrines & Ghats",
        citations: "28 Verified Authorities",
        guilds: "9 Guilds & Sitar Gharanas",
        distance: "24 km walking & boat trail",
        intensity: "Moderate Cultural Immersion",
      };
    } else if (expeditionDays <= 5) {
      return {
        label: "5 Days · Panchakroshi Cosmic Mandala",
        tirthas: "84 Ghats + 108 Sacred Stations",
        citations: "42 Statutory Citations",
        guilds: "18 Master Guilds & Archival Sites",
        distance: "80.5 km (50 Puranic Miles)",
        intensity: "Full Cosmic Circumambulation",
      };
    } else {
      return {
        label: "7 Days · Greater Kashi & Sarnath Odyssey",
        tirthas: "All 84 Riverfronts + Sarnath Stupas",
        citations: "65 Statutory & Museum Citations",
        guilds: "25 Artisan Guilds & Oral Archives",
        distance: "115 km comprehensive trail",
        intensity: "Deep Civilizational Expedition",
      };
    }
  }, [expeditionDays]);

  return (
    <section aria-labelledby="expedition-slider-title" className="rounded-[2.5rem] border border-[#24131E]/20 bg-gradient-to-br from-[#2B1522] via-[#24131E] to-[#1A0E16] p-6 sm:p-10 md:p-14 shadow-2xl text-white">
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
          <span>✦</span>
          <span>INTERACTIVE CULTURAL EXPEDITION CALCULATOR</span>
        </div>
        <h2 id="expedition-slider-title" className="mt-2 font-serif text-2xl sm:text-4xl font-bold text-white tracking-tight">
          Plan Your Living Heritage Circuit
        </h2>
        <p className="mt-2 text-body text-white/70 leading-relaxed">
          Drag the expedition slider to calibrate your journey across verified ASI monuments, master weaving quarters, and sacred riverfront ghats.
        </p>
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-white/80">Selected Journey Duration:</span>
              <span className="font-serif text-2xl font-bold text-gold">
                {expeditionDays} {expeditionDays === 1 ? "Day" : "Days"}
              </span>
            </div>

            <div className="space-y-2">
              <input
                type="range"
                min="1"
                max="7"
                step="1"
                value={expeditionDays}
                onChange={(e) => setExpeditionDays(parseInt(e.target.value, 10))}
                className="w-full h-3 bg-white/15 rounded-lg appearance-none cursor-pointer accent-gold"
                aria-label="Expedition Days Slider"
              />
              <div className="flex justify-between text-xs text-white/50 font-mono px-1">
                <span>1 Day (Riverfront)</span>
                <span>3 Days</span>
                <span>5 Days (Panchakroshi)</span>
                <span>7 Days (Greater Kashi)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <div className="text-xs uppercase tracking-wider text-white/50">Expedition Profile</div>
              <div className="mt-1 font-serif text-lg font-bold text-white">
                {expeditionMetrics.label}
              </div>
              <div className="text-xs text-gold/90 mt-0.5">
                Intensity: {expeditionMetrics.intensity}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/places?city=varanasi"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-6 text-support font-semibold text-on-gold hover:bg-gold-hover shadow-md transition-all active:scale-95"
            >
              <span>Plot Route on Cultural Atlas</span>
              <span>→</span>
            </Link>
            <Link
              href="/stories/varanasi-panchakroshi-yatra"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-support font-semibold text-white hover:bg-white/15 transition-all"
            >
              Read Verified Guide
            </Link>
          </div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-gold">Sacred Tirthas</div>
            <div className="mt-2 font-serif text-xl font-bold text-white">{expeditionMetrics.tirthas}</div>
            <p className="mt-1 text-xs text-white/60">Ghats, kunds &amp; temples visited</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Statutory Citations</div>
            <div className="mt-2 font-serif text-xl font-bold text-white">{expeditionMetrics.citations}</div>
            <p className="mt-1 text-xs text-white/60">ASI &amp; UNESCO groundings</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">Master Guilds</div>
            <div className="mt-2 font-serif text-xl font-bold text-white">{expeditionMetrics.guilds}</div>
            <p className="mt-1 text-xs text-white/60">Karkhanas &amp; oral archives</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">Trail Footprint</div>
            <div className="mt-2 font-serif text-xl font-bold text-white">{expeditionMetrics.distance}</div>
            <p className="mt-1 text-xs text-white/60">Calculated parikrama span</p>
          </div>
        </div>
      </div>
    </section>
  );
}

{/* ─────────────────────────────────────────────────────────────────────────
    5. STATUTORY MEDIA ARCHIVE REEL (High-Fidelity Curated Photography)
────────────────────────────────────────────────────────────────────────── */}
export function CulturalEvidenceReelSection() {
  return (
    <section aria-labelledby="reel-title" className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#F0DCE4] pb-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-800">
            <span>✦</span>
            <span>STATUTORY MEDIA ARCHIVE</span>
          </div>
          <h2 id="reel-title" className="mt-1 font-serif text-2xl sm:text-4xl font-bold text-[#20101B] tracking-tight">
            Verified Photographic Evidence
          </h2>
        </div>
        <p className="max-w-md text-support text-[#5A4450]">
          Sourced and accredited in partnership with statutory institutions and academic repositories.
        </p>
      </div>

      <CulturalMediaReel items={VARANASI_MEDIA_ITEMS} />
    </section>
  );
}

{/* ─────────────────────────────────────────────────────────────────────────
    6. MINIMALIST ACCORDION FAQ (Matching 21st.dev Template FAQ section)
────────────────────────────────────────────────────────────────────────── */}
export function CulturalFaqSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section aria-labelledby="faq-title" className="rounded-[2.5rem] border border-[#F0DCE4] bg-white p-6 sm:p-10 md:p-14 shadow-sm">
      <div className="max-w-2xl">
        <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
          <span>✦</span>
          <span>FREQUENTLY ASKED QUESTIONS</span>
        </div>
        <h2 id="faq-title" className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#20101B] tracking-tight">
          Everything About TattvaCo&apos;s Methodology
        </h2>
      </div>

      <div className="mt-8 space-y-3">
        {FAQS.map((faq, idx) => {
          const isOpen = openFaq === idx;
          return (
            <div
              key={faq.q}
              className="overflow-hidden rounded-2xl border border-[#F0DCE4] bg-[#FAF0F4]/50 transition-all duration-200 hover:border-amber-600/30"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : idx)}
                className="flex w-full items-center justify-between p-5 text-left font-serif text-base sm:text-lg font-semibold text-[#20101B] hover:text-amber-800 transition-colors cursor-pointer"
                aria-expanded={isOpen}
              >
                <span>{faq.q}</span>
                <span className={`ml-4 text-amber-700 text-lg transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>
                  +
                </span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 text-support text-[#5A4450] leading-relaxed border-t border-[#F0DCE4] pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

{/* ─────────────────────────────────────────────────────────────────────────
    7. LUXURY FLOATING CLOSING CTA (Matching 21st.dev Bottom Section)
────────────────────────────────────────────────────────────────────────── */}
export function CulturalClosingCtaSection() {
  return (
    <section className="relative overflow-hidden rounded-[2.5rem] border border-[#24131E]/20 bg-gradient-to-r from-[#2B1522] via-[#24131E] to-[#1A0E16] p-8 sm:p-12 md:p-16 shadow-2xl text-white text-center">
      <div className="relative z-10 max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center justify-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1 text-xs font-semibold text-gold">
          <span>✦</span>
          <span>INDIA&apos;S LIVING CULTURAL ARCHIVE</span>
        </div>
        <h2 className="font-serif text-3xl sm:text-5xl font-bold text-white tracking-tight">
          Begin Your Civilizational Discovery
        </h2>
        <p className="text-support text-white/80 leading-relaxed max-w-lg mx-auto">
          Step onto the crescent stone ghats of Varanasi or trace master handloom guilds with statutorily verified cultural intelligence.
        </p>
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/explore"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gold px-8 text-support font-semibold text-on-gold hover:bg-gold-hover shadow-lg transition-all active:scale-95"
          >
            <span>Explore All Stories</span>
            <span>→</span>
          </Link>
          <Link
            href="/places"
            className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 text-support font-semibold text-white hover:bg-white/15 transition-all"
          >
            <span>Launch Cultural Atlas</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

{/* Default composite wrapper */}
export function CulturalMeadowBoard({ userEmail }: { userEmail?: string | null } = {}) {
  return (
    <div className="space-y-16 md:space-y-24">
      <CulturalHeroSection userEmail={userEmail} />
      <CulturalBentoSection />
      <CulturalConnectedChainSection />
      <CulturalExpeditionSection />
      <CulturalEvidenceReelSection />
      <CulturalFaqSection />
      <CulturalClosingCtaSection />
    </div>
  );
}

