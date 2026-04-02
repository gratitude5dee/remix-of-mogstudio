

# Build Edit Video & Motion Control Tab Views

## Problem
The "Edit Video" and "Motion Control" tabs in `VideoStudioSection` exist but don't change the UI — all three tabs show the same "Create Video" content.

## Plan

### File: `src/components/kanvas/VideoStudioSection.tsx`

Refactor the component to render different sidebar + main content based on `activeTab`:

**When `activeTab === "create"`** — keep existing UI (dropzones for start/end frame, prompt, model settings, feature bento grid, recent creations).

**When `activeTab === "edit"`** (per reference screenshot):
- **Sidebar:**
  - Headline: "Edit Video" + subtitle "Refine and manipulate cinematic shots with AI precision."
  - Single large dropzone: "PRIMARY VIDEO SOURCE" — accepts video files (MP4, MOV), aspect-video
  - "REFERENCE ELEMENTS (UP TO 4)" — row of 4 circular `+` buttons for reference images
  - "EDIT PROMPT" textarea with placeholder "Describe the change you want... (e.g., 'Change her hair to neon pink and make the phone glow with digital sparks')"
  - "AUTO SETTINGS" toggle row with "ACTIVE" label
  - Model row: "Kling 01 Edit" display + Quality "720p HQ"
  - Bottom action bar: Version History, Collaborate, Export Frame, Download HD buttons
- **Main area:** Large preview panel showing uploaded video or "PREVIEW MODE" watermark text when empty

**When `activeTab === "motion"`** (per reference screenshot):
- **Main area (left, wider):**
  - Massive hero: "RECREATE ANY [MOTION] WITH YOUR IMAGE" (Space Grotesk, lime accent on [MOTION])
  - Subtitle about neural animation engine
  - "Start by copying motion from library" header with lime underline + "VIEW ALL LIBRARY →"
  - Row of 5 tall vertical video cards (aspect-[9/16]) with cinematic placeholders, dark gradient overlay, lime play icon pill, lime title text
- **Right control panel (sticky):**
  - "ADD MOTION TO COPY" dropzone (aspect-video, dashed)
  - "ADD YOUR CHARACTER" dropzone (narrower, aspect-square)
  - Model: "Kling 3.0 Motion Control" in lime
  - Quality: 720P / 1080P pills
  - Scene Control toggle
  - VIDEO / IMAGE segmented control
  - "GENERATE MOTION" CTA button (lime, full-width, rounded-full)
- **Bottom:** WZRD Tip card with lime left border

### Structure
Extract tab content into three internal render functions: `renderCreateTab()`, `renderEditTab()`, `renderMotionTab()`. The top-level layout switches based on `activeTab`. The existing props (prompt, onGenerate, models, etc.) are reused across tabs where applicable.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/VideoStudioSection.tsx` | Add `renderEditTab()` and `renderMotionTab()` content; switch layout by `activeTab` |

