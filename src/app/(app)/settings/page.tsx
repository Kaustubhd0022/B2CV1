import type { Metadata } from "next";
import Link from "next/link";
import { pageContext } from "@/lib/page";
import { languageInfo } from "@/lib/i18n/languages";
import { IconAccount, IconArrow, IconLanguage, IconPrivacy, IconReport, IconTerms } from "@/components/icons";
import { Page } from "@/components/ui";
import { signOut } from "@/app/sign-in/actions";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { session, lang, t } = await pageContext();
  const items = [
    { href: "/settings/account", title: t("settings.account"), hint: t("settings.accountHint"), Icon: IconAccount },
    { href: "/language?next=/settings", title: t("settings.language"), hint: `${t("settings.languageHint")} · ${languageInfo(lang).native}`, Icon: IconLanguage },
    { href: "/settings/privacy", title: t("settings.privacy"), hint: t("settings.privacyHint"), Icon: IconPrivacy },
    { href: "/policies", title: t("settings.terms"), hint: t("settings.termsHint"), Icon: IconTerms },
    { href: "/report?type=product&ref=general", title: t("settings.report"), hint: t("settings.reportHint"), Icon: IconReport },
  ];

  return (
    <Page className="max-w-2xl pt-2">
      {/* Explorer Profile Banner (Master Spec §12 Screen 10 / Reference Page 9) */}
      <div className="rounded-3xl border border-border bg-gradient-to-br from-[#EFE9DC] via-[#E7DDCA] to-[#DFD7C7] p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-meta font-semibold uppercase tracking-wider text-terracotta">
            <span>✦</span>
            <span>My Cultural Journey</span>
          </div>
          <span className="rounded-full bg-forest/10 border border-forest/20 px-3 py-1 text-meta font-semibold text-forest">
            Explorer Profile
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4">
          <span className="flex size-14 items-center justify-center rounded-full bg-forest font-serif text-section font-semibold text-on-forest shadow-md">
            {(session.email ?? "T").slice(0, 1).toUpperCase()}
          </span>
          <div>
            <h1 className="font-serif text-page font-semibold text-charcoal break-all sm:break-normal">
              {session.email ?? "Cultural Explorer"}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-meta text-muted">
              <span>Language: <strong className="text-charcoal font-semibold">{languageInfo(lang).native}</strong></span>
              <span>·</span>
              <span>Role: <strong className="text-terracotta capitalize font-semibold">{session.role}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Phase 1 Discovery Context Stats */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Explorer parameters">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
          <p className="font-serif text-section font-semibold text-forest">6 Cities</p>
          <p className="mt-1 text-meta text-muted">Pilot Ecosystems</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
          <p className="font-serif text-section font-semibold text-forest">11 Scripts</p>
          <p className="mt-1 text-meta text-muted">Native Languages</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
          <p className="font-serif text-section font-semibold text-terracotta">100%</p>
          <p className="mt-1 text-meta text-muted">Privacy Respecting</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4 shadow-xs">
          <p className="font-serif text-section font-semibold text-forest">Tier-1</p>
          <p className="mt-1 text-meta text-muted">Statutory Evidence</p>
        </div>
      </section>

      {/* Preferences and Account Settings */}
      <section className="mt-8" aria-label="Account preferences">
        <h2 className="font-serif text-card font-semibold text-charcoal mb-3">Preferences & Controls</h2>
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface shadow-xs">
          {items.map((i) => (
            <li key={i.href}>
              <Link href={i.href} className="group flex min-h-16 items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-surface-2 border border-border/70 text-forest group-hover:bg-forest group-hover:text-on-forest transition-colors shadow-2xs">
                    <i.Icon width={18} height={18} />
                  </span>
                  <div>
                    <span className="block font-semibold text-charcoal">{i.title}</span>
                    <span className="block text-meta text-muted">{i.hint}</span>
                  </div>
                </div>
                <IconArrow width={18} height={18} className="shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          ))}
          {session.role === "editor" && (
            <li>
              <Link href="/editorial" className="group flex min-h-16 items-center justify-between gap-3 px-5 py-3.5 hover:bg-surface-2 transition-colors bg-[#f4f7f4]">
                <div className="flex items-center gap-3.5">
                  <span className="flex size-9 items-center justify-center rounded-full bg-forest/15 border border-forest/30 text-forest shadow-2xs">
                    ✦
                  </span>
                  <div>
                    <span className="block font-semibold text-forest">Editorial Workspace</span>
                    <span className="block text-meta text-muted">Review queue, publishing and reports (editors only)</span>
                  </div>
                </div>
                <IconArrow width={18} height={18} className="shrink-0 text-forest transition-transform group-hover:translate-x-0.5" />
              </Link>
            </li>
          )}
        </ul>
      </section>

      {/* Sign Out Action */}
      <form action={signOut} className="mt-8">
        <SubmitButton variant="secondary" className="w-full sm:w-auto">
          {t("auth.signOut")}
        </SubmitButton>
      </form>
    </Page>
  );
}
