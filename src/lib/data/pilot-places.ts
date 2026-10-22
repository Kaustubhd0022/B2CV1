export type PlaceType = "worship" | "craft" | "monument" | "public_space" | "natural";

export interface NearbyPlace {
  name: string;
  distance: string;
  type: string;
}

export interface PlaceDetail {
  id: string;
  citySlug: string;
  cityName: string;
  name: string;
  subtitle: string;
  type: PlaceType;
  typeLabel: string;
  period: string;
  deityOrSubject: string;
  significance: string;
  location: string;
  architectureStyle: string;
  description: string;
  about: string[];
  architectureNotes: string;
  ritualsAndCulture: string;
  coordinates: { lat: number; lng: number };
  mapPosition: { x: number; y: number }; // Percentage coordinates for responsive topographic canvas
  image: string;
  gallery: string[];
  nearby: NearbyPlace[];
  relatedStorySlug: string;
  relatedStoryTitle: string;
}

export const PILOT_PLACES: Record<string, PlaceDetail[]> = {
  varanasi: [
    {
      id: "kashi-vishwanath",
      citySlug: "varanasi",
      cityName: "Varanasi",
      name: "Kashi Vishwanath Temple",
      subtitle: "The Golden Temple of Shiva on the sacred banks of the Ganga",
      type: "worship",
      typeLabel: "Temple",
      period: "1780 CE (Rebuilt by Maharani Ahilyabai Holkar)",
      deityOrSubject: "Lord Shiva (Vishveshvara / Lord of the Universe)",
      significance: "One of the twelve sacred Jyotirlingas, focal point of Kashi's cosmic mandala",
      location: "Vishwanath Gali, Godowlia, Varanasi",
      architectureStyle: "Nagara spire with 800kg gold-plated shikhara donated by Maharaja Ranjit Singh (1839)",
      description: "Standing at the spiritual core of Varanasi, Kashi Vishwanath is one of the most revered sanctuaries in the Hindu world. The current structure was consecrated by Maharani Ahilyabai Holkar of Indore after historical destructions, and adorned with towering gold spires in 1839.",
      about: [
        "Kashi Vishwanath Temple stands at the absolute center of Kashi's sacred geography. Regarded as one of the twelve Jyotirlingas, ancient texts declare that a single darshan here liberates the soul from the endless cycle of rebirth.",
        "The current stone shrine was resurrected in 1780 by the visionary queen Ahilyabai Holkar of Indore. In 1839, Maharaja Ranjit Singh of the Sikh Empire donated one tonne of pure gold to plate the twin spires and dome.",
        "In recent years, the Kashi Vishwanath Corridor transformed the pilgrimage experience by opening a direct 50,000-square-meter pedestrian thoroughfare connecting the riverfront ghats directly to the sanctum sanctorum."
      ],
      architectureNotes: "The temple exemplifies classical Nagara temple architecture. Its main shikhara rises 15.5 meters above the inner sanctum (garbhagriha), covered in hammered gilded copper plates. The precinct features intricately carved stone pillars depicting Shaivite motifs and Sanskrit stotras.",
      ritualsAndCulture: "The temple observes five daily aartis starting with the Mangala Aarti at 3:00 AM, followed by Bhog, Sandhya, Shringar, and concluding with the meditative Shayana Aarti at 10:30 PM. Pilgrims carry freshly drawn Ganga water from Manikarnika Ghat to perform abhisheka.",
      coordinates: { lat: 25.3109, lng: 83.0107 },
      mapPosition: { x: 52, y: 44 },
      image: "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Annapurna Temple", distance: "120m", type: "Temple" },
        { name: "Manikarnika Ghat", distance: "250m", type: "Ghat" },
        { name: "Dashashwamedh Ghat", distance: "600m", type: "Ghat" },
        { name: "Nepali Temple (Kathwala)", distance: "450m", type: "Wood Temple" }
      ],
      relatedStorySlug: "varanasi-sacred-geography",
      relatedStoryTitle: "The Living Ganga: Sacred Geography and Spatial Memory of Kashi"
    },
    {
      id: "dashashwamedh-ghat",
      citySlug: "varanasi",
      cityName: "Varanasi",
      name: "Dashashwamedh Ghat",
      subtitle: "The ceremonial riverfront heart of Varanasi and site of the grand Ganga Aarti",
      type: "public_space",
      typeLabel: "Ghat",
      period: "Reconstructed 1748 CE by Peshwa Balaji Baji Rao",
      deityOrSubject: "Ganga Mata & Lord Brahma",
      significance: "Mythological site of Brahma's Ten-Horse sacrifice; Varanasi's busiest sacred riverfront",
      location: "Godowlia Crossing to Riverfront, Varanasi",
      architectureStyle: "Multi-tiered sandstone ghat steps, pavilions, and Maratha river bastions",
      description: "Dashashwamedh is the most vibrant and historically celebrated of Varanasi's 84 ghats. Each evening at twilight, young Brahmin priests perform the synchronized Maha Aarti with brass multi-tiered lamps against the sacred Ganga.",
      about: [
        "According to the Kashi Khanda of the Skanda Purana, Lord Brahma sacrificed ten horses (dasa-ashwamedha) here in a great Vedic yajna to welcome Lord Shiva back to the holy city.",
        "The monumental stone steps were reconstructed in 1748 by the Maratha Peshwa Balaji Baji Rao and later expanded by Ahilyabai Holkar. It serves as the primary civic and ritual gateway for pilgrims descending from the bustling Godowlia bazaar.",
        "Every evening, thousands of pilgrims and travelers gather on boats and riverbank tiers to witness the choreographed Sandhya Aarti, filling the night air with conch shells, incense, and floating earthen oil lamps (diyas)."
      ],
      architectureNotes: "Constructed with massive Chunar sandstone blocks resistant to monsoon flooding. The ghat incorporates cantilevered stone retaining walls, stone chhatris (canopied pavilions), and stepped platforms engineered to accommodate river level fluctuations of over 10 meters.",
      ritualsAndCulture: "Twilight Maha Aarti held every sunset without interruption for decades. Dawn snana (sacred bathing) and Surya Arghya (solar water offerings) begin before sunrise.",
      coordinates: { lat: 25.3075, lng: 83.0104 },
      mapPosition: { x: 50, y: 55 },
      image: "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1598977123418-454555aa1641?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Dr. Rajendra Prasad Ghat", distance: "100m", type: "Ghat" },
        { name: "Man Mandir Observatory", distance: "300m", type: "Monument" },
        { name: "Kashi Vishwanath Corridor", distance: "600m", type: "Temple" }
      ],
      relatedStorySlug: "varanasi-sacred-geography",
      relatedStoryTitle: "The Living Ganga: Sacred Geography and Spatial Memory of Kashi"
    },
    {
      id: "manikarnika-ghat",
      citySlug: "varanasi",
      cityName: "Varanasi",
      name: "Manikarnika Ghat",
      subtitle: "The Mahashmashana — the Great Cremation Ground of eternal liberation",
      type: "public_space",
      typeLabel: "Ghat",
      period: "Ancient (Mentioned in 5th c. Gupta inscriptions)",
      deityOrSubject: "Lord Shiva & Goddess Parvati",
      significance: "Supreme site of liberation (moksha); eternal pyres burning unceasingly for millennia",
      location: "Between Scindia and Dashashwamedh Ghats",
      architectureStyle: "Tiered cremation platforms, ancient stone kund (well), and leaning Shiva temple",
      description: "Manikarnika Ghat is the sacred threshold between mortality and transcendence. According to ancient lore, Lord Shiva whispers the liberating Taraka Mantra into the ears of all who are cremated here.",
      about: [
        "Manikarnika Kund is believed to be older than the Ganga itself, excavated by Lord Vishnu with his chakra at the dawn of creation. As Lord Shiva danced in bliss, Parvati's jeweled earring (Manikarnika) fell into the well.",
        "The sacred pyres have burned continuously through empires and epochs. In Hindu eschatology, to die in Kashi and be consigned to the holy river at Manikarnika frees the jiva (soul) permanently from samsara.",
        "The site is overseen by the Dom Raja lineage, who have maintained custody of the sacred flame for countless generations."
      ],
      architectureNotes: "Built into steep cliffs above the river with tiered stone terraces. Adjacent sits the Ratneshwar Mahadev Temple, famous for its dramatic 9-degree lean into the river silt, out-leaning the Tower of Pisa.",
      ritualsAndCulture: "Continuous 24-hour antyesti (funeral) rites conducted with sandalwood and river clay. Devotees take bath in the adjacent Manikarnika Kund during solar eclipses.",
      coordinates: { lat: 25.3108, lng: 83.0142 },
      mapPosition: { x: 55, y: 38 },
      image: "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Scindia Ghat", distance: "200m", type: "Ghat" },
        { name: "Ratneshwar Leaning Temple", distance: "50m", type: "Temple" },
        { name: "Kashi Vishwanath Corridor", distance: "250m", type: "Temple" }
      ],
      relatedStorySlug: "varanasi-sacred-geography",
      relatedStoryTitle: "The Living Ganga: Sacred Geography and Spatial Memory of Kashi"
    },
    {
      id: "assi-ghat",
      citySlug: "varanasi",
      cityName: "Varanasi",
      name: "Assi Ghat",
      subtitle: "The southern confluence of dawn ragas, yogic meditation, and literary heritage",
      type: "public_space",
      typeLabel: "Ghat",
      period: "Ancient confluence described in Matsya and Kurma Puranas",
      deityOrSubject: "Shiva Asisangameshvara",
      significance: "Southern boundary of sacred Kashi; home of Subah-e-Banaras and Tulsidas's literary hermitage",
      location: "Southern end of the Varanasi riverfront crescent",
      architectureStyle: "Broad clay and stone amphitheatrical riverbank with historic banyan trees",
      description: "Assi Ghat marks the southern boundary of the traditional sacred zone where the Assi stream joins the Ganga. It is world-renowned for Subah-e-Banaras — the morning confluence of Vedic hymns, classical ragas, and sunrise yoga.",
      about: [
        "Legend holds that Goddess Durga dropped her sword (asi) here after slaying the demons Shumbha and Nishumbha, carving out the river boundary.",
        "It was at adjacent Tulsi Ghat that Goswami Tulsidas composed the Awadhi epic Ramcharitmanas in the late 16th century, democratizing sacred literature across northern India.",
        "Today Assi serves as Varanasi's premier cultural and intellectual meeting ground, welcoming musicians, scholars, sadhus, and travelers for philosophical discourse."
      ],
      architectureNotes: "Unlike the steep stone ramparts of the northern ghats, Assi features wide, gently sloping stone platforms stepping down into natural silt banks, flanked by stone lingas beneath ancient peepal and banyan trees.",
      ritualsAndCulture: "Subah-e-Banaras takes place daily from 5:00 AM to 7:00 AM, beginning with sunrise Yajna, Vedic student chanting, classical shehnai or sitar recitals, and public hatha yoga.",
      coordinates: { lat: 25.2899, lng: 83.0064 },
      mapPosition: { x: 42, y: 78 },
      image: "https://images.unsplash.com/photo-1598977123418-454555aa1641?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1598977123418-454555aa1641?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Tulsi Ghat", distance: "250m", type: "Ghat" },
        { name: "Lolark Kund", distance: "400m", type: "Sacred Well" },
        { name: "Sankat Mochan Temple", distance: "1.2km", type: "Temple" }
      ],
      relatedStorySlug: "varanasi-music-gharana",
      relatedStoryTitle: "Acoustic Mandala: The Banaras Gharana and Riverfront Soundscapes"
    },
    {
      id: "madanpura-peeli-kothi",
      citySlug: "varanasi",
      cityName: "Varanasi",
      name: "Madanpura & Peeli Kothi Weaving Quarters",
      subtitle: "The historic mohallas of the Ansari master weavers of Banarasi silk",
      type: "craft",
      typeLabel: "Craft Quarter",
      period: "Mughal Empire guilds formalized under Akbar (16th c.)",
      deityOrSubject: "Living Craft & Handloom Brocade Tradition",
      significance: "Global epicenter of the Kadhwa handloom technique and pure silver zari brocade",
      location: "Madanpura, Chowk & Peeli Kothi, Varanasi",
      architectureStyle: "Dense labyrinthine multi-story brick havelis with rooftop loom lofts and inner courtyards",
      description: "Behind the riverfront lies Madanpura, a vibrant urban tapestry of handloom pit-looms where Muslim master weavers (Ansaris) have hand-woven royal Banarasi brocades for generations in deep syncretic harmony with Hindu patronage.",
      about: [
        "The Banarasi silk weaving tradition reached its zenith during the Mughal era when Persian floral designs (paisley, shikargah, butidar) merged with Hindu iconographic motifs like the kalga, bel, and lotus.",
        "The hallmark technique is 'Kadhwa' (interlocking twill), where each motif is engraved on the warp individually by hand using tiny spools, ensuring no loose threads on the reverse side. A single master sari can take 3 to 6 months of daily rhythmic hand labor.",
        "The craft embodies the Ganga-Jamuni Tehzeeb (syncretic composite culture), where predominantly Muslim artisans weave sacred wedding silks for Hindu brides and temple idols across India."
      ],
      architectureNotes: "Vernacular urban architecture characterized by high-density brick townhouses with open lightwells (aangan) designed to funnel diffused daylight onto loom shuttles.",
      ritualsAndCulture: "Weavers recite Sufi verses and Kabir couplets as mnemonic guides to complex pattern sequences. The annual Dev Deepavali and Eid celebrations see entire mohallas opening courtyards to visitors.",
      coordinates: { lat: 25.321, lng: 82.998 },
      mapPosition: { x: 35, y: 32 },
      image: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Chowk Bazaar", distance: "450m", type: "Market" },
        { name: "Gyanvapi Precinct", distance: "700m", type: "Heritage" },
        { name: "Kashi Vishwanath Corridor", distance: "900m", type: "Temple" }
      ],
      relatedStorySlug: "varanasi-silk-weavers",
      relatedStoryTitle: "Woven Light: The Ansari Master Craftsmen and Banarasi Brocade"
    },
    {
      id: "sarnath",
      citySlug: "varanasi",
      cityName: "Varanasi",
      name: "Sarnath Deer Park & Dhamek Stupa",
      subtitle: "The cradle of the Buddhist Sangha and Ashoka's monumental Lion Capital",
      type: "monument",
      typeLabel: "Monument",
      period: "3rd c. BCE (Ashoka) to 5th c. CE (Gupta Stupa)",
      deityOrSubject: "Gautama Buddha & Dhammacakkappavattana Sutta",
      significance: "Site of the Buddha's First Sermon; birthplace of India's national emblem",
      location: "Sarnath, 10 km northeast of Varanasi Cantonment",
      architectureStyle: "Gupta brick and stone cylindrical stupa with geometric relief friezes",
      description: "At Isipatana (modern Sarnath), Siddhartha Gautama proclaimed the Four Noble Truths and Eightfold Path to his first five disciples. The immense Dhamek Stupa anchors a quiet landscape of excavated monastic viharas.",
      about: [
        "Following his enlightenment under the Bodhi tree at Bodh Gaya, the Buddha walked to Sarnath to deliver his seminal discourse, setting in motion the Wheel of Dharma (Dharmachakra).",
        "Emperor Ashoka erected the famous polished sandstone pillar topped with four back-to-back Asiatic lions, the Dharma wheel, and the bull, horse, lion, and elephant, adopted in 1950 as the official State Emblem of India.",
        "The towering Dhamek Stupa was constructed in 500 CE during the Gupta Empire, enveloped in carved sandstone bands of swastikas, lotuses, and celestial gandharvas."
      ],
      architectureNotes: "The Dhamek Stupa stands 43.6 meters high and 28 meters in diameter. Its lower half is encased in finely chiselled stone panels exhibiting the zenith of Gupta classical decorative relief sculpture.",
      ritualsAndCulture: "Buddhist pilgrims from Thailand, Japan, Tibet, and Sri Lanka circumambulate the stupa chanting the Pali canon, lighting butter lamps, and placing gold leaf upon ancient foundation stones.",
      coordinates: { lat: 25.3811, lng: 83.0214 },
      mapPosition: { x: 75, y: 15 },
      image: "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1599839575945-a9e5af0c3fa5?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Sarnath Archaeological Museum", distance: "150m", type: "Museum" },
        { name: "Chaukhandi Stupa", distance: "900m", type: "Monument" },
        { name: "Mulagandha Kuti Vihara", distance: "300m", type: "Monastery" }
      ],
      relatedStorySlug: "varanasi-sacred-geography",
      relatedStoryTitle: "The Living Ganga: Sacred Geography and Spatial Memory of Kashi"
    }
  ],
  jaipur: [
    {
      id: "jantar-mantar-jaipur",
      citySlug: "jaipur",
      cityName: "Jaipur",
      name: "Jantar Mantar Astronomical Observatory",
      subtitle: "The world's largest stone sundial and zenith of Rajput astronomical science",
      type: "monument",
      typeLabel: "Monument",
      period: "Completed 1734 CE by Maharaja Sawai Jai Singh II",
      deityOrSubject: "Astronomical Cosmos & Jyotisha Science",
      significance: "UNESCO World Heritage site with nineteen monumental stone masonry instruments",
      location: "Gangori Bazaar, J.D.A. Market, Pink City, Jaipur",
      architectureStyle: "Precision monumental stone masonry and marble gradations",
      description: "Commissioned by the polymath king Sawai Jai Singh II, Jantar Mantar features the Vrihat Samrat Yantra, the world's largest stone sundial capable of measuring local solar time to an accuracy of two seconds.",
      about: [
        "Jai Singh II sought to reconcile contradictory astronomical tables from Ptolemaic, Islamic (Zij-i-Sultani), and Hindu Siddhanta traditions, choosing permanent stone over brass astrolabes to eliminate mechanical distortion.",
        "The 19 open-air instruments calculate celestial coordinates, track planetary eclipses, and align with equatorial and ecliptic coordinate systems.",
        "The site represents one of humanity's most breathtaking syntheses of geometry, architecture, and astrophysical observation before the invention of the optical telescope."
      ],
      architectureNotes: "Constructed with local sandstone and marble extracted from Makrana. The colossal Samrat Yantra gnomon rises 27 meters at an inclination exactly equal to Jaipur's latitude (26°55' N).",
      ritualsAndCulture: "Astronomers and astrologers still assemble on Guru Purnima and solstices to cast planetary charts and observe solar zenith transitions.",
      coordinates: { lat: 26.9248, lng: 75.8246 },
      mapPosition: { x: 50, y: 50 },
      image: "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1603204077651-70bf8122c4f1?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "City Palace", distance: "100m", type: "Palace" },
        { name: "Hawa Mahal", distance: "400m", type: "Monument" },
        { name: "Sireh Deori Bazaar", distance: "350m", type: "Craft Bazaar" }
      ],
      relatedStorySlug: "jaipur-astronomy-jantar-mantar",
      relatedStoryTitle: "Stone Instruments of the Cosmos: Sawai Jai Singh II and Jantar Mantar"
    },
    {
      id: "hawa-mahal",
      citySlug: "jaipur",
      cityName: "Jaipur",
      name: "Hawa Mahal (Palace of Winds)",
      subtitle: "The five-story crown of 953 filigreed jharokhas",
      type: "monument",
      typeLabel: "Monument",
      period: "1799 CE by Maharaja Sawai Pratap Singh",
      deityOrSubject: "Lord Krishna's Crown & Venturi Cooling Architecture",
      significance: "Architectural masterpiece designed for royal women to witness street life unseen",
      location: "Hawa Mahal Rd, Badi Choupad, Pink City, Jaipur",
      architectureStyle: "Rajput-Mughal synthesis in red and pink sandstone with 953 jharokhas",
      description: "Designed by Lal Chand Ustad in the form of Lord Krishna's crown, Hawa Mahal's facade is perforated with 953 micro-latticed stone windows engineered to induce natural cooling through the Venturi effect.",
      about: [
        "Built under the patronage of Maharaja Sawai Pratap Singh, a fervent Krishna devotee, the palace resembles the peacock-feathered mukut (crown) of the deity.",
        "Strict purdah customs barred royal ladies from appearing in public streets; the miniature honeycomb windows enabled them to observe royal processions and daily street commerce without being detected.",
        "Its architectural ingenuity utilizes the Venturi airflow effect: breezes channeled through tight stone apertures cool naturally, making interior chambers comfortable during sweltering desert summers."
      ],
      architectureNotes: "Standing five stories high but measuring only a few feet in depth on its upper tiers, it has no conventional foundation, stabilized by delicate curvature and interlocking masonry.",
      ritualsAndCulture: "Every Gangaur and Teej festival, the royal chariot procession passes right below the facade, greeted by flower showers.",
      coordinates: { lat: 26.9239, lng: 75.8267 },
      mapPosition: { x: 55, y: 48 },
      image: "https://images.unsplash.com/photo-1603204077651-70bf8122c4f1?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1603204077651-70bf8122c4f1?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Jantar Mantar", distance: "400m", type: "Monument" },
        { name: "City Palace", distance: "350m", type: "Palace" },
        { name: "Johari Bazaar", distance: "300m", type: "Jewelry Market" }
      ],
      relatedStorySlug: "jaipur-urban-grid",
      relatedStoryTitle: "The Vastu Grid: Vidyadhar Bhattacharya and the Cosmic City of Jaipur"
    }
  ],
  hampi: [
    {
      id: "virupaksha-temple-hampi",
      citySlug: "hampi",
      cityName: "Hampi",
      name: "Virupaksha Temple",
      subtitle: "The unbroken 1,300-year sanctuary of Shiva on the Tungabhadra",
      type: "worship",
      typeLabel: "Temple",
      period: "7th c. CE foundation; expanded 1510 CE by Krishnadevaraya",
      deityOrSubject: "Lord Shiva (Virupaksha / Pampa-Pati)",
      significance: "Only major temple in Hampi with active, uninterrupted worship since before Vijayanagara",
      location: "Hampi Bazaar, Bellary District, Karnataka",
      architectureStyle: "Dravidian gopuram rising 50 meters, stepped pillared sabhamandapa",
      description: "Virupaksha Temple anchors the sacred realm of Vijayanagara. Dedicated to Lord Shiva as Pampa's consort, its eastern 50-meter tiered gopuram commands the boulder-strewn Tungabhadra valley.",
      about: [
        "Worship here predates the 1336 CE founding of the Vijayanagara Empire, originating in local goddess cults centered on Pampa (Tungabhadra River).",
        "Emperor Krishnadevaraya renovated the inner hall and commissioned the 50-meter eastern gopuram in 1510 CE to commemorate his coronation.",
        "Remarkably, when Vijayanagara fell in 1565 CE, Virupaksha survived demolition and has maintained daily pujas and annual car festivals without cessation."
      ],
      architectureNotes: "Features a famous pinhole camera phenomenon inside an inner hall where light passing through a narrow masonry slit projects an inverted shadow of the towering eastern gopuram onto the chamber wall.",
      ritualsAndCulture: "The annual Virupaksha Chariot Festival (Rathotsavam) draws tens of thousands in April to pull colossal wooden temple cars along the ancient stone bazaar street.",
      coordinates: { lat: 15.3351, lng: 76.46 },
      mapPosition: { x: 45, y: 48 },
      image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1600100397608-f010f443b7d1?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Hemakuta Hill Temples", distance: "200m", type: "Temple Complex" },
        { name: "Hampi Stone Bazaar", distance: "100m", type: "Historic Market" },
        { name: "Kadalekalu Ganesha", distance: "450m", type: "Monolith" }
      ],
      relatedStorySlug: "hampi-hydraulic-landscape",
      relatedStoryTitle: "Water, Granite, Empire: The Hydraulic Landscape of Vijayanagara"
    }
  ],
  kochi: [
    {
      id: "mattancherry-synagogue",
      citySlug: "kochi",
      cityName: "Kochi",
      name: "Paradesi Synagogue (Mattancherry)",
      subtitle: "The 1568 sanctuary of Malabar's Jewish heritage and hand-painted blue tiles",
      type: "worship",
      typeLabel: "Synagogue",
      period: "1568 CE by Spanish-speaking Sephardic Jews (Paradesi)",
      deityOrSubject: "Jewish Heritage & Torah Scrolls",
      significance: "Oldest active synagogue in the Commonwealth; floor paved with 1,100 Canton porcelain tiles",
      location: "Synagogue Lane, Jew Town, Mattancherry, Kochi",
      architectureStyle: "Dutch-Malabar fusion with Belgian glass chandeliers and 18th c. clock tower",
      description: "Tucked inside Jew Town in Mattancherry, this 1568 sanctuary preserves gold crowns, 4th-century copper plates granted by the Chera king Bhaskara Ravi Varma, and hundreds of hand-painted blue willow porcelain tiles.",
      about: [
        "Constructed beside the Mattancherry Palace with land gifted by the Hindu Raja of Cochin, Rama Varma, reflecting Malabar's deep tradition of religious sanctuary.",
        "In 1762, Ezekiel Rahabi paved the floor with 1,100 hand-painted blue willow porcelain tiles imported from Canton, China, each with a uniquely painted floral vignette.",
        "The synagogue holds ancient silver-encased Torah scrolls and the famed Jewish Copper Plates recording royal tax exemptions and hereditary privileges."
      ],
      architectureNotes: "Characterized by white limewashed exterior walls, carved teakwood ark, brass bima (central pulpit), and a four-faced clock tower erected in 1760 displaying Hebrew, Roman, Malayalam, and Arabic numerals.",
      ritualsAndCulture: "Though the Cochin Paradesi Jewish community has dwindled to single digits due to aliyah, the synagogue remains open for prayers on Shabbat and Rosh Hashanah.",
      coordinates: { lat: 9.9575, lng: 76.2595 },
      mapPosition: { x: 50, y: 52 },
      image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Mattancherry Palace (Dutch Palace)", distance: "150m", type: "Palace Museum" },
        { name: "Jew Town Antiques Street", distance: "50m", type: "Historic Bazaar" },
        { name: "Fort Kochi Beach", distance: "3.5km", type: "Coastal Heritage" }
      ],
      relatedStorySlug: "kochi-spice-maritime",
      relatedStoryTitle: "Monsoon Trade Winds: Muziris to Mattancherry and the Spice Network"
    }
  ],
  kolkata: [
    {
      id: "kumartuli-colony",
      citySlug: "kolkata",
      cityName: "Kolkata",
      name: "Kumartuli Clay Idol-Makers Colony",
      subtitle: "The historic northern quarter where sacred clay awakens into living deities",
      type: "craft",
      typeLabel: "Craft Quarter",
      period: "Settled mid-18th century along the Hooghly riverbank",
      deityOrSubject: "Maa Durga & Straw-Bamboo-Clay Murti Sculpting",
      significance: "Global center of clay idol craftsmanship for Durga Puja (UNESCO Representative List)",
      location: "Kumartuli, Sovabazar, North Kolkata",
      architectureStyle: "Narrow alleyways lined with bamboo-frame workshops and clay drying lofts",
      description: "Nestled along the Hooghly in North Kolkata, Kumartuli is home to hundreds of artisan families (palas) who have sculpted divine clay effigies for Bengal's Durga Puja festivals for over two centuries.",
      about: [
        "Potters from Krishnanagar and Nadia originally settled here in the mid-1700s, utilizing the fertile Ganga clay (Ganga maati) deposited along the riverbank.",
        "The idol creation begins with the kathamo (sacred bamboo and wood skeleton), wrapped in dry straw (khor), and coated in layers of river clay mixed with organic husk.",
        "The culmination occurs on Mahalaya during 'Chokkhudaan' — the sacred ritual where the senior master artisan paints the eyes of the goddess in divine invocation."
      ],
      architectureNotes: "Ephemeral work studios built of bamboo poles, tarpaulin, and tile roofs opening into sunlit alleys where rows of clay limbs and serene divine faces dry before painted gilding.",
      ritualsAndCulture: "Clay for the idol must incorporate soil collected from the threshold of sex workers' quarters (Nishiddho Polli), symbolizing universal dignity and the inclusion of all humanity in the sacred mother.",
      coordinates: { lat: 22.6006, lng: 88.3614 },
      mapPosition: { x: 52, y: 46 },
      image: "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1558431382-27e303142255?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Sovabazar Rajbari", distance: "600m", type: "Palace" },
        { name: "Bagbazar Ghat", distance: "400m", type: "Riverfront" },
        { name: "College Street Boi Para", distance: "2.8km", type: "Literary Hub" }
      ],
      relatedStorySlug: "kolkata-durga-puja-clay",
      relatedStoryTitle: "From River Clay to Living Goddess: The Kumartuli Sculptors of Bengal"
    }
  ],
  madurai: [
    {
      id: "meenakshi-amman-temple",
      citySlug: "madurai",
      cityName: "Madurai",
      name: "Meenakshi Sundareswarar Temple",
      subtitle: "The epicenter of Tamil temple architecture with fourteen towering gopurams",
      type: "worship",
      typeLabel: "Temple",
      period: "Ancient Sangam roots; rebuilt 16th–17th c. by Nayak Dynasty",
      deityOrSubject: "Goddess Meenakshi (Parvati) & Sundareswarar (Shiva)",
      significance: "Heart of Madurai's concentric lotus city plan; jewel of late Dravidian architecture",
      location: "Madurai Main, Tamil Nadu",
      architectureStyle: "Dravidian architecture featuring 14 gopurams and Hall of 1,000 Pillars",
      description: "Rising at the geometric center of Madurai, this colossal temple city is dedicated to the fish-eyed warrior goddess Meenakshi. Its 14 multicolored gopurams house over 33,000 sculpted divine figures.",
      about: [
        "Ancient Tamil Sangam texts describe Madurai laid out like a blooming lotus, with the Meenakshi Temple as its divine pericarp and the concentric street rings (Aadi, Chithirai, Avani) as the outer petals.",
        "The current architectural grandeur owes to the Nayak kings, notably Thirumalai Nayak (1623–1659 CE), who commissioned the Hall of a Thousand Pillars (Aayiram Kaal Mandapam) carved with extraordinary dynamism.",
        "Unlike most Hindu temples where the male deity dominates, here Goddess Meenakshi takes primacy: pilgrims worship her first before visiting Lord Sundareswarar."
      ],
      architectureNotes: "The temple precinct covers 14 acres enclosed by high stone ramparts. The South Gopuram is the tallest at 51.9 meters, crowded with sculpted puranic narratives carved from stucco and painted in jewel pigments.",
      ritualsAndCulture: "Every night at 9:30 PM, the procession of Lord Sundareswarar's silver palanquin conveys him to Meenakshi's bedchamber accompanied by nadaswaram music and burning camphor.",
      coordinates: { lat: 9.9195, lng: 78.1193 },
      mapPosition: { x: 50, y: 50 },
      image: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=600&q=80",
        "https://images.unsplash.com/photo-1571536802807-30451e3955d8?auto=format&fit=crop&w=600&q=80"
      ],
      nearby: [
        { name: "Pudhu Mandapam", distance: "80m", type: "Craft Bazaar" },
        { name: "Thirumalai Nayakkar Mahal", distance: "1.2km", type: "Palace" },
        { name: "Vandiyur Mariamman Teppakulam", distance: "4km", type: "Temple Tank" }
      ],
      relatedStorySlug: "madurai-sangam-temple-city",
      relatedStoryTitle: "City of the Lotus: Sacred Urbanism, Nayak Architecture, and Tamil Poetry"
    }
  ]
};

export function getPilotPlaces(citySlug: string): PlaceDetail[] {
  return PILOT_PLACES[citySlug] ?? PILOT_PLACES.varanasi;
}

export function getPilotPlaceById(id: string): PlaceDetail | undefined {
  for (const city of Object.values(PILOT_PLACES)) {
    const found = city.find((p) => p.id === id);
    if (found) return found;
  }
  return undefined;
}
