

# Bold Cinematic WebGL — Complete Shader Overhaul

## Problem
The current shaders are too subtle — faint fog, tiny particles, dim colors. The effects barely register visually. The user wants **bold, dramatic, award-winning** cinematic quality.

## What Changes

### 1. Loading Screen — "Supernova Emergence" (LoadingScreen.tsx + loading-shaders.ts)

**Dramatically bolder shader effects:**
- **Intense energy vortex**: Replace faint fog with a swirling vortex of fire — high-contrast FBM with warped domain (rotating UV coordinates over time), bright orange/amber core fading to deep crimson edges
- **Shockwave rings**: Multiple expanding shockwave rings (not subtle sine ripples) — thick, bright, motion-blurred concentric rings that pulse outward from center with exponential falloff
- **Aggressive logo reveal**: Logo dissolves in with a bright burning edge effect (white-hot → orange → red falloff at the dissolve boundary), not just a soft threshold
- **Massive bloom/glow**: Add a fake bloom pass — sample the bright areas and blur them radially, creating an intense lens flare around the logo
- **Visible particles**: Increase particle size from 0.02 to 0.06, add per-particle size variation using a `size` buffer attribute, orange→white color gradient, higher opacity (0.8 vs 0.6)
- **Dramatic progress bar**: Replace the 3px bottom bar with a full-width energy beam that pulses and glows

**Phase timing — faster, punchier:**
- `void` (0-0.2s): Black with sudden noise flash
- `ignite` (0.2-0.6s): Explosive orange shockwave from center
- `bloom` (0.6-1.2s): Logo burns in with white-hot edges
- `reveal` (1.2-1.8s): Full logo, text sweeps in, particles orbiting
- `resolve` (1.8-2.5s): Settle to clean with residual glow

### 2. Cinematic Intro — "Genesis Event" (CinematicIntro.tsx + intro-shaders.ts)

**Multi-layer cinematic spectacle:**
- **Volumetric rays v2**: Replace the 30-sample radial blur with 60 samples, much higher intensity (3x current), pulsating brightness, rays that rotate slowly over time
- **Plasma background**: Replace faint dark fog with a visible animated plasma field — vivid orange/amber/crimson swirls using domain-warped FBM at high contrast
- **Anamorphic lens flare**: Horizontal streak across the center during bloom phase (typical of cinema lenses) — bright white core with orange falloff
- **Logo with intense bloom**: After dissolve, add a multi-sample radial glow around the logo (sample logo texture in a circle, accumulate brightness) creating a true bloom halo
- **Chromatic aberration 5x stronger**: Current 0.004 is invisible — increase to 0.02 during bloom, with RGB channel separation clearly visible
- **Text reveal with glow**: Each character gets a bright flash as it appears (not just fade), with an orange afterglow that settles
- **Film grain**: Increase grain intensity from 0.04 to 0.08 for cinematic feel
- **Dramatic vignette**: Deeper, darker edges (current is too mild)

**Particle overhaul:**
- Size: 0.02 → 0.05 with variation
- Add `color` attribute: gradient from deep orange to white based on distance
- Add orbital motion (not just linear drift) — particles spiral around center
- Opacity: 0.45 → 0.7

### 3. Loading Screen Component Updates (LoadingScreen.tsx)
- Add particle size variation via `size` buffer attribute
- Add particle color variation via `color` buffer attribute  
- Make particles start immediately (not wait for phase 0.5)

### 4. Cinematic Intro Component Updates (CinematicIntro.tsx)
- Same particle upgrades as loading screen
- Add spiral orbital motion to particle update loop

## Files Changed

| File | Change |
|------|--------|
| `src/components/ui/shaders/loading-shaders.ts` | Complete rewrite: intense vortex, shockwaves, burning dissolve edge, fake bloom, dramatic progress bar |
| `src/components/landing/shaders/intro-shaders.ts` | Complete rewrite: 60-sample god rays, plasma bg, anamorphic flare, intense bloom halo, 5x chromatic aberration, character flash reveal |
| `src/components/ui/LoadingScreen.tsx` | Bigger particles with size/color variation, earlier spawn |
| `src/components/landing/CinematicIntro.tsx` | Bigger particles with orbital motion, size/color attributes |

