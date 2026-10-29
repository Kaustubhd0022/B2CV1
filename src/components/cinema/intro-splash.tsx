"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EASING, MOTION_TIMINGS, isFirstSessionVisit } from "@/lib/motion.config";

export function IntroSplash({ onComplete }: { onComplete?: () => void }) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<"splash" | "dissolve" | "hidden">("splash");
  const [isFullIntro, setIsFullIntro] = useState(true);

  useEffect(() => {
    // If user prefers reduced motion, skip splash entirely
    if (reducedMotion) {
      setStage("hidden");
      onComplete?.();
      return;
    }

    const isFirst = isFirstSessionVisit();
    setIsFullIntro(isFirst);

    const totalDuration = isFirst ? 2600 : 1200;
    const timer = setTimeout(() => {
      setStage("dissolve");
      const cleanupTimer = setTimeout(() => {
        setStage("hidden");
        onComplete?.();
      }, 1000);
      return () => clearTimeout(cleanupTimer);
    }, totalDuration);

    return () => clearTimeout(timer);
  }, [reducedMotion, onComplete]);

  if (stage === "hidden") return null;

  return (
    <AnimatePresence>
      <motion.div
        key="intro-splash-overlay"
        initial={{ opacity: 1 }}
        animate={{ opacity: stage === "dissolve" ? 0 : 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.0, ease: EASING.natural }}
        className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-[#141d18]"
        aria-hidden="true"
      >
        {/* Subtle concentric rangoli/diya radial ring pulse */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: [0.8, 1.4, 2.2],
            opacity: [0, 0.45, 0],
          }}
          transition={{
            duration: isFullIntro ? 2.4 : 1.0,
            ease: "easeOut",
          }}
            className="absolute size-72 rounded-full border border-amber-500/30 bg-gradient-radial from-amber-600/25 via-amber-700/5 to-transparent blur-xl"
          />

          {/* Central ✦ Sacred Geometry SVG Mark */}
          <div className="relative flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 100 100"
              className="size-20 sm:size-24 overflow-visible"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer decorative diya ring */}
              <motion.circle
                cx="50"
                cy="50"
                r="44"
                stroke="#C67D28"
                strokeWidth="1.5"
                strokeDasharray="276"
                initial={{ strokeDashoffset: 276, opacity: 0 }}
                animate={{ strokeDashoffset: 0, opacity: [0, 0.7, 0.3] }}
                transition={{
                  duration: isFullIntro ? 1.8 : 0.7,
                  ease: EASING.natural,
                }}
              />

              {/* Four-pointed auspicious star ✦ */}
              <motion.path
                d="M50 8 C50 32 32 50 8 50 C32 50 50 68 50 92 C50 68 68 50 92 50 C68 50 50 32 50 8 Z"
                stroke="#F6D59E"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="300"
                fill="#C67D28"
                initial={{
                  strokeDashoffset: 300,
                  fillOpacity: 0,
                  scale: 0.7,
                }}
                animate={{
                  strokeDashoffset: 0,
                  fillOpacity: [0, 0, 0.95],
                  scale: [0.7, 1.05, 1],
                  filter: [
                    "drop-shadow(0 0 0px #C67D28)",
                    "drop-shadow(0 0 20px #E6A247)",
                    "drop-shadow(0 0 10px #C67D28)",
                  ],
                }}
                transition={{
                  duration: isFullIntro ? 2.0 : 0.8,
                  ease: EASING.natural,
                  times: [0, 0.7, 1],
                }}
              />
            </svg>

            {/* Glowing brand reveal under emblem */}
            <motion.div
              initial={{ opacity: 0, y: 12, letterSpacing: "0.4em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.22em" }}
              transition={{
                delay: isFullIntro ? 0.9 : 0.3,
                duration: 1.1,
                ease: EASING.natural,
              }}
              className="mt-4 font-serif text-xs sm:text-sm font-semibold tracking-widest text-[#F6D59E]/90 uppercase"
            >
              TATTVACO
            </motion.div>
          </div>
        </motion.div>
    </AnimatePresence>
  );
}
