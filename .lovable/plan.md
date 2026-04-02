

# Build Cinematic "Image" View for /kanvas

## Overview
Create a new `ImageStudioSection` component that renders when `studio === "image"`, replacing the legacy shared UI with a dedicated Noir Futurist layout matching the reference screenshot. This follows the same pattern already established by `VideoStudioSection`.

## Architecture

The component renders its own full-width layout with:
- **Left Sidebar** (260px fixed) — Studio Features, AI Models, Storage Usage
- **Main Content** (remaining width) — Hero typography, preset gallery cards
- **Floating Prompt Bar** (fixed bottom) — Input + model pill + aspect ratio + generate button
- **Footer Meta** — Copyright line at bottom

## New Component

### `src/components/kanvas/ImageStudioSection.tsx`

**Props** — Same pattern as VideoStudioSection: `prompt`, `onPromptChange`, `referenceId`, `onReferenceChange`, `currentModel`, `models`, `onModelChange`, `settings`, `onSettingsChange`, `submitting`, `onGenerate`, `jobs`, `selectedJob`, `assets`, `uploading`, `onUpload`, `pageLoading`.

**Left Sidebar:**
- Fixed position, 260px wide, full height below header
- "STUDIO FEATURES" section: Active "Create Image" lime pill (bg-[#ccff00] text-black), inactive items (Cinema Studio, Soul ID, AI Influencer, Photodump) in text-zinc-400
- "AI MODELS" section: List from `models` prop. Active model gets lime border + lightning icon + checkmark. Others plain zinc
- "STORAGE USAGE" pinned to bottom: 64% bar in lime, glass "Upgrade Plan" button

**Main Content (ml-[260px]):**
- Hero: "TURN IDEAS" (white) + "INTO VISUALS" (lime) in Space Grotesk 8xl, centered
- Subtitle in zinc-400
- Horizontal scroll preset gallery: 3+ cards (min-w-[340px], aspect-[4/5], rounded-3xl) with gradient overlays, lime overline categories (PRESET, ENVIRONMENT, CHARACTERS), white titles, hover scale effect
- Cards use placeholder cinematic gradients (no external images needed — dark atmospheric gradient backgrounds)

**Floating Prompt Bar (fixed bottom):**
- Massive pill: bg-[#131313]/90 backdrop-blur-2xl rounded-full
- "+" button (circular glass), textarea input, model pill (lime lightning + model name), aspect ratio pill (📷 3:4), count pill, settings icon, lime "GENERATE ✦" button (rounded-full, bg-[#ccff00])
- Submitting state shows spinner

**Footer:**
- Bottom-pinned meta line: "© 2024 WZRD.STUDIO • THE NOIR FUTURIST" left, "PRIVACY TERMS API" right

### Integration in `src/pages/KanvasPage.tsx`

Add `studio === "image"` branch alongside the existing `studio === "video"` check (line 1228), rendering `<ImageStudioSection>` with the same props currently passed to the legacy UI for image mode. The legacy `else` block then only handles `cinema` and `lipsync`.

**Top nav:** When `studio === "image"`, the existing `StudioNavButton` already highlights the active tab. The new component renders its own sidebar, so the page-level aside is skipped (same as video).

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/ImageStudioSection.tsx` | **New** — Full cinematic image studio layout |
| `src/pages/KanvasPage.tsx` | Add `studio === "image"` branch rendering ImageStudioSection before the video check |

