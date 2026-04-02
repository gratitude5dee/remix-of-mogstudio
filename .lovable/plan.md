

# Build Cinema Studio (Movie Cast Builder) for /kanvas

## Overview
Create a new `CinemaStudioSection` component rendered as a fixed full-viewport overlay when `studio === "cinema"`, replacing the current generic fallback UI. Features a 280px project sidebar and a cinematic main canvas with hero typography, filter pills, and a genre poster carousel.

## Architecture

```text
┌───────────────────────────────────────────────┐
│ KanvasPage                                    │
│  studio === "cinema" → <CinemaStudioSection/> │
│    ┌────────────┬────────────────────────────┐ │
│    │ Project    │ Main Canvas:               │ │
│    │ Sidebar    │  • Hero "CRAFT YOUR DREAM" │ │
│    │ 280px      │  • Filter pills            │ │
│    │            │  • Genre poster carousel   │ │
│    │            │  • Floating FAB            │ │
│    └────────────┴────────────────────────────┘ │
└───────────────────────────────────────────────┘
```

## New File: `src/components/kanvas/CinemaStudioSection.tsx`

### Props
Receives cinema-related props from KanvasPage: `prompt`, `onPromptChange`, `cinemaSettings`, `onCinemaSettingsChange`, `currentModel`, `models`, `onModelChange`, `submitting`, `onGenerate`, `jobs`, `selectedJob`, `assets`.

### State
- `activeNav`: "master-files" | "scene-generator" | "voice-synth" | "vfx-stack" — sidebar navigation
- `activeFilter`: "genre" | "budget" | "era" | "archetype" | "identity" | "star-power" — filter pills

### Layout (fixed overlay, bg-[#090909])

**Left Sidebar (280px, bg-[#0e0e0e])**:
- Header: Lime sparkle icon circle + "Project Alpha" / "IN PRODUCTION"
- "NEW SEQUENCE" full-width lime button
- Nav items: Master Files (active, flush-left lime pill with `rounded-r-full`), Scene Generator, Voice Synth, VFX Stack
- Footer: Preferences, System Info links

**Main Canvas (ml-[280px])**:
- Massive watermark "CRAFT" at `text-[200px] text-white/[0.02]` behind content
- Hero: "CRAFT YOUR " (white) + "DREAM" (lime) / "MOVIE CAST" (white) — `text-7xl md:text-8xl font-black`
- Floating avatar circle to the right with pink glow shadow
- Filter pills row: Genre (active lime), Budget, Era, Archetype, Identity, Star Power (dark outline pills)
- Genre poster carousel: 3 cards (320×480px) — Adventure (pink overline), Sci-Fi (cyan overline), Noir (gray overline) with Unsplash images, gradient overlays, `group-hover:scale-105`
- Floating lime FAB (bottom-right, clapperboard icon, `w-20 h-20`)

### Cinema Controls Integration
The existing cinema camera settings (Camera, Lens, Focal Length, Aperture), model selector, and generate button from the current fallback block will be accessible when clicking the "Scene Generator" nav item — rendered below the carousel in a collapsible panel.

## KanvasPage Changes

**`src/pages/KanvasPage.tsx`**:
1. Import `CinemaStudioSection`
2. Add `studio === "cinema"` branch before the generic `else` fallback (after lipsync check)
3. Pass cinema props: `cinemaPrompt`, `setCinemaPrompt`, `cinemaCameraSettings`, `setCinemaCameraSettings`, cinema models, `handleGenerate`, `currentStudioJobs`, `selectedJob`, `assets`
4. The generic `else` block becomes effectively dead code (all studios now have dedicated components) but we leave it as a safe fallback

## Design System
- Backgrounds: `#090909`, `#0e0e0e`, `#131313`
- No opaque borders — `border-white/5`, `border-white/10`
- Lime `#ccff00` for active states, buttons, FAB
- Pink `#ff68a8` for Adventure overline, Cyan `#00d4ec` for Sci-Fi
- Space Grotesk for all display typography
- Hidden scrollbars on carousel

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/CinemaStudioSection.tsx` | **New** — Full cinema studio with sidebar, hero, carousel, FAB |
| `src/pages/KanvasPage.tsx` | Add `studio === "cinema"` branch rendering CinemaStudioSection with props |

