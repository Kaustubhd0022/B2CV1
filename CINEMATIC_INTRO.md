# TattvaCo Cinematic Sign-In Experience

This document details the cinematic opening choreography, architecture, timing configurations, and testing options for the TattvaCo passport sign-in experience (`/sign-in`).

---

## 1. Opening Choreography (Slower Ceremonial Sequence)

| Timestamp | Phase | Visual Motion Description | Component |
| :--- | :--- | :--- | :--- |
| **0.0s – 1.6s** | **Auspicious Star Draw** | SVG path stroke-dash draw of the 4-pointed `✦` emblem centered over the deep forest backdrop (`#141d18`) with a warm radial diya aura. | `src/components/cinema/intro-splash.tsx` |
| **1.6s – 2.6s** | **Meditative Hold & Dissolve** | Emblem holds with warm breathing light, then smoothly dissolves into the hero scene over 1.0s. | `src/components/cinema/intro-splash.tsx` |
| **2.0s – 3.8s** | **Ghats Unveiling** | Gentle 1.8s fade on Varanasi Manikarnika Ghats through the authentic forest overlay (`#141d18` / `#1b2620` / `#18231e`) with slow 18s Ken Burns drift. | `src/components/cinema/cinematic-sign-in.tsx` |
| **2.6s – 3.7s** | **Brand Crest Reveal** | Stately entrance for **TATTVACO** followed by tagline type-in *"Culture lives in connections"* at 3.2s. | `src/components/cinema/reveal-text.tsx` |
| **3.6s – 4.8s** | **Headline Mask-Up & Shimmer** | Display serif headline reveals line-by-line ("Discover India" at 3.6s, "Differently" at 4.0s, Subtitle at 4.5s), finishing with a glowing saffron shimmer sweep across *"Differently"* at 4.8s. | `src/components/cinema/reveal-text.tsx` |
| **4.2s – 5.5s** | **Passport Auth Card** | Warm off-white card ascends gracefully (`y: 40px -> 0px`, `duration: 1.3s`) with breathing saffron border pulse. | `src/app/sign-in/auth-card.tsx` |
| **5.2s – 6.2s** | **7 Dimension Chips** | Gentle spring entrance with 0.12s stagger for Places, People, Festivals, Food, Crafts, History, and Traditions. | `src/components/cinema/dimension-chips.tsx` |
| **6.2s – 7.4s** | **6 Pilot City Cards** | Smooth slide-up with 0.14s stagger and 3D perspective tilt for Varanasi, Jaipur, Hampi, Kochi, Kolkata, and Madurai. | `src/components/cinema/tilt-card.tsx` |

---

## 2. Micro-Interactions & Ambient Layers

- **Ambient Diya Sparks**: An ultra-lightweight `<canvas>` rendering 28 drifting ember particles (16 on mobile) with natural sine-wave oscillation, kept under 60fps budget.
- **Water Ripple Shimmer**: CSS linear-gradient counter-shimmer reflecting sacred river waters across the bottom edge.
- **Pilot City Parallax Tilt**: Gyroscopic 3D mouse tracking (`rotateX`, `rotateY`, `scale: 1.04`) with dynamic city-tint shifting.
- **Dimension Chip Magnetic Physics**: Dynamic spring hover with amber indicator sweep.
- **Desktop Lantern Cursor**: Ambient soft gold radial glow tracking the user's cursor (`src/components/cinema/cursor-glow.tsx`).
- **Input Focus Ring**: Warm saffron glow ring (`focus:ring-2 focus:ring-amber-500/25`) on auth inputs.
- **Exit Curtain**: Seamless dark forest curtain with pulsing `✦` emblem during verification (`src/components/cinema/exit-curtain.tsx`).

---

## 3. Configuration & Timings

All motion timings, easing curves, and spring physics are centralized in [`src/lib/motion.config.ts`](file:///Users/kaustubharvinddeshmukh/B2C%20Phase%201/src/lib/motion.config.ts):

```typescript
export const MOTION_TIMINGS = {
  logoDrawDuration: 1.6,
  splashHold: 1.0,
  splashDissolveDuration: 1.0,
  bgRevealStart: 2.0,
  bgRevealDuration: 1.8,
  brandTitleStart: 2.6,
  taglineStart: 3.2,
  headlineStart: 3.6,
  authCardStart: 4.2,
  chipsStart: 5.2,
  citiesStart: 6.2,
};
```

### Customizing Easing Curves
Modify `EASING` in [`src/lib/motion.config.ts`](file:///Users/kaustubharvinddeshmukh/B2C%20Phase%201/src/lib/motion.config.ts):
- `natural`: `[0.22, 1, 0.36, 1]` (custom cubic bezier for organic deceleration)
- `dramatic`: `[0.16, 1, 0.3, 1]` (fast start with sustained glide)
- `snappy`: `[0.4, 0, 0.2, 1]` (crisp micro-interaction feedback)

---

## 4. Testing & Disabling the Intro

### Disabling / Re-triggering the Intro in Browser
The full 3.5s sequence runs once per session. Returning visits use an instant 0.6s subtle fade.

1. **Re-trigger full 3.5s sequence**:
   Open browser DevTools Console (`F12`) and run:
   ```javascript
   sessionStorage.removeItem("tc_cinema_intro_seen_v1");
   location.reload();
   ```

2. **Skip or Test Reduced Motion**:
   - In Chrome DevTools: Press `Cmd+Shift+P` -> Type `Rendering` -> Enable **"Emulate CSS media feature prefers-reduced-motion: reduce"**.
   - The app instantly switches to zero-motion, high-contrast, fully accessible static layout.
