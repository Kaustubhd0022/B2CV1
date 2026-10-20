import en, { type MessageKey } from "./messages/en";
import { CATALOGUES } from "./messages";
import type { LanguageCode } from "./languages";

export type { MessageKey };
export type Vars = Record<string, string | number>;
export type Translate = (key: MessageKey, vars?: Vars) => string;

function interpolate(s: string, vars?: Vars) {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

/**
 * Returns a translator for a language. Missing keys fall back to English, and that
 * fallback is surfaced to users through uiCoverage() — never silently.
 */
export function translator(lang: LanguageCode): Translate {
  const cat = CATALOGUES[lang] ?? {};
  return (key, vars) => interpolate(cat[key] ?? en[key] ?? key, vars);
}

const TOTAL = Object.keys(en).length;

/** Fraction (0..1) of interface keys available in a language. */
export function uiCoverage(lang: LanguageCode): number {
  if (lang === "en") return 1;
  const cat = CATALOGUES[lang] ?? {};
  const n = (Object.keys(en) as MessageKey[]).filter((k) => typeof cat[k] === "string" && cat[k]).length;
  return n / TOTAL;
}

/** Subset of a translated catalogue for client components (keys by prefix). */
export function clientMessages(lang: LanguageCode, prefixes: string[]): Record<string, string> {
  const t = translator(lang);
  const out: Record<string, string> = {};
  for (const k of Object.keys(en) as MessageKey[]) if (prefixes.some((p) => k.startsWith(p))) out[k] = t(k);
  return out;
}
