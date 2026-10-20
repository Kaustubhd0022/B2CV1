import type { Metadata } from "next";
import { requireUser } from "@/lib/auth/session";
import { safeNext } from "@/lib/auth/normalize";
import { languageReadiness } from "@/lib/i18n/readiness";
import { translator } from "@/lib/i18n/t";
import { SubmitButton } from "@/components/submit-button";
import { Notice } from "@/components/ui";

export const metadata: Metadata = { title: "Language" };

export default async function LanguagePage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const sp = await searchParams;
  const s = await requireUser();
  const current = s.language ?? "en";
  const t = translator(current);
  const langs = await languageReadiness();
  const next = safeNext(sp.next);

  return (
    <main className="mx-auto w-full max-w-xl px-4 py-8 sm:px-5">
      <p className="mb-6 text-section font-semibold text-charcoal">TattvaCo</p>
      <h1 className="font-serif text-page font-semibold">{t("lang.title")}</h1>
      <p className="mt-1 text-support text-muted">{t("lang.subtitle")}</p>
      {sp.error && (
        <Notice tone="error" role="alert" className="mt-4">
          {t("common.error")}
        </Notice>
      )}

      {/* A plain POST (not a server action) so the whole document reloads with the new <html lang>. */}
      <form action="/language/select" method="post" className="mt-6">
        <input type="hidden" name="next" value={next} />
        <fieldset>
          <legend className="sr-only">{t("lang.title")}</legend>
          <ul className="grid gap-2 sm:grid-cols-2">
            {langs.map((l) => (
              <li key={l.code}>
                <label className="flex min-h-14 cursor-pointer items-start gap-3 rounded-md border border-border bg-surface p-3 has-[:checked]:border-forest has-[:checked]:ring-2 has-[:checked]:ring-forest/30">
                  <input type="radio" name="language" value={l.code} defaultChecked={l.code === current} className="mt-1.5 size-4 accent-forest" required />
                  <span className="min-w-0">
                    <span lang={l.code} className="block text-card font-semibold">
                      {l.native}
                    </span>
                    <span className="block text-meta text-muted">
                      {l.english}
                      {" · "}
                      {l.gatePassed ? t("lang.statusValidated") : t("lang.statusPreview")}
                    </span>
                    <span className="block text-meta text-muted">
                      {t("lang.uiCoverage", { percent: Math.round(l.uiCoverage * 100) })}
                      {" · "}
                      {t("lang.storiesAvailable", { count: l.publishedStories })}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <SubmitButton className="mt-6 w-full sm:w-auto">{t("lang.continue")}</SubmitButton>
      </form>
      <p className="mt-6 text-meta text-muted">{t("lang.note")}</p>
      <p className="mt-1 text-meta text-muted">{t("lang.sessionOnly")}</p>
    </main>
  );
}
