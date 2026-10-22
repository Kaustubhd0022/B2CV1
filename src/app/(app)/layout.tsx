import Link from "next/link";
import { pageContext } from "@/lib/page";
import { languageInfo } from "@/lib/i18n/languages";
import { gatePassed } from "@/lib/i18n/readiness";
import { uiCoverage } from "@/lib/i18n/t";
import { LanguageLink, MainNav } from "@/components/nav";
import { config } from "@/lib/config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { lang, t } = await pageContext();
  const info = languageInfo(lang);
  const coverage = uiCoverage(lang);
  const labels = { discover: t("nav.discover"), explore: t("nav.explore"), ask: t("nav.ask"), settings: t("nav.settings"), main: t("nav.main") };

  return (
    <div lang={lang} className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2">
        {t("nav.skip")}
      </a>
      <header className="sticky top-0 z-30 border-b border-border bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 sm:px-6 md:px-8">
          <Link href="/" className="flex min-h-10 items-center gap-2.5 font-serif text-section font-semibold text-charcoal tracking-tight hover:text-gold transition-colors">
            <span className="flex size-7 items-center justify-center rounded-full border border-gold/40 bg-surface text-gold text-xs font-serif font-bold shadow-xs">
              ✦
            </span>
            <span className="tracking-wide">TattvaCo</span>
            {config().demoMode && (
              <span title={t("common.demoBanner")} className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 font-sans text-[11px] font-semibold text-gold">
                {t("common.demoLabel")}
              </span>
            )}
          </Link>
          <MainNav labels={labels} variant="top" />
          <LanguageLink lang={lang} native={info.native} label={t("lang.change")} />
        </div>
        {lang !== "en" && (coverage < 1 || !gatePassed(lang)) && (
          <p role="note" className="border-t border-warning/30 bg-warning/5 px-4 py-2 text-center text-meta text-charcoal">
            {coverage < 1 ? t("lang.partialBanner", { language: info.native }) : t("lang.previewBanner", { language: info.native })}
          </p>
        )}
      </header>
      <main id="main" className="pb-20 md:pb-0">{children}</main>
      <MainNav labels={labels} variant="bottom" />
    </div>
  );
}
