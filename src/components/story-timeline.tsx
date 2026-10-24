import { FadeIn } from "./motion";

export interface TimelineMilestone {
  era: string;
  period: string;
  title: string;
  desc: string;
  epistemicNote: string;
}

const TIMELINE_DATA: Record<string, TimelineMilestone[]> = {
  "varanasi-ghats": [
    {
      era: "Vedic Roots & Sacred Geography",
      period: "c. 1500–600 BCE",
      title: "The Celestial Descent of the Ganga",
      desc: "Vedic hymns and early Upanishads revere the Ganga as the sacred river of celestial descent. The northward crescent bend (Uttaravahini) in Kashi is consecrated as a cosmic axis granting liberation from samsara.",
      epistemicNote: "Rigvedic Nadistuti Sukta & Shatapatha Brahmana",
    },
    {
      era: "Classical Consolidation & Puranic Mandala",
      period: "3rd c. BCE – 6th c. CE",
      title: "Codification of the 84 Tirthas",
      desc: "Emperor Ashoka erects his lion pillar at nearby Sarnath. The Skanda Purana's Kashi Khanda codifies the sacred circumambulation circuits and establishes 84 primary riverfront tirthas corresponding to the 12 zodiacs and 7 cosmic realms.",
      epistemicNote: "Skanda Purana (Kashi Khanda) & ASI Sarnath Inscriptions",
    },
    {
      era: "Bhakti Renaissance & Living Guilds",
      period: "14th – 16th c. CE",
      title: "Poets, Weavers, and Spiritual Democracy",
      desc: "The Bhakti movement democratizes spiritual practice. Sant Kabir preaches radical syncretic monotheism from the weaver quarters, while Goswami Tulsidas completes the Ramcharitmanas at Assi Ghat.",
      epistemicNote: "Sahitya Akademi Historical Corpus & Tulsidas Manuscripts",
    },
    {
      era: "Maratha Architectural Renaissance",
      period: "1730 – 1850 CE",
      title: "Monolithic Stone Ghats & Ahilyabai Holkar",
      desc: "Following centuries of regional disruption, Maratha monarchs fund the monumental rebuilding of Kashi. Maharani Ahilyabai Holkar rebuilds the Kashi Vishwanath temple (1780), while Peshwa Balaji Baji Rao formalizes Dashashwamedh Ghat.",
      epistemicNote: "National Archives Maratha Administrative Records & ASI Inscriptions",
    },
    {
      era: "Contemporary Living Heritage",
      period: "20th c. – Present",
      title: "Subah-e-Banaras & Global Living Continuum",
      desc: "The introduction of the choreographed twilight Maha Aarti in the 1990s and morning Subah-e-Banaras at Assi Ghat establishes an unbroken daily sensory ritual attended by millions of global pilgrims.",
      epistemicNote: "Ministry of Culture Living Traditions Registry",
    },
  ],
  "varanasi-ghats-architecture-and-river": [
    {
      era: "Vedic Roots & Sacred Geography",
      period: "c. 1500–600 BCE",
      title: "The Celestial Descent of the Ganga",
      desc: "Vedic hymns and early Upanishads revere the Ganga as the sacred river of celestial descent. The northward crescent bend (Uttaravahini) in Kashi is consecrated as a cosmic axis granting liberation from samsara.",
      epistemicNote: "Rigvedic Nadistuti Sukta & Shatapatha Brahmana",
    },
    {
      era: "Classical Consolidation & Puranic Mandala",
      period: "3rd c. BCE – 6th c. CE",
      title: "Codification of the 84 Tirthas",
      desc: "Emperor Ashoka erects his lion pillar at nearby Sarnath. The Skanda Purana's Kashi Khanda codifies the sacred circumambulation circuits and establishes 84 primary riverfront tirthas corresponding to the 12 zodiacs and 7 cosmic realms.",
      epistemicNote: "Skanda Purana (Kashi Khanda) & ASI Sarnath Inscriptions",
    },
    {
      era: "Bhakti Renaissance & Living Guilds",
      period: "14th – 16th c. CE",
      title: "Poets, Weavers, and Spiritual Democracy",
      desc: "The Bhakti movement democratizes spiritual practice. Sant Kabir preaches radical syncretic monotheism from the weaver quarters, while Goswami Tulsidas completes the Ramcharitmanas at Assi Ghat.",
      epistemicNote: "Sahitya Akademi Historical Corpus & Tulsidas Manuscripts",
    },
    {
      era: "Maratha Architectural Renaissance",
      period: "1730 – 1850 CE",
      title: "Monolithic Stone Ghats & Ahilyabai Holkar",
      desc: "Following centuries of regional disruption, Maratha monarchs fund the monumental rebuilding of Kashi. Maharani Ahilyabai Holkar rebuilds the Kashi Vishwanath temple (1780), while Peshwa Balaji Baji Rao formalizes Dashashwamedh Ghat.",
      epistemicNote: "National Archives Maratha Administrative Records & ASI Inscriptions",
    },
    {
      era: "Contemporary Living Heritage",
      period: "20th c. – Present",
      title: "Subah-e-Banaras & Global Living Continuum",
      desc: "The introduction of the choreographed twilight Maha Aarti in the 1990s and morning Subah-e-Banaras at Assi Ghat establishes an unbroken daily sensory ritual attended by millions of global pilgrims.",
      epistemicNote: "Ministry of Culture Living Traditions Registry",
    },
  ],
  "jaipur-jantar-mantar": [
    {
      era: "Astrophysical Inquiry",
      period: "1720–1728 CE",
      title: "Conception of Monumental Stone Devices",
      desc: "Sawai Jai Singh II examines brass astrolabes and finds them flawed by mechanical wear. He commissions Bengali scholar Vidyadhar Bhattacharya to engineer colossal permanent stone masonry observatories.",
      epistemicNote: "Zij-i Muhammad Shahi royal astronomical tables",
    },
    {
      era: "Monumental Construction",
      period: "1728–1734 CE",
      title: "Completion of the 19 Astronomical Yantras",
      desc: "Craftsmen complete the Vrihat Samrat Yantra, the world's largest sundial, capable of measuring local solar time to two-second accuracy, alongside zodiacal instruments aligned with ecliptic coordinates.",
      epistemicNote: "ASI Jaipur Circle Monument Ledger No. 42",
    },
    {
      era: "Global Recognition",
      period: "2010 – Present",
      title: "UNESCO World Heritage Inscription",
      desc: "Recognized as a masterpiece of human creative genius, demonstrating the historic interchange of Vedic, Islamic, and European astronomical systems in pre-telescopic India.",
      epistemicNote: "UNESCO World Heritage Committee Citation",
    },
  ],
  "hampi-vijayanagara": [
    {
      era: "Imperial Foundation",
      period: "1336 CE",
      title: "Founding of the Vijayanagara Empire",
      desc: "Brothers Harihara and Bukka establish the capital amidst the protective granite boulders of Hampi on the south bank of the Tungabhadra River, blessed by Sage Vidyaranya of Sringeri.",
      epistemicNote: "Epigraphia Carnatica & Sringeri Records",
    },
    {
      era: "The Golden Age of Krishnadevaraya",
      period: "1509–1529 CE",
      title: "Imperial Architecture & Hydraulic Engineering",
      desc: "Krishnadevaraya expands the Virupaksha Temple with its 50-meter gopuram, constructs the Vittala Temple's stone chariot, and builds an intricate stone aqueduct network irrigating royal gardens.",
      epistemicNote: "Domingo Paes & Fernão Nunes Portuguese chronicles",
    },
    {
      era: "Sack and Ruin",
      period: "1565 CE",
      title: "Battle of Talikota and Fall of the City",
      desc: "Following the battle of Talikota, the imperial city is ransacked over several months, yet the sacred Virupaksha shrine survives unbroken and continues continuous worship.",
      epistemicNote: "Archaeological Survey of India Hampi Monograph",
    },
  ],
};

