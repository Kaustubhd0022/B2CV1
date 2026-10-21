import { writeFileSync } from "node:fs";
import path from "node:path";
import { ItemFileSchema } from "../src/lib/content/types";

const storiesDir = path.join(process.cwd(), "content/fixtures/stories");
const connectionsDir = path.join(process.cwd(), "content/fixtures/connections");

const stories = [
  // 1. Varanasi: Banaras Gharana
  {
    kind: "story",
    slug: "varanasi-music-banaras-gharana",
    city: "varanasi",
    fixture: true,
    entities: [
      { id: "banaras-gharana", role: "subject" },
      { id: "varanasi-ghats", role: "mentioned" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "The Banaras Gharana: Tabla, Shehnai and the Acoustics of the Riverfront",
          orientation: "How the open stone steps of Varanasi's riverfront shaped one of Hindustani music's most expressive instrumental and vocal lineages.",
          hero: {
            src: "/images/dev/varanasi-hero.jpg",
            alt: "Classical musicians and morning prayers along the Varanasi ghats at sunrise",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The sound of the riverfront",
              paragraphs: [
                {
                  text: "The Banaras Gharana of Hindustani classical music developed in the 18th and 19th centuries, strongly influenced by the daily ritual sounds and acoustic spaces of Kashi's riverfront temples.",
                  claims: ["gharana-origins"]
                },
                {
                  text: "Unlike court-centered gharanas of Delhi or Lucknow, Banaras musicians practiced outdoors along the river steps, developing an open, powerful, and deeply vocalized style of tabla and shehnai playing.",
                  claims: ["acoustic-setting"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Instruments and master lineages",
              paragraphs: [
                {
                  text: "Legendary masters such as Pandit Ram Sahai created the distinct Banaras tabla style, while Ustad Bismillah Khan brought the temple shehnai from religious ceremonies onto the international concert stage.",
                  claims: ["master-lineage"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "The Banaras Gharana exemplifies the syncretic soul of Varanasi, where Muslim shehnai players and Hindu temple vocalists shared deep devotion to musical expression and the river.",
                  claims: ["syncretic-heritage"]
                }
              ]
            },
            {
              id: "limits",
              kind: "limits",
              heading: "What we don't know",
              paragraphs: [
                {
                  text: "Oral traditions recount distinct early lineage dates, but written chronicles prior to the late 18th century remain sparse, relying on master-disciple memories.",
                  claims: []
                }
              ]
            }
          ],
          themes: ["art-music", "communities", "beliefs", "places"],
          followUpQuestions: [
            "How does the Banaras tabla style differ from the Delhi gharana?",
            "What was Ustad Bismillah Khan's spiritual connection to the Ganga?",
            "Which temples in Varanasi host annual all-night classical music festivals?"
          ],
          connections: ["temple-acoustics-hampi-madurai", "varanasi-river-to-loom"],
          relatedStories: ["varanasi-ghats-architecture-and-river", "varanasi-silk-weaving-craft-and-living-tradition"]
        },
        claims: [
          {
            key: "gharana-origins",
            text: "The Banaras Gharana developed in Varanasi with a distinctive aesthetic influenced by ritual practices.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-banaras-gharana",
                relation: "supports",
                excerpt: "The Banaras gharana of Hindustani classical music is one of the six most prominent styles of playing the tabla and shehnai.",
                locator: "Lead section"
              }
            ]
          },
          {
            key: "acoustic-setting",
            text: "The open acoustic spaces of Varanasi's stone ghats fostered a resonant performance technique.",
            claimType: "descriptive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-banaras-gharana",
                relation: "supports",
                excerpt: "Musicians often practiced on the open banks of the Ganges, which influenced the sonorous, ringing tone characteristic of the Banaras style.",
                locator: "Style and Technique"
              }
            ]
          },
          {
            key: "master-lineage",
            text: "Pandit Ram Sahai and Ustad Bismillah Khan were seminal figures in establishing the gharana's international acclaim.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-banaras-gharana",
                relation: "supports",
                excerpt: "Pandit Ram Sahai developed the unique Banaras baj, while Ustad Bismillah Khan achieved world renown playing the shehnai at the ghats and temples.",
                locator: "History"
              }
            ]
          },
          {
            key: "syncretic-heritage",
            text: "The music tradition demonstrates communal and cultural syncretism across community boundaries.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-banaras-gharana",
                relation: "supports",
                excerpt: "The tradition brings together both Hindu and Muslim performers in a shared reverence for Kashi's cultural and spiritual environment.",
                locator: "Cultural Significance"
              }
            ]
          }
        ]
      }
    ]
  },

  // 2. Varanasi: Panchakroshi Yatra
  {
    kind: "story",
    slug: "varanasi-panchakroshi-yatra",
    city: "varanasi",
    fixture: true,
    entities: [
      { id: "panchakroshi-parikrama", role: "subject" },
      { id: "kashi-sacred-geography", role: "mentioned" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Panchakroshi Yatra: The 50-Mile Sacred Circumambulation of Kashi",
          orientation: "How an ancient circular pilgrimage route traces the cosmic perimeter of Varanasi and preserves its sacred mandala.",
          hero: {
            src: "/images/dev/varanasi-card.jpg",
            alt: "Pilgrims circumambulating sacred shrines in the Varanasi hinterland",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The sacred boundary",
              paragraphs: [
                {
                  text: "The Panchakroshi Yatra is a traditional pilgrimage covering a perimeter of approximately 50 miles (5 kroshas radius) encompassing the sacred field of Kashi.",
                  claims: ["panchakroshi-radius"]
                },
                {
                  text: "The pilgrimage typically takes five days on foot, visiting 108 principal shrines located in five major halting camps before concluding at Manikarnika Ghat.",
                  claims: ["pilgrim-stages"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Spatial and scriptural order",
              paragraphs: [
                {
                  text: "Described in the medieval Kashi Khanda text, the route transforms the physical countryside into a living mandala where every step earns the spiritual merit of traversing the universe.",
                  claims: ["mandala-concept"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Panchakroshi illustrates how sacred geography in India integrates rural landscape, temple architecture, and walking ritual into an unbroken living practice.",
                  claims: ["landscape-integration"]
                }
              ]
            }
          ],
          themes: ["beliefs", "places", "history"],
          followUpQuestions: [
            "What are the five principal resting stations of the Panchakroshi route?",
            "How does the Panchakroshi route link rural shrines to the urban riverfront?"
          ],
          connections: ["sacred-rivers-ganga-tungabhadra-vaigai"],
          relatedStories: ["varanasi-ghats-architecture-and-river"]
        },
        claims: [
          {
            key: "panchakroshi-radius",
            text: "The Panchakroshi route covers a circumambulation of roughly 50 miles around Varanasi.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-panchakroshi-yatra",
                relation: "supports",
                excerpt: "The Panchakroshi Yatra is a five-day circumambulation pilgrimage covering roughly 50 miles around the sacred city of Varanasi.",
                locator: "Route Overview"
              }
            ]
          },
          {
            key: "pilgrim-stages",
            text: "Pilgrims visit designated sacred halts and shrines beginning and ending at the riverfront.",
            claimType: "descriptive",
            epistemic: "tradition",
            evidence: [
              {
                source: "wp-panchakroshi-yatra",
                relation: "supports",
                excerpt: "The pilgrimage stops at five designated overnight halts and includes 108 shrines, traditionally beginning and ending at Manikarnika Ghat.",
                locator: "Itinerary"
              }
            ]
          },
          {
            key: "mandala-concept",
            text: "Scriptural traditions depict the route as a sacred cosmic mandala protecting the holy territory.",
            claimType: "belief",
            epistemic: "tradition",
            evidence: [
              {
                source: "gov-ignca-kashi-sacred-geography",
                relation: "supports",
                excerpt: "The Panchakroshi circuit forms the outer cosmic boundary of Kashi, embodying the sacred geometry of the mandala.",
                locator: "Spatial Structure"
              }
            ]
          },
          {
            key: "landscape-integration",
            text: "The yatra links water tanks, sacred trees, and rural temples into a continuous ritual ecology.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "gov-ignca-kashi-sacred-geography",
                relation: "supports",
                excerpt: "The pilgrimage integrates rural agrarian ponds, groves, and centuries-old rest houses into an unbroken spiritual continuum.",
                locator: "Ecology and Ritual"
              }
            ]
          }
        ]
      }
    ]
  },

  // 3. Jaipur: Sanganer Block-Printing
  {
    kind: "story",
    slug: "jaipur-sanganer-block-printing",
    city: "jaipur",
    fixture: true,
    entities: [
      { id: "sanganer-block-craft", role: "subject" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Chhipa Artisans and the River Dyes: The Sanganer Block-Printing Lineage",
          orientation: "How skilled hand-carved teak blocks and mineral dyes turned a village outside Jaipur into a global textile heritage center.",
          hero: {
            src: "/images/dev/jaipur.jpg",
            alt: "Artisan carving intricate wooden printing blocks in Jaipur",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The craft of the Chhipas",
              paragraphs: [
                {
                  text: "Sanganer, located south of Jaipur, has been home to the Chhipa community of textile printers since royal patronage flourished in the 17th century under the Kachwaha rulers.",
                  claims: ["chhipa-history"]
                },
                {
                  text: "The craft relies on hand-carved sheesham and teak blocks dipped in vegetable and mineral mordants to print precise floral and paisley motifs on natural cotton cloth.",
                  claims: ["wood-block-technique"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Water, sand and sun",
              paragraphs: [
                {
                  text: "The mineral-rich waters of the local Sanjaria River and the arid Rajasthani sun were essential in giving Sanganer prints their characteristic crisp white backgrounds and fast natural colors.",
                  claims: ["ecological-setting"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Recognized with a Geographical Indication (GI) tag, Sanganer block printing preserves an unbroken guild knowledge system resistant to mechanized mass production.",
                  claims: ["gi-recognition"]
                }
              ]
            }
          ],
          themes: ["crafts", "communities", "history"],
          followUpQuestions: [
            "How do Sanganeri prints differ from Bagru mud-resist (Dabu) prints?",
            "What natural ingredients are used to create red and black dyes?"
          ],
          connections: ["handloom-guilds-banaras-sanganer-sungudi"],
          relatedStories: ["jaipur-jantar-mantar-astronomy-in-stone", "varanasi-silk-weaving-craft-and-living-tradition"]
        },
        claims: [
          {
            key: "chhipa-history",
            text: "The Chhipa community in Sanganer received royal patronage under the Kachwaha dynasty.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-sanganer-block-print",
                relation: "supports",
                excerpt: "Sanganer printing gained prominence in the 17th century when the rulers of Jaipur encouraged craft communities to settle in the region.",
                locator: "History"
              }
            ]
          },
          {
            key: "wood-block-technique",
            text: "Artisans use multiple carved wooden blocks to layer intricate floral patterns on cotton.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-sanganer-block-print",
                relation: "supports",
                excerpt: "Hand-carved wooden blocks made of teak or sheesham are used to apply patterns in successive color layers.",
                locator: "Technique"
              }
            ]
          },
          {
            key: "ecological-setting",
            text: "Local water chemistry and sunlight were vital factors in developing the print's color fastness.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-sanganer-block-print",
                relation: "supports",
                excerpt: "The water of the local river was credited with imparting brightness and luster to the dyed cloth during washing and drying.",
                locator: "Water and Environment"
              }
            ]
          },
          {
            key: "gi-recognition",
            text: "Sanganer hand block printing holds statutory Geographical Indication protection.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-sanganer-block-print",
                relation: "supports",
                excerpt: "Sanganeri hand block printing has received Geographical Indication (GI) status under Indian intellectual property law.",
                locator: "GI Tag"
              }
            ]
          }
        ]
      }
    ]
  },

  // 4. Jaipur: Amer Fort Water Systems
  {
    kind: "story",
    slug: "jaipur-amer-fort-water-systems",
    city: "jaipur",
    fixture: true,
    entities: [
      { id: "amer-fort-citadel", role: "subject" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Rajput Stone Citadel Hydraulics: Maota Lake and the Water Lifts of Amer",
          orientation: "How engineering genius lifted water hundreds of feet up rocky cliffs to nourish gardens and palaces in the arid desert hills.",
          hero: {
            src: "/images/dev/jaipur.jpg",
            alt: "Amer Fort ramparts reflected in the waters of Maota Lake",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "Fortress on the ridge",
              paragraphs: [
                {
                  text: "Amer Fort, constructed primarily of red sandstone and marble by Raja Man Singh I beginning in 1592, served as the royal seat of the Kachwaha dynasty before the founding of Jaipur.",
                  claims: ["amer-construction"]
                },
                {
                  text: "The greatest architectural feat of the citadel was its multi-stage Persian wheel hydraulic system that lifted water from Maota Lake up nearly 400 feet into the fort's storage tanks.",
                  claims: ["hydraulic-system"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Cooling courtyards and pleasure gardens",
              paragraphs: [
                {
                  text: "The lifted water powered fountains in the Sheesh Mahal and cascaded through marble channels into the Kesar Kyari saffron garden laid out in the middle of Maota Lake.",
                  claims: ["kesar-kyari-garden"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Amer's water architecture demonstrates that medieval Indian hill citadels were sophisticated ecological habitats harmonizing defence, water harvesting, and microclimate regulation.",
                  claims: ["ecological-habitat"]
                }
              ]
            }
          ],
          themes: ["history", "places", "architecture"],
          followUpQuestions: [
            "How did the underground clay pipelines prevent water loss from evaporation?",
            "What connection exists between Amer Fort and the Jaigarh cannon foundry?"
          ],
          connections: ["sacred-rivers-ganga-tungabhadra-vaigai"],
          relatedStories: ["jaipur-jantar-mantar-astronomy-in-stone"]
        },
        claims: [
          {
            key: "amer-construction",
            text: "Amer Fort was constructed by Raja Man Singh I as the fortified capital of the Kachwaha Rajputs.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-amer-fort",
                relation: "supports",
                excerpt: "Amer Fort was built by Raja Man Singh I in the late 16th century, situated high on a hill overlooking Maota Lake.",
                locator: "History"
              }
            ]
          },
          {
            key: "hydraulic-system",
            text: "Water was lifted from the lake to the summit fort through multi-tiered pulley and aqueduct systems.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-amer-fort",
                relation: "supports",
                excerpt: "A complex system of Persian wheels (rehats) lifted water from Maota Lake across multiple terrace levels into the upper citadel reservoirs.",
                locator: "Water Architecture"
              }
            ]
          },
          {
            key: "kesar-kyari-garden",
            text: "The lake water irrigated the geometrically designed Kesar Kyari island garden.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-amer-fort",
                relation: "supports",
                excerpt: "In the center of Maota Lake lies the Kesar Kyari garden, created with star-shaped sunken flower beds.",
                locator: "Gardens and Lake"
              }
            ]
          },
          {
            key: "ecological-habitat",
            text: "The water system moderated desert summer temperatures inside the residential pavilions.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-amer-fort",
                relation: "supports",
                excerpt: "Circulating water through hidden wall channels and cooling screens allowed inhabitants to withstand intense summer heat.",
                locator: "Architecture and Climate"
              }
            ]
          }
        ]
      }
    ]
  },

  // 5. Hampi: Vittala Musical Pillars
  {
    kind: "story",
    slug: "hampi-vittala-musical-pillars",
    city: "hampi",
    fixture: true,
    entities: [
      { id: "vittala-musical-pillars", role: "subject" },
      { id: "hampi-vijayanagara", role: "mentioned" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Acoustic Granite: The 56 Resonant Pillars of Vijaya Vittala",
          orientation: "How Vijayanagara sculptors cut monolithic granite columns that ring with musical notes, turning stone into sacred sound.",
          hero: {
            src: "/images/dev/hampi.jpg",
            alt: "Intricately carved stone pillars of Vijaya Vittala temple hall at Hampi",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "Columns that sing",
              paragraphs: [
                {
                  text: "The Vijaya Vittala Temple, begun in the 15th century and expanded during Emperor Krishnadevaraya's reign, houses the famed Ranga Mandapa with 56 musical pillars (SaReGaMa pillars).",
                  claims: ["vittala-pillars-dates"]
                },
                {
                  text: "Each main pillar is surrounded by seven slender micro-pillars carved out of a single monolithic block of resonant granite that produce distinct bell-like tones when tapped.",
                  claims: ["monolith-acoustics"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Sacred dance and liturgical performance",
              paragraphs: [
                {
                  text: "Scholars suggest these pillars served as acoustic accompaniment to temple dancers and liturgical chants during sacred nocturnal festivals.",
                  claims: ["dance-liturgy"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "The musical pillars represent the apex of Dravidian stone craftsmanship, proving that medieval artisans understood stone density, sonic vibration, and architectural resonance.",
                  claims: ["stone-apex"]
                }
              ]
            }
          ],
          themes: ["art-music", "architecture", "history"],
          followUpQuestions: [
            "How do acoustic properties vary between different pillars in the hall?",
            "What links exist between the Hampi musical pillars and Madurai's Thousand Pillar Hall?"
          ],
          connections: ["temple-acoustics-hampi-madurai"],
          relatedStories: ["hampi-a-capital-and-a-sacred-landscape", "madurai-meenakshi-temple-city"]
        },
        claims: [
          {
            key: "vittala-pillars-dates",
            text: "The Vittala temple mandapa featuring musical pillars was built during the 15th–16th centuries of Vijayanagara rule.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-vittala-temple",
                relation: "supports",
                excerpt: "The Vijaya Vittala temple dates to the 15th century, with substantial additions made by King Krishnadevaraya in the 16th century.",
                locator: "History"
              }
            ]
          },
          {
            key: "monolith-acoustics",
            text: "Clusters of slender colonnettes carved from a single granite block emit musical pitches.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-vittala-temple",
                relation: "supports",
                excerpt: "The pillars are carved out of single pieces of granite; when struck gently, each colonnette produces a clear musical note.",
                locator: "Musical Pillars"
              }
            ]
          },
          {
            key: "dance-liturgy",
            text: "Acoustic resonance supported liturgical dance and musical ceremonies in the Ranga Mandapa.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-vittala-temple",
                relation: "supports",
                excerpt: "Tradition holds that the pillars provided acoustic accompaniment to religious dances and temple celebrations.",
                locator: "Religious Use"
              }
            ]
          },
          {
            key: "stone-apex",
            text: "The pillars demonstrate advanced metallurgical and mineralogical knowledge of granite resonance.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-vittala-temple",
                relation: "supports",
                excerpt: "Studies note varying mineral compositions and densities in the granite chosen specifically for acoustic performance.",
                locator: "Acoustic Studies"
              }
            ]
          }
        ]
      }
    ]
  },

  // 6. Hampi: Tungabhadra Coracles
  {
    kind: "story",
    slug: "hampi-tungabhadra-coracles",
    city: "hampi",
    fixture: true,
    entities: [
      { id: "tungabhadra-river-axis", role: "subject" },
      { id: "hampi-vijayanagara", role: "mentioned" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Sacred Boulders and River Coracles: The Kishkindha Landscape Across Millennia",
          orientation: "How woven bamboo coracles and ancient granite outcrops preserved the sacred river boundary of the Vijayanagara Empire.",
          hero: {
            src: "/images/dev/hampi.jpg",
            alt: "Circular woven coracles floating on the Tungabhadra River near ancient Hampi boulders",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The river and the stone",
              paragraphs: [
                {
                  text: "The Tungabhadra River cuts through one of the oldest exposed granite landscapes on earth, dividing the ancient monkey kingdom of Kishkindha from the imperial capital of Vijayanagara.",
                  claims: ["geological-setting"]
                },
                {
                  text: "For centuries, local boatmen have navigated its treacherous rapids using circular woven coracles (harigolu), made from split bamboo waterproofed with leather or tar.",
                  claims: ["coracle-craft"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Travellers across the centuries",
              paragraphs: [
                {
                  text: "Sixteenth-century Portuguese chronicler Domingo Paes documented these very basket-boats transporting warriors, horses, and temple supplies across the river.",
                  claims: ["portuguese-records"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Coracle navigation on the Tungabhadra represents an unbroken living watercraft technology, linking modern travellers directly to medieval river life.",
                  claims: ["living-watercraft"]
                }
              ]
            }
          ],
          themes: ["places", "crafts", "history"],
          followUpQuestions: [
            "How does the coracle's circular shape prevent it from tipping in river whirlpools?",
            "What mythological sites in Kishkindha are reachable only by river crossing?"
          ],
          connections: ["sacred-rivers-ganga-tungabhadra-vaigai"],
          relatedStories: ["hampi-a-capital-and-a-sacred-landscape"]
        },
        claims: [
          {
            key: "geological-setting",
            text: "The Tungabhadra river passes through Precambrian granite boulder hills associated with the Kishkindha of epic tradition.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-tungabhadra-river",
                relation: "supports",
                excerpt: "The Tungabhadra River flows past Hampi through steep granite gorges traditionally identified with Kishkindha.",
                locator: "Geography"
              }
            ]
          },
          {
            key: "coracle-craft",
            text: "Coracles are circular woven wickercraft vessels constructed for navigating turbulent river waters.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-tungabhadra-river",
                relation: "supports",
                excerpt: "Coracles made of woven bamboo reeds and waterproofed hide have been used as ferries across the Tungabhadra for centuries.",
                locator: "Navigation"
              }
            ]
          },
          {
            key: "portuguese-records",
            text: "Domingo Paes and other early European visitors recorded the widespread use of coracles in Vijayanagara.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-hampi",
                relation: "supports",
                excerpt: "Portuguese traveler Domingo Paes noted that people crossed the river in round basket-boats that could carry ten men and horses.",
                locator: "Accounts of Vijayanagara"
              }
            ]
          },
          {
            key: "living-watercraft",
            text: "Coracle ferrying continues today as an active community tradition at Anegundi and Hampi.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-tungabhadra-river",
                relation: "supports",
                excerpt: "Modern travelers and pilgrims continue to use coracles to cross the river between Hampi and Anegundi.",
                locator: "Modern Times"
              }
            ]
          }
        ]
      }
    ]
  },

  // 7. Kochi: Kathakali
  {
    kind: "story",
    slug: "kochi-kathakali-temple-theater",
    city: "kochi",
    fixture: true,
    entities: [
      { id: "kathakali-dance-drama", role: "subject" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Veshams, Mudras and the Green Room: The Living Tradition of Kathakali",
          orientation: "How hours of intricate mineral facial makeup and a codified language of eye movements bring epic mythology to life on the Malabar coast.",
          hero: {
            src: "/images/dev/kochi.jpg",
            alt: "Kathakali artist in green Paccha makeup and elaborate headdress performing in Kochi",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The ritual transformation",
              paragraphs: [
                {
                  text: "Kathakali originated in 17th-century Kerala under the patronage of the Zamorins and royal courts, blending Ramanattam dance with Kalaripayattu martial footwork.",
                  claims: ["kathakali-origins"]
                },
                {
                  text: "The preparation takes up to four hours in the green room (Aniyara), where artists lie motionless as specialized makeup artists apply natural pigments and the Chutti (layered rice paste border).",
                  claims: ["chutti-makeup"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "The codified language of emotion",
              paragraphs: [
                {
                  text: "Without uttering a single spoken word, the actor-dancer conveys complex narratives through 24 primary root mudras (hand gestures) and precise micro-movements of eyes and brows.",
                  claims: ["mudra-system"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Kathakali demonstrates how total theater combines visual portraiture, percussion rhythm (Chenda and Maddalam), and physical discipline into a sacred dramatic literature.",
                  claims: ["total-theater"]
                }
              ]
            }
          ],
          themes: ["art-music", "beliefs", "communities"],
          followUpQuestions: [
            "What do the five primary character types (Paccha, Kathi, Thadi, Kari, Minukku) symbolize?",
            "How did poet Vallathol Narayana Menon revive Kathakali at Kerala Kalamandalam?"
          ],
          connections: ["temple-acoustics-hampi-madurai"],
          relatedStories: ["kochi-cantilevered-fishing-nets"]
        },
        claims: [
          {
            key: "kathakali-origins",
            text: "Kathakali developed in Kerala during the 17th century from courtly and temple theatrical lineages.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-kathakali",
                relation: "supports",
                excerpt: "Kathakali is a major form of classical Indian dance that originated in the 17th century in Kerala.",
                locator: "Lead section"
              }
            ]
          },
          {
            key: "chutti-makeup",
            text: "The facial makeup requires hours of preparation using natural mineral pigments and rice-paste ridges.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-kathakali",
                relation: "supports",
                excerpt: "The makeup process is elaborate and can take several hours, utilizing rice flour and lime for the white chutti frame.",
                locator: "Makeup and Costumes"
              }
            ]
          },
          {
            key: "mudra-system",
            text: "Actors communicate complex stories using 24 basic mudras accompanied by facial bhavas.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-kathakali",
                relation: "supports",
                excerpt: "Kathakali incorporates 24 primary root hand gestures (mudras) codified from the Hastha Lakshana Deepika.",
                locator: "Gestures and Mudras"
              }
            ]
          },
          {
            key: "total-theater",
            text: "The art form integrates live vocals, heavy percussion, and symbolic dance into an immersive narrative.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-kathakali",
                relation: "supports",
                excerpt: "Kathakali is celebrated worldwide as a form of total theatre synthesizing dance, music, painting, and literature.",
                locator: "Significance"
              }
            ]
          }
        ]
      }
    ]
  },

  // 8. Kochi: Spice Route & Jew Town
  {
    kind: "story",
    slug: "kochi-spice-route-jew-town",
    city: "kochi",
    fixture: true,
    entities: [
      { id: "paradesi-synagogue-jewtown", role: "subject" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Malabar Black Gold: The Mattancherry Spice Bazaars and Paradesi Synagogue",
          orientation: "How ginger, cardamom, and black pepper drew maritime traders from across the globe to create Mattancherry's pluralistic cultural quarter.",
          hero: {
            src: "/images/dev/kochi.jpg",
            alt: "Antique wooden warehouses and spice merchants along the narrow alleys of Jew Town in Kochi",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The port of pepper",
              paragraphs: [
                {
                  text: "Following the historic flood of the Periyar River in 1341 that silted up ancient Muziris, Kochi emerged as the premier natural harbour of the Malabar coast for the international spice trade.",
                  claims: ["muziris-flood"]
                },
                {
                  text: "Jewish merchants, welcomed by the Hindu Raja of Cochin who granted them land adjacent to his palace, built Jew Town and the Paradesi Synagogue in 1568.",
                  claims: ["jew-town-synagogue"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Porcelain tiles and Belgian glass",
              paragraphs: [
                {
                  text: "The Paradesi Synagogue contains hand-painted willow-pattern porcelain tiles imported from Canton in 1762, Belgian glass chandeliers, and copper plate charters granted by ancient Chera kings.",
                  claims: ["synagogue-artifacts"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Jew Town stands as living testimony to India's historic tradition of religious asylum and maritime cosmopolitanism where communities lived peacefully for centuries.",
                  claims: ["cosmopolitan-tolerance"]
                }
              ]
            }
          ],
          themes: ["history", "communities", "places"],
          followUpQuestions: [
            "What rights were inscribed on the Jewish copper plates granted by Bhaskara Ravi Varman?",
            "How did Cochin Jewish culinary traditions blend Malabar coconut and spice with kosher laws?"
          ],
          connections: ["sacred-rivers-ganga-tungabhadra-vaigai"],
          relatedStories: ["kochi-cantilevered-fishing-nets"]
        },
        claims: [
          {
            key: "muziris-flood",
            text: "The 1341 flood of the Periyar opened Kochi's harbour and altered Malabar's spice geography.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-chinese-fishing-nets",
                relation: "supports",
                excerpt: "The great flood of the Periyar River in 1341 silted up the port of Muziris and created the natural harbour at Kochi.",
                locator: "History of Kochi Port"
              }
            ]
          },
          {
            key: "jew-town-synagogue",
            text: "The Paradesi Synagogue was built in 1568 on land granted by the Raja of Cochin.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-paradesi-synagogue",
                relation: "supports",
                excerpt: "The Paradesi Synagogue was built in 1568 by Spanish-speaking Jews on land adjacent to the Mattancherry Palace granted by Rama Varma.",
                locator: "History"
              }
            ]
          },
          {
            key: "synagogue-artifacts",
            text: "The synagogue features 18th-century Chinese porcelain floor tiles and copper charters.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-paradesi-synagogue",
                relation: "supports",
                excerpt: "The floor is paved with hundreds of unique hand-painted Chinese porcelain tiles, lit by antique Belgian glass chandeliers.",
                locator: "Architecture and Interior"
              }
            ]
          },
          {
            key: "cosmopolitan-tolerance",
            text: "Mattancherry represents multi-century coexistence between Jewish, Christian, Muslim and Hindu merchants.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-paradesi-synagogue",
                relation: "supports",
                excerpt: "The Cochin Jewish community flourished with freedom of worship and full civil rights granted by local rulers.",
                locator: "Community Life"
              }
            ]
          }
        ]
      }
    ]
  },

  // 9. Kolkata: Kumartuli
  {
    kind: "story",
    slug: "kolkata-kumartuli-clay-sculptors",
    city: "kolkata",
    fixture: true,
    entities: [
      { id: "kumartuli-clay-craft", role: "subject" },
      { id: "durga-puja-kolkata", role: "mentioned" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "River Silt and Sacred Straw: The Master Idol Artisans of Kumartuli",
          orientation: "How generational potters along the Hooghly mold river clay and sacred earth into the divine icons of Durga Puja.",
          hero: {
            src: "/images/dev/kolkata.jpg",
            alt: "Artisan hands sculpting clay face of Goddess Durga in Kumartuli workshop",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The potter's quarter",
              paragraphs: [
                {
                  text: "Kumartuli, located in North Kolkata along the Hooghly River, is a centuries-old artisanal enclave where hundreds of master potters sculpt thousands of clay idols annually for Durga Puja.",
                  claims: ["kumartuli-settlement"]
                },
                {
                  text: "The sculpting process follows an ancient sequence: a bamboo and straw framework (Kathamo), coated in alluvial river silt (entel mati), and finished with smooth fine silt (bele mati).",
                  claims: ["clay-technique"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Sacred soil and the Chakshu Daan ritual",
              paragraphs: [
                {
                  text: "Tradition requires incorporating a pinch of soil from the threshold of a courtesan's dwelling (punya mati), followed on Mahalaya by the solemn ritual of painting the goddess's eyes (Chakshu Daan).",
                  claims: ["chakshu-daan-ritual"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Kumartuli embodies an ephemeral cycle of devotion: born from river silt, brought to life through community worship, and dissolved back into the river during immersion (Visarjan).",
                  claims: ["ephemeral-cycle"]
                }
              ]
            }
          ],
          themes: ["crafts", "festivals", "beliefs", "communities"],
          followUpQuestions: [
            "Why is immersion of clay idols into the Hooghly designed to be ecologically biodegradable?",
            "How do women clay sculptors like China Pal challenge traditional patriarchal workshop boundaries?"
          ],
          connections: ["living-clay-kumartuli-to-ghats"],
          relatedStories: ["kolkata-durga-puja-living-art"]
        },
        claims: [
          {
            key: "kumartuli-settlement",
            text: "Kumartuli was founded along the riverfront by potters who migrated to supply clay vessels and idols to Kolkata.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-kumartuli",
                relation: "supports",
                excerpt: "Kumartuli is a traditional potters' quarter in northern Kolkata known for sculpting clay idols for Durga Puja.",
                locator: "Lead section"
              }
            ]
          },
          {
            key: "clay-technique",
            text: "Idols are sculpted around straw armatures using successive layers of Hooghly river clay.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-kumartuli",
                relation: "supports",
                excerpt: "Artisans build the image around a bamboo frame using straw and clay gathered from the banks of the river Hooghly.",
                locator: "Idol Making Process"
              }
            ]
          },
          {
            key: "chakshu-daan-ritual",
            text: "The final ritual act of bestowing sight on the idol occurs on Mahalaya morning.",
            claimType: "belief",
            epistemic: "tradition",
            evidence: [
              {
                source: "wp-kumartuli",
                relation: "supports",
                excerpt: "The sacred act of painting the eyes of Goddess Durga, known as Chokhhu Daan, is traditionally performed on Mahalaya.",
                locator: "Rituals"
              }
            ]
          },
          {
            key: "ephemeral-cycle",
            text: "The clay returns to the river upon immersion, completing an ecological and spiritual circle.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-durga-puja-in-kolkata",
                relation: "supports",
                excerpt: "The celebration concludes with the immersion of the clay idols into the river waters from which their clay was drawn.",
                locator: "Immersion"
              }
            ]
          }
        ]
      }
    ]
  },

  // 10. Kolkata: Bengal Renaissance & Adda
  {
    kind: "story",
    slug: "kolkata-bengal-renaissance-adda",
    city: "kolkata",
    fixture: true,
    entities: [
      { id: "bengal-adda-tradition", role: "subject" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Coffee House and the Spoken Word: Adda, Literature and Intellectual Awakening",
          orientation: "How informal, passionate conversation in Kolkata's heritage cafes nurtured the Bengal Renaissance and shaped modern Indian literature.",
          hero: {
            src: "/images/dev/kolkata.jpg",
            alt: "Scholars, poets, and students gathered for literary discussion at Kolkata Coffee House",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The art of conversation",
              paragraphs: [
                {
                  text: "In Bengali culture, 'adda' is neither idle gossip nor formal debate; it is an unhurried, spontaneous intellectual communion where literature, philosophy, politics, and art are dissected across generations.",
                  claims: ["adda-definition"]
                },
                {
                  text: "During the 19th and 20th centuries, venues like College Street's Coffee House and neighbourhood rock-sitting (parar roak) became fertile incubators for literary magazines and revolutionary ideas.",
                  claims: ["coffee-house-hub"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "From Tagore to Satyajit Ray",
              paragraphs: [
                {
                  text: "Figures from Rabindranath Tagore and Michael Madhusudan Dutt to filmmaker Satyajit Ray drew direct inspiration from the egalitarian spontaneity of these literary salons.",
                  claims: ["renaissance-figures"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Adda demonstrates how intellectual culture in India thrives outside formal institutional walls, grounded in public spaces, shared tea, and a collective passion for ideas.",
                  claims: ["public-culture"]
                }
              ]
            }
          ],
          themes: ["history", "communities", "places"],
          followUpQuestions: [
            "How did the Hungry Generation literary movement emerge out of Coffee House addas?",
            "What role did College Street bookstalls play in democratizing vernacular reading?"
          ],
          connections: ["varanasi-river-to-loom"],
          relatedStories: ["kolkata-durga-puja-living-art"]
        },
        claims: [
          {
            key: "adda-definition",
            text: "Adda is a cherished social practice of freewheeling intellectual discourse distinctive to Bengali urban culture.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-adda-kolkata",
                relation: "supports",
                excerpt: "Adda is a form of intellectual and social gathering characterized by informal, open-ended conversation among peers in Bengal.",
                locator: "Sociological Meaning"
              }
            ]
          },
          {
            key: "coffee-house-hub",
            text: "The Indian Coffee House on College Street became the epicenter for literary and political debate.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-adda-kolkata",
                relation: "supports",
                excerpt: "The Indian Coffee House at College Street is historically renowned as the meeting place of poets, artists, and academics.",
                locator: "Famous Adda Hubs"
              }
            ]
          },
          {
            key: "renaissance-figures",
            text: "Seminal artists, filmmakers, and poets actively participated in and drew creative energy from adda gatherings.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-adda-kolkata",
                relation: "supports",
                excerpt: "Prominent intellectuals including Satyajit Ray, Amartya Sen, and Sunil Gangopadhyay frequently engaged in Coffee House discussions.",
                locator: "Historical Figures"
              }
            ]
          },
          {
            key: "public-culture",
            text: "The practice highlights the role of democratic public spaces in cultivating intellectual freedom.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-adda-kolkata",
                relation: "supports",
                excerpt: "Sociologists consider adda an essential democratic space that broke down rigid social hierarchies through egalitarian exchange.",
                locator: "Cultural Value"
              }
            ]
          }
        ]
      }
    ]
  },

  // 11. Madurai: Chithirai Festival
  {
    kind: "story",
    slug: "madurai-chithirai-festival",
    city: "madurai",
    fixture: true,
    entities: [
      { id: "chithirai-thiruvizha", role: "subject" },
      { id: "meenakshi-temple", role: "mentioned" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "The Celestial Wedding and the River Crossing: Chithirai Thiruvizha and Regional Harmony",
          orientation: "How a month-long temple festival brought Shaivite and Vaishnavite traditions together in the sacred riverbed of the Vaigai.",
          hero: {
            src: "/images/dev/madurai.jpg",
            alt: "Grand wooden temple chariot of Meenakshi Temple pulled by thousands of devotees in Madurai",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "A festival of reconciliation",
              paragraphs: [
                {
                  text: "The Chithirai Festival of Madurai, celebrated in the Tamil month of Chithirai (April–May), is one of the world's longest continuously observed temple festivals, spanning nearly a month.",
                  claims: ["chithirai-duration"]
                },
                {
                  text: "King Thirumalai Nayak in the 17th century politically united two previously separate festivals: the celestial wedding of Meenakshi and Sundareswarar, and Lord Alagar's journey from Alagar Koyil into the Vaigai River.",
                  claims: ["thirumalai-unification"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "The golden horse in the riverbed",
              paragraphs: [
                {
                  text: "The dramatic climax occurs when Lord Alagar enters the Vaigai River mounted on a golden horse, greeted by over a million pilgrims in the dry summer riverbed.",
                  claims: ["river-entry"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Chithirai Thiruvizha demonstrates how enlightened statesmanship utilized sacred ritual and riverfront topography to forge enduring peace between rival religious communities.",
                  claims: ["peace-reconciliation"]
                }
              ]
            }
          ],
          themes: ["festivals", "beliefs", "history", "places"],
          followUpQuestions: [
            "Why does Lord Alagar turn back without attending the wedding ceremony?",
            "How do agricultural communities around Madurai participate in pulling the giant temple car (Ther)?"
          ],
          connections: ["sacred-rivers-ganga-tungabhadra-vaigai", "vijayanagara-and-madurai"],
          relatedStories: ["madurai-meenakshi-temple-city"]
        },
        claims: [
          {
            key: "chithirai-duration",
            text: "Chithirai Festival spans nearly an entire month of rituals across Madurai and the Vaigai River.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-chithirai-festival",
                relation: "supports",
                excerpt: "The Chithirai festival is one of the biggest celebrations in Madurai, lasting for nearly a month during the Tamil month of Chithirai.",
                locator: "Overview"
              }
            ]
          },
          {
            key: "thirumalai-unification",
            text: "King Thirumalai Nayak combined the Shaivite Meenakshi wedding with the Vaishnavite Alagar festival.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-chithirai-festival",
                relation: "supports",
                excerpt: "Ruler Thirumalai Nayak merged the two separate festivals into a single grand celebration to unite Shaivites and Vaishnavites.",
                locator: "History"
              }
            ]
          },
          {
            key: "river-entry",
            text: "Lord Alagar enters the Vaigai River mounted on a golden horse, observed by massive crowds.",
            claimType: "belief",
            epistemic: "tradition",
            evidence: [
              {
                source: "wp-chithirai-festival",
                relation: "supports",
                excerpt: "The highlight of the festival is Lord Alagar's grand entry into the Vaigai River riding his golden horse.",
                locator: "Key Events"
              }
            ]
          },
          {
            key: "peace-reconciliation",
            text: "The festival served as a social mechanism for communal harmony across regional caste and sectarian lines.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-chithirai-festival",
                relation: "supports",
                excerpt: "Scholars emphasize the role of the festival in promoting sectarian solidarity across diverse communities of the region.",
                locator: "Social Impact"
              }
            ]
          }
        ]
      }
    ]
  },

  // 12. Madurai: Sungudi Cotton Weavers
  {
    kind: "story",
    slug: "madurai-sungudi-cotton-weavers",
    city: "madurai",
    fixture: true,
    entities: [
      { id: "madurai-sungudi-craft", role: "subject" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Saurashtrian Migrants and Vaigai Silt: The Sungudi Knot-and-Dye Handloom Heritage",
          orientation: "How skilled migrant weavers from Gujarat settled in Madurai, fusing tie-and-dye techniques with South Indian temple cotton borders.",
          hero: {
            src: "/images/dev/madurai.jpg",
            alt: "Artisan tying thousands of tiny knots on Madurai Sungudi cotton fabric before dyeing",
            credit: "TattvaCo Cultural Archives",
            rightsCleared: true
          },
          sections: [
            {
              id: "story",
              kind: "narrative",
              heading: "The journey of the Saurashtrians",
              paragraphs: [
                {
                  text: "During the 16th century, master weavers from Saurashtra migrated south to escape political upheavals, receiving asylum and royal patronage from the Nayak rulers of Madurai.",
                  claims: ["saurashtra-migration"]
                },
                {
                  text: "In Madurai, they developed Sungudi (from the Sanskrit 'Sunnam', meaning round spot): fine combed cotton fabric patterned by tying thousands of tiny knots by hand using fingernails and thread.",
                  claims: ["sungudi-knot-technique"]
                }
              ]
            },
            {
              id: "context",
              kind: "context",
              heading: "Natural dyes and the Vaigai River",
              paragraphs: [
                {
                  text: "The cloth was traditionally washed and treated in the mineral-rich waters of the Vaigai River, which bonded the natural madder red and indigo dyes permanently to the cotton fibers.",
                  claims: ["vaigai-dyeing"]
                }
              ]
            },
            {
              id: "why",
              kind: "significance",
              heading: "Why it matters",
              paragraphs: [
                {
                  text: "Sungudi represents a magnificent synthesis of Western Indian Bandhani tie-dye with Tamil temple borders (zari karai), awarded Geographical Indication protection.",
                  claims: ["sungudi-gi"]
                }
              ]
            }
          ],
          themes: ["crafts", "communities", "history"],
          followUpQuestions: [
            "How do Saurashtrian Tamils maintain their unique language and culinary traditions in Madurai?",
            "What distinguishes authentic Sungudi knot-dyeing from screen-printed imitations?"
          ],
          connections: ["handloom-guilds-banaras-sanganer-sungudi"],
          relatedStories: ["madurai-meenakshi-temple-city", "varanasi-silk-weaving-craft-and-living-tradition"]
        },
        claims: [
          {
            key: "saurashtra-migration",
            text: "Saurashtrian weavers migrated to Madurai under Nayak patronage in the 16th and 17th centuries.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-sungudi-saree",
                relation: "supports",
                excerpt: "The craft was brought to Madurai by Saurashtrian weavers who migrated to the Tamil region upon invitation by King Thirumalai Nayak.",
                locator: "History"
              }
            ]
          },
          {
            key: "sungudi-knot-technique",
            text: "Sungudi textiles are characterized by minute hand-tied knots producing circular dot patterns.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-sungudi-saree",
                relation: "supports",
                excerpt: "The fabric is pinch-tied with thread thousands of times by hand before being immersed in dye baths.",
                locator: "Craft Process"
              }
            ]
          },
          {
            key: "vaigai-dyeing",
            text: "Washing the tied cotton in the Vaigai River water helped fix natural mineral dyes.",
            claimType: "descriptive",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-sungudi-saree",
                relation: "supports",
                excerpt: "The waters of the Vaigai River were traditionally used to rinse and fix the dyes onto the combed cotton yarn.",
                locator: "Dyeing Process"
              }
            ]
          },
          {
            key: "sungudi-gi",
            text: "Madurai Sungudi possesses Geographical Indication (GI) status under Indian law.",
            claimType: "historical",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-sungudi-saree",
                relation: "supports",
                excerpt: "Madurai Sungudi has been registered under the Geographical Indications of Goods Act.",
                locator: "GI Registration"
              }
            ]
          }
        ]
      }
    ]
  }
];

