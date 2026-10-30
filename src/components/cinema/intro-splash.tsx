"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { EASING, isFirstSessionVisit } from "@/lib/motion.config";
import { Logo3D } from "./logo-3d";

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

    const totalDuration = isFirst ? 2900 : 2200;
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
        <Logo3D isFullIntro={isFullIntro} />
      </motion.div>
    </AnimatePresence>
  );
}
