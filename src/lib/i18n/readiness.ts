import "server-only";
import { config } from "@/lib/config";
import { publishedStoryCountsByLanguage } from "@/lib/content/repo";
import { LANGUAGES, type LanguageCode } from "./languages";
import { uiCoverage } from "./t";

export type LanguageReadiness = {
  code: LanguageCode;
  native: string;
  english: string;
  /** Formal quality gate (release gate G1). False until the product owner records a pass. */
  gatePassed: boolean;
  uiCoverage: number;
  publishedStories: number;
};

export function gatePassed(code: string) {
  return config().ai.gatePassedLanguages.includes(code);
}

export async function languageReadiness(): Promise<LanguageReadiness[]> {
  const counts = await publishedStoryCountsByLanguage().catch(() => new Map<string, number>());
  return LANGUAGES.map((l) => ({
    code: l.code,
    native: l.native,
    english: l.english,
    gatePassed: gatePassed(l.code),
    uiCoverage: uiCoverage(l.code),
    publishedStories: counts.get(l.code) ?? 0,
  }));
}
