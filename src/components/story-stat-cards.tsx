interface StatItem {
  val: string;
  label: string;
  sublabel?: string;
}

const STORY_PRESET_STATS: Record<string, StatItem[]> = {
  // Varanasi
  "varanasi-ghats": [
    { val: "2,500+ Yrs", label: "Continuous Civilisation", sublabel: "Unbroken ritual & urban memory" },
    { val: "84 Ghats", label: "Crescent Riverfront", sublabel: "Stepped stone embankments" },
    { val: "Millions", label: "Annual Pilgrims", sublabel: "Sacred snana & moksha circuits" },
    { val: "Sacred & Living", label: "Epistemic Status", sublabel: "ASI & Purana attested" },
  ],
  "varanasi-ghats-architecture-and-river": [
    { val: "2,500+ Yrs", label: "Continuous Civilisation", sublabel: "Unbroken ritual & urban memory" },
    { val: "84 Ghats", label: "Crescent Riverfront", sublabel: "Stepped stone embankments" },
    { val: "Millions", label: "Annual Pilgrims", sublabel: "Sacred snana & moksha circuits" },
    { val: "Sacred & Living", label: "Epistemic Status", sublabel: "ASI & Purana attested" },
  ],
  "varanasi-silk-craft": [
    { val: "1,000+ Yrs", label: "Guild Lineage", sublabel: "Kadhwa handloom heritage" },
    { val: "GI Tagged", label: "Geographical Indication", sublabel: "Authentic Banarasi brocade" },
    { val: "Jacquard & Pit", label: "Master Craft Technique", sublabel: "Pure silver zari embroidery" },
    { val: "Ganga-Jamuni", label: "Syncretic Tradition", sublabel: "Hindu-Muslim guild alliance" },
  ],
  "varanasi-silk-weaving-craft-and-living-tradition": [
    { val: "1,000+ Yrs", label: "Guild Lineage", sublabel: "Kadhwa handloom heritage" },
    { val: "GI Tagged", label: "Geographical Indication", sublabel: "Authentic Banarasi brocade" },
    { val: "Jacquard & Pit", label: "Master Craft Technique", sublabel: "Pure silver zari embroidery" },
    { val: "Ganga-Jamuni", label: "Syncretic Tradition", sublabel: "Hindu-Muslim guild alliance" },
  ],
  "varanasi-music-banaras-gharana": [
    { val: "18th c. CE", label: "Gharana Foundation", sublabel: "Pandit Ram Sahai lineage" },
    { val: "Pakhawaj & Tabla", label: "Percussive Synthesis", sublabel: "Solo and jugalbandi repertoire" },
    { val: "Subah-e-Banaras", label: "Living Soundscape", sublabel: "Morning ragas at Assi Ghat" },
    { val: "UNESCO", label: "Creative City of Music", sublabel: "Living acoustic heritage" },
  ],
  "varanasi-panchakroshi-yatra": [
    { val: "50 Miles", label: "Circumambulation Mandala", sublabel: "5-day cosmic pilgrim trek" },
    { val: "108 Temples", label: "Sacred Waypoints", sublabel: "Encircling the Holy City" },
    { val: "Puranic Roots", label: "Kashi Khanda Attested", sublabel: "Symbolic cosmic journey" },
    { val: "Living Ritual", label: "Moksha Pilgrimage", sublabel: "Observed in Malmas month" },
  ],

  // Jaipur
  "jaipur-jantar-mantar": [
    { val: "1734 CE", label: "Year Completed", sublabel: "Maharaja Sawai Jai Singh II" },
    { val: "19 Devices", label: "Architectural Instruments", sublabel: "Masonry stone observatories" },
    { val: "UNESCO", label: "World Heritage Site", sublabel: "Peak of Rajput astronomy" },
    { val: "2 Seconds", label: "Samrat Yantra Precision", sublabel: "Local solar time calculation" },
  ],
  "jaipur-sanganer-block-printing": [
    { val: "500+ Yrs", label: "Chhipa Community Craft", sublabel: "Natural dyed hand block print" },
    { val: "GI Protected", label: "Authentic Sanganeri", sublabel: "Calico floral motifs" },
    { val: "Teakwood Blocks", label: "Master Engraving", sublabel: "Triple-layer color registration" },
    { val: "Saraswati Waters", label: "Natural Chemical Wash", sublabel: "Distinct mineral luster" },
  ],
  "jaipur-amer-fort-water-systems": [
    { val: "16th c. CE", label: "Engineered Fort", sublabel: "Raja Man Singh I" },
    { val: "Maota Lake", label: "Hydraulic Reservoir", sublabel: "Gravity & persian wheel lift" },
    { val: "Sukh Niwas", label: "Passive Air Conditioning", sublabel: "Cascading indoor marble rills" },
    { val: "Arid Resilience", label: "Rajput Ingenuity", sublabel: "Monsoon harvesting grid" },
  ],

  // Hampi
  "hampi-vijayanagara": [
    { val: "14th c. CE", label: "Imperial Capital", sublabel: "Vijayanagara Empire" },
    { val: "4,100 Hectares", label: "UNESCO World Heritage", sublabel: "Granite boulder landscape" },
    { val: "Tungabhadra", label: "Hydraulic Channels", sublabel: "Aquaducts and royal baths" },
    { val: "Living Worship", label: "Virupaksha Temple", sublabel: "Unbroken daily puja since 7th c." },
  ],
  "hampi-vittala-musical-pillars": [
    { val: "56 Pillars", label: "Saptaswara Colonnade", sublabel: "Solid granite acoustic columns" },
    { val: "1513 CE", label: "Krishnadevaraya Era", sublabel: "Maha Mandapa architecture" },
    { val: "Musical Tones", label: "Percussive Resonance", sublabel: "Shruti, Bell, and Veena notes" },
    { val: "Stone Chariot", label: "Garuda Shrine", sublabel: "Revolving stone wheel design" },
  ],

  // Kochi
  "kochi-spice-route-jew-town": [
    { val: "1568 CE", label: "Paradesi Synagogue", sublabel: "Oldest in Commonwealth" },
    { val: "1,100 Tiles", label: "Canton Porcelain", sublabel: "Hand-painted blue willow" },
    { val: "Muziris", label: "Ancient Trade Nexus", sublabel: "Roman & Arab spice voyages" },
    { val: "Pepper & Cardamom", label: "Black Gold Emporium", sublabel: "Malabar coastal trade" },
  ],
  "kochi-fishing-nets": [
    { val: "14th c. CE", label: "Zheng He Maritime Trade", sublabel: "Chinese Kublai Khan era" },
    { val: "Cantilevered", label: "Mechanical Counterweights", sublabel: "20-meter teakwood spars" },
    { val: "Fort Kochi", label: "Vasco da Gama Shore", sublabel: "Tidal estuary fishing" },
    { val: "Living Icon", label: "Heritage Landmark", sublabel: "Community net team operation" },
  ],

  // Kolkata
  "kolkata-durga-puja": [
    { val: "UNESCO", label: "Intangible Cultural Heritage", sublabel: "Inscribed in 2021" },
    { val: "3,000+ Pandals", label: "Public Ephemeral Art", sublabel: "Transforming city streets" },
    { val: "Ganga Maati", label: "Sacred River Clay", sublabel: "Organic riverbed immersion" },
    { val: "Mahalaya to Dashami", label: "10 Days of Celebration", sublabel: "Living community renaissance" },
  ],
  "kolkata-kumartuli-clay-sculptors": [
    { val: "250+ Yrs", label: "Clay Artisan Colony", sublabel: "Hooghly riverfront quarter" },
    { val: "400+ Studios", label: "Pala Sculptor Guilds", sublabel: "Traditional bamboo kathamo" },
    { val: "Chokkhudaan", label: "Eye Painting Rite", sublabel: "Invoking life into the clay" },
    { val: "Nishiddho Polli", label: "Sacred Soil Blend", sublabel: "Universal dignity symbolism" },
  ],

  // Madurai
  "madurai-meenakshi": [
    { val: "2,500+ Yrs", label: "Lotus City Epicenter", sublabel: "Sangam literature attested" },
    { val: "14 Gopurams", label: "Monumental Towers", sublabel: "South tower rises 51.9 meters" },
    { val: "33,000 Deities", label: "Sculpted Stucco Figures", sublabel: "Puranic pictorial cosmos" },
    { val: "1,000 Pillars", label: "Aayiram Kaal Mandapam", sublabel: "Nayak dynastic architecture" },
  ],
  "madurai-chithirai-festival": [
    { val: "12 Days", label: "Grand Annual Spectacle", sublabel: "April–May celestial wedding" },
    { val: "1 Million+", label: "Pilgrim Gathering", sublabel: "Vaigai river entry of Alagar" },
    { val: "Shaivite-Vaishnavite", label: "Social Synthesis", sublabel: "Royal Nayak reconciliation" },
    { val: "Golden Horse", label: "Kallalagar Procession", sublabel: "Living Tamil spectacle" },
  ],
};

export function StoryStatCards({
  slug,
  defaultStats,
}: {
  slug: string;
  defaultStats?: StatItem[];
}) {
  const stats = STORY_PRESET_STATS[slug] ?? defaultStats ?? [
    { val: "Curated", label: "Flagship Narrative", sublabel: "Epistemically grounded" },
    { val: "Primary", label: "Institutional Sources", sublabel: "ASI & archival citations" },
    { val: "Living", label: "Cultural Heritage", sublabel: "Continuous community traditions" },
    { val: "Verified", label: "Statutory Integrity", sublabel: "Rigorous claim classification" },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Key story telemetry">
      {stats.map((stat, idx) => (
        <div
          key={idx}
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
            <p className="mt-1 text-[11px] text-muted leading-tight line-clamp-1">
              {stat.sublabel}
            </p>
          )}
        </div>
      ))}
    </section>
  );
}
