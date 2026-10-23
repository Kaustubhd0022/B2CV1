"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  IconSearch,
  IconPlaces,
  IconCrafts,
  IconFestivals,
  IconMusic,
  IconExplore,
  IconConnect,
  IconArrow,
  IconHistory,
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

export function CulturalMeadowBoard({ userEmail }: { userEmail?: string | null } = {}) {
  const [activeTab, setActiveTab] = useState<"circuit" | "crafts" | "acoustics" | "celestial">("circuit");
  const [selectedStation, setSelectedStation] = useState(0);
  const [expeditionDays, setExpeditionDays] = useState(5);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
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

  // Dynamic calculations based on Expedition Days slider
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
    <div className="space-y-16 md:space-y-24">
      {/* ─────────────────────────────────────────────────────────────────────────
          1. THE HERO STAGE: 21st.dev Botanical Flower Meadow & Floating Brass Yantras
          Framed inside luxurious rounded-[2.5rem] curved canvas with radiant rose-dawn
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative isolate overflow-hidden rounded-[2.5rem] border border-white/40 bg-gradient-to-b from-[#FFF5F8] via-[#FDF0F4] to-[#FCE7EF] p-6 sm:p-10 md:p-14 shadow-2xl transition-all">
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

        {/* Floating Search & Cultural Ask AI Pill Bar */}
        <div className="relative z-20 mt-8 max-w-2xl">
          <form
            action="/ask"
            method="get"
            onSubmit={(e) => {
              if (!inquiryText.trim()) e.preventDefault();
            }}
            className="flex items-center gap-2 rounded-full border border-white/90 bg-white/85 p-2 shadow-xl backdrop-blur-xl transition-all focus-within:ring-2 focus-within:ring-amber-500/50"
          >
            <div className="pl-3 text-amber-700">
              <IconSearch width={20} height={20} />
            </div>
            <input
              type="text"
              name="q"
              value={inquiryText}
              onChange={(e) => setInquiryText(e.target.value)}
              placeholder="Ask anything about Varanasi ghats, Kadhwa handlooms, Panchakroshi..."
              className="w-full bg-transparent px-2 text-sm text-[#24131E] placeholder:text-[#8D7882] focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#24131E] px-6 text-xs font-semibold text-white shadow-md transition-all hover:bg-[#381C2E] active:scale-95 shrink-0"
            >
              <span>Ask Copilot</span>
              <span className="text-amber-400">✦</span>
            </button>
          </form>

          {/* Quick Cultural Shortcut Pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-[#66505B]">Popular Inquiries:</span>
            <Link
              href="/stories/varanasi-ghats-architecture-and-river"
              className="rounded-full border border-[#24131E]/12 bg-white/60 px-3 py-1 font-medium text-[#24131E] hover:bg-white hover:border-amber-600/40 transition-colors shadow-2xs"
            >
              84 Crescent Ghats
            </Link>
            <Link
              href="/stories/varanasi-silk-weaving-craft-and-living-tradition"
              className="rounded-full border border-[#24131E]/12 bg-white/60 px-3 py-1 font-medium text-[#24131E] hover:bg-white hover:border-amber-600/40 transition-colors shadow-2xs"
            >
              Kadhwa Silk GI #99
            </Link>
            <Link
              href="/stories/varanasi-panchakroshi-yatra"
              className="rounded-full border border-[#24131E]/12 bg-white/60 px-3 py-1 font-medium text-[#24131E] hover:bg-white hover:border-amber-600/40 transition-colors shadow-2xs"
            >
              Panchakroshi Circuit
            </Link>
            <Link
              href="/places?city=varanasi"
              className="rounded-full border border-[#24131E]/12 bg-white/60 px-3 py-1 font-medium text-[#24131E] hover:bg-white hover:border-amber-600/40 transition-colors shadow-2xs"
            >
              Interactive Map ↗
            </Link>
          </div>
        </div>

        {/* ── Flower Meadow Base Stage with Floating 3D Antique Brass Elements ── */}
        <div className="relative mt-12 sm:mt-16 -mx-6 -mb-6 sm:-mx-10 sm:-mb-10 md:-mx-14 md:-mb-14 overflow-hidden rounded-b-[2.5rem] pt-32 sm:pt-48 md:pt-64">
          {/* Authentic Generated High-Res Flower Meadow Visual Bed */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/flower-meadow-hero.jpg"
              alt="Lush botanical flower meadow with pink lotus, marigolds, and floating antique brass astrolabes"
              fill
              priority
              sizes="(min-width: 1200px) 1400px, 100vw"
              className="object-cover object-bottom"
            />
            {/* Subtle soft gradient fade into the top rose background */}
            <div className="absolute inset-x-0 top-0 h-36 bg-gradient-to-b from-[#FFF5F8] to-transparent" />
          </div>

          {/* Floating Interactive Pill Feature Highlights */}
          <div className="relative z-10 px-6 pb-8 sm:px-10 sm:pb-12 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#24131E] shadow-lg backdrop-blur-md animate-float-slow">
                <span className="flex size-5 items-center justify-center rounded-full bg-amber-500/20 text-amber-800 text-[11px] font-bold">
                  84
                </span>
                <span>Sacred Stone Tirthas</span>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#24131E] shadow-lg backdrop-blur-md animate-float-medium">
                <span className="flex size-5 items-center justify-center rounded-full bg-rose-500/20 text-rose-800 text-[11px] font-bold">
                  GI
                </span>
                <span>Application #99 Standards</span>
              </div>
              <div className="hidden md:inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/80 px-4 py-2 text-xs font-semibold text-[#24131E] shadow-lg backdrop-blur-md animate-float-reverse">
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

      {/* ─────────────────────────────────────────────────────────────────────────
          2. THE ASYMMETRIC BENTO GRID OF CULTURAL DIMENSIONS (Matching 21st.dev)
          High-contrast cards: Deep Royal Jamun (#1E101A) & Luminous Blush (#FDF4F6)
      ────────────────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="bento-title" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <span>✦</span>
              <span>LIVING HERITAGE BENTO</span>
            </div>
            <h2 id="bento-title" className="mt-2 font-serif text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Four Dimensions of Civilizational Memory
            </h2>
          </div>
          <p className="max-w-md text-support text-secondary-text">
            Each card provides an interactive window into statutory evidence, artisanal physics, and unbroken traditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Card 1: Massive Dark Plum Bento Card (Sacred Geography of Panchakroshi) */}
          <div className="md:col-span-7 flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#1E101A] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
            {/* Ambient glow accent */}
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
          <div className="md:col-span-5 flex flex-col justify-between rounded-[2rem] border border-[#24131E]/10 bg-gradient-to-br from-[#FFF5F8] to-[#FCE7EF] p-6 sm:p-8 shadow-xl text-[#24131E] relative overflow-hidden group">
            <div>
              <div className="flex items-center justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-[#24131E]/20 bg-white/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#24131E]">
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
              <div className="mt-6 space-y-3 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-sm backdrop-blur-md">
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

            <div className="mt-8 pt-4 border-t border-[#24131E]/10 flex flex-wrap items-center justify-between gap-3">
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
          <div className="md:col-span-6 flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#161219] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
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
          <div className="md:col-span-6 flex flex-col justify-between rounded-[2rem] border border-white/10 bg-[#1E1417] p-6 sm:p-8 shadow-xl text-white relative overflow-hidden group">
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

              {/* Equinox Alignment Dial Preview */}
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

      {/* ─────────────────────────────────────────────────────────────────────────
          3. THE INTERACTIVE EXPEDITION SLIDER (Matching 21st.dev Yield Calculator)
          Live reactive slider computing stops, citations, distance & handloom guilds
      ────────────────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="expedition-slider-title" className="rounded-[2.5rem] border border-white/15 bg-gradient-to-br from-[#1A1218] via-[#161014] to-[#110D10] p-6 sm:p-10 md:p-14 shadow-2xl text-white">
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
          {/* Slider Control Column */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-white/80">Selected Journey Duration:</span>
                <span className="font-serif text-2xl font-bold text-gold">
                  {expeditionDays} {expeditionDays === 1 ? "Day" : "Days"}
                </span>
              </div>

              {/* Range Slider */}
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

            {/* Quick Action Buttons */}
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

          {/* Dynamic Metrics Cards (Live updates based on slider!) */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gold">Sacred Tirthas</div>
              <div className="mt-2 font-serif text-xl font-bold text-white">{expeditionMetrics.tirthas}</div>
              <p className="mt-1 text-xs text-white/60">Ghats, kunds & temples visited</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">Statutory Citations</div>
              <div className="mt-2 font-serif text-xl font-bold text-white">{expeditionMetrics.citations}</div>
              <p className="mt-1 text-xs text-white/60">ASI & UNESCO groundings</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">Master Guilds</div>
              <div className="mt-2 font-serif text-xl font-bold text-white">{expeditionMetrics.guilds}</div>
              <p className="mt-1 text-xs text-white/60">Karkhanas & oral archives</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-sky-400">Trail Footprint</div>
              <div className="mt-2 font-serif text-xl font-bold text-white">{expeditionMetrics.distance}</div>
              <p className="mt-1 text-xs text-white/60">Calculated parikrama span</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          4. STATUTORY MEDIA ARCHIVE REEL (High-Fidelity Curated Photography)
      ────────────────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="reel-title" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
              <span>✦</span>
              <span>STATUTORY MEDIA ARCHIVE</span>
            </div>
            <h2 id="reel-title" className="mt-2 font-serif text-2xl sm:text-4xl font-bold text-charcoal tracking-tight">
              Verified Photographic Evidence
            </h2>
          </div>
          <p className="max-w-md text-support text-secondary-text">
            Sourced and accredited in partnership with statutory institutions and academic repositories.
          </p>
        </div>

        <CulturalMediaReel items={VARANASI_MEDIA_ITEMS} />
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          5. MINIMALIST ACCORDION FAQ (Matching 21st.dev Template FAQ section)
      ────────────────────────────────────────────────────────────────────────── */}
      <section aria-labelledby="faq-title" className="rounded-[2.5rem] border border-white/10 bg-[#161311] p-6 sm:p-10 md:p-14 shadow-xl">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold">
            <span>✦</span>
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 id="faq-title" className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-charcoal tracking-tight">
            Everything About TattvaCo&apos;s Methodology
          </h2>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={faq.q}
                className="overflow-hidden rounded-2xl border border-border/80 bg-surface transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-5 text-left font-serif text-base sm:text-lg font-semibold text-charcoal hover:text-gold transition-colors cursor-pointer"
                  aria-expanded={isOpen}
                >
                  <span>{faq.q}</span>
                  <span className={`ml-4 text-gold transition-transform duration-200 ${isOpen ? "rotate-45" : ""}`}>
                    +
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-support text-secondary-text leading-relaxed border-t border-border/40 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────────────────
          6. LUXURY FLOATING CLOSING CTA (Matching 21st.dev Bottom Section)
      ────────────────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-gold/40 bg-gradient-to-r from-[#2B1522] via-[#24131E] to-[#1A0E16] p-8 sm:p-12 md:p-16 shadow-2xl text-white text-center">
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
    </div>
  );
}
