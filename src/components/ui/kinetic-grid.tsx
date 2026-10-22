"use client";

import React, { useRef, useEffect, useCallback, type ReactNode } from "react";
import { cx } from "@/components/ui";

// ── Math Helpers ─────────────────────────────────────────────────────────────

function lerpN(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

interface RgbaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

function lerpColor(c1: RgbaColor, c2: RgbaColor, t: number): string {
  const r = Math.round(lerpN(c1.r, c2.r, t));
  const g = Math.round(lerpN(c1.g, c2.g, t));
  const b = Math.round(lerpN(c1.b, c2.b, t));
  const a = +(lerpN(c1.a, c2.a, t)).toFixed(3);
  return `rgba(${r},${g},${b},${a})`;
}

// ── Theme Palettes ───────────────────────────────────────────────────────────

export type KineticGridTheme = "cultural-gold" | "monochrome" | "default";

interface ThemeConfig {
  bg: string;
  glow: string;       // "r,g,b"
  ripple: string;     // "r,g,b"
  nodeBase: RgbaColor;
  nodeActive: RgbaColor;
  lineColor: string;  // "r,g,b"
  lineOpacity: number;
}

const THEMES: Record<KineticGridTheme, ThemeConfig> = {
  // Bespoke TattvaCo Cultural Near-Black & Heritage Gold
  "cultural-gold": {
    bg: "#0C0B0A",
    glow: "214,179,106",
    ripple: "214,179,106",
    nodeBase: { r: 214, g: 179, b: 106, a: 0.18 },
    nodeActive: { r: 231, g: 201, b: 133, a: 0.95 },
    lineColor: "214,179,106",
    lineOpacity: 0.08,
  },
  monochrome: {
    bg: "#000000",
    glow: "255,255,255",
    ripple: "255,255,255",
    nodeBase: { r: 255, g: 255, b: 255, a: 0.15 },
    nodeActive: { r: 255, g: 255, b: 255, a: 0.9 },
    lineColor: "255,255,255",
    lineOpacity: 0.06,
  },
  default: {
    bg: "#161618",
    glow: "160,160,180",
    ripple: "180,180,200",
    nodeBase: { r: 200, g: 200, b: 220, a: 0.15 },
    nodeActive: { r: 255, g: 255, b: 255, a: 0.85 },
    lineColor: "200,200,220",
    lineOpacity: 0.06,
  },
};

// ── Configuration Constants ──────────────────────────────────────────────────

const GRID_SPACING = 38;
const MOUSE_RADIUS = 160;
const WARP_MAX = 22;
const NODE_BASE_RADIUS = 1.25;
const NODE_ACTIVE_RADIUS = 2.75;
const LERP_SPEED = 0.085;
const RIPPLE_SPEED = 0.38;
const RIPPLE_DURATION = 1400;

interface Ripple {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  born: number;
}

export interface KineticGridProps {
  children?: ReactNode;
  className?: string;
  globalColor?: KineticGridTheme;
  gridSpacing?: number;
  mouseRadius?: number;
  showConnectingLines?: boolean;
}

export default function KineticGrid({
  children,
  className,
  globalColor = "cultural-gold",
  gridSpacing = GRID_SPACING,
  mouseRadius = MOUSE_RADIUS,
  showConnectingLines = true,
}: KineticGridProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sizeRef = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const mouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const targetMouseRef = useRef<{ x: number; y: number }>({ x: -9999, y: -9999 });
  const ripplesRef = useRef<Ripple[]>([]);
  const rafRef = useRef<number | null>(null);

  const theme = THEMES[globalColor] || THEMES["cultural-gold"];

  // ── Compute warped grid point based on pointer & ripples ───────────────────

  const getWarpedPoint = useCallback(
    (gx: number, gy: number, now: number) => {
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const dx = gx - mx;
      const dy = gy - my;
      const dist = Math.hypot(dx, dy);

      let wx = gx;
      let wy = gy;
      let influence = 0;

      // Pointer gravitational displacement
      if (dist < mouseRadius && dist > 0) {
        const factor = 1 - dist / mouseRadius;
        influence = Math.sin(factor * Math.PI * 0.5);
        const pull = influence * WARP_MAX;
        wx += (dx / dist) * pull;
        wy += (dy / dist) * pull;
      }

      // Ripple displacements
      for (const r of ripplesRef.current) {
        const rdx = gx - r.x;
        const rdy = gy - r.y;
        const rdist = Math.hypot(rdx, rdy);
        const waveDist = Math.abs(rdist - r.radius);
        if (waveDist < 45 && rdist > 0) {
          const waveFactor = Math.cos((waveDist / 45) * Math.PI * 0.5) * r.opacity;
          wx += (rdx / rdist) * (waveFactor * 12);
          wy += (rdy / rdist) * (waveFactor * 12);
          influence = Math.max(influence, waveFactor);
        }
      }

      return { x: wx, y: wy, t: Math.min(1, Math.max(0, influence)) };
    },
    [mouseRadius],
  );

  // ── Draw Frame ──────────────────────────────────────────────────────────────

  const draw = useCallback(
    (now: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const { w, h } = sizeRef.current;
      if (w === 0 || h === 0) return;

      ctx.clearRect(0, 0, w, h);

      // Advance ripples
      const ripples = ripplesRef.current;
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        const age = now - r.born;
        if (age > RIPPLE_DURATION) {
          ripples.splice(i, 1);
        } else {
          r.radius += RIPPLE_SPEED * (now - (r.born + age * 0.8) + 16);
          r.opacity = Math.max(0, 1 - age / RIPPLE_DURATION);
        }
      }

      const cols = Math.ceil(w / gridSpacing) + 1;
      const rows = Math.ceil(h / gridSpacing) + 1;

      // Pre-compute warped grid points
      const points: { x: number; y: number; t: number }[][] = [];
      for (let r = 0; r < rows; r++) {
        points[r] = [];
        for (let c = 0; c < cols; c++) {
          const gx = c * gridSpacing;
          const gy = r * gridSpacing;
          points[r][c] = getWarpedPoint(gx, gy, now);
        }
      }

      // Optional connecting grid lines
      if (showConnectingLines) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            const p = points[r][c];
            if (c < cols - 1) {
              const right = points[r][c + 1];
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(right.x, right.y);
            }
            if (r < rows - 1) {
              const down = points[r + 1][c];
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(down.x, down.y);
            }
          }
        }
        ctx.strokeStyle = `rgba(${theme.lineColor},${theme.lineOpacity})`;
        ctx.lineWidth = 0.75;
        ctx.stroke();
      }

      // Draw Grid Nodes
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = points[r][c];
          const t = p.t;
          const radius = lerpN(NODE_BASE_RADIUS, NODE_ACTIVE_RADIUS, t);

          // Outer glow ring for active nodes
          if (t > 0.3) {
            const glowR = radius + lerpN(0, 7, (t - 0.3) / 0.7);
            const grd = ctx.createRadialGradient(
              p.x,
              p.y,
              radius * 0.5,
              p.x,
              p.y,
              glowR,
            );
            grd.addColorStop(0, `rgba(${theme.glow},${(t * 0.32).toFixed(3)})`);
            grd.addColorStop(1, `rgba(${theme.glow},0)`);
            ctx.beginPath();
            ctx.arc(p.x, p.y, glowR, 0, Math.PI * 2);
            ctx.fillStyle = grd;
            ctx.fill();
          }

          // Node circle fill
          ctx.beginPath();
          ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
          ctx.fillStyle = lerpColor(theme.nodeBase, theme.nodeActive, t);
          ctx.fill();
        }
      }

      // Ripple rings
      for (const r of ripples) {
        const safeRadius = Math.max(0, r.radius);
        if (safeRadius > 0 && r.opacity > 0.01) {
          ctx.beginPath();
          ctx.arc(r.x, r.y, safeRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(${theme.ripple},${(r.opacity * 0.35).toFixed(3)})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    },
    [getWarpedPoint, gridSpacing, showConnectingLines, theme],
  );

  // ── Animation Loop ──────────────────────────────────────────────────────────

  const animate = useCallback(
    (now: number) => {
      const m = mouseRef.current;
      const t = targetMouseRef.current;

      m.x = lerpN(m.x, t.x, LERP_SPEED);
      m.y = lerpN(m.y, t.y, LERP_SPEED);

      draw(now);
      rafRef.current = requestAnimationFrame(animate);
    },
    [draw],
  );

  // ── Setup & Listeners ───────────────────────────────────────────────────────

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      sizeRef.current = { w, h };
    };

    setSize();
    window.addEventListener("resize", setSize);

    const onMouseMove = (e: MouseEvent) => {
      targetMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const onClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        opacity: 1,
        born: performance.now(),
      });
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("click", onClick);
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", setSize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [animate]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div
      className={cx(
        "relative w-full min-h-screen overflow-hidden",
        className,
      )}
      style={{ backgroundColor: theme.bg }}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="fixed inset-0 size-full z-0 pointer-events-none"
      />

      <div className="relative z-10 size-full">{children}</div>
    </div>
  );
}
