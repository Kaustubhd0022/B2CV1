"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

interface PassportSeal3DProps {
  status?: "waiting" | "verifying" | "verified";
  className?: string;
}

export function PassportSeal3D({
  status = "waiting",
  className = "",
}: PassportSeal3DProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Mouse move tilt effect for desktop
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) / (window.innerWidth / 2);
      const deltaY = (e.clientY - centerY) / (window.innerHeight / 2);

      // Max 14 deg tilt
      setTilt({
        x: Math.max(-14, Math.min(14, -deltaY * 14)),
        y: Math.max(-14, Math.min(14, deltaX * 14)),
      });
    };

    const handleMouseLeave = () => {
      setTilt({ x: 0, y: 0 });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return (
      <div className={`relative flex items-center justify-center ${className}`}>
        <div className="flex size-20 items-center justify-center rounded-full border-2 border-amber-500/50 bg-[#1A2520] text-amber-300 shadow-xl">
          <span className="text-3xl font-serif">✦</span>
        </div>
      </div>
    );
  }

  const isVerified = status === "verified";
  const isVerifying = status === "verifying";

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none ${className}`}
      style={{
        perspective: 1100,
      }}
    >
      {/* ─────────────────────────────────────────────────────────────
          1. Sacred Diya Flame Aura (Z: -70px)
         ───────────────────────────────────────────────────────────── */}
      <motion.div
        animate={{
          scale: isVerified ? [1, 1.6, 1.4] : isVerifying ? [1, 1.35, 1.1] : [1, 1.18, 0.95, 1],
          opacity: isVerified ? [0.6, 1, 0.8] : isVerifying ? [0.5, 0.85, 0.5] : [0.35, 0.55, 0.35],
        }}
        transition={{
          duration: isVerifying ? 1.2 : 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute size-56 sm:size-64 rounded-full bg-gradient-radial from-amber-500/45 via-orange-600/25 to-transparent blur-3xl"
        style={{ transform: "translateZ(-70px)" }}
        aria-hidden="true"
      />

      {/* ─────────────────────────────────────────────────────────────
          2. The 3D Multi-Layer Rotating Seal Stage
         ───────────────────────────────────────────────────────────── */}
      <motion.div
        animate={{
          rotateX: tilt.x,
          rotateY: tilt.y,
          y: isVerified ? 0 : [0, -5, 5, 0],
          scale: isVerified ? 1.08 : 1,
        }}
        transition={{
          rotateX: { type: "spring", stiffness: 120, damping: 15 },
          rotateY: { type: "spring", stiffness: 120, damping: 15 },
          y: { duration: 4.8, repeat: Infinity, ease: "easeInOut" },
          scale: { duration: 0.5, ease: "easeOut" },
        }}
        className="relative flex size-32 sm:size-36 items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Layer A: Outer Celestial Orbit Compass Ring (Z: -35px) */}
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: isVerifying ? 10 : 36,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute size-32 sm:size-36 rounded-full border border-dashed border-amber-400/40"
          style={{ transform: "translateZ(-35px)" }}
          aria-hidden="true"
        >
          {/* Cardinal star markers */}
          <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[10px] text-amber-300 font-mono">✦</span>
          <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 text-[10px] text-amber-300 font-mono">✦</span>
          <span className="absolute top-1/2 -left-1.5 -translate-y-1/2 text-[10px] text-amber-300 font-mono">✦</span>
          <span className="absolute top-1/2 -right-1.5 -translate-y-1/2 text-[10px] text-amber-300 font-mono">✦</span>
        </motion.div>

        {/* Layer B: Sacred Mandala Sun Wheel (Z: -12px) */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: isVerifying ? 8 : 28,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute size-28 sm:size-30 rounded-full border border-amber-500/40 bg-gradient-to-tr from-amber-900/25 via-yellow-700/15 to-transparent shadow-inner"
          style={{ transform: "translateZ(-12px)" }}
          aria-hidden="true"
        >
          <div className="absolute inset-1 rounded-full border border-amber-400/25" />
        </motion.div>

        {/* Layer C: Cast Shadow of Medallion (Z: -6px) */}
        <div
          className="pointer-events-none absolute size-24 sm:size-26 rounded-full bg-black/60 blur-md"
          style={{ transform: "translateZ(-6px) translateY(8px)" }}
          aria-hidden="true"
        ></div>

        {/* Layer D: Central Heavy Brass & Terracotta Seal (Z: +28px) */}
        <motion.div
          animate={
            isVerified
              ? { rotateY: 360, scale: [1, 1.15, 1.05] }
              : isVerifying
              ? { rotateY: [0, 180, 360] }
              : { rotateY: [0, 8, -8, 0] }
          }
          transition={
            isVerified
              ? { duration: 0.9, ease: "easeOut" }
              : isVerifying
              ? { duration: 2.2, repeat: Infinity, ease: "linear" }
              : { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }
          className="relative flex size-24 sm:size-26 items-center justify-center rounded-full border-2 border-amber-400/70 bg-gradient-to-br from-[#352013] via-[#1F2C25] to-[#0E1713] shadow-[0_12px_28px_rgba(0,0,0,0.75),inset_0_2px_5px_rgba(255,215,0,0.4)]"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(28px)",
          }}
        >
          {/* Concentric inner golden border */}
          <div className="absolute inset-1.5 rounded-full border border-amber-500/40 bg-gradient-to-b from-amber-600/15 to-transparent pointer-events-none" />

          {/* Specular Glint Sheen sweep across the 3D surface */}
          <motion.div
            animate={{
              x: ["-150%", "200%"],
              opacity: [0, 0.75, 0],
            }}
            transition={{
              duration: 3.5,
              repeat: Infinity,
              repeatDelay: 2.2,
              ease: "easeInOut",
            }}
            className="pointer-events-none absolute inset-0 overflow-hidden rounded-full"
            aria-hidden="true"
          >
            <div className="h-full w-1/2 -skew-x-30 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent blur-2xs mix-blend-color-dodge" />
          </motion.div>

          {/* Center Emblem: Glowing ✦ or Checkmark on verified */}
          {isVerified ? (
            <motion.span
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: 1 }}
              transition={{ duration: 0.5, ease: "backOut" }}
              className="text-2xl sm:text-3xl font-bold text-amber-300 drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]"
            >
              ✓
            </motion.span>
          ) : (
            <span
              className="font-serif text-2xl sm:text-3xl font-black text-amber-300/95 drop-shadow-[0_2px_8px_rgba(201,130,43,0.85)] tracking-tighter"
              style={{ transform: "translateZ(10px)" }}
            >
              ✦
            </span>
          )}

          {/* Micro sacred corner accents */}
          <div className="absolute top-1 text-[7px] text-amber-400/50">▲</div>
          <div className="absolute bottom-1 text-[7px] text-amber-400/50">▼</div>
        </motion.div>

        {/* Orbiting Golden Embers */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 9,
            repeat: Infinity,
            ease: "linear",
          }}
          className="pointer-events-none absolute size-28 sm:size-32"
          style={{ transform: "translateZ(35px)" }}
          aria-hidden="true"
        >
          <div className="absolute top-0 left-1/2 size-1 rounded-full bg-amber-300 shadow-[0_0_8px_#F6D59E]" />
          <div className="absolute bottom-2 left-4 size-1.5 rounded-full bg-amber-400/80 shadow-[0_0_10px_#F6D59E]" />
        </motion.div>
      </motion.div>
    </div>
  );
}
