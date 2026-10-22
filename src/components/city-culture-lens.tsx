"use client";

import { useState } from "react";

interface CultureLensItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  content: string[];
}

const CITIES_CULTURE_LENS: Record<string, CultureLensItem[]> = {
  varanasi: [
    {
      id: "timing",
      title: "Optimal Cultural Hours",
      subtitle: "Experience sacred transitions at dawn and twilight",
      icon: "☀️",
      content: [
        "Subah-e-Banaras (Dawn 5:00 AM – 7:00 AM): Arrive at Assi Ghat before sunrise. Witness the quiet confluence of Vedic chanting, sunrise ragas, and sacred snana as golden mist rises off the water.",
        "Twilight Maha Aarti (6:00 PM – 7:30 PM): Position yourself by boat or on the upper tiers of Dashashwamedh Ghat by 5:45 PM for the synchronized multi-tiered brass lamp ritual offered to Mother Ganga.",
      ],
    },
    {
      id: "walking",
      title: "Architectural Walking Circuit",
      subtitle: "Navigating the crescent riverfront and historic mohallas",
      icon: "🧭",
      content: [
        "The Riverfront Promenade: Walk from Assi Ghat northward to Manikarnika Ghat (approx. 3.5 km). Observe the evolution of stone ramparts, Maratha chhatris, and leaning medieval shrines.",
        "The Weaver Labyrinths of Madanpura: Enter behind Godowlia through Vishwanath Gali. Walk through the narrow shaded brick havelis where pit-loom shuttles create rhythmic percussive sounds from open doorways.",
      ],
    },
    {
      id: "etiquette",
      title: "Sacred Space & Riverfront Etiquette",
      subtitle: "Cultural protocols for respectful contemplation",
      icon: "🪷",
      content: [
        "Cremation Grounds Dignity: At Manikarnika and Harishchandra ghats, keep cameras and phones strictly away. Respect the profound threshold of liberation (moksha) and family mourning.",
        "Temple Footwear & Attire: Remove footwear at designated shoe stands before entering temple alleys or ghat platforms. Modest dress covering knees and shoulders is customary.",
      ],
    },
    {
      id: "crafts",
      title: "Artisanal Guild Etiquette",
      subtitle: "Interacting with master handloom weavers",
      icon: "🧵",
      content: [
        "Weaver Mohallas: Master weavers in Peeli Kothi and Madanpura welcome respectful observers. Always request permission before stepping into active weaving studios or photographing delicate silk jacquard cards.",
        "Direct Patronage: Support registered Handloom Mark and Silk Mark cooperative societies that channel fair wages directly to artisan families.",
      ],
    },
  ],
  jaipur: [
    {
      id: "timing",
      title: "Optimal Astronomical Observation",
      subtitle: "Reading shadows and astronomical noon",
      icon: "☀️",
      content: [
        "Solar Noon at Jantar Mantar (11:45 AM – 12:30 PM): Visit during midday when the colossal Vrihat Samrat Yantra gnomon casts its sharpest, thinnest shadow across the marble quadrant scales.",
        "Badi Choupad at Golden Hour: Stand opposite Hawa Mahal around 4:30 PM as late afternoon desert sunlight illuminates the pink sandstone jharokhas.",
      ],
    },
    {
      id: "walking",
      title: "Vastu Shastra Urban Grid Walk",
      subtitle: "Exploring Vidyadhar Bhattacharya's nine-square layout",
      icon: "🧭",
      content: [
        "Walk from Ajmeri Gate through Kishanpole Bazaar towards Tripolia Gate, tracing the straight wide arterial avenues and uniform pink porticoes planned in 1727.",
      ],
    },
    {
      id: "etiquette",
      title: "Heritage Conservation Etiquette",
      subtitle: "Preserving delicate frescoes and stone instruments",
      icon: "🪷",
      content: [
        "Do not lean on or touch the calibrated marble scales of Jantar Mantar instruments; skin oils degrade centuries-old celestial markings.",
      ],
    },
    {
      id: "crafts",
      title: "Sanganer Block Print Guilds",
      subtitle: "Natural dye workshops along the riverbanks",
      icon: "🧵",
      content: [
        "Visit the Chhipa artisan mohallas in Sanganer. Watch triple-color registration using hand-carved teakwood blocks and natural alum and mineral dyes.",
      ],
    },
  ],
  hampi: [
    {
      id: "timing",
      title: "Sunrise & Sunset Across the Boulders",
      subtitle: "Witnessing granite topography in dramatic light",
      icon: "☀️",
      content: [
        "Matanga Hill Sunrise (5:30 AM): Climb the stepped path for a 360-degree panoramic vista across the Virupaksha gopuram, Tungabhadra River, and endless sea of granite boulders.",
        "Hemakuta Hill Sunset (5:45 PM): Settle among pre-Vijayanagara triple-shrine stone temples as evening breeze sweeps through the valley.",
      ],
    },
    {
      id: "walking",
      title: "Sacred to Royal Center Trail",
      subtitle: "Following ancient paved pilgrim thoroughfares",
      icon: "🧭",
      content: [
        "Walk the 2-km stone path from Virupaksha Bazaar along the riverbank past Sugriva's Cave to the Vittala Temple Stone Chariot.",
      ],
    },
    {
      id: "etiquette",
      title: "Living Worship Protocol",
      subtitle: "Virupaksha's 1,300-year continuous sanctity",
      icon: "🪷",
      content: [
        "Virupaksha is an active living temple. Please deposit footwear at the eastern gopuram gate and dress respectfully when entering inner mandapas.",
      ],
    },
    {
      id: "crafts",
      title: "Anegundi Crafts & River Coracles",
      subtitle: "Crossing the river to ancient artisanal settlements",
      icon: "🧵",
      content: [
        "Cross the Tungabhadra in a traditional round woven coracle to Anegundi to observe banana fiber craft workshops and vernacular mud-stone architecture.",
      ],
    },
  ],
};

