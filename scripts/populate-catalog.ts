import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { ItemFileSchema, CatalogFileSchema } from "../src/lib/content/types";

const catalogPath = path.join(process.cwd(), "content/fixtures/catalog.json");
const catalog = JSON.parse(readFileSync(catalogPath, "utf8"));

const newSources = [
  {
    id: "wp-banaras-gharana",
    title: "Banaras Gharana",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Banaras_gharana",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary overview of the Varanasi musical lineage in tabla, shehnai and vocal thumri."
  },
  {
    id: "wp-panchakroshi-yatra",
    title: "Panchakroshi Yatra",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Panchakroshi_Yatra",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary reference describing the circumambulation pilgrimage circuit around Kashi."
  },
  {
    id: "wp-sanganer-block-print",
    title: "Sanganeri Print",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Sanganeri",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary summary of Sanganeri wooden block printing on white and pale backgrounds."
  },
  {
    id: "wp-amer-fort",
    title: "Amer Fort",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Amer_Fort",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary overview of Amer Fort architecture, Rajput defense design and Maota Lake hydraulics."
  },
  {
    id: "wp-vittala-temple",
    title: "Vittala Temple, Hampi",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Vittala_Temple,_Hampi",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary documentation of Vijaya Vittala complex, musical pillars and monolithic stone chariot."
  },
  {
    id: "wp-tungabhadra-river",
    title: "Tungabhadra River",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Tungabhadra_River",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary overview of the Tungabhadra river, coracle navigation and Kishkindha topography."
  },
  {
    id: "wp-kathakali",
    title: "Kathakali",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Kathakali",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary reference on the classical dance-drama of Kerala, facial makeup (vesham) and mudras."
  },
  {
    id: "wp-paradesi-synagogue",
    title: "Paradesi Synagogue",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Paradesi_Synagogue",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary record of Cochin Jewish heritage, Jew Town, and the historic spice trade nexus."
  },
  {
    id: "wp-kumartuli",
    title: "Kumartuli",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Kumartuli",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary documentation of the traditional potters' colony in Kolkata sculpting clay Durga idols."
  },
  {
    id: "wp-adda-kolkata",
    title: "Adda (social gathering)",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Adda_(social_gathering)",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary overview of Bengali intellectual discourse and Coffee House adda culture."
  },
  {
    id: "wp-chithirai-festival",
    title: "Chithirai Festival",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Chithirai_Festival",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary documentation of the annual Madurai festival uniting Saivite and Vaishnavite traditions."
  },
  {
    id: "wp-sungudi-saree",
    title: "Madurai Sungudi",
    publisher: "Wikipedia (English)",
    sourceType: "reference",
    url: "https://en.wikipedia.org/wiki/Madurai_Sungudi",
    language: "en",
    accessedDate: "2026-10-21",
    assessment: "Tertiary record of GI-tagged tie-and-dye cotton sarees made by Saurashtrian weavers in Madurai."
  }
];

const newEntities = [
  { id: "banaras-gharana-music", type: "tradition", canonicalName: "Banaras Gharana (Hindustani Music)", region: "Varanasi, Uttar Pradesh" },
  { id: "panchakroshi-parikrama", type: "practice", canonicalName: "Panchakroshi Yatra", region: "Varanasi, Uttar Pradesh" },
  { id: "sanganer-block-craft", type: "practice", canonicalName: "Sanganeri Hand-Block Printing", region: "Jaipur, Rajasthan" },
  { id: "amer-fort-citadel", type: "structure", canonicalName: "Amer Fort & Water Lifts", region: "Jaipur, Rajasthan" },
  { id: "vittala-musical-pillars", type: "structure", canonicalName: "Vijaya Vittala Musical Pillars", region: "Hampi, Karnataka" },
  { id: "tungabhadra-river-axis", type: "place", canonicalName: "Tungabhadra River & Kishkindha", region: "Hampi, Karnataka" },
  { id: "kathakali-dance-drama", type: "tradition", canonicalName: "Kathakali Classical Theatre", region: "Kochi, Kerala" },
  { id: "paradesi-synagogue-jewtown", type: "structure", canonicalName: "Paradesi Synagogue & Jew Town", region: "Kochi, Kerala" },
  { id: "kumartuli-clay-craft", type: "practice", canonicalName: "Kumartuli Clay Idol Sculpting", region: "Kolkata, West Bengal" },
  { id: "bengal-adda-tradition", type: "tradition", canonicalName: "Kolkata Adda & Intellectual Heritage", region: "Kolkata, West Bengal" },
  { id: "chithirai-thiruvizha", type: "event", canonicalName: "Chithirai Festival of Madurai", region: "Madurai, Tamil Nadu" },
  { id: "madurai-sungudi-craft", type: "practice", canonicalName: "Madurai Sungudi Tie-and-Dye", region: "Madurai, Tamil Nadu" }
];

for (const s of newSources) {
  if (!catalog.sources.some((x: any) => x.id === s.id)) {
    catalog.sources.push(s);
  }
}
for (const e of newEntities) {
  if (!catalog.entities.some((x: any) => x.id === e.id)) {
    catalog.entities.push(e);
  }
}

CatalogFileSchema.parse(catalog);
writeFileSync(catalogPath, JSON.stringify(catalog, null, 2) + "\n");
console.log("Updated catalog.json successfully with", newSources.length, "sources and", newEntities.length, "entities.");
