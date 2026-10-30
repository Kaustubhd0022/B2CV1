/**
 * TattvaCo Cinematic Motion Configuration
 * Centralized timings, bezier curves, springs, and flags.
 * Tune numbers here to adjust the entire sign-in entrance rhythm.
 */

export const EASING = {
  // Apple/Fluid standard: fast initial acceleration, silky smooth settling
  natural: [0.22, 1, 0.36, 1] as const,
  // Snappier curve for micro-interactions
  snappy: [0.16, 1, 0.3, 1] as const,
  // Dramatic deceleration for cinematic reveals
  dramatic: [0.19, 1, 0.22, 1] as const,
  // Gentle ease for continuous ambient motion
  ambient: [0.45, 0.05, 0.55, 0.95] as const,
};

export const MOTION_TIMINGS = {
  // Slower, graceful, ceremonial opening rhythm (in seconds)
  logoDrawStart: 0.0,
  logoDrawDuration: 1.6,
  splashHold: 1.0,
  splashDissolveDuration: 1.0,
  
  bgRevealStart: 2.0,     // Silky crossfade as splash dissolves
  bgRevealDuration: 1.8,  // Gentle 1.8s fade
  kenBurnsDuration: 18.0, // Leisurely slow drift
  
  brandTitleStart: 2.6,   // TATTVACO emblem and title reveal
  brandTitleDuration: 1.1,
  taglineStart: 3.2,      // "Culture lives in connections"
  taglineDuration: 1.0,
  
  headlineStart: 3.6,     // "Discover India" line 1
  headlineDuration: 1.2,
  headlineLine2Delay: 4.0,// "Differently" line 2
  headlineSubDelay: 4.5,  // Subtitle
  shimmerDelay: 4.8,      // Saffron shimmer sweep
  
  authCardStart: 4.2,     // Passport auth card ascends
  authCardDuration: 1.3,
  
  chipsStart: 5.2,        // 7 Dimensions staggered entrance
  chipsStagger: 0.12,
  
  citiesStart: 6.2,       // 6 Pilot City cards entrance
  citiesStagger: 0.14,
  citiesDuration: 1.1,

  // Returning visitor shortened sequence
  quickIntroDuration: 1.0,
  
  // Post-auth exit curtain transition
  exitCurtainDuration: 0.8,
};

export const SPRING_CONFIG = {
  chips: { type: "spring", stiffness: 180, damping: 22, mass: 1.0 } as const,
  cards: { type: "spring", stiffness: 160, damping: 24, mass: 1.0 } as const,
  cardHover: { type: "spring", stiffness: 350, damping: 28 } as const,
};

export const COLOR_TINTS = {
  varanasi: "rgba(198, 125, 40, 0.18)", // Saffron / Sacred Flame
  jaipur: "rgba(217, 93, 76, 0.18)",    // Terracotta / Pink City
  hampi: "rgba(224, 168, 76, 0.18)",     // Granite Gold
  kochi: "rgba(46, 125, 91, 0.18)",      // Malabar Palm & Spice
  kolkata: "rgba(186, 75, 98, 0.18)",    // Jamun / Crimson Terrace
  madurai: "rgba(168, 85, 247, 0.18)",   // Temple Gopuram Violet
};

const SESSION_STORAGE_KEY = "tc_cinema_intro_seen_v1";

/**
 * Returns true if this is the first visit in the current session.
 * Safe for SSR (returns false on server to avoid hydration mismatches).
 */
export function isFirstSessionVisit(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const search = window.location.search;
    if (search.includes("intro") || search.includes("replay")) {
      return true;
    }
    const hasSeen = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!hasSeen) {
      sessionStorage.setItem(SESSION_STORAGE_KEY, "true");
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Manually reset intro for testing/previewing
 */
export function resetIntroSession(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {}
}
