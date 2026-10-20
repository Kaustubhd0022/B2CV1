import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Terms and policies" };

/** Public (pre-sign-in) placeholder. Real policies require legal/privacy approval (OD-05, G4). */
export default function PoliciesPage() {
  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <p className="font-serif text-section font-semibold text-forest">TattvaCo</p>
      <h1 className="mt-6 font-serif text-page font-semibold">Terms and policies</h1>
      <p className="mt-3 rounded-md border border-warning/40 bg-warning/5 p-4 text-support">
        The Terms of Service and Privacy Policy have not yet been approved. This build is a pre-release pilot. It stores only
        the data needed to sign you in, keeps AI context for the current session only, and does not build interest profiles.
      </p>
      <p className="mt-4 text-support">
        TattvaCo is a cultural discovery companion, not an authority on cultural truth. Answers may be incomplete; sources are
        shown so you can check them.
      </p>
      <Link href="/sign-in" className="mt-6 inline-flex min-h-11 items-center font-semibold text-forest underline">
        Back to sign in
      </Link>
    </main>
  );
}
