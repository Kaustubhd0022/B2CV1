"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";

const INK = "#B45309";
const HOVER_HEIGHT = 58;
const PETAL = "M0 -7 C 9 -13, 9 -25, 0 -33 C -9 -25, -9 -13, 0 -7 Z";

/** Stacked discs read as a solid turned-wood block once the scene is tilted in 3D. */
const STAMP_PARTS = [
  ...Array.from({ length: 6 }, (_, i) => ({ z: i * 2, size: 58, color: i === 5 ? "#A8703C" : "#7A4A24" })),
  ...Array.from({ length: 10 }, (_, i) => ({ z: 12 + i * 2, size: 20, color: "#2F1A28" })),
  { z: 32, size: 26, color: "#2F1A28" },
  { z: 34, size: 32, color: "#2F1A28" },
  { z: 36, size: 34, color: "#3A2132" },
  { z: 38, size: 32, color: "#3A2132" },
  { z: 40, size: 26, color: "#4A2C40" },
];

export function PassportStamp3D({
  filled,
  pressed,
  attempt,
}: {
  /** How many digits have been entered: one lotus petal is inked for each. */
  filled: number;
  /** The whole code was submitted: the stamp seals the page. */
  pressed: boolean;
  /** Increments after a rejected code. */
  attempt: number;
}) {
  const reduced = useReducedMotion();
  const height = useMotionValue(HOVER_HEIGHT);
  const shake = useMotionValue(0);
  const pointerX = useSpring(0, { stiffness: 70, damping: 16 });
  const pointerY = useSpring(0, { stiffness: 70, damping: 16 });
  const rotateX = useTransform(pointerY, (v) => 54 - v * 5);
  const rotateZ = useTransform(pointerX, (v) => -7 + v * 5);
  const shadowScale = useTransform(height, [0, HOVER_HEIGHT], [1, 1.25]);
  const shadowOpacity = useTransform(height, [0, HOVER_HEIGHT], [0.45, 0.16]);
  const previousFilled = useRef(filled);

  useEffect(() => {
    if (reduced) return;
    const onMove = (e: MouseEvent) => {
      pointerX.set((e.clientX / window.innerWidth) * 2 - 1);
      pointerY.set((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduced, pointerX, pointerY]);

  // A light dab for each digit, then a full press once the code is complete.
  useEffect(() => {
    const added = filled > previousFilled.current;
    previousFilled.current = filled;
    if (reduced) return;
    if (pressed) {
      const controls = animate(height, [height.get(), 0, 0, 34], {
        duration: 1,
        times: [0, 0.32, 0.48, 1],
        ease: ["easeIn", "linear", "easeOut"],
      });
      return () => controls.stop();
    }
    const controls = added
      ? animate(height, [HOVER_HEIGHT, 30, HOVER_HEIGHT], { duration: 0.32, ease: "easeInOut" })
      : animate(height, HOVER_HEIGHT, { duration: 0.4, ease: "easeOut" });
    return () => controls.stop();
  }, [filled, pressed, reduced, height]);

  useEffect(() => {
    if (reduced || attempt === 0) return;
    const controls = animate(shake, [0, -7, 7, -5, 5, 0], { duration: 0.4 });
    return () => controls.stop();
  }, [attempt, reduced, shake]);

  return (
    <div aria-hidden="true" className="relative h-40 w-full" style={{ perspective: 760 }}>
      <motion.div
        className="absolute left-1/2 top-[62%] h-[132px] w-[232px] -ml-[116px] -mt-[66px]"
        style={{ rotateX, rotateZ, x: shake, transformStyle: "preserve-3d" }}
      >
        {/* Cover, visible as an edge around the pages */}
        <div className="absolute -inset-[5px] rounded-[10px] bg-[#24131E] shadow-[0_18px_30px_rgba(36,19,30,0.35)]" />

        {/* Right page with the visa */}
        <div
          className="absolute inset-y-0 right-0 w-1/2 overflow-hidden rounded-r-md border-l border-[#E9D5DF] bg-[#FFFDFB]"
          style={{ transform: "translateZ(2px)" }}
        >
          <svg viewBox="-58 -66 116 132" className="size-full">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <g key={i} transform={`rotate(${i * 60})`}>
                <path d={PETAL} fill="none" stroke="#E2C9D4" strokeWidth="1" strokeDasharray="2.5 2.5" />
                <motion.path
                  d={PETAL}
                  fill={INK}
                  initial={false}
                  animate={{ opacity: i < filled ? 0.92 : 0 }}
                  transition={{ duration: reduced ? 0 : 0.2, delay: reduced ? 0 : 0.14 }}
                />
              </g>
            ))}
            <circle r="4" fill={filled === 6 ? INK : "#E2C9D4"} />
            <motion.circle
              r="42"
              fill="none"
              stroke={INK}
              strokeWidth="2"
              initial={false}
              animate={{ opacity: pressed ? 0.9 : 0, r: pressed ? 42 : 36 }}
              transition={{ duration: reduced ? 0 : 0.2, delay: pressed && !reduced ? 0.32 : 0 }}
            />
          </svg>
        </div>

        {/* Stamp shadow on the page */}
        <motion.div
          className="absolute left-3/4 top-1/2 -ml-8 -mt-8 size-16 rounded-full bg-[#24131E] blur-md"
          style={{ translateZ: 3, scale: shadowScale, opacity: shadowOpacity }}
        />

        {/* The block-print stamp */}
        <motion.div className="absolute left-3/4 top-1/2" style={{ translateZ: height, transformStyle: "preserve-3d" }}>
          {STAMP_PARTS.map((part) => (
            <div
              key={part.z}
              className="absolute rounded-full"
              style={{
                width: part.size,
                height: part.size,
                marginLeft: -part.size / 2,
                marginTop: -part.size / 2,
                background: part.color,
                transform: `translateZ(${part.z}px)`,
              }}
            />
          ))}
        </motion.div>

        {/* Left page: hinged on the spine, so the passport opens when the screen loads */}
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2"
          style={{ transformOrigin: "100% 50%", transformStyle: "preserve-3d", translateZ: 2 }}
          initial={{ rotateY: 178 }}
          animate={{ rotateY: 0 }}
          transition={reduced ? { duration: 0 } : { duration: 0.95, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            className="absolute inset-0 overflow-hidden rounded-l-md bg-[#FFFDFB] p-3"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#92400E]">✦</span>
              <span className="font-serif text-[10px] font-bold text-[#20101B]">TattvaCo</span>
            </div>
            <p className="mt-0.5 text-[7px] leading-tight text-[#7E6674]">Cultural Explorer Passport</p>
            <div className="mt-3.5 space-y-2.5">
              <div className="h-px w-full bg-[#E9D5DF]" />
              <div className="h-px w-5/6 bg-[#E9D5DF]" />
              <div className="h-px w-full bg-[#E9D5DF]" />
              <div className="h-px w-2/3 bg-[#E9D5DF]" />
            </div>
          </div>
          {/* Outside of the cover, seen while the passport is closed */}
          <div
            className="absolute -inset-y-[5px] -left-[5px] right-0 flex flex-col items-center justify-center rounded-l-[10px] bg-[#24131E] text-[#F6D59E]"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-lg">✦</span>
            <span className="mt-1 font-serif text-[9px] font-semibold">Passport</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
