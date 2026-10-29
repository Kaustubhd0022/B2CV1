"use client";

import { motion, useReducedMotion } from "motion/react";
import { SPRING_CONFIG, MOTION_TIMINGS, EASING } from "@/lib/motion.config";
import type { ComponentType } from "react";
import {
  IconPlaces,
  IconPeople,
  IconFestivals,
  IconFood,
  IconCrafts,
  IconHistory,
  IconBeliefs,
} from "@/components/icons";

export interface CategoryItem {
  label: string;
}

const ICON_MAP: Record<string, ComponentType<{ className?: string; width?: number; height?: number }>> = {
  Places: IconPlaces,
  People: IconPeople,
  Festivals: IconFestivals,
  Food: IconFood,
  Crafts: IconCrafts,
  History: IconHistory,
  Traditions: IconBeliefs,
};

export function DimensionChips({ categories }: { categories: CategoryItem[] }) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return (
      <div className="mt-8">
        <p className="text-meta font-medium uppercase tracking-wider text-white/70">
          Explore 7 Dimensions
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.label] ?? IconPlaces;
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
    );
  }

  return (
    <div className="mt-8">
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: MOTION_TIMINGS.chipsStart - 0.2, duration: 1.0, ease: EASING.natural }}
        className="text-meta font-medium uppercase tracking-wider text-white/70"
      >
        Explore 7 Dimensions
      </motion.p>

      <ul className="mt-3 flex flex-wrap gap-2">
        {categories.map((cat, index) => (
          <MagneticChip key={cat.label} cat={cat} index={index} />
        ))}
      </ul>
    </div>
  );
}

function MagneticChip({
  cat,
  index,
}: {
  cat: CategoryItem;
  index: number;
}) {
  const Icon = ICON_MAP[cat.label] ?? IconPlaces;

  return (
    <motion.li
      initial={{ scale: 0.65, opacity: 0, y: 18 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        ...SPRING_CONFIG.chips,
        delay: MOTION_TIMINGS.chipsStart + index * MOTION_TIMINGS.chipsStagger,
      }}
      whileHover={{
        scale: 1.05,
        y: -2,
        transition: { type: "spring", stiffness: 450, damping: 20 },
      }}
      whileTap={{ scale: 0.96 }}
      className="group relative inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/35 px-3 py-1 text-support text-white/90 backdrop-blur-xs cursor-pointer select-none transition-colors duration-200 hover:border-gold/60 hover:bg-black/55"
    >
      {/* Icon with subtle bounce on hover */}
      <motion.span
        whileHover={{ rotate: [-6, 6, 0], scale: 1.15 }}
        transition={{ duration: 0.3 }}
        className="shrink-0"
      >
        <Icon className="size-3.5 text-gold" />
      </motion.span>
      <span>{cat.label}</span>

      {/* Underline sweep indicator */}
      <span className="absolute inset-x-3 -bottom-px h-[1.5px] bg-gradient-to-r from-transparent via-amber-400 to-transparent scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100" />
    </motion.li>
  );
}