export function StoryTimeline({ slug }: { slug: string }) {
  const milestones = TIMELINE_DATA[slug];
  if (!milestones || milestones.length === 0) return null;

  return (
    <section id="timeline-section" className="mt-14 rounded-[2.5rem] border border-[#F0DCE4] bg-white/80 backdrop-blur-md p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-amber-700">
        <span>✦</span>
        <span>A River Through Time</span>
      </div>
      <h2 className="mt-2 font-serif text-2xl sm:text-3xl font-semibold text-[#20101B]">
        Chronological Timeline of Heritage & Memory
      </h2>
      <p className="mt-1 text-meta text-[#5A4450] max-w-2xl">
        Trace how philosophical, political, and architectural epochs shaped this cultural landmark over centuries.
      </p>

      <div className="mt-8 space-y-8 relative">
        {/* Continuous vertical timeline connector line */}
        <div className="absolute top-4 bottom-4 left-[15px] sm:left-[19px] w-0.5 bg-gradient-to-b from-amber-600/60 via-amber-600/30 to-amber-600/10" />

        {milestones.map((m, idx) => (
          <FadeIn key={m.era} duration={0.3} delay={idx * 0.08}>
            <div className="relative flex items-start gap-4 sm:gap-6 pl-1">
              {/* Timeline Node Circle */}
              <div className="relative z-10 flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border-2 border-amber-600 bg-white text-xs sm:text-sm font-bold text-amber-800 shadow-md">
                {idx + 1}
              </div>

              {/* Milestone Content Card */}
              <div className="flex-1 rounded-2xl border border-border/70 bg-surface/80 p-4 sm:p-5 shadow-xs backdrop-blur-xs">
                <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-2.5">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-gold">
                    {m.era}
                  </span>
                  <span className="rounded-full bg-gold/10 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-gold border border-gold/25">
                    {m.period}
                  </span>
                </div>

                <h3 className="mt-2 font-serif text-lg sm:text-xl font-semibold text-charcoal">
                  {m.title}
                </h3>

                <p className="mt-2 text-support text-secondary-text leading-relaxed">
                  {m.desc}
                </p>

                <div className="mt-3.5 flex items-center gap-1.5 pt-2 border-t border-border/40 text-[11px] text-muted">
                  <span className="font-semibold text-gold">Evidence Grounding:</span>
                  <span className="italic">{m.epistemicNote}</span>
                </div>
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
