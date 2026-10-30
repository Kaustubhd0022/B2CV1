"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";
import { EASING } from "@/lib/motion.config";

interface Logo3DProps {
  isFullIntro?: boolean;
  className?: string;
}

export function Logo3D({ isFullIntro = true, className = "" }: Logo3DProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);

  if (reducedMotion) {
    return (
      <div className={`relative flex flex-col items-center justify-center ${className}`}>
        <Image
          src="/images/tattvaco-logo.png"
          alt="TattvaCo"
          width={430}
          height={113}
          priority
          className="h-auto w-64 sm:w-80 md:w-96 object-contain drop-shadow-xl"
        />
        <p className="mt-4 text-xs sm:text-sm font-serif font-semibold tracking-[0.2em] text-[#F6D59E] uppercase">
          Culture Lives in Connections
        </p>
      </div>
    );
  }

  // Animation timings adjusted for full intro vs fast intro
  const enterDuration = isFullIntro ? 2.0 : 1.4;
  const shimmerDelay = isFullIntro ? 1.4 : 0.8;
  const taglineDelay = isFullIntro ? 1.7 : 1.0;

  return (
    <div
      ref={containerRef}
      className={`relative flex flex-col items-center justify-center select-none ${className}`}
      style={{
        perspective: 1200,
        transformStyle: "preserve-3d",
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          Ambient Warm Sacred Diya Aura behind the 3D logo (Z: -60px)
         ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{
          scale: [0.6, 1.35, 1.15],
          opacity: [0, 0.55, 0.35],
        }}
        transition={{
          duration: isFullIntro ? 2.6 : 1.0,
          ease: "easeOut",
        }}
        className="pointer-events-none absolute -inset-10 -z-30 rounded-full bg-gradient-radial from-amber-600/30 via-orange-700/10 to-transparent blur-3xl"
        style={{ transform: "translateZ(-60px)" }}
        aria-hidden="true"
      />

      {/* Decorative concentric sacred circle ring */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0, rotate: -30 }}
        animate={{
          scale: [0.7, 1.15, 1],
          opacity: [0, 0.4, 0.2],
          rotate: 0,
        }}
        transition={{
          duration: isFullIntro ? 2.2 : 0.8,
          ease: EASING.natural,
        }}
        className="pointer-events-none absolute size-80 sm:size-96 rounded-full border border-amber-500/25 blur-xs"
        style={{ transform: "translateZ(-40px)" }}
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────────────────────────
          The 3D Logo Stage: 3-Plane Parallax Depth
         ───────────────────────────────────────────────────────────── */}
      <motion.div
        initial={{
          rotateX: 34,
          rotateY: -38,
          rotateZ: -6,
          scale: 0.72,
          z: -140,
          opacity: 0,
          filter: "blur(10px)",
        }}
        animate={{
          rotateX: [34, -8, 2, 0],
          rotateY: [-38, 14, -3, 0],
          rotateZ: [-6, 2, 0, 0],
          scale: [0.72, 1.06, 0.99, 1],
          z: [-140, 40, -5, 0],
          opacity: [0, 1, 1, 1],
          filter: ["blur(10px)", "blur(0px)", "blur(0px)", "blur(0px)"],
        }}
        transition={{
          duration: enterDuration,
          ease: EASING.natural,
          times: [0, 0.65, 0.85, 1],
        }}
        className="relative flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Layer 1: Parallax Cast Depth Shadow (Z: -28px) */}
        <motion.div
          animate={{
            x: [12, -4, 0],
            y: [16, 6, 8],
            opacity: [0, 0.6, 0.45],
          }}
          transition={{
            duration: enterDuration,
            ease: EASING.natural,
          }}
          className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center filter blur-md"
          style={{ transform: "translateZ(-28px)" }}
          aria-hidden="true"
        >
          <Image
            src="/images/tattvaco-logo.png"
            alt=""
            width={430}
            height={113}
            priority
            className="h-auto w-64 sm:w-80 md:w-96 object-contain brightness-0 opacity-70"
          />
        </motion.div>

        {/* Layer 2: Main 3D Terracotta Logo (Z: 20px) with rich drop-shadows */}
        <motion.div
          animate={{
            // Gentle continuous floating levitation once settled
            y: isFullIntro ? [0, -3.5, 3.5, 0] : 0,
            rotateX: isFullIntro ? [0, 1.5, -1.5, 0] : 0,
            rotateY: isFullIntro ? [0, -2, 2, 0] : 0,
          }}
          transition={{
            delay: enterDuration,
            duration: 5.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative"
          style={{ transform: "translateZ(24px)" }}
        >
          <Image
            src="/images/tattvaco-logo.png"
            alt="TattvaCo"
            width={430}
            height={113}
            priority
            className="h-auto w-64 sm:w-80 md:w-96 object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)] drop-shadow-[0_0_30px_rgba(198,125,40,0.35)]"
          />

          {/* Layer 3: Specular Light & Metallic Sheen Glint Sweep across the 3D surface */}
          <motion.div
            initial={{ x: "-120%", opacity: 0 }}
            animate={{
              x: ["-120%", "220%"],
              opacity: [0, 1, 0],
            }}
            transition={{
              delay: shimmerDelay,
              duration: 1.2,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="pointer-events-none absolute inset-0 -z-5 overflow-hidden"
            aria-hidden="true"
          >
            <div className="h-full w-1/3 -skew-x-25 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent blur-xs mix-blend-color-dodge" />
          </motion.div>

          {/* Layer 4: Radiant Star Flare ✦ at letter ligature */}
          <motion.span
            initial={{ scale: 0, opacity: 0, rotate: -90 }}
            animate={{
              scale: [0, 1.4, 0.9, 0],
              opacity: [0, 1, 0.8, 0],
              rotate: [0, 120],
            }}
            transition={{
              delay: shimmerDelay + 0.3,
              duration: 0.9,
              ease: "easeOut",
            }}
            className="pointer-events-none absolute -top-1.5 left-2.5 text-xs text-amber-200 drop-shadow-[0_0_12px_#F6D59E]"
            aria-hidden="true"
          >
            ✦
          </motion.span>
        </motion.div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          Tagline Reveal Beneath the 3D Logo
         ───────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden mt-5 sm:mt-6">
        <motion.p
          initial={{ opacity: 0, y: 16, letterSpacing: "0.35em" }}
          animate={{ opacity: 1, y: 0, letterSpacing: "0.22em" }}
          transition={{
            delay: taglineDelay,
            duration: 1.1,
            ease: EASING.natural,
          }}
          className="font-serif text-xs sm:text-sm font-semibold tracking-widest text-[#F6D59E]/90 uppercase text-center drop-shadow-sm"
        >
          Culture Lives in Connections
        </motion.p>
      </div>
    </div>
  );
}
