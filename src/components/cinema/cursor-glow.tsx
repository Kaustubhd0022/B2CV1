"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useReducedMotion } from "motion/react";

export function CursorGlow() {
  const reducedMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const mouseX = useSpring(0, { stiffness: 250, damping: 28 });
  const mouseY = useSpring(0, { stiffness: 250, damping: 28 });

  useEffect(() => {
    // Check if device supports fine mouse pointer and is desktop width
    if (reducedMotion) return;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const isWide = window.innerWidth >= 1024;
    setIsDesktop(hasFinePointer && isWide);

    if (!hasFinePointer || !isWide) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - 160);
      mouseY.set(e.clientY - 160);
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => setIsVisible(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [reducedMotion, mouseX, mouseY, isVisible]);

  if (reducedMotion || !isDesktop || !isVisible) return null;

  return (
    <motion.div
      style={{
        x: mouseX,
        y: mouseY,
      }}
      className="pointer-events-none fixed top-0 left-0 z-10 size-80 rounded-full opacity-35 mix-blend-screen blur-3xl transition-opacity duration-500"
      aria-hidden="true"
    >
      <div className="h-full w-full rounded-full bg-gradient-radial from-amber-500/25 via-amber-600/10 to-transparent" />
    </motion.div>
  );
}
