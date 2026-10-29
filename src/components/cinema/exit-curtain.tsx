"use client";

import { motion } from "motion/react";
import { EASING, MOTION_TIMINGS } from "@/lib/motion.config";

export function ExitCurtain({ active = false }: { active?: boolean }) {
  if (!active) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: MOTION_TIMINGS.exitCurtainDuration,
        ease: EASING.dramatic,
      }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#141d18]"
      aria-hidden="true"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [0.8, 1.15, 1], opacity: 1 }}
        transition={{ duration: 0.6, ease: EASING.natural }}
        className="flex flex-col items-center justify-center"
      >
        <span className="flex size-16 items-center justify-center rounded-full border border-gold/40 bg-[#18231e] text-gold text-2xl shadow-2xl shadow-emerald-950/50 animate-pulse">
          ✦
        </span>
        <span className="mt-4 font-serif text-sm font-semibold tracking-widest text-[#F6D59E] uppercase">
          Entering TattvaCo
        </span>
      </motion.div>
    </motion.div>
  );
}
