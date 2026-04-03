# Redesign Edit Studio & Cinema Studio — MogStudio Reference Match

## Overview

Rewrite `EditStudioSection` and `CinemaStudioSection` to match the MogStudio reference screenshots. Also expand the backend model registry with edit-specific models and wire Cinema Studio to the existing generation pipeline.

## Phase 1: Edit Studio Redesign

### Reference Analysis (editpage1.png, editpage2.png)

- **Page 1**: Two-column left panel — "Features" list (Edit Video, Inpaint, Relight, AI Stylist, Upscale, Skin Enhancer, Angles) and "Models" list (Nano Banana Pro Inpaint, Nano Banana Inpaint, Product Placement, Topaz, Qwen-Edit Models, Grok Imagine Edit, Kling Motion Control, Kling 3.0 Omni Edit, Kling O1 Edit). Right side shows a centered image with "INPAINT" label, description, and "Upload media" button.
- **Page 2**: Active workspace — left vertical thumbnail strip of recent assets, center canvas with the edited image in a carousel with dots, floating tool palette (brush, eraser, etc.), bottom prompt bar "Draw a mask, upload an image, and optionally enter a prompt..." with an "Edit" button.

### `src/components/kanvas/EditStudioSection.tsx` — Full rewrite

**Landing State** (no asset selected):

- Two-column feature/model browser on the left (~560px total):
  - "Features" column: Edit Video, Inpaint (TOP badge), Relight (NEW badge), AI Stylist, Upscale, Skin Enhancer, Angles — each with icon + description
  - "Models" column: List of edit models with TOP/NEW badges, grouped by capability
- Right side: Centered preview card showing selected feature's example image, feature name in bold serif, description text, and "Upload media" rounded button

**Active Workspace** (asset selected):

- Left strip: Vertical thumbnail rail (~60px wide) with `+` upload button at top, scrollable asset thumbnails
- Center canvas: Large image display with carousel dots if multiple results, `< >` navigation arrows
- "Clear all" text link above tools
- Floating tool palette: Brush (lime active), Eraser, Hand, Undo, Redo | separator | Download, More menu
- Bottom prompt bar: Full-width dark panel — "Draw a mask, upload an image, and optionally enter a prompt..." input, `+ Add Product` pill, quality selector pill, "Edit" lime button on right

**Features as operations** (each maps to a fal endpoint):


| Feature           | Operation        | Endpoint                                               |
| ----------------- | ---------------- | ------------------------------------------------------ |
| Inpaint           | inpaint          | `fal-ai/flux-pro/v1/fill` (upgrade from SD inpainting) |
| Remove BG         | removeBackground | `fal-ai/imageutils/rembg` (existing)                   |
| Upscale           | upscale          | `fal-ai/seedvr/upscale/image/seamless`                 |
| Relight           | relight          | (placeholder — mark as coming soon)                    |
| AI Stylist        | stylize          | (placeholder)                                          |
| Skin Enhancer     | skinEnhance      | (placeholder)                                          |
| Angles            | angles           | (placeholder)                                          |
| Product Placement | productPlacement | `bria/embed-product`                                   |


### New Edit Models in `supabase/functions/_shared/kanvas.ts`

Add an `edit` studio type to the backend model registry:

```
KanvasStudio = 'image' | 'video' | 'edit' | 'cinema' | 'lipsync'
```

New models under `studio: 'edit'`:

- Nano Banana Pro Inpaint (`fal-ai/nano-banana/pro/edit`) — 8 credits, TOP
- Nano Banana Inpaint (`fal-ai/nano-banana-2/edit`) — 5 credits
- FLUX Pro Fill (`fal-ai/flux-pro/v1/fill`) — 7 credits, TOP
- GPT Image 1.5 Edit (`fal-ai/gpt-image-1-5/edit`) — 4 credits
- Grok Imagine Edit (`fal-ai/grok-imagine/edit`) — 5 credits
- Seedream 5 Edit (`fal-ai/seedream-5-lite/edit`) — 6 credits, NEW
- Topaz/Upscale (`fal-ai/seedvr/upscale/image/seamless`) — 3 credits
- Product Placement (`bria/embed-product`) — 6 credits

### Update `image-edit-operation` Edge Function

- Add `upscale` and `productPlacement` to SUPPORTED_OPERATIONS
- Upgrade inpaint model from `fal-ai/stable-diffusion-inpainting` to `fal-ai/flux-pro/v1/fill`
- Add model selection parameter so frontend can specify which edit model to use
- Add cost overrides in `_shared/credits.ts`

## Phase 2: Cinema Studio Redesign

### Reference Analysis (cinemastudiopage1-3.png)

- **Page 1**: Dark background with gradient sky, "CINEMA STUDIO 2.5" label, large "What would you shoot with infinite budget?" heading. Modal overlay showing "Characters & Locations" with tabs (Recently attached, Image Generations, Liked, Characters & Locations). Bottom bar: Image/Video mode toggle, prompt "india", Scenes pill, 1/4 counter, 16:9, 2K quality, Characters & Locations button, GENERATE lime button with credit cost.
- **Page 2**: "Camera movement" preset grid — Static, Handheld, Zoom Out, Zoom in, Camera follows, Pan left (2 rows of thumbnails). Director Panel below with character slots, Movement: Auto dropdown, speed ramp slider, Speed ramp: Auto, Duration: 12s. Bottom bar: prompt input, Single shot pill, 16:9, 1080p, General style, Sound On, 1/4 counter, START FRAME / END FRAME buttons, GENERATE ✦ 24.
- **Page 3**: "Cast" tab — "Craft Your Dream Movie Cast" heading with floating character circle avatars. Filter pills: Genre, Budget in millions, Era, Archetype, Identity, Physical Appearance, Details, Outfit. Genre carousel: Action, Adventure, Comedy, Drama, Thriller, Horror, Detective, Romance cards. Bottom: shuffle icon + Generate lime button.

