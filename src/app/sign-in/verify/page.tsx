import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { maskTarget } from "@/lib/auth/normalize";
import { pendingVerification } from "../actions";
import { VerifyCard } from "./verify-card";

export const metadata: Metadata = {
  title: "Verify Passport Email — TattvaCo",
  description: "Confirm your email to unlock your Cultural Explorer Passport and explore living traditions.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string; signup?: string; preview?: string }>;
}) {
  const { error, notice, signup, preview } = await searchParams;
  let pending = await pendingVerification();

  // Explicit preview fallback only in dev environment
  if (!pending) {
    if (preview === "1" && !config().isProd) {
      pending = {
        channel: "email",
        target: "dh@tattvaco.com",
        next: "/",
      };
    } else {
      redirect("/sign-in?error=expired_code");
    }
  }

  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden bg-canvas">
      <Image
        src="/images/dev/varanasi-hero.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#24131E]/35" />

      <header className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 md:px-10">
        <Link href="/" className="inline-flex items-center gap-2.5" title="Return to TattvaCo">
          <span className="flex size-9 items-center justify-center rounded-full border border-white/40 bg-[#24131E]/70 text-[#F6D59E]">
            ✦
          </span>
          <span className="font-serif text-section font-semibold tracking-wider text-white">TATTVACO</span>
        </Link>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 pb-8">
        <VerifyCard
          target={pending.target}
          maskedTarget={maskTarget(pending.channel, pending.target)}
          channel={pending.channel}
          initialNotice={notice}
          initialError={error}
          isSignUp={signup === "1"}
        />
      </main>
    </div>
  );
}