for (const story of stories) {
  ItemFileSchema.parse(story);
  const filePath = path.join(storiesDir, `${story.slug}.json`);
  writeFileSync(filePath, JSON.stringify(story, null, 2) + "\n");
  console.log("Created story:", story.slug);
}

// 4 New Rich Cultural Connections
const newConnections = [
  {
    kind: "connection",
    slug: "sacred-rivers-ganga-tungabhadra-vaigai",
    fixture: true,
    entities: [
      { id: "ganges", role: "from" },
      { id: "tungabhadra-river-axis", role: "to" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Sacred Hydrology: How Ganga, Tungabhadra and Vaigai Shaped India's Cultural Ecosystems",
          summary: "Across three distinct geographic zones, sacred rivers functioned not merely as water sources but as moral boundaries, architectural axes, and liturgical centers.",
          relationshipType: "place_and_practice",
          from: { entity: "ganges", label: "The Ganga at Varanasi" },
          to: { entity: "tungabhadra-river-axis", label: "The Tungabhadra at Hampi" },
          rationale: [
            {
              text: "In Varanasi, the north-flowing Ganga defines the 84 crescent ghats; in Hampi, the turbulent Tungabhadra forms the natural moat of an imperial citadel; in Madurai, the Vaigai hosts the divine reconciliation of Chithirai.",
              claims: ["sacred-hydrology-rationale"]
            }
          ],
          whyItMatters: [
            {
              text: "Understanding Indian civilization requires recognizing that urbanism, temple geometry, and living festivals were conceived as dialogues with river ecosystems rather than conquest over them.",
              claims: ["river-ecosystem-significance"]
            }
          ],
          doesNotEstablish: "This comparison does not establish that all three river traditions share a single continuous liturgical origin, but rather that hydrological veneration emerged as a pan-Indian urban planning principle.",
          uncertainty: "Comparative timelines between early Gangetic settlement dates and peninsular river basin occupations rely on ongoing archaeological stratification surveys.",
          relatedStories: ["varanasi-ghats-architecture-and-river", "hampi-tungabhadra-coracles", "madurai-chithirai-festival"]
        },
        claims: [
          {
            key: "sacred-hydrology-rationale",
            text: "Major Indian cultural centers were deliberately planned along rivers that served as symbolic and practical centers.",
            claimType: "relationship",
            epistemic: "interpretation",
            evidence: [
              {
                source: "gov-ignca-kashi-sacred-geography",
                relation: "supports",
                excerpt: "Sacred hydrology connects the ritual and spatial structure of pilgrimage cities across India.",
                locator: "Comparative Hydrology"
              }
            ]
          },
          {
            key: "river-ecosystem-significance",
            text: "River conservation and sacred geography were inextricably linked in traditional Indian town planning.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "gov-ignca-kashi-sacred-geography",
                relation: "supports",
                excerpt: "Rivers were worshipped as mother figures to inculcate deep ecological preservation through ritual taboos.",
                locator: "Sacred Ecology"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    kind: "connection",
    slug: "handloom-guilds-banaras-sanganer-sungudi",
    fixture: true,
    entities: [
      { id: "banarasi-silk-weaving", role: "from" },
      { id: "sanganer-block-craft", role: "to" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Living Looms: Silk Brocade, Hand-Block Wood and Sungudi Knot-Dye Guilds",
          summary: "Comparing the master guild structures, natural mordants, and oral transmission systems of Banaras, Sanganer, and Madurai.",
          relationshipType: "comparable_practice",
          from: { entity: "banarasi-silk-weaving", label: "Banarasi Kadhwa Brocade" },
          to: { entity: "sanganer-block-craft", label: "Sanganer Hand-Block Printing" },
          rationale: [
            {
              text: "All three traditions depend on close-knit artisanal communities (Julahas/Ansaris in Varanasi, Chhipas in Rajasthan, Saurashtrians in Madurai) who preserved complex chemical and tactile knowledge through family lineages.",
              claims: ["guild-lineages"]
            }
          ],
          whyItMatters: [
            {
              text: "India's surviving handloom diversity is unique globally; these artisanal guilds constitute a living repository of sustainable craft and community self-reliance.",
              claims: ["handloom-resilience"]
            }
          ],
          doesNotEstablish: "This comparative lineage does not claim historical migration between the three specific craft communities, but examines their parallel guild preservation models under royal and temple patronage.",
          uncertainty: "Pre-colonial guild regulations were preserved through oral lineage contracts and master-disciple oaths rather than state registry archives.",
          relatedStories: ["varanasi-silk-weaving-craft-and-living-tradition", "jaipur-sanganer-block-printing", "madurai-sungudi-cotton-weavers"]
        },
        claims: [
          {
            key: "guild-lineages",
            text: "Distinct artisanal communities passed down specialized textile knowledge through family workshops.",
            claimType: "relationship",
            epistemic: "documented",
            evidence: [
              {
                source: "gov-indian-culture-banaras-brocade",
                relation: "supports",
                excerpt: "Weaving techniques and motif drawing were transmitted orally across master-apprentice and father-son lines in guild workshops.",
                locator: "Guild Systems"
              }
            ]
          },
          {
            key: "handloom-resilience",
            text: "Geographical Indication protections help sustain artisanal handloom economies against factory imitation.",
            claimType: "interpretive",
            epistemic: "documented",
            evidence: [
              {
                source: "gov-textiles-banaras-gi",
                relation: "supports",
                excerpt: "GI registration protects the authentic handloom heritage and guarantees consumer traceability.",
                locator: "Legal Framework"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    kind: "connection",
    slug: "temple-acoustics-hampi-madurai",
    fixture: true,
    entities: [
      { id: "vittala-musical-pillars", role: "from" },
      { id: "meenakshi-temple", role: "to" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Resonant Granite: Acoustic Pillars of Vijayanagara and Sculpted Nayak Halls",
          summary: "How the Vijayanagara empire's metallurgical and stone acoustic mastery was inherited, refined, and magnified by the Nayak rulers in Madurai.",
          relationshipType: "shared_lineage",
          from: { entity: "vittala-musical-pillars", label: "Vijaya Vittala Musical Pillars (Hampi)" },
          to: { entity: "meenakshi-temple", label: "Thousand Pillar Hall (Madurai)" },
          rationale: [
            {
              text: "Following the fall of Hampi in 1565, master stone carvers took refuge in the Nayak kingdom of Madurai, where they recreated musical pillars in the Meenakshi Temple's Thousand Pillar Hall.",
              claims: ["artisan-migration-lineage"]
            }
          ],
          whyItMatters: [
            {
              text: "This connection proves that monumental temple architecture in South India was not static, but an evolving technological and acoustic tradition carried by migrating master guilds.",
              claims: ["living-architectural-lineage"]
            }
          ],
          doesNotEstablish: "This relationship does not prove that every acoustic pillar in Madurai was sculpted by the exact same artisans who worked at Vittala, but confirms the historical continuity of the architectural school.",
          uncertainty: "Exact mason marks linking individual carver guilds across Karnataka and Tamil Nadu remain subject to ongoing epigraphical survey.",
          relatedStories: ["hampi-vittala-musical-pillars", "madurai-meenakshi-temple-city"]
        },
        claims: [
          {
            key: "artisan-migration-lineage",
            text: "Nayak rulers welcomed Vijayanagara artisans who continued their stone acoustic traditions in Tamil Nadu.",
            claimType: "relationship",
            epistemic: "documented",
            evidence: [
              {
                source: "wp-madurai-nayak-dynasty",
                relation: "supports",
                excerpt: "The Nayaks of Madurai were patrons of artisans displaced after the battle of Talikota, incorporating Vijayanagara architectural idioms.",
                locator: "Architecture and Patronage"
              }
            ]
          },
          {
            key: "living-architectural-lineage",
            text: "The musical pillars at both sites represent a shared mathematical and geological mastery of stone resonance.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-meenakshi-temple",
                relation: "supports",
                excerpt: "The musical stone pillars in Madurai produce different musical notes when tapped, directly echoing the earlier Vittala temple style.",
                locator: "Thousand Pillar Hall"
              }
            ]
          }
        ]
      }
    ]
  },
  {
    kind: "connection",
    slug: "living-clay-kumartuli-to-ghats",
    fixture: true,
    entities: [
      { id: "kumartuli-clay-craft", role: "from" },
      { id: "varanasi-ghats", role: "to" }
    ],
    versions: [
      {
        language: "en",
        body: {
          title: "Sacred Earth and River Silt: Kumartuli Clay to Gangetic Immersion",
          summary: "Tracing the philosophical and ecological continuum of ephemeral clay ritual from Hooghly silt to Gangetic Visarjan.",
          relationshipType: "comparable_practice",
          from: { entity: "kumartuli-clay-craft", label: "Kumartuli Clay Idol Workshops" },
          to: { entity: "varanasi-ghats", label: "Ganges Riverfront Rituals" },
          rationale: [
            {
              text: "Both traditions celebrate transience: divinity is given tangible form in clay harvested from the sacred river, worshipped with seasonal ecstasy, and surrendered back into the flowing water without permanent monuments.",
              claims: ["ephemeral-theology"]
            }
          ],
          whyItMatters: [
            {
              text: "This philosophy of deliberate transience contrasts with Western monumental permanence, offering a profound indigenous ecological framework for art and worship.",
              claims: ["ecological-impermanence"]
            }
          ],
          doesNotEstablish: "This relationship does not suggest that idol sculpting in Bengal and cremation rituals in Varanasi follow identical liturgical manuals, but reveals a shared philosophical worldview concerning elemental return.",
          uncertainty: "Local theological interpretations of clay dissolution differ between regional Tantric and Puranic traditions.",
          relatedStories: ["kolkata-kumartuli-clay-sculptors", "varanasi-ghats-architecture-and-river"]
        },
        claims: [
          {
            key: "ephemeral-theology",
            text: "Indian river traditions emphasize that clay forms are temporary vessels for eternal spiritual principles.",
            claimType: "relationship",
            epistemic: "tradition",
            evidence: [
              {
                source: "wp-durga-puja-in-kolkata",
                relation: "supports",
                excerpt: "The immersion reinforces the philosophical notion that all forms return to their primordial elemental state.",
                locator: "Philosophy"
              }
            ]
          },
          {
            key: "ecological-impermanence",
            text: "Traditional clay sculpting was designed to leave no trace, dissolving harmlessly into the river ecosystem.",
            claimType: "interpretive",
            epistemic: "interpretation",
            evidence: [
              {
                source: "wp-kumartuli",
                relation: "supports",
                excerpt: "Unbaked clay and vegetable colors historically ensured natural ecological degradation in the river.",
                locator: "Materials and Ecology"
              }
            ]
          }
        ]
      }
    ]
  }
];

for (const conn of newConnections) {
  ItemFileSchema.parse(conn);
  const filePath = path.join(connectionsDir, `${conn.slug}.json`);
  writeFileSync(filePath, JSON.stringify(conn, null, 2) + "\n");
  console.log("Created connection:", conn.slug);
}

console.log("All stories and connections created and validated against ItemFileSchema!");
