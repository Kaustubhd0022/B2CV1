import type { Metadata } from "next";
import { pageContext } from "@/lib/page";
import { getConnection, getSource, getStory } from "@/lib/content/repo";
import { REPORT_CATEGORIES } from "@/lib/reports";
import type { MessageKey } from "@/lib/i18n/t";
import { Page } from "@/components/ui";
import { ReportForm } from "./report-form";

export const metadata: Metadata = { title: "Report a problem" };

const TYPES = ["story", "connection", "answer", "source", "product"] as const;

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ type?: string; ref?: string }> }) {
  const { lang, t } = await pageContext();
  const sp = await searchParams;
  const type = (TYPES as readonly string[]).includes(sp.type ?? "") ? (sp.type as (typeof TYPES)[number]) : "product";
  const ref = /^[A-Za-z0-9:_-]{1,160}$/.test(sp.ref ?? "") ? sp.ref! : "general";

  // Identify the affected item so the report is routed with context (Design Screen 11).
  let about: string = type === "product" ? t("settings.reportHint") : ref;
  if (type === "story") {
    const r = await getStory(ref, lang, true);
    if (r.status === "ok") about = r.body.title;
  } else if (type === "connection") {
    const r = await getConnection(ref, lang, true);
    if (r.status === "ok") about = r.body.title;
  } else if (type === "source") {
    about = (await getSource(ref))?.title ?? ref;
  } else if (type === "answer") {
    about = t("ask.response");
  }

  return (
    <Page className="max-w-xl">
      <h1 className="mt-4 font-serif text-page font-semibold">{t("report.title")}</h1>
      <p className="mt-1 text-support text-muted">{t("report.intro")}</p>
      <p className="mt-3 rounded-md border border-border bg-surface px-3 py-2 text-support">{t("report.about", { item: about })}</p>
      <ReportForm
        targetType={type}
        targetRef={ref}
        language={lang}
        categories={REPORT_CATEGORIES.map((c) => ({ value: c, label: t(`report.cat.${c}` as MessageKey) }))}
        labels={{
          category: t("report.category"),
          details: `${t("report.details")} (${t("common.optional")})`,
          detailsHint: t("report.detailsHint"),
          includeAnswer: t("report.includeAnswer"),
          submit: t("report.submit"),
          thanks: t("report.thanks"),
          thanksBody: t("report.thanksBody"),
          chooseCategory: t("report.chooseCategory"),
          tooLong: t("report.tooLong"),
          error: t("common.error"),
          rateLimited: t("auth.tooMany"),
          home: t("nav.home"),
        }}
      />
    </Page>
  );
}
