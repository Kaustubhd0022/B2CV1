import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { pageContext } from "@/lib/page";
import { getDb, schema } from "@/lib/db/client";
import { maskTarget } from "@/lib/auth/normalize";
import { currentSession, deleteAllSessionsForUser, endSession } from "@/lib/auth/session";
import { languageInfo } from "@/lib/i18n/languages";
import { BackLink, Notice, Page, SectionTitle } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";
import { EpistemicLegend } from "@/components/evidence";
import { IconLanguage, IconPrivacy, IconReport, IconSignOut } from "@/components/icons";
import { signOut } from "@/app/sign-in/actions";

export const metadata: Metadata = {
  title: "Cultural Explorer Account & Journey · TattvaCo",
  description: "Manage your profile, preferred language across India's 11 regional languages, and session exploration telemetry.",
};

async function signOutEverywhere() {
  "use server";
  const s = await currentSession();
  if (!s) redirect("/sign-in");
  await deleteAllSessionsForUser(s.userId);
  await endSession();
  redirect("/sign-in");
}

async function deleteAccount(formData: FormData) {
  "use server";
  const s = await currentSession();
  if (!s) redirect("/sign-in");
  if (formData.get("confirm") !== "DELETE") redirect("/settings/account?error=confirm");
  const db = await getDb();
  await db.delete(schema.users).where(eq(schema.users.id, s.userId));
  await db.insert(schema.auditLog).values({
    actorLabel: "self-service",
    action: "account_deleted",
    targetType: "user",
    targetId: "redacted",
  });
  await endSession();
  redirect("/sign-in");
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { session, lang, t } = await pageContext();
  const db = await getDb();
  const identities = await db
    .select({ provider: schema.authIdentities.provider })
    .from(schema.authIdentities)
    .where(eq(schema.authIdentities.userId, session.userId));

  const methods = [
    session.email ? `Email · ${maskTarget("email", session.email)}` : null,
    session.phone ? `Phone · ${maskTarget("phone", session.phone)}` : null,
    ...identities.map((i) => (i.provider === "google" ? "Google Account" : "Apple ID")),
  ].filter(Boolean);

  const isGuest = !session.email && !session.phone;
  const error = (await searchParams).error;
  const currentLang = languageInfo(lang);

  return (
    <Page className="max-w-3xl pt-2 pb-16">
      <BackLink href="/settings" label={t("settings.title")} />

      {/* 1. Explorer Profile Header Card matching Reference Page 9 */}
      <div className="mt-3 rounded-[2.5rem] border border-[#F0DCE4] bg-white/80 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F0DCE4] pb-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-amber-700">
            <span>✦</span>
            <span>Cultural Explorer Profile</span>
          </div>
          <span className="rounded-full bg-amber-500/10 border border-amber-600/30 px-3 py-0.5 text-meta font-semibold text-amber-800">
            {isGuest ? "Guest Mode" : "Verified Explorer"}
          </span>
        </div>

        <div className="mt-5 flex flex-col sm:flex-row sm:items-center gap-5">
          <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-[#24131E] font-serif text-2xl font-bold text-white shadow-md">
            {(session.email ?? "E").slice(0, 1).toUpperCase()}
          </span>

          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#20101B] break-all sm:break-normal">
              {session.email ?? (isGuest ? "Cultural Explorer (Guest)" : "Verified Explorer")}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-meta text-[#5A4450]">
              <span>Primary Language: <strong className="text-[#20101B] font-semibold">{currentLang.native}</strong></span>
              <span>·</span>
              <span>Access Role: <strong className="text-amber-800 capitalize font-semibold">{session.role}</strong></span>
            </div>
          </div>

          <div className="pt-2 sm:pt-0">
            {isGuest ? (
              <Link
                href="/sign-in"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-gold px-5 text-meta font-semibold text-[#12100e] hover:bg-gold-hover shadow-xs transition-colors"
              >
                Sign In / Register
              </Link>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href="/settings"
                  className="inline-flex min-h-10 items-center justify-center rounded-full border border-border bg-surface px-4 text-meta font-semibold text-charcoal hover:bg-surface-2 transition-colors"
                >
                  Settings Overview
                </Link>
                <form action={signOut}>
                  <SubmitButton variant="secondary" className="text-rose-700 hover:text-rose-800 hover:border-rose-300">
                    <span className="flex items-center gap-1.5">
                      <IconSignOut width={14} height={14} />
                      <span>{t("auth.signOut")}</span>
                    </span>
                  </SubmitButton>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Exploration Ecosystem Telemetry matching Reference Page 9 */}
      <section className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" aria-label="Ecosystem telemetry">
        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs">
          <p className="font-serif text-2xl font-bold text-gold">6 Cities</p>
          <p className="mt-0.5 text-meta font-semibold text-charcoal">Pilot Ecosystems</p>
          <p className="text-[11px] text-muted">Varanasi to Madurai</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs">
          <p className="font-serif text-2xl font-bold text-gold">19 Stories</p>
          <p className="mt-0.5 text-meta font-semibold text-charcoal">Flagship Narratives</p>
          <p className="text-[11px] text-muted">Primary evidence grounded</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs">
          <p className="font-serif text-2xl font-bold text-gold">42 Places</p>
          <p className="mt-0.5 text-meta font-semibold text-charcoal">Mapped Sites</p>
          <p className="text-[11px] text-muted">Topographic Cultural Atlas</p>
        </div>
        <div className="rounded-2xl border border-border/80 bg-surface p-4 shadow-xs">
          <p className="font-serif text-2xl font-bold text-gold">11 Scripts</p>
          <p className="mt-0.5 text-meta font-semibold text-charcoal">Vernacular Languages</p>
          <p className="text-[11px] text-muted">Native typography</p>
        </div>
      </section>

      {/* 3. Preferred Vernacular Language Preferences */}
      <section className="mt-8 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-lg bg-surface-2 border border-border text-gold">
              <IconLanguage width={18} height={18} />
            </span>
            <div>
              <h2 className="font-serif text-lg font-semibold text-charcoal">
                Preferred Vernacular Language
              </h2>
              <p className="text-meta text-muted">Choose from 11 officially supported Indian languages</p>
            </div>
          </div>
          <Link
            href={`/language?next=/settings/account`}
            className="inline-flex min-h-9 items-center justify-center rounded-full border border-gold/40 bg-gold/10 px-4 text-meta font-semibold text-gold hover:bg-gold/20 transition-colors"
          >
            Change ({currentLang.native}) →
          </Link>
        </div>

        <div className="mt-4">
          <p className="text-support text-secondary-text leading-relaxed">
            TattvaCo renders content and navigational controls natively in your chosen language without silent fallback to English. When a narrative is available exclusively in specific dialects, it is explicitly annotated.
          </p>
        </div>
      </section>

      {/* 4. Epistemic Integrity Guide */}
      <section className="mt-8 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
        <div className="border-b border-border/70 pb-3">
          <h2 className="font-serif text-lg font-semibold text-charcoal">
            Epistemic Verification Classification
          </h2>
          <p className="mt-0.5 text-meta text-muted">
            How claims, traditions, and archaeological facts are distinguished in TattvaCo
          </p>
        </div>

        <div className="mt-4">
          <EpistemicLegend t={t} />
        </div>
      </section>

      {/* 5. Privacy Commitment & Signed-in Methods */}
      <section className="mt-8 rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center gap-2.5 border-b border-border/70 pb-3">
          <span className="flex size-8 items-center justify-center rounded-lg bg-surface-2 border border-border text-forest">
            <IconPrivacy width={18} height={18} />
          </span>
          <div>
            <h2 className="font-serif text-lg font-semibold text-charcoal">
              Privacy & Authentication Security
            </h2>
            <p className="text-meta text-muted">Strict privacy protection without cross-device tracking</p>
          </div>
        </div>

        <div className="text-support text-secondary-text leading-relaxed">
          <p>
            TattvaCo operates with strict architectural privacy integrity. We do not maintain cross-site behavioral tracking, persistent browsing profiling, or device fingerprinting. Your cultural exploration is confidential and sovereign.
          </p>
        </div>

        <div className="border-t border-border/60 pt-4">
          <h3 className="text-meta font-semibold uppercase tracking-wider text-charcoal">
            Active Authentication Methods
          </h3>
          <ul className="mt-2 space-y-1.5 text-support text-muted">
            {methods.length > 0 ? (
              methods.map((m) => (
                <li key={m} className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-forest" />
                  <span>{m}</span>
                </li>
              ))
            ) : (
              <li className="italic text-muted">No external identities linked (Guest session).</li>
            )}
          </ul>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <form action={signOut}>
            <SubmitButton variant="secondary" className="text-rose-700 hover:text-rose-800 hover:border-rose-300">
              <span className="flex items-center gap-1.5">
                <IconSignOut width={14} height={14} />
                <span>{t("auth.signOut")}</span>
              </span>
            </SubmitButton>
          </form>
          <form action={signOutEverywhere}>
            <SubmitButton variant="secondary">
              Sign Out All Sessions
            </SubmitButton>
          </form>
          <Link
            href="/report?type=product&ref=account"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-lg border border-border px-3.5 text-meta font-medium text-charcoal hover:bg-surface-2 transition-colors"
          >
            <IconReport width={14} height={14} /> Report an Issue
          </Link>
        </div>
      </section>

      {/* 6. Account Deletion (Self-Service) */}
      <section className="mt-8 rounded-2xl border border-error/30 bg-surface p-5 sm:p-6 shadow-xs">
        <SectionTitle>{t("settings.deleteAccount")}</SectionTitle>
        <p className="mt-2 text-support text-secondary-text leading-relaxed">
          {t("settings.deleteAccountBody")}
        </p>
        {error === "confirm" && (
          <Notice tone="error" role="alert" className="mt-3">
            {t("settings.deleteConfirm")}
          </Notice>
        )}
        <form action={deleteAccount} className="mt-4 space-y-3">
          <label className="block text-support font-medium text-charcoal">
            Type <strong className="text-error">DELETE</strong> to confirm immediate irreversible deletion:
            <input
              name="confirm"
              autoComplete="off"
              placeholder="DELETE"
              className="mt-1.5 block w-full min-h-11 rounded-xl border border-border bg-surface-2 px-3 text-body text-charcoal focus:border-error focus:outline-none"
            />
          </label>
          <SubmitButton className="bg-error hover:bg-error/90 text-white">
            Permanently Delete My Account
          </SubmitButton>
        </form>
      </section>
    </Page>
  );
}
