

# Comprehensive Kanvas Image & Video Studio Audit + Model Expansion

## Overview
Expand the model catalog from ~15 to 40+ models across Image and Video studios, update the UI of both sections to match MogStudio reference quality, and verify end-to-end generation via fal.ai.

## Architecture Decision: Hardcoded Models (not DB table)
The current system uses a hardcoded `KANVAS_MODELS` array in `_shared/kanvas.ts` — the frontend calls `falai-models` edge function which returns from this array. Creating a `models` DB table would require rewriting the entire model resolution pipeline (edge function, service layer, type system). Instead, we expand the hardcoded array with all new models and add cost overrides. This is the correct approach for the existing architecture.

## Phase 1: Model Registry Expansion

### `supabase/functions/_shared/kanvas.ts` — Add ~30 new models

**New Image Models (text-to-image):**
- FLUX.2 Pro (`fal-ai/flux-pro/v2`) — 7 credits
- FLUX.2 Pro v1.1 (`fal-ai/flux-pro/v1.1`) — 9 credits
- FLUX.2 Flex (`fal-ai/flux-pro/v2/flex`) — 6 credits
- FLUX.1 Dev (`fal-ai/flux/dev`) — 5 credits
- FLUX.1 Schnell (`fal-ai/flux/schnell`) — 2 credits
- GPT Image 1.5 (`fal-ai/gpt-image-1-5`) — 8 credits
- Nano Banana 2 (`fal-ai/nano-banana-2`) — 5 credits
- Seedream 4.5 (`fal-ai/seedream-4-5`) — 6 credits
- Recraft V3 (`fal-ai/recraft/v3`) — 5 credits

**New Image Models (image-to-image):**
- FLUX Kontext Pro (`fal-ai/flux-pro/kontext`) — 8 credits
- FLUX Kontext Dev (`fal-ai/flux/kontext/dev`) — 6 credits
- GPT Image 1.5 Edit (`fal-ai/gpt-image-1-5/edit`) — 4 credits
- NB2 Edit (`fal-ai/nano-banana-2/edit`) — 7 credits
- Seedream 5 Edit (`fal-ai/seedream-5-lite/edit`) — 6 credits
- Grok Edit (`fal-ai/grok-imagine/edit`) — 5 credits

**New Video Models (text-to-video):**
- Kling 3.0 Pro T2V (`fal-ai/kling-video/v3/pro/text-to-video`) — 30 credits
- Kling 3.0 Omni (`fal-ai/kling-video/v3/omni`) — 25 credits
- Kling 2.5 Turbo (`fal-ai/kling-video/v2.5-turbo/pro/text-to-video`) — 22 credits
- Veo 3.1 (`fal-ai/veo3.1/text-to-video`) — 40 credits
- Veo 3.1 Fast (`fal-ai/veo3.1/fast/text-to-video`) — 25 credits
- Sora 2 Pro (`fal-ai/sora/pro/text-to-video`) — 50 credits
- Seedance 2.0 (`fal-ai/seedance/v2/text-to-video`) — 30 credits
- Hailuo 2.3 Pro (`fal-ai/minimax/hailuo-2.3/pro`) — 28 credits
- Wan 2.5 (`fal-ai/wan/v2.5/text-to-video`) — 15 credits
- Higgsfield DoP (`fal-ai/higgsfield/dop`) — 20 credits

**New Video Models (image-to-video):**
- Kling 3.0 Pro I2V — already exists
- Veo 3.1 I2V (`fal-ai/veo3.1/image-to-video`) — 40 credits
- Sora 2 Pro I2V (`fal-ai/sora/pro/image-to-video`) — 50 credits
- Seedance 2.0 I2V (`fal-ai/seedance/v2/image-to-video`) — 30 credits

**New Video Models (special):**
- Kling 3.0 Motion Control (`fal-ai/kling-video/v3/motion-control`) — 30 credits, subcategory motion_control
- Kling O1 Edit (`fal-ai/kling-video/o1/edit`) — 28 credits, subcategory video_editing

Each model entry includes: proper controls (aspect_ratio, duration, resolution, generate_audio where supported), defaults, and aliases.

### `supabase/functions/_shared/credits.ts` — Add cost overrides
Add entries for every new model ID in `MODEL_COST_OVERRIDES`.

## Phase 2: Image Studio UI Redesign

