import type { Metadata } from "next";
import Link from "next/link";
import { pageContext } from "@/lib/page";
import { languageInfo } from "@/lib/i18n/languages";
import { IconArrow } from "@/components/icons";
import { Page } from "@/components/ui";
import { signOut } from "@/app/sign-in/actions";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { session, lang, t } = await pageContext();
  const items = [
    { href: "/settings/account", title: t("settings.account"), hint: t("settings.accountHint") },
    { href: "/language?next=/settings", title: t("settings.language"), hint: `${t("settings.languageHint")} · ${languageInfo(lang).native}` },
    { href: "/settings/privacy", title: t("settings.privacy"), hint: t("settings.privacyHint") },
    { href: "/policies", title: t("settings.terms"), hint: t("settings.termsHint") },
    { href: "/report?type=product&ref=general", title: t("settings.report"), hint: t("settings.reportHint") },
  ];
  return (
    <Page className="max-w-xl">
      <h1 className="mt-4 font-serif text-page font-semibold">{t("settings.title")}</h1>
      <ul className="mt-6 divide-y divide-border overflow-hidden rounded-lg border border-border bg-surface">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2">
              <span>
                <span className="block font-semibold">{i.title}</span>
                <span className="block text-meta text-muted">{i.hint}</span>
              </span>
              <IconArrow width={18} height={18} className="shrink-0 text-muted" />
            </Link>
          </li>
        ))}
        {session.role === "editor" && (
          <li>
            <Link href="/editorial" className="flex min-h-16 items-center justify-between gap-3 px-4 py-3 hover:bg-surface-2">
              <span>
                <span className="block font-semibold">Editorial workspace</span>
                <span className="block text-meta text-muted">Review queue, publishing and reports (editors only)</span>
              </span>
              <IconArrow width={18} height={18} className="shrink-0 text-muted" />
            </Link>
          </li>
        )}
      </ul>
      <form action={signOut} className="mt-6">
        <SubmitButton variant="secondary">{t("auth.signOut")}</SubmitButton>
      </form>
    </Page>
  );
}
