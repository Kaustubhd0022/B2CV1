"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { EASING, MOTION_TIMINGS } from "@/lib/motion.config";
import { IntroSplash } from "./intro-splash";
import { AmbientSparks } from "./particles";
import { CursorGlow } from "./cursor-glow";
import { CinematicHeadline, CinematicBrandHeader } from "./reveal-text";
import { DimensionChips } from "./dimension-chips";
import { PilotCitiesShowcase } from "./tilt-card";
import { CinematicLanguageSwitcher } from "./language-picker";
import { ExitCurtain } from "./exit-curtain";
import { AuthCard } from "@/app/sign-in/auth-card";
import type { ComponentType } from "react";

interface CategoryItem {
  label: string;
}

interface CityItem {
  slug: string;
  name: string;
  state: string;
  img: string;
}

export interface CinematicSignInProps {
  categories: CategoryItem[];
  pilotCities: CityItem[];
  next: string;
  errorMessage?: string;
  googleConfigured: boolean;
  emailConfigured: boolean;
  activeLanguage: string;
}

export function CinematicSignIn({
  categories,
  pilotCities,
  next,
  errorMessage,
  googleConfigured,
  emailConfigured,
  activeLanguage,
}: CinematicSignInProps) {
  const reducedMotion = useReducedMotion();
  const [activeCityTint, setActiveCityTint] = useState<string | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-[#141d18] text-charcoal select-none-subtle">
      {/* 0.0-0.8s Cinematic Opening Intro Splash with ✦ SVG Stroke Draw */}
      <IntroSplash />

      {/* Ambient Continuous Lantern Glow following cursor on desktop */}
      <CursorGlow />

      {/* Ambient Floating Saffron Diya Sparks (<30 particles) & Water Shimmer */}
      <AmbientSparks />

      {/* Post-login exit transition curtain */}
      <ExitCurtain active={isExiting} />

      {/* ─────────────────────────────────────────────────────────────
          Background Hero Photography with Ghat Steps Iris Reveal & Ken Burns
         ───────────────────────────────────────────────────────────── */}
      <div className="relative isolate min-h-dvh overflow-hidden">
        <motion.div
          initial={
            reducedMotion
              ? { opacity: 1, scale: 1 }
              : {
                  opacity: 0,
                  scale: 1.12,
                  clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                }
          }
          animate={{
            opacity: 1,
            scale: 1.0,
          }}
          transition={{
            opacity: { duration: MOTION_TIMINGS.bgRevealDuration, delay: MOTION_TIMINGS.bgRevealStart },
            scale: { duration: MOTION_TIMINGS.kenBurnsDuration, ease: EASING.ambient },
          }}
          className="absolute inset-0 -z-20 h-full w-full"
        >
          <Image
            src="/images/dev/varanasi-hero.jpg"
            alt="Ghats of Varanasi along the sacred Ganga"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
        </motion.div>

        {/* Dynamic City-Tint Ambient Overlay Layer */}
        <motion.div
          animate={{
            backgroundColor: activeCityTint || "rgba(20, 29, 24, 0)",
          }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none absolute inset-0 -z-15 mix-blend-color transition-colors"
          aria-hidden="true"
        />

        {/* Previous Soft Forest & Twilight Gradient Overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-gradient-to-r from-[#141d18]/90 via-[#1b2620]/80 to-[#141d18]/85 md:from-[#141d18]/92 md:via-[#18231e]/75 md:to-transparent"
        />

        {/* ─────────────────────────────────────────────────────────────
            Top Floating Utility Bar: Language Switcher
           ───────────────────────────────────────────────────────────── */}
        <div className="relative z-30 mx-auto max-w-7xl px-4 pt-4 sm:px-6 md:px-10 flex items-center justify-between">
          <CinematicBrandHeader />
          <CinematicLanguageSwitcher currentLang={activeLanguage} />
        </div>

        {/* ─────────────────────────────────────────────────────────────
            Main Interactive Grid
           ───────────────────────────────────────────────────────────── */}
        <div className="mx-auto flex min-h-[calc(100dvh-5rem)] max-w-7xl flex-col justify-between px-4 pb-8 pt-4 sm:px-6 md:px-10 lg:flex-row lg:items-center lg:gap-10">
          {/* Left Column: Headline, Categories, Pilot Cities */}
          <div className="flex max-w-2xl flex-col justify-center py-4 text-white lg:py-0">
            {/* 1.0-2.0s Mask-Up Headline Reveal & Saffron Shimmer */}
            <CinematicHeadline
              headline="Discover India Differently"
              subHeadline="Connect stories, living traditions, sacred places and philosophical ideas across 5,000 years of living culture."
              highlightWord="Differently"
            />

            {/* 1.6-2.4s 7 Dimension Chips with Staggered Spring Entrance */}
            <DimensionChips categories={categories} />

            {/* 1.8-2.8s 6 Pilot Cities with 3D Soft Parallax Tilt */}
            <PilotCitiesShowcase
              cities={pilotCities}
              onHoverCity={(tint) => setActiveCityTint(tint)}
            />
          </div>

          {/* Right Column: 1.4-2.4s Login Card with Glassmorphism Rise */}
          <div className="w-full max-w-[360px] lg:shrink-0 flex justify-center py-4 lg:py-0">
            <motion.div
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 36, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: MOTION_TIMINGS.authCardDuration,
                delay: MOTION_TIMINGS.authCardStart,
                ease: EASING.natural,
              }}
              className="relative w-full"
            >
              {/* Subtle saffron border-glow pulse that fades out */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.75, 0] }}
                transition={{
                  duration: 2.2,
                  delay: MOTION_TIMINGS.authCardStart + 0.3,
                  ease: "easeInOut",
                }}
                className="pointer-events-none absolute -inset-0.5 rounded-2xl border-2 border-amber-500/60 blur-xs"
                aria-hidden="true"
              />

              <AuthCard
                next={next}
                errorMessage={errorMessage}
                googleConfigured={googleConfigured}
                emailConfigured={emailConfigured}
                activeLanguage={activeLanguage}
                onBeginTransition={() => setIsExiting(true)}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
