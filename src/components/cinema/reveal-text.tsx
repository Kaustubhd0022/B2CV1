"use client";

import { motion, useReducedMotion } from "motion/react";
import { EASING, MOTION_TIMINGS } from "@/lib/motion.config";
import type { ReactNode } from "react";

export function MaskUpText({
  children,
  className = "",
  delay = 0,
  duration = 0.8,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "115%", opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration,
          delay,
          ease: EASING.natural,
        }}
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Headline "Discover India / Differently" with mask-up lines and saffron shimmer
 */
export function CinematicHeadline({
  headline = "Discover India Differently",
  subHeadline,
  highlightWord = "Differently",
}: {
  headline?: string;
  subHeadline?: string;
  highlightWord?: string;
}) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div>
        <h1 className="mt-3 font-serif text-display leading-tight text-white md:text-display-lg">
          {headline}
        </h1>
        {subHeadline && (
          <p className="mt-4 max-w-xl text-body text-white/85 leading-relaxed">
            {subHeadline}
          </p>
        )}
      </div>
    );
  }

  // Split headline into lines or highlight word
  const parts = headline.includes("Differently")
    ? ["Discover India", "Differently"]
    : [headline];

  return (
    <div className="space-y-1">
      {/* Line 1 */}
      <div className="overflow-hidden">
        <motion.div
          initial={{ y: "120%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{
            duration: MOTION_TIMINGS.headlineDuration,
            delay: MOTION_TIMINGS.headlineStart,
            ease: EASING.natural,
          }}
          className="font-serif text-display leading-tight text-white md:text-display-lg"
        >
          {parts[0]}
        </motion.div>
      </div>

      {/* Line 2 with saffron shimmer sweep */}
      {parts.length > 1 && (
        <div className="overflow-hidden">
          <motion.div
            initial={{ y: "120%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
              duration: MOTION_TIMINGS.headlineDuration,
              delay: MOTION_TIMINGS.headlineLine2Delay,
              ease: EASING.natural,
            }}
            className="font-serif text-display leading-tight md:text-display-lg"
          >
            <span className="relative inline-block bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-sweep">
              {parts[1]}
            </span>
          </motion.div>
        </div>
      )}

      {/* Subtitle with soft fade in */}
      {subHeadline && (
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1.3,
            delay: MOTION_TIMINGS.headlineSubDelay,
            ease: EASING.natural,
          }}
          className="mt-4 max-w-xl text-body text-white/85 leading-relaxed"
        >
          {subHeadline}
        </motion.p>
      )}
    </div>
  );
}

/**
 * Brand Logo & Tagline with letter tracking tightening
 */
export function CinematicBrandHeader() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div>
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full border border-gold/40 bg-forest/80 text-gold shadow-xs">
            ✦
          </span>
          <span className="font-serif text-section font-semibold tracking-wider text-white">
            TATTVACO
          </span>
        </div>
        <p className="mt-6 text-meta font-semibold uppercase tracking-[0.16em] text-gold">
          Culture Lives in Connections
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2.5">
        <motion.span
          initial={{ scale: 0.6, rotate: -45, opacity: 0 }}
          animate={{ scale: 1, rotate: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: MOTION_TIMINGS.brandTitleStart,
            ease: EASING.natural,
          }}
          className="flex size-9 items-center justify-center rounded-full border border-gold/40 bg-forest/80 text-gold shadow-md"
        >
          ✦
        </motion.span>
        <motion.span
          initial={{ opacity: 0, letterSpacing: "0.35em", x: -8 }}
          animate={{ opacity: 1, letterSpacing: "0.15em", x: 0 }}
          transition={{
            duration: MOTION_TIMINGS.brandTitleDuration,
            delay: MOTION_TIMINGS.brandTitleStart + 0.1,
            ease: EASING.natural,
          }}
          className="font-serif text-section font-semibold text-white tracking-widest"
        >
          TATTVACO
        </motion.span>
      </div>

      {/* Tagline reveals with wide tracking */}
      <div className="overflow-hidden mt-6">
        <motion.p
          initial={{ opacity: 0, y: "100%", letterSpacing: "0.25em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.16em" }}
          transition={{
            duration: MOTION_TIMINGS.taglineDuration,
            delay: MOTION_TIMINGS.taglineStart,
            ease: EASING.natural,
          }}
          className="text-meta font-semibold uppercase text-gold"
        >
          Culture Lives in Connections
        </motion.p>
      </div>
    </div>
  );
}
