"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  alpha: number;
  maxAlpha: number;
  vx: number;
  vy: number;
  hue: number;
  pulseSpeed: number;
}

export function AmbientSparks() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize, { passive: true });

    // Under 32 particles for maximum performance (60fps)
    const count = window.innerWidth < 768 ? 16 : 28;
    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.8 + 0.6,
        alpha: Math.random() * 0.6 + 0.2,
        maxAlpha: Math.random() * 0.5 + 0.3,
        vx: (Math.random() - 0.5) * 0.3,
        vy: -(Math.random() * 0.45 + 0.2), // gentle upward float
        hue: Math.random() > 0.6 ? 40 : 32, // golden saffron to deep amber
        pulseSpeed: Math.random() * 0.02 + 0.01,
      });
    }

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const render = () => {
      if (!isVisible) {
        animId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < count; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.01;

        // Wrap around smoothly
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const currentAlpha = Math.max(0.1, Math.min(p.maxAlpha, p.alpha));

        // Draw soft glowing diya spark
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.5);
        grad.addColorStop(0, `hsla(${p.hue}, 95%, 75%, ${currentAlpha})`);
        grad.addColorStop(0.5, `hsla(${p.hue}, 90%, 55%, ${currentAlpha * 0.5})`);
        grad.addColorStop(1, `hsla(${p.hue}, 85%, 45%, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <>
      {/* Floating Saffron Diya Sparks Canvas */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-75"
        aria-hidden="true"
      />

      {/* Faint Sacred River Water Ripple Shimmer at the lower edge */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 h-40 z-0 bg-gradient-to-t from-[#20101B]/40 via-transparent to-transparent opacity-60 mix-blend-screen"
        aria-hidden="true"
        style={{
          maskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
          WebkitMaskImage: "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)",
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-amber-600/10 via-amber-700/5 to-transparent animate-water-shimmer" />
      </div>
    </>
  );
}
