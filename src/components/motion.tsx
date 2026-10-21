"use client";

import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

export { motion, AnimatePresence };

/** Apple-standard fluid cubic-bezier curve */
export const EASING_APPLE = [0.22, 1, 0.36, 1] as const;

/** Fade in with subtle vertical lift */
export function FadeIn({
  children,
  className,
  delay = 0,
  duration = 0.45,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  y?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: EASING_APPLE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container for orchestrating lists of items (cards, cities, categories) */
export function StaggerContainer({
  children,
  className,
  staggerDelay = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            delayChildren: delay,
            staggerChildren: staggerDelay,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Individual staggered item */
export function StaggerItem({
  children,
  className,
  y = 16,
}: {
  children: ReactNode;
  className?: string;
  y?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: EASING_APPLE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Card hover interaction wrapper with subtle scale, lift, and tactile tap feedback */
export function MotionCard({
  children,
  className,
  hoverScale = 1.02,
  hoverY = -3,
}: {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  hoverY?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ scale: hoverScale, y: hoverY }}
      whileTap={{ scale: 0.985 }}
      transition={{ type: "spring", stiffness: 380, damping: 26 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/** Pulsing radar beacon for coordinates, maps, and active status indicators */
export function PulsingDot({ className }: { className?: string }) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <span className={`relative inline-flex size-3 items-center justify-center ${className ?? ""}`}>
      {!shouldReduceMotion && (
        <motion.span
          animate={{ scale: [1, 2.2, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inline-flex size-full rounded-full bg-forest/40"
        />
      )}
      <span className="relative inline-flex size-2 rounded-full bg-forest" />
    </span>
  );
}

/** Smooth accordion drawer for disclosure details */
export function MotionDisclosure({
  isOpen,
  children,
  className,
}: {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return isOpen ? <div className={className}>{children}</div> : null;
  }

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: EASING_APPLE }}
          className={`overflow-hidden ${className ?? ""}`}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Sequential reveal orchestrator for monumental hero sections */
export function HeroReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASING_APPLE }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
