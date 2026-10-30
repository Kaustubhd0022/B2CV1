import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { config } from "@/lib/config";
import { maskTarget } from "@/lib/auth/normalize";
import { AmbientSparks } from "@/components/cinema/particles";
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
    <div className="relative isolate min-h-dvh flex flex-col justify-between overflow-hidden bg-[#0D1511] text-white select-none">
      {/* ─────────────────────────────────────────────────────────────
          Full-bleed Cinematic Varanasi Background
         ───────────────────────────────────────────────────────────── */}
      <Image
        src="/images/dev/varanasi-hero.jpg"
        alt="Sacred twilight on the Varanasi ghats"
        fill
        priority
        sizes="100vw"
        className="-z-20 object-cover object-center filter brightness-[0.7] contrast-[1.05]"
      />

      {/* Atmospheric nocturnal sacred forest scrim overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-b from-[#141D18]/92 via-[#18231E]/84 to-[#0C130F]/96"
      />

      {/* Ambient floating saffron diya embers */}
      <AmbientSparks />

      {/* ─────────────────────────────────────────────────────────────
          Top Cultural Brand Navigation
         ───────────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full px-6 py-5 max-w-6xl mx-auto flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform hover:scale-[1.02]"
          title="Return to TattvaCo"
        >
          <span className="flex size-9 items-center justify-center rounded-full border border-amber-500/40 bg-[#16221B]/90 text-amber-300 shadow-[0_0_12px_rgba(201,130,43,0.3)] transition-colors group-hover:border-amber-400">
            ✦
          </span>
          <span className="font-serif text-lg font-bold tracking-widest text-white">
            TATTVACO
          </span>
        </Link>

        <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Encrypted Secure Verification</span>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          Main Centered 3D Luxury Verify Card Stage
         ───────────────────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-6 sm:py-10">
        <VerifyCard
          target={pending.target}
          maskedTarget={maskTarget(pending.channel, pending.target)}
          channel={pending.channel}
          next={pending.next}
          initialNotice={notice}
          initialError={error}
          isSignUp={signup === "1"}
        />
      </main>

      {/* ─────────────────────────────────────────────────────────────
          Footer Brand Motto
         ───────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-white/40">
        <p className="font-serif tracking-wider uppercase text-[11px] text-amber-300/60">
          Culture Lives in Connections
        </p>
        <p className="mt-0.5 text-[10px] text-white/30">
          © {new Date().getFullYear()} TattvaCo. Cultural Explorer Passport Security.
        </p>
      </footer>
    </div>
  );
}
