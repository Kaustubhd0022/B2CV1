import type { Metadata } from "next";
import Image from "next/image";
import { config } from "@/lib/config";
import { emailConfigured, smsConfigured } from "@/lib/auth/delivery";
import { oauthConfigured } from "@/lib/auth/oauth";
import { safeNext } from "@/lib/auth/normalize";
import { translator, type MessageKey } from "@/lib/i18n/t";
import { isLanguageCode } from "@/lib/i18n/languages";
import {
  IconPlaces,
  IconPeople,
  IconFestivals,
  IconFood,
  IconCrafts,
  IconHistory,
  IconBeliefs,
} from "@/components/icons";
import { SignUpCard } from "./sign-up-card";

export const metadata: Metadata = { title: "Create an Account · TattvaCo" };

const ERRORS: Record<string, string> = {
  invalid_email: "Please enter a valid email address.",
  invalid_password: "Password must be at least 8 characters.",
  email_exists: "An account with this email already exists. Please sign in.",
  oauth_failed: "Authentication failed. Please try again.",
  link_conflict: "An account with this email is already linked.",
};

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const hl = isLanguageCode(sp.hl) ? sp.hl : "en";
  const next = safeNext(sp.next);
  const errorMessage = sp.error ? (ERRORS[sp.error] ?? "An error occurred. Please try again.") : undefined;
  const google = oauthConfigured("google");
  const email = emailConfigured();

  const pilotCities = [
    { slug: "varanasi", name: "Varanasi", state: "Uttar Pradesh", img: "/images/dev/varanasi-card.jpg" },
    { slug: "jaipur", name: "Jaipur", state: "Rajasthan", img: "/images/dev/jaipur.jpg" },
    { slug: "hampi", name: "Hampi", state: "Karnataka", img: "/images/dev/hampi.jpg" },
    { slug: "kochi", name: "Kochi", state: "Kerala", img: "/images/dev/kochi.jpg" },
    { slug: "kolkata", name: "Kolkata", state: "West Bengal", img: "/images/dev/kolkata.jpg" },
    { slug: "madurai", name: "Madurai", state: "Tamil Nadu", img: "/images/dev/madurai.jpg" },
  ];

  const categories = [
    { label: "Places", icon: IconPlaces },
    { label: "People", icon: IconPeople },
    { label: "Festivals", icon: IconFestivals },
    { label: "Food", icon: IconFood },
    { label: "Crafts", icon: IconCrafts },
    { label: "History", icon: IconHistory },
    { label: "Traditions", icon: IconBeliefs },
  ];

  return (
    <div lang={hl} className="min-h-dvh bg-canvas text-charcoal">
      {/* Background full-bleed photography container */}
      <div className="relative isolate min-h-dvh overflow-hidden">
        <Image
          src="/images/dev/varanasi-hero.jpg"
          alt="Ghats of Varanasi along the sacred Ganga"
          fill
          priority
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        {/* Soft overlay for editorial contrast */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#141d18]/90 via-[#1b2620]/80 to-[#141d18]/85 md:from-[#141d18]/92 md:via-[#18231e]/75 md:to-transparent"
        />

        <div className="mx-auto flex min-h-dvh max-w-7xl flex-col justify-between px-4 py-6 sm:px-6 md:px-10 lg:flex-row lg:items-center lg:gap-10 lg:py-8">
          {/* Left Column: Cultural editorial headline */}
          <div className="flex max-w-2xl flex-col justify-center py-6 text-white lg:py-0">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-full border border-gold/40 bg-forest/80 text-gold shadow-xs">
                ✦
              </span>
              <span className="font-serif text-section font-semibold tracking-wider text-white">TATTVACO</span>
            </div>

            <p className="mt-6 text-meta font-semibold uppercase tracking-[0.16em] text-gold">
              Culture Lives in Connections
            </p>
            <h1 className="mt-3 font-serif text-display leading-tight text-white md:text-display-lg">
              Begin Your Cultural Journey
            </h1>
            <p className="mt-4 max-w-xl text-body text-white/85 leading-relaxed">
              Create your cultural passport to save sacred routes, oral histories, folk music, and living craft traditions across India.
            </p>

            {/* Cultural Categories Strip */}
            <div className="mt-8">
              <p className="text-meta font-medium uppercase tracking-wider text-white/70">Explore 7 Dimensions</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <li
                      key={cat.label}
                      className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-support text-white/90 backdrop-blur-xs"
                    >
                      <Icon className="size-3.5 text-gold shrink-0" />
                      <span>{cat.label}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Pilot Cities Showcase */}
            <div className="mt-8 hidden sm:block">
              <div className="flex items-center justify-between">
                <p className="text-meta font-medium uppercase tracking-wider text-white/70">6 Pilot Cities</p>
                <span className="text-meta text-gold">Phase 1 Discovery</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2.5 md:grid-cols-6">
                {pilotCities.map((city) => (
                  <div
                    key={city.slug}
                    className="group relative aspect-[3/4] overflow-hidden rounded-md border border-white/15 bg-surface-2 transition-all hover:border-gold/60"
                  >
                    <Image
                      src={city.img}
                      alt={city.name}
                      fill
                      sizes="120px"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="scrim-bottom absolute inset-0" />
                    <div className="absolute inset-x-0 bottom-0 p-2">
                      <p className="text-meta font-semibold leading-tight text-white">{city.name}</p>
                      <p className="text-[10px] text-white/75">{city.state}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Compact Create Account Card */}
          <div className="w-full max-w-[360px] lg:shrink-0 flex justify-center py-4 lg:py-0">
            <SignUpCard
              next={next}
              errorMessage={errorMessage}
              googleConfigured={google}
              emailConfigured={email}
              activeLanguage={hl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