### `src/components/kanvas/CinemaStudioSection.tsx` — Full rewrite

**Accept props** from KanvasPage (currently receives none):

```ts
interface CinemaStudioProps {
  prompt: string;
  onPromptChange: (v: string) => void;
  cinemaSettings: Record<string, unknown>;
  onCinemaSettingsChange: (s: Record<string, unknown>) => void;
  cinemaCameraSettings: KanvasCinemaSettings;
  onCinemaCameraSettingsChange: (s: KanvasCinemaSettings) => void;
  currentModel: KanvasModel | null;
  models: KanvasModel[];
  onModelChange: (id: string) => void;
  submitting: boolean;
  onGenerate: () => void;
  jobs: KanvasJob[];
  selectedJob: KanvasJob | null;
  assets: KanvasAsset[];
  onUpload: (file: File, type: KanvasAssetType) => void;
  uploading: boolean;
}
```

**Layout — 3 sub-tabs**: Image | Video | Cast (top nav, matching reference)

**Left sidebar** (~56px icon rail): Search, character avatar slots (circular thumbnails with lime active ring)

**Image sub-tab**:

- Gradient sky background (dark purple to black)
- "CINEMA STUDIO 2.5" label
- "What would you shoot with infinite budget?" heading (large, pink gradient text)
- Asset attachment modal (Recently attached, Image Generations, Liked, Characters & Locations)
- Characters section: "Reuse characters across scenes" + Create Character button
- Locations section: "Keep every scene in the same world" + Create Location button

**Video sub-tab**:

- Camera movement preset grid (Static, Handheld, Zoom Out, etc.) — 2 rows of thumbnail cards
- Director Panel: Character slots, Movement dropdown (Auto), speed ramp slider, Duration selector
- Bottom bar: prompt, Single shot, aspect ratio, resolution, style, sound toggle, frame count, Start/End frame buttons, GENERATE

**Cast sub-tab** (existing genre carousel, improved):

- Floating character circle avatars composition
- "Craft Your Dream Movie Cast" centered heading
- Filter pills row: Genre, Budget in millions, Era, Archetype, Identity, Physical Appearance, Details, Outfit
- Genre card carousel with `< >` arrows: Action, Adventure, Comedy, Drama, Thriller, Horror, Detective, Romance
- Bottom: Shuffle + Generate button

**Bottom prompt bar** (persistent across all sub-tabs):

- Image/Video mode toggle (left)
- Prompt input: "Describe your scene - use @ to add characters & locations"
- Scenes pill, count stepper (1/4), aspect ratio (16:9), quality (2K), Characters & Locations button
- GENERATE lime button with dynamic credit cost

### KanvasPage.tsx Updates

Pass cinema props to `CinemaStudioSection`:

```tsx
<CinemaStudioSection
  prompt={cinemaPrompt}
  onPromptChange={setCinemaPrompt}
  cinemaSettings={cinemaSettings}
  onCinemaSettingsChange={setCinemaSettings}
  cinemaCameraSettings={cinemaCameraSettings}
  onCinemaCameraSettingsChange={setCinemaCameraSettings}
  currentModel={currentCinemaModel}
  models={currentCinemaModels}
  onModelChange={(id) => { setCinemaModelId(id); setCinemaSettings({}); }}
  submitting={submitting}
  onGenerate={() => void handleGenerate()}
  jobs={currentStudioJobs}
  selectedJob={selectedJob}
  assets={assets}
  onUpload={handleAssetUpload}
  uploading={uploadingByType.image}
/>
```

## Phase 3: Backend Model Expansion

### `supabase/functions/_shared/kanvas.ts`

- Add `'edit'` to `KanvasStudio` type
- Add ~8 edit models under `studio: 'edit'`
- Add cinema video models (Kling 3.0 cinema presets) for the Video sub-tab

### `supabase/functions/_shared/credits.ts`

- Add cost overrides for all new edit model IDs

### `supabase/functions/image-edit-operation/index.ts`

- Add `upscale` operation using `fal-ai/seedvr/upscale/image/seamless`
- Add optional `modelId` parameter for model-specific inpainting
- Upgrade default inpaint model to FLUX Pro Fill
- Deploy updated function

## Design System Compliance

- True black `#0A0A0A` / `#090909` backgrounds
- Neon lime `#BEFF00` / `#ccff00` for CTAs and active states
- Surface cards `#1A1A1A` with `border-white/[0.06]`
- Space Grotesk headings, Inter body
- TOP badge: coral/red pill; NEW badge: lime pill
- 200-300ms transitions, hidden scrollbars
- Drag-and-drop upload zones with dashed lime border

## Files Changed


| File                                               | Change                                                                 |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `src/components/kanvas/EditStudioSection.tsx`      | Full rewrite — 2-state layout (browser + workspace), MogStudio edit UI |
| `src/components/kanvas/CinemaStudioSection.tsx`    | Full rewrite — 3 sub-tabs (Image/Video/Cast), props, generation wiring |
| `src/pages/KanvasPage.tsx`                         | Pass cinema props to CinemaStudioSection                               |
| `supabase/functions/_shared/kanvas.ts`             | Add `'edit'` to KanvasStudio, add ~8 edit models                       |
| `supabase/functions/_shared/credits.ts`            | Add cost overrides for edit models                                     |
| `supabase/functions/image-edit-operation/index.ts` | Add upscale op, upgrade inpaint model, add modelId param               |
