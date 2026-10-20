/**
 * The 11 confirmed launch languages (PRD FR-03). Being listed here does NOT mean a
 * language is production-ready: readiness is tracked separately (readiness.ts) and no
 * language has passed a formal quality gate until QUALITY_GATE_PASSED_LANGUAGES says so.
 */
export const LANGUAGES = [
  { code: "en", english: "English", native: "English", script: "Latin", wiki: "en" },
  { code: "hi", english: "Hindi", native: "हिन्दी", script: "Devanagari", wiki: "hi" },
  { code: "kn", english: "Kannada", native: "ಕನ್ನಡ", script: "Kannada", wiki: "kn" },
  { code: "ml", english: "Malayalam", native: "മലയാളം", script: "Malayalam", wiki: "ml" },
  { code: "bn", english: "Bengali", native: "বাংলা", script: "Bengali", wiki: "bn" },
  { code: "ta", english: "Tamil", native: "தமிழ்", script: "Tamil", wiki: "ta" },
  { code: "mr", english: "Marathi", native: "मराठी", script: "Devanagari", wiki: "mr" },
  { code: "te", english: "Telugu", native: "తెలుగు", script: "Telugu", wiki: "te" },
  { code: "gu", english: "Gujarati", native: "ગુજરાતી", script: "Gujarati", wiki: "gu" },
  { code: "pa", english: "Punjabi", native: "ਪੰਜਾਬੀ", script: "Gurmukhi", wiki: "pa" },
  { code: "or", english: "Odia", native: "ଓଡ଼ିଆ", script: "Oriya", wiki: "or" },
] as const;

export type LanguageCode = (typeof LANGUAGES)[number]["code"];
export type Script = (typeof LANGUAGES)[number]["script"];

export const LANGUAGE_CODES = LANGUAGES.map((l) => l.code) as LanguageCode[];

export function isLanguageCode(v: unknown): v is LanguageCode {
  return typeof v === "string" && (LANGUAGE_CODES as string[]).includes(v);
}

export function languageInfo(code: string) {
  return LANGUAGES.find((l) => l.code === code) ?? LANGUAGES[0];
}

/** Unicode block ranges used for script detection and language-quality checks. */
export const SCRIPT_RANGES: Record<Script, [number, number][]> = {
  Latin: [
    [0x41, 0x5a],
    [0x61, 0x7a],
    [0xc0, 0x24f],
  ],
  Devanagari: [[0x0900, 0x097f]],
  Bengali: [[0x0980, 0x09ff]],
  Gurmukhi: [[0x0a00, 0x0a7f]],
  Gujarati: [[0x0a80, 0x0aff]],
  Oriya: [[0x0b00, 0x0b7f]],
  Tamil: [[0x0b80, 0x0bff]],
  Telugu: [[0x0c00, 0x0c7f]],
  Kannada: [[0x0c80, 0x0cff]],
  Malayalam: [[0x0d00, 0x0d7f]],
};

function scriptOf(cp: number): Script | null {
  for (const [script, ranges] of Object.entries(SCRIPT_RANGES) as [Script, [number, number][]][]) {
    if (ranges.some(([a, b]) => cp >= a && cp <= b)) return script;
  }
  return null;
}

/** Counts letters per script, ignoring digits, punctuation and spaces. */
export function scriptProfile(text: string): Partial<Record<Script, number>> {
  const counts: Partial<Record<Script, number>> = {};
  for (const ch of text) {
    const s = scriptOf(ch.codePointAt(0)!);
    if (s) counts[s] = (counts[s] ?? 0) + 1;
  }
  return counts;
}

/** Share of script-bearing characters that belong to the expected script (0..1). */
export function scriptRatio(text: string, expected: Script): number {
  const p = scriptProfile(text);
  const total = Object.values(p).reduce((a, b) => a + (b ?? 0), 0);
  return total === 0 ? 0 : (p[expected] ?? 0) / total;
}

/**
 * Detects the dominant script of a question. Devanagari is shared by Hindi and Marathi,
 * so detection returns candidate languages, not a single certain answer.
 */
export function detectLanguages(text: string): LanguageCode[] {
  const p = scriptProfile(text);
  const top = (Object.entries(p) as [Script, number][]).sort((a, b) => b[1] - a[1])[0];
  if (!top) return [];
  return LANGUAGES.filter((l) => l.script === top[0]).map((l) => l.code);
}
