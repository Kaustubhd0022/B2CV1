import Link from "next/link";
import type { Translate } from "@/lib/i18n/t";
import { languageInfo } from "@/lib/i18n/languages";
import { ButtonLink, Page } from "./ui";

/** ST03: explain the state, offer Home/Back. Never substitute unrelated content (PRD §6.3). */
export function Unavailable({ title, body, t, back }: { title: string; body: string; t: Translate; back?: { href: string; label: string } }) {
  return (
    <Page>
      <div className="mx-auto mt-10 max-w-lg rounded-lg border border-border bg-surface p-6 text-center" role="status">
        <h1 className="font-serif text-page font-semibold">{title}</h1>
        <p className="mt-2 text-support text-muted">{body}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <ButtonLink href="/">{t("nav.home")}</ButtonLink>
          {back && (
            <ButtonLink href={back.href} variant="secondary">
              {back.label}
            </ButtonLink>
          )}
        </div>
      </div>
    </Page>
  );
}

/** The item exists, but not in the selected language: say so and let the user decide. */
export function OtherLanguagesAvailable({ available, selected, href, t }: { available: string[]; selected: string; href: string; t: Translate }) {
  const names = available.map((l) => languageInfo(l).native).join(", ");
  return (
    <Page>
      <div className="mx-auto mt-10 max-w-lg rounded-lg border border-border bg-surface p-6" role="status">
        <h1 className="font-serif text-section font-semibold">{t("story.languageNote", { shown: names, selected: languageInfo(selected).native })}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          <ButtonLink href={href}>{t("city.showOther")}</ButtonLink>
          <ButtonLink href="/" variant="secondary">
            {t("nav.home")}
          </ButtonLink>
        </div>
        <p className="mt-4 text-meta text-muted">
          <Link href="/language" className="underline">
            {t("lang.change")}
          </Link>
        </p>
      </div>
    </Page>
  );
}
