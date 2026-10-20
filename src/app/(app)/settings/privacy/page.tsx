import type { Metadata } from "next";
import { pageContext } from "@/lib/page";
import { config } from "@/lib/config";
import { BackLink, Notice, Page, SectionTitle } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy and data" };

/** Plain-language summary of docs/DATA_INVENTORY.md. English-only until reviewed translations exist. */
export default async function PrivacyPage() {
  const { t } = await pageContext();
  const r = config().retention;
  const rows: [string, string, string][] = [
    ["Email address or phone number", "To sign you in and verify it is you.", "Until you delete your account."],
    ["Linked Google / Apple account identifier", "To recognise you when you sign in with that provider.", "Until you delete your account."],
    ["Session", "To keep you signed in; holds your language for this session and the last few questions for follow-ups.", `Deleted when you sign out; expires after ${config().auth.sessionDays} days.`],
    ["Answer check records", "To audit automated answer checks. No question text and no account identifier.", `Proposed: ${r.answerRunDays} days (not yet approved).`],
    ["Usage events", "To understand which parts of the journey work. No account identifier, no question text.", `Proposed: ${r.analyticsDays} days (not yet approved).`],
    ["Problem reports", "To investigate content issues. Not linked to your account; the answer text is attached only if you choose.", `Proposed: ${r.resolvedReportDays} days after resolution (not yet approved).`],
  ];
  return (
    <Page className="prose-reading">
      <BackLink href="/settings" label={t("settings.title")} />
      <h1 className="mt-2 font-serif text-page font-semibold">{t("settings.privacy")}</h1>
      <Notice className="mt-4" tone="warning">
        {t("settings.policiesPending")}
      </Notice>
      <section className="mt-6">
        <SectionTitle>What TattvaCo stores</SectionTitle>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] border-collapse text-left text-support">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 pr-3">Data</th>
                <th className="py-2 pr-3">Why</th>
                <th className="py-2">How long</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([a, b, c]) => (
                <tr key={a} className="border-b border-border align-top">
                  <td className="py-2 pr-3 font-semibold">{a}</td>
                  <td className="py-2 pr-3">{b}</td>
                  <td className="py-2">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="mt-8">
        <SectionTitle>What TattvaCo does not do</SectionTitle>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-body">
          <li>No interest profile, saved library or discovery history.</li>
          <li>No long-term AI memory: a new session starts without previous questions.</li>
          <li>No location tracking.</li>
          <li>No personal data or questions in shareable links.</li>
        </ul>
      </section>
    </Page>
  );
}
