export type CityCulturalData = {
  slug: string;
  coordinates: { lat: number; lng: number };
  region: string;
  culturalThemes: string[];
  landmarks: {
    id: string;
    name: string;
    description: string;
    coordinates: { lat: number; lng: number };
    type: "monument" | "natural" | "craft" | "worship" | "public_space";
  }[];
  culturalFigures: {
    name: string;
    role: string;
    era: string;
  }[];
  livingTraditions: {
    name: string;
    description: string;
  }[];
};

export const CITIES_CULTURAL_DATA: Record<string, CityCulturalData> = {
  varanasi: {
    slug: "varanasi",
    coordinates: { lat: 25.3176, lng: 82.9739 },
    region: "Uttar Pradesh · Gangetic Plain",
    culturalThemes: [
      "Sacred Geography & River Ganga",
      "Banarasi Brocade & Handloom Silk",
      "Banaras Gharana & Classical Music",
      "Pilgrimage, Ritual & Moksha",
      "Syncretic Guilds & Living Heritage",
    ],
    landmarks: [
      {
        id: "dashashwamedh-ghat",
        name: "Dashashwamedh Ghat",
        description: "Primary ceremonial riverfront where the choreographed evening Maha Aarti is offered to the Ganga.",
        coordinates: { lat: 25.3075, lng: 83.0104 },
        type: "public_space",
      },
      {
        id: "manikarnika-ghat",
        name: "Manikarnika Ghat",
        description: "The Mahashmashana (great cremation grounds) functioning continuously for over two millennia as a site of liberation.",
        coordinates: { lat: 25.3108, lng: 83.0142 },
        type: "public_space",
      },
      {
        id: "kashi-vishwanath",
        name: "Kashi Vishwanath Corridor",
        description: "Ancient sacred axis of Kashi connecting the sacred Jyotirlinga shrine directly with the riverfront.",
        coordinates: { lat: 25.3109, lng: 83.0107 },
        type: "worship",
      },
      {
        id: "madanpura-peeli-kothi",
        name: "Madanpura & Peeli Kothi",
        description: "Historic weaver mohallas where master Muslim artisans have preserved the Kadhwa silk handloom tradition for centuries.",
        coordinates: { lat: 25.321, lng: 82.998 },
        type: "craft",
      },
      {
        id: "sarnath",
        name: "Sarnath Deer Park",
        description: "Site of the Buddha's First Sermon (Dhammacakkappavattana Sutta) and Ashoka's lion capital.",
        coordinates: { lat: 25.3811, lng: 83.0214 },
        type: "monument",
      },
    ],
    culturalFigures: [
      { name: "Sant Kabir Das", role: "Mystic Poet & Weaver (Julaha)", era: "15th Century" },
      { name: "Goswami Tulsidas", role: "Sage & Poet (Ramcharitmanas)", era: "16th Century" },
      { name: "Ustad Bismillah Khan", role: "Shehnai Maestro (Bharat Ratna)", era: "1916–2006" },
      { name: "Pandit Ravi Shankar", role: "Sitar Virtuoso & Composer", era: "1920–2012" },
    ],
    livingTraditions: [
      { name: "Subah-e-Banaras", description: "Vedic chanting, morning ragas and yoga at sunrise on Assi Ghat." },
      { name: "Kadhwa Silk Weaving", description: "Paucity of floating threads; individual hand-engraved motifs in gold zari." },
      { name: "Ganga Aarti", description: "Choreographed multi-tiered brass lamp ritual at twilight." },
      { name: "Panchakroshi Yatra", description: "50-mile circumambulation pilgrim circuit defining Kashi's sacred mandala." },
    ],
  },
  jaipur: {
    slug: "jaipur",
    coordinates: { lat: 26.9124, lng: 75.7873 },
    region: "Rajasthan · Dhundhar Region",
    culturalThemes: [
      "Vastu Shastra & Urban Planning",
      "Astronomical Heritage (Jantar Mantar)",
      "Karkhana Royal Workshops & Crafts",
      "Blue Pottery & Block Printing",
    ],
    landmarks: [
      {
        id: "jantar-mantar-jaipur",
        name: "Jantar Mantar Observatory",
        description: "UNESCO World Heritage site with nineteen monumental stone astronomical instruments built by Sawai Jai Singh II.",
        coordinates: { lat: 26.9248, lng: 75.8246 },
        type: "monument",
      },
      {
        id: "city-palace",
        name: "City Palace Complex",
        description: "Seat of the Kachwaha dynasty blending Rajasthani and Mughal court architecture.",
        coordinates: { lat: 26.9258, lng: 75.8237 },
        type: "monument",
      },
      {
        id: "hawa-mahal",
        name: "Hawa Mahal (Palace of Winds)",
        description: "Five-story pink sandstone honeycomb designed for royal women to observe street life without being seen.",
        coordinates: { lat: 26.9239, lng: 75.8267 },
        type: "monument",
      },
      {
        id: "sanganer-crafts",
        name: "Sanganer Block-Printing Guilds",
        description: "Artisanal center of wooden hand-block printing on natural textiles.",
        coordinates: { lat: 26.8172, lng: 75.7725 },
        type: "craft",
      },
    ],
    culturalFigures: [
      { name: "Maharaja Sawai Jai Singh II", role: "Astronomer, Statesman & Founder", era: "1688–1743" },
      { name: "Vidyadhar Bhattacharya", role: "Chief Architect & Urban Planner", era: "1693–1751" },
    ],
    livingTraditions: [
      { name: "Dhunghi Block Printing", description: "Carved teak block stamping using indigenous vegetable and mineral dyes." },
      { name: "Jaipur Blue Pottery", description: "Glazed low-fire ceramic made without clay, utilizing quartz and fuller's earth." },
    ],
  },
  hampi: {
    slug: "hampi",
    coordinates: { lat: 15.335, lng: 76.46 },
    region: "Karnataka · Tungabhadra Basin",
    culturalThemes: [
      "Vijayanagara Imperial Architecture",
      "Boulder Granite Landscapes",
      "Acoustic Shrines & Musical Pillars",
      "Kishkindha Mythological Topography",
    ],
    landmarks: [
      {
        id: "virupaksha-temple",
        name: "Virupaksha Temple",
        description: "Continuously functioning sanctuary since the 7th century, dedicated to Shiva as Virupaksha.",
        coordinates: { lat: 15.3353, lng: 76.4597 },
        type: "worship",
      },
      {
        id: "vijaya-vittala-temple",
        name: "Vijaya Vittala & Stone Chariot",
        description: "Pinnacle of Vijayanagara art with carved granite musical pillars and the iconic Garuda stone chariot.",
        coordinates: { lat: 15.3396, lng: 76.4795 },
        type: "monument",
      },
      {
        id: "tungabhadra-river",
        name: "Tungabhadra River & Coracles",
        description: "Ancient river boundary navigated by traditional woven wicker coracles.",
        coordinates: { lat: 15.3402, lng: 76.462 },
        type: "natural",
      },
    ],
    culturalFigures: [
      { name: "Krishnadevaraya", role: "Emperor of Vijayanagara & Patron of Arts", era: "1509–1529" },
      { name: "Purandara Dasa", role: "Father of Carnatic Classical Music", era: "1484–1564" },
    ],
    livingTraditions: [
      { name: "Hampi Utsav", description: "Annual celebration of music, dance, and cultural memory amidst the ruins." },
      { name: "Coracle Navigation", description: "Round reed-and-hide boats navigating turbulent river currents unchanged for millennia." },
    ],
  },
  kochi: {
    slug: "kochi",
    coordinates: { lat: 9.9312, lng: 76.2673 },
    region: "Kerala · Malabar Coast",
    culturalThemes: [
      "Maritime Spice Route Exchange",
      "Cantilevered Fishing Net Practice",
      "Syncretic Heritage (Jew Town, Fort Kochi)",
      "Kathakali & Kalaripayattu",
    ],
    landmarks: [
      {
        id: "chinese-fishing-nets",
        name: "Fort Kochi Fishing Nets",
        description: "Shore-operated cantilevered lift nets introduced via maritime trade exchange centuries ago.",
        coordinates: { lat: 9.9678, lng: 76.2415 },
        type: "craft",
      },
      {
        id: "paradesi-synagogue",
        name: "Paradesi Synagogue & Jew Town",
        description: "Oldest active synagogue in the Commonwealth, featuring hand-painted Chinese porcelain tiles and Belgian chandeliers.",
        coordinates: { lat: 9.9575, lng: 76.2594 },
        type: "worship",
      },
      {
        id: "mattancherry-palace",
        name: "Mattancherry Palace (Dutch Palace)",
        description: "Historic residence featuring extraordinary 16th-century Hindu mythological wall murals.",
        coordinates: { lat: 9.9583, lng: 76.2592 },
        type: "monument",
      },
    ],
    culturalFigures: [
      { name: "Kunjali Marakkars", role: "Naval Commanders of the Zamorin", era: "16th Century" },
      { name: "Raja Varma Brothers", role: "Mural Painters of Mattancherry", era: "17th Century" },
    ],
    livingTraditions: [
      { name: "Cantilever Net Operation", description: "Team rhythm of stone counterweights balancing tidal waters." },
      { name: "Kathakali Performance", description: "Classical dance-drama of elaborate facial makeup and mudras." },
    ],
  },
  kolkata: {
    slug: "kolkata",
    coordinates: { lat: 22.5726, lng: 88.3639 },
    region: "West Bengal · Hooghly Delta",
    culturalThemes: [
      "Durga Puja Living Art & Clay Sculpting",
      "Bengal Renaissance & Literature",
      "Colonial & Indigenous Hybrid Architecture",
      "Coffee House Intellectual Traditions",
    ],
    landmarks: [
      {
        id: "kumartuli",
        name: "Kumartuli Clay Idol Quarter",
        description: "Traditional potters' settlement where clay from the Hooghly river is molded into Durga idols.",
        coordinates: { lat: 22.5997, lng: 88.3644 },
        type: "craft",
      },
      {
        id: "howrah-bridge-hooghly",
        name: "Hooghly Riverfront & Ghats",
        description: "Riverfront lifeline of ferry landings, morning flower markets, and clay immersion ghats.",
        coordinates: { lat: 22.5851, lng: 88.3468 },
        type: "public_space",
      },
      {
        id: "indian-museum",
        name: "Indian Museum",
        description: "Oldest museum in India (founded 1814), housing priceless Gandhara sculptures and Bharhut stupa railings.",
        coordinates: { lat: 22.5579, lng: 88.3511 },
        type: "monument",
      },
    ],
    culturalFigures: [
      { name: "Rabindranath Tagore", role: "Nobel Laureate, Poet & Polymath", era: "1861–1941" },
      { name: "Swami Vivekananda", role: "Philosopher & Monk of Belur Math", era: "1863–1902" },
    ],
    livingTraditions: [
      { name: "Durga Puja Public Art", description: "UNESCO Intangible Cultural Heritage transforming the city into a public contemporary gallery." },
      { name: "Adda Culture", description: "Informal, freewheeling intellectual discourse practiced across tea stalls and heritage cafes." },
    ],
  },
  madurai: {
    slug: "madurai",
    coordinates: { lat: 9.9252, lng: 78.1198 },
    region: "Tamil Nadu · Vaigai River Valley",
    culturalThemes: [
      "Sangam Literature & Tamil Language Heritage",
      "Dravidian Temple City Planning",
      "Nayak Architecture & Sculpted Halls",
      "Chithirai Festival Cultural Fusion",
    ],
    landmarks: [
      {
        id: "meenakshi-temple",
        name: "Meenakshi Sundareswarar Temple",
        description: "Double-sanctuary citadel with twelve towering gopurams and the Thousand Pillar Hall.",
        coordinates: { lat: 9.9195, lng: 78.1193 },
        type: "worship",
      },
      {
        id: "thirumalai-nayakkar-mahal",
        name: "Thirumalai Nayakkar Palace",
        description: "17th-century palace celebrated for its massive stucco arches and fusion of Dravidian and Islamic idioms.",
        coordinates: { lat: 9.9152, lng: 78.1235 },
        type: "monument",
      },
      {
        id: "vaigai-riverbed",
        name: "Vaigai Riverfront",
        description: "Sacred seasonal river hosting the grand Chithirai festival entry of Lord Kallazhagar.",
        coordinates: { lat: 9.9325, lng: 78.131 },
        type: "natural",
      },
    ],
    culturalFigures: [
      { name: "Mangammal", role: "Queen Regent of Madurai Nayak Kingdom", era: "1689–1704" },
      { name: "Ilango Adigal", role: "Author of the Tamil epic Silappatikaram", era: "c. 5th Century" },
    ],
    livingTraditions: [
      { name: "Chithirai Thiruvizha", description: "Month-long celestial wedding and river festival re-enacting historic regional reconciliation." },
      { name: "Sungudi Cotton Weaving", description: "Traditional tie-and-dye cotton sarees made by Saurashtrian migrant weavers." },
    ],
  },
};

export function getCityCulturalData(slug: string): CityCulturalData | null {
  return CITIES_CULTURAL_DATA[slug] ?? null;
}
