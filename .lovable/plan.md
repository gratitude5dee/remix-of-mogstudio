

# Build Lipsync Production Studio

## Overview
Create a new `LipsyncStudioSection` component rendered as a fixed full-viewport overlay (same pattern as Image/Video/Edit studios) when `studio === "lipsync"`. It features a left sidebar wizard navigation and three switchable views: Lipsync Dashboard, UGC Templates, and Audio Settings.

## Architecture

```text
┌─────────────────────────────────────────────────────┐
│ KanvasPage (existing)                               │
│  studio === "lipsync" → <LipsyncStudioSection />    │
│    ┌──────────┬────────────────────────────────────┐ │
│    │ Wizard   │ activeView switches between:       │ │
│    │ Sidebar  │  • LipsyncDashboard (default)      │ │
│    │ 260px    │  • UGCTemplates                     │ │
│    │          │  • UGCAudioSettings                 │ │
│    └──────────┴────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

## New File: `src/components/kanvas/LipsyncStudioSection.tsx`

### Props
Receives all lipsync-related props from KanvasPage: `prompt`, `onPromptChange`, `lipsyncMode`, `onLipsyncModeChange`, `imageId`, `videoId`, `audioId`, `onImageChange`, `onVideoChange`, `onAudioChange`, `currentModel`, `models`, `onModelChange`, `submitting`, `onGenerate`, `jobs`, `selectedJob`, `assets` (image/video/audio arrays), `uploading*`, `onUpload`.

### State
- `activeStep`: "script" | "voice" | "avatar" | "environment" | "render" — drives sidebar highlight and which view renders
- `selectedTemplate`: string | null — for UGC template selection

### Layout (fixed overlay, bg-[#000000])
- Film grain overlay div with SVG noise pattern, `mix-blend-overlay opacity-20`
- Left sidebar 260px (`bg-[#090909]`)
- Main content `ml-[260px]` scrollable

### Left Sidebar (`<WizardSidebar>`)
- Header: "UGC FACTORY" in lime, "PRODUCTION WIZARD" in muted gray
- 5 nav steps: Script, Voice, Avatar, Environment, Render
  - Active: `bg-[#ccff00] text-black font-bold rounded-full`
  - Inactive: `text-zinc-500 hover:text-white`
- Footer: Support, Archive links + "Export Project" pill button

### View Mapping
- **Script** step → `<LipsyncDashboard>` — the main lipsync generation view
- **Voice** step → `<UGCAudioSettings>` — language, accent, voice type, emotion, preview player
- **Avatar** step → `<UGCTemplates>` — template grid with cinematic cards
- **Environment / Render** → placeholder panels (styled consistently)

### LipsyncDashboard (Reference: screen-19)
- Hero: "LIPSYNC MODELS," (white) + "ONE CLICK AWAY" (lime), massive Space Grotesk
- Two-column layout:
  - **Left**: Upload asset card (dark glass, lime upload icon), Audio toggle pills ("Audio Text" active lime / "Generate Audio" inactive), Script textarea with char count, massive lime Generate button
  - **Right**: 3 workflow step cards (01 Upload, 02 Generate, 03 Select) with lime left border on active, Latest Render card with preview image + metadata + Preview/Upscale pills
- Wired to real props: upload triggers `onUpload`, Generate calls `onGenerate`, prompt uses `prompt`/`onPromptChange`

### UGCTemplates (Reference: screen-21)
- Hero: "Choose your " + "Template" (lime)
- 3-column grid of tall cards with gradient overlays, category labels, titles
- Selected card gets `border-2 border-[#ccff00]` + lime checkmark
- Floating lime circle FAB bottom-right with arrow

### UGCAudioSettings (Reference: screen-20)
- Hero: "AUDIO " + "SETTINGS" (lime)
- Two dropdowns (Language, Accent) side by side
- Voice Type pill row (Whispers active lime, others dark)
- Emotional Delivery 6-card grid (Happy active with lime border)
- Voice Preview player bar at bottom with play button, waveform, timestamps
- "NEXT STEP" lime pill button bottom-right

## KanvasPage Changes

**`src/pages/KanvasPage.tsx`**:
1. Import `LipsyncStudioSection`
2. Add `studio === "lipsync"` branch before the generic `else` fallback (after `character-creation` check), rendering `<LipsyncStudioSection>` with all lipsync props passed through
3. Remove the lipsync-specific code from the generic else block (the `studio === "lipsync"` conditionals for mode buttons, asset selectors, prompt logic) — these are now handled inside the new component

## Design System Compliance
- All backgrounds: `#000000`, `#090909`, `#0e0e0e`, `#131313`
- No opaque borders — only `border-white/5` or `border-white/10`
- Lime accent `#ccff00` for active states, buttons, highlights
- Hot pink `#ff3399` for Upscale button accent
- Space Grotesk for all display typography
- Film grain SVG noise overlay on main content
- Hidden scrollbars via `scrollbar-hide` / custom CSS

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/LipsyncStudioSection.tsx` | **New** — Full lipsync production wizard with 3 views |
| `src/pages/KanvasPage.tsx` | Add `studio === "lipsync"` branch rendering LipsyncStudioSection with props |

