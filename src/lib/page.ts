import "server-only";
import { cache } from "react";
import { requireUserWithLanguage } from "@/lib/auth/session";
import { translator } from "@/lib/i18n/t";

/** Per-request page context: authenticated session, selected language and translator. */
export const pageContext = cache(async () => {
  const session = await requireUserWithLanguage();
  return { session, lang: session.language, t: translator(session.language) };
});

export function formatDate(d: Date | null | undefined, lang: string) {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat(lang === "en" ? "en-IN" : `${lang}-IN`, { dateStyle: "medium" }).format(d);
  } catch {
    return d.toISOString().slice(0, 10);
  }
}
