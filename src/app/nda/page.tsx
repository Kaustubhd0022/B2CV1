import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNext } from "@/lib/auth/normalize";
import { currentSession } from "@/lib/auth/session";
import { hasAcceptedNda, NDA_AGREEMENT_TEXT } from "@/lib/legal/nda-record";
import { SubmitButton } from "@/components/submit-button";
import { signOut } from "../sign-in/actions";
import { acceptNda } from "./actions";

export const metadata: Metadata = { title: "Non-Disclosure Agreement · TattvaCo" };

export default async function NdaPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next: rawNext, error } = await searchParams;
  const next = safeNext(rawNext);
  const session = await currentSession();
  if (!session) redirect("/sign-in");
  if (await hasAcceptedNda(session.userId)) redirect(next);

  return (
    <main className="min-h-dvh bg-[#FAF0F4] px-4 py-8 sm:py-12">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-[#F0DCE4] bg-white p-5 shadow-xl sm:p-8">
        <h1 className="font-serif text-2xl font-semibold text-[#20101B]">{NDA_AGREEMENT_TEXT.title}</h1>
        <p className="mt-1 text-sm text-[#5A4550]">
          {NDA_AGREEMENT_TEXT.company} · Version {NDA_AGREEMENT_TEXT.version}
        </p>
        <p className="mt-4 text-sm text-[#5A4550]">Please read and accept this agreement to continue to TattvaCo.</p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
            We could not record your acceptance. Please try again.
          </p>
        )}

        <div className="mt-5 max-h-[50dvh] space-y-4 overflow-y-auto rounded-xl border border-[#F0DCE4] p-4" tabIndex={0}>
          {NDA_AGREEMENT_TEXT.clauses.map((clause) => (
            <section key={clause.num}>
              <h2 className="text-sm font-semibold text-[#20101B]">
                {clause.num}. {clause.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-[#3D2C37]">{clause.body}</p>
            </section>
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <form action={signOut}>
            <button type="submit" className="min-h-10 text-sm font-medium text-[#5A4550] underline">
              Decline and sign out
            </button>
          </form>
          <form action={acceptNda}>
            <input type="hidden" name="next" value={next} />
            <SubmitButton>I Agree and Continue</SubmitButton>
          </form>
        </div>
      </div>
    </main>
  );
}