export function CityCultureLens({ citySlug }: { citySlug: string }) {
  const items = CITIES_CULTURE_LENS[citySlug] ?? CITIES_CULTURE_LENS.varanasi;
  const [expandedId, setExpandedId] = useState<string>(items[0]?.id ?? "");

  const toggleItem = (id: string) => {
    setExpandedId((prev) => (prev === id ? "" : id));
  };

  return (
    <section className="mt-12 rounded-3xl border border-gold/30 bg-gradient-to-br from-[#171411] via-[#1a1714] to-[#12100d] p-6 sm:p-8 shadow-md">
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-gold">
            <span>✦</span>
            <span>Cultural Lens</span>
          </div>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-charcoal">
            Plan Your Visit Through a Cultural Lens
          </h2>
        </div>
        <span className="hidden sm:inline-block rounded-full bg-forest/80 px-3 py-1 text-[11px] font-semibold text-white">
          Contextual Guidance
        </span>
      </div>

      <p className="mt-3 text-meta text-muted leading-relaxed">
        Thoughtful cultural and architectural guidance to experience this ecosystem with authenticity, respect, and deep historical awareness.
      </p>

      {/* Accordion List */}
      <div className="mt-6 space-y-3">
        {items.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border transition-all ${
                isExpanded
                  ? "border-gold/50 bg-surface shadow-xs"
                  : "border-border/70 bg-surface/60 hover:border-gold/30 hover:bg-surface"
              }`}
            >
              <button
                type="button"
                onClick={() => toggleItem(item.id)}
                className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 focus:outline-none"
                aria-expanded={isExpanded}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-2 border border-border/80 text-base shadow-2xs">
                    {item.icon}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-serif text-support sm:text-base font-semibold text-charcoal truncate">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-muted truncate">{item.subtitle}</p>
                  </div>
                </div>
                <span className="text-gold font-bold text-lg shrink-0">
                  {isExpanded ? "−" : "+"}
                </span>
              </button>

              {isExpanded && (
                <div className="px-5 pb-5 pt-1 border-t border-border/40 text-support text-secondary-text space-y-2.5 leading-relaxed">
                  {item.content.map((para, idx) => (
                    <p key={idx}>{para}</p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
