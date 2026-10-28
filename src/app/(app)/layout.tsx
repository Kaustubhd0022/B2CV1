import Link from "next/link";
import { pageContext } from "@/lib/page";
import { languageInfo } from "@/lib/i18n/languages";
import { gatePassed } from "@/lib/i18n/readiness";
import { uiCoverage } from "@/lib/i18n/t";
import { LanguageLink, MainNav } from "@/components/nav";
import { UserProfileMenu } from "@/components/user-profile-menu";
import { config } from "@/lib/config";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { session, lang, t } = await pageContext();
  const info = languageInfo(lang);
  const coverage = uiCoverage(lang);
  const labels = {
    discover: t("nav.discover"),
    explore: t("nav.explore"),
    atlas: t("nav.atlas"),
    ask: t("nav.ask"),
    comingSoon: t("nav.comingSoon"),
    settings: t("nav.settings"),
    main: t("nav.main"),
  };

  return (
    <div lang={lang} className="min-h-dvh">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-md focus:bg-[#1c1915] focus:text-gold focus:border focus:border-gold focus:ring-2 focus:ring-gold focus:px-4 focus:py-2.5 focus:shadow-lg focus:font-semibold">
        {t("nav.skip")}
      </a>
      {/* 21st.dev Floating Glass Pill Nav */}
      <header className="sticky top-3 sm:top-4 z-40 mx-auto max-w-6xl px-3 sm:px-6">
        <div className="flex items-center justify-between gap-3 sm:gap-4 rounded-full border border-white/80 bg-white/85 px-4 py-2 sm:px-5 sm:py-2.5 shadow-md backdrop-blur-xl transition-all duration-300">
          <Link
            href="/"
            className="flex min-h-10 items-center gap-2.5 font-serif text-section font-semibold text-[#20101B] tracking-tight hover:text-amber-800 transition-colors"
          >
            <span className="flex size-7 items-center justify-center rounded-full border border-[#24131E]/15 bg-white text-amber-700 text-xs font-serif font-bold shadow-2xs">
              ✦
            </span>
            <span className="tracking-wide text-lg sm:text-xl font-bold">TattvaCo</span>
            {config().demoMode && (
              <span
                title={t("common.demoBanner")}
                className="hidden sm:inline-flex rounded-full border border-[#24131E]/12 bg-[#24131E]/5 px-2 py-0.5 font-sans text-[11px] font-semibold text-[#24131E]"
              >
                {t("common.demoLabel")}
              </span>
            )}
          </Link>
          <MainNav labels={labels} variant="top" />
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/explore"
              className="hidden lg:flex items-center gap-1.5 rounded-lg border border-[#24131E]/12 bg-white/80 px-3 py-1.5 text-xs font-medium text-[#5A4450] hover:text-[#20101B] hover:border-amber-600/40 transition-all duration-200 whitespace-nowrap shadow-2xs"
              aria-label="Search"
            >
              <svg className="size-3.5 text-amber-700 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Search</span>
            </Link>
            <LanguageLink lang={lang} native={info.native} label={t("lang.change")} />
            <Link
              href="/places"
              className="hidden sm:inline-flex min-h-9 items-center justify-center rounded-full bg-[#24131E] hover:bg-[#381C2E] px-4 text-xs font-semibold text-white shadow-xs transition-all active:scale-95 whitespace-nowrap"
            >
              Cultural Atlas →
            </Link>
            <UserProfileMenu
              user={session}
              labels={{
                profile: t("settings.title"),
                account: t("settings.account"),
                settings: t("settings.title"),
                signOut: t("auth.signOut"),
                signIn: "Sign In / Register",
              }}
            />
          </div>
        </div>
        {lang !== "en" && (coverage < 1 || !gatePassed(lang)) && (
          <p
            role="note"
            className="mt-2 rounded-full border border-warning/30 bg-warning/10 px-4 py-1.5 text-center text-meta text-charcoal backdrop-blur-md"
          >
            {coverage < 1
              ? t("lang.partialBanner", { language: info.native })
              : t("lang.previewBanner", { language: info.native })}
          </p>
        )}
      </header>
      <main id="main" className="pb-20 md:pb-0">{children}</main>
      <MainNav labels={labels} variant="bottom" />
    </div>
  );
}