### `src/components/kanvas/ImageStudioSection.tsx` — Major rewrite

Match the MogStudio Image reference (imagepage2.png, imagepage3.png):

**Layout changes:**
- Remove the 260px sidebar — models move into the bottom prompt bar's model selector dropdown
- Full-width hero section with "TURN IDEAS INTO VISUALS" centered
- Below hero: 3-card carousel with perspective tilt showing use cases (Stage Your Product, Generate Visuals, Change Background) with left/right arrows and centered "Try this" pill
- Community gallery tab: Pinterest-style masonry grid of completed jobs (variable height cards, `columns-2 md:columns-4 lg:columns-5`)

**Bottom prompt bar redesign:**
- Full-width dark panel docked to bottom, rounded corners
- `+` button (image upload) on left
- Text input: "Describe the scene you imagine"
- Model selector pill: green `G` icon + model name + chevron → opens dropdown grouped by provider
- Aspect ratio pill with icon
- Image count stepper (`— 1/4 +`)
- `@` mention button
- "Extra free gens" toggle with green switch
- "Draw" button with pencil icon
- Generate button: Large lime pill with sparkle + credit cost ("Generate ✦ 2")

**Model selector dropdown:**
- Groups by provider (Google, Black Forest Labs, OpenAI, ByteDance, etc.)
- Provider icon + header
- "Top Choice" lime badge for featured models
- "New" badge for is_new
- Credit cost display per model
- Filter by subcategory (Generation / Editing)

**Sub-nav tabs:** Add "History" and "Community" tabs below the main nav

## Phase 3: Video Studio UI Redesign

### `src/components/kanvas/VideoStudioSection.tsx` — Major rewrite

Match MogStudio Video references (videopage2-5.png):

**Sub-navigation:** "Create Video | Edit Video | Motion Control" with underline indicator + "History | How it works" secondary row

**Create Video (left sidebar ~280px):**
- Preset thumbnail at top with "Change" overlay button
- Start frame / End frame: Two "Optional" upload boxes side by side
- Multi-shot toggle with info icon
- Prompt textarea with `@` element references
- Enhancement row: "Enhance on | Sound On | Elements" pills
- Model selector: "Model > Kling 3.0" with chevron
- Settings row: "5s | 16:9 | 720p" pill selectors
- Generate button full-width lime: "Generate ✦ 8.75"

**Create Video (main content):**
- "MAKE VIDEOS IN ONE CLICK" hero heading
- 3-step flow cards: ADD IMAGE → CHOOSE PRESET → GET VIDEO
- Preset gallery: Model tabs scrollbar (Higgsfield DoP, Kling 3.0, etc.) + filter pills (All, New, Trending, Effects, etc.)
- Preset grid with "Top Choice" lime badges

**Edit Video panel:**
- "KLING O1 EDIT" preset header
- Video upload zone (3-10 secs)
- Images & elements upload (up to 4)
- Edit prompt textarea
- Auto settings toggle
- Model + quality selectors

**Motion Control panel:**
- "RECREATE ANY [MOTION] WITH YOUR IMAGE" heading
- Video upload (3-30 seconds) + Character image upload
- Model selector + scene control mode toggle
- Motion library grid of reference videos

## Phase 4: Edge Function Verification

### `supabase/functions/kanvas-generate/index.ts` + `_shared/kanvas.ts`
- Verify `buildFalInput()` correctly maps all new model parameters
- Ensure `normalizeKanvasResult()` handles response shapes from new models (Veo 3.1 returns `video.url`, FLUX returns `images[].url`)
- Add model-specific parameter mapping where needed (e.g., Veo 3.1 uses `duration` not `duration_seconds`)
- Deploy updated edge functions

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/_shared/kanvas.ts` | Add ~30 new model entries to KANVAS_MODELS |
| `supabase/functions/_shared/credits.ts` | Add cost overrides for all new models |
| `src/components/kanvas/ImageStudioSection.tsx` | Full redesign: remove sidebar, add masonry gallery, redesign prompt bar with model dropdown |
| `src/components/kanvas/VideoStudioSection.tsx` | Full redesign: 3-tab layout (Create/Edit/Motion), preset gallery, model tabs |
| `supabase/functions/kanvas-generate/index.ts` | No changes needed — uses generic `buildFalInput` |
| `supabase/functions/falai-models/index.ts` | No changes needed — already serves from KANVAS_MODELS |

