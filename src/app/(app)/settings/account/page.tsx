import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { pageContext } from "@/lib/page";
import { getDb, schema } from "@/lib/db/client";
import { maskTarget } from "@/lib/auth/normalize";
import { currentSession, deleteAllSessionsForUser, endSession } from "@/lib/auth/session";
import { BackLink, Notice, Page, SectionTitle } from "@/components/ui";
import { SubmitButton } from "@/components/submit-button";

export const metadata: Metadata = { title: "Account" };

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
  // Cascades to sessions and linked sign-in identities. Reports and analytics hold no user id.
  await db.delete(schema.users).where(eq(schema.users.id, s.userId));
  await db.insert(schema.auditLog).values({ actorLabel: "self-service", action: "account_deleted", targetType: "user", targetId: "redacted" });
  await endSession();
  redirect("/sign-in");
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { session, t } = await pageContext();
  const db = await getDb();
  const identities = await db
    .select({ provider: schema.authIdentities.provider })
    .from(schema.authIdentities)
    .where(eq(schema.authIdentities.userId, session.userId));
  const methods = [
    session.email ? `Email · ${maskTarget("email", session.email)}` : null,
    session.phone ? `Phone · ${maskTarget("phone", session.phone)}` : null,
    ...identities.map((i) => (i.provider === "google" ? "Google" : "Apple")),
  ].filter(Boolean);
  const error = (await searchParams).error;

  return (
    <Page className="max-w-xl">
      <BackLink href="/settings" label={t("settings.title")} />
      <h1 className="mt-2 font-serif text-page font-semibold">{t("settings.account")}</h1>

      <section className="mt-6">
        <SectionTitle>{t("settings.signedInWith")}</SectionTitle>
        <ul className="mt-3 space-y-1 text-body">
          {methods.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
        <form action={signOutEverywhere} className="mt-4">
          <SubmitButton variant="secondary">{t("settings.signOutAll")}</SubmitButton>
        </form>
      </section>

      <section className="mt-10 rounded-lg border border-error/30 bg-surface p-4">
        <SectionTitle>{t("settings.deleteAccount")}</SectionTitle>
        <p className="mt-2 text-support">{t("settings.deleteAccountBody")}</p>
        {error === "confirm" && (
          <Notice tone="error" role="alert" className="mt-3">
            {t("settings.deleteConfirm")}
          </Notice>
        )}
        <form action={deleteAccount} className="mt-4 space-y-3">
          <label className="block text-support font-medium">
            {t("settings.deleteConfirm")}
            <input name="confirm" autoComplete="off" className="mt-1 block w-full min-h-11 rounded-md border border-border bg-canvas px-3" />
          </label>
          <SubmitButton className="bg-error hover:bg-error/90">{t("settings.deleteAccount")}</SubmitButton>
        </form>
      </section>
    </Page>
  );
}
