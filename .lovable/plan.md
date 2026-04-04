

# Cinematic WebGL Loading + Intro Animation + Sidebar Position Sync

## Overview

Three workstreams: (1) Replace the basic `PerfShell` skeleton and `LoadingScreen` with a cinematic WebGL shader animation featuring the WZRD logo, (2) Enhance the landing `CinematicIntro` to a next-level shader experience, (3) Unify collapsed sidebar positioning across Home and Kanvas pages.

Note: **Pretext** (`@chenglou/pretext`) is a text measurement/layout library for computing text dimensions without DOM. It is useful for rendering precise text in Canvas/SVG/WebGL contexts. We will use it to render the "WZRD STUDIO" wordmark as measured text overlays on the WebGL canvas, ensuring pixel-perfect text positioning without triggering browser reflow.

---

## 1. New Cinematic Loading Screen (`LoadingScreen.tsx`)

Replace the current Framer Motion-based loading screen with a full WebGL shader animation:

**Shader Design — "Void Emergence":**
- Full-screen fragment shader with no Three.js scene graph (single fullscreen quad via `@react-three/fiber`)
- **Layer 1 — Void fog**: Animated FBM (fractional Brownian motion) noise creating swirling dark fog with orange-amber highlights
- **Layer 2 — Energy field**: Concentric ripple distortion emanating from center, driven by `sin(distance * freq - uTime)`
- **Layer 3 — Logo reveal**: Load `wzrdtechlogo.png` as texture, dissolve-in using Perlin noise threshold (similar to existing `CinematicIntro` but higher quality with multi-octave noise)
- **Layer 4 — Particle sparks**: GPU-driven particle system (instanced points) spiraling inward toward logo center
- **Layer 5 — Lens effects**: Chromatic aberration + radial blur that intensifies during bloom phase, then resolves to clean

**Pretext Integration:**
- Use `@chenglou/pretext` `prepare()` + `layout()` to measure the "WZRD STUDIO" text dimensions
- Render the text as a Canvas2D texture (CanvasTexture) with exact positioning from Pretext measurements
- Overlay as a second shader plane beneath the logo, fading in during the "reveal" phase with a typewriter dissolve effect

**Phase Sequence (2.5s total):**
1. `void` (0-0.3s): Pure black, subtle noise begins
2. `ignite` (0.3-0.8s): Orange energy pulse from center, particles spawn
3. `bloom` (0.8-1.4s): Logo fades in through noise dissolve, chromatic aberration peaks
4. `reveal` (1.4-2.0s): Full logo visible, text appears below, particles settle
5. `resolve` (2.0-2.5s): Effects fade, clean logo + text remain, then screen fades out

**Fallback:** If WebGL unavailable, show a minimal CSS animation (orange pulse + logo fade-in).

### Files:
- **`src/components/ui/LoadingScreen.tsx`** — Complete rewrite with WebGL Canvas
- **`src/components/ui/shaders/loading-shaders.ts`** — New file: vertex + fragment GLSL for the void fog + energy field

---

## 2. Enhanced Cinematic Intro (`CinematicIntro.tsx`)

Upgrade the existing intro from a single dissolve effect to a multi-pass cinematic sequence:

**New Shader Layers:**
- **Pass 1 — Volumetric light rays**: God rays emanating from logo center using radial blur in screen-space
- **Pass 2 — Heat distortion**: Barrel distortion + chromatic split that pulses with the bloom phase
- **Pass 3 — Edge detection glow**: Sobel filter on the logo alpha channel to create an energy-line effect around logo edges (not just the noise-based edge glow)
- **Pass 4 — Film grain overlay**: Subtle animated grain for cinematic feel

**Pretext Text Rendering:**
- Render "WZRD STUDIO" as a Pretext-measured CanvasTexture
- Text animates with a per-character stagger reveal (each character dissolves in using its own noise seed)
- Measure with `layout()` for exact centering regardless of viewport

**Updated Phase Timing (6s total):**
1. `dark` (0-0.6s): Void with faint grain
2. `rays` (0.6-1.5s): Volumetric light rays pulse outward
3. `bloom` (1.5-2.5s): Logo dissolves in with intense bloom + chromatic aberration
4. `reveal` (2.5-4.0s): Full logo, text staggers in character-by-character
5. `resolve` (4.0-5.0s): Effects settle, clean presentation
6. `fadeout` (5.0-6.0s): Smooth opacity transition out

**Ambient Particles Enhancement:**
- Increase count from 120 to 300
- Add size variation based on distance from camera
- Color gradient: deep orange → amber → white for depth

### Files:
- **`src/components/landing/CinematicIntro.tsx`** — Major upgrade with multi-pass shaders
- **`src/components/landing/shaders/intro-shaders.ts`** — New file: all GLSL code for the intro

---

## 3. Unified Sidebar Positioning

Currently the collapsed sidebars differ:
- **Home**: `top-[calc(50%+62px)]` with trigger zone `top-[68px]`
- **Kanvas**: `top-[calc(50%-1.5rem)]` with trigger zone `top-0 h-[calc(100vh-2rem)]`

**Fix:** Standardize both to the same vertical center calculation accounting for the header height (68px) and ensuring they don't overlap the bottom bar:
- Both sidebars: `top-[calc(50%+34px)] -translate-y-1/2` (centers in the available space below header)
- Both trigger zones: `top-[68px] bottom-[56px] md:bottom-0` (clears header and mobile bottom nav)

### Files:
- **`src/components/home/Sidebar.tsx`** — Update collapsed pill position from `top-[calc(50%+62px)]` to `top-[calc(50%+34px)]`, trigger zone to `top-[68px] bottom-[56px]`
- **`src/components/kanvas/KanvasSidebar.tsx`** — Update from `top-[calc(50%-1.5rem)]` to `top-[calc(50%+34px)]`, trigger zone to `top-[68px] bottom-0`

---

## 4. PerfShell Update

Update `PerfShell.tsx` to replace "Preparing your creative workspace" with "Preparing your generative workspace" (per brand guidelines), and update headline default to "Initializing studio".

### Files:
- **`src/components/perf/PerfShell.tsx`** — Update default text strings

---

## Dependencies

- `@chenglou/pretext` — Install for text measurement (used in both loading screen and intro)
- Existing: `@react-three/fiber@^8.18`, `@react-three/drei@^9.122.0`, `@react-three/postprocessing`, `three`, `framer-motion`

---

## Files Changed Summary

| File | Change |
|------|--------|
| `src/components/ui/LoadingScreen.tsx` | Full rewrite: WebGL shader loading animation with Pretext text |
| `src/components/ui/shaders/loading-shaders.ts` | New: GLSL shaders for void fog + energy field |
| `src/components/landing/CinematicIntro.tsx` | Major upgrade: multi-pass shaders, volumetric rays, Pretext text |
| `src/components/landing/shaders/intro-shaders.ts` | New: GLSL shaders for intro (god rays, heat distortion, grain) |
| `src/components/home/Sidebar.tsx` | Sync collapsed pill position to `top-[calc(50%+34px)]` |
| `src/components/kanvas/KanvasSidebar.tsx` | Sync collapsed pill position to `top-[calc(50%+34px)]` |
| `src/components/perf/PerfShell.tsx` | Update default text: "generative workspace" |
| `package.json` | Add `@chenglou/pretext` dependency |

