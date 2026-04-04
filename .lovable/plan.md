

# Sync All Models (Image + Video + Audio) Across App + Mobile-Ready All Pages

## Overview

Three workstreams: (1) Add ~30 missing image and video models to the centralized catalog, (2) Add ~25 new audio models, (3) Unify Cinema Studio with the central catalog, add audio model selector to project-setup, and make all pages mobile-responsive.

---

## 1. New Image Models to Add to `studio-model-constants.ts`

The following models exist on fal.ai but are missing from `imageGenerationModels`:

| Model ID | Name | Credits | Badge |
|----------|------|---------|-------|
| `fal-ai/flux-2-pro` | Flux 2 Pro | 8 | Premium |
| `fal-ai/flux-2` | Flux 2 | 6 | Quality |
| `fal-ai/flux-2/turbo` | Flux 2 Turbo | 5 | Fast |
| `fal-ai/flux-2/flash` | Flux 2 Flash | 4 | Fast |
| `fal-ai/flux-2-max` | Flux 2 Max | 10 | Premium |
| `fal-ai/flux-2-flex` | Flux 2 Flex | 6 | — |
| `fal-ai/flux-pro/kontext/text-to-image` | FLUX Kontext Pro | 7 | Quality |
| `fal-ai/gpt-image-1.5` | GPT-Image 1.5 | 8 | Premium |
| `xai/grok-imagine-image` | Grok Imagine Image | 7 | — |
| `fal-ai/imagen4/preview` | Imagen 4 | 7 | Quality |
| `fal-ai/imagen4/preview/ultra` | Imagen 4 Ultra | 10 | Premium |
| `fal-ai/imagen4/preview/fast` | Imagen 4 Fast | 5 | Fast |
| `fal-ai/bytedance/seedream/v4.5/text-to-image` | Seedream 4.5 | 5 | — |
| `fal-ai/z-image/turbo` | Z-Image Turbo | 4 | Fast |

## 2. New Video Models to Add

**Text-to-Video (add to `videoGenerationModels`):**

| Model ID | Name | Credits | Badge |
|----------|------|---------|-------|
| `fal-ai/veo3.1` | Veo 3.1 | 40 | Premium |
| `fal-ai/veo3.1/fast` | Veo 3.1 Fast | 30 | Fast |
| `fal-ai/veo3.1/lite` | Veo 3.1 Lite | 22 | — |
| `fal-ai/veo3` | Veo 3 | 35 | Quality |
| `fal-ai/veo3/fast` | Veo 3 Fast | 25 | Fast |
| `fal-ai/kling-video/v3/pro/text-to-video` | Kling 3.0 Pro T2V | 32 | Premium |
| `fal-ai/kling-video/v3/standard/text-to-video` | Kling 3.0 Std T2V | 22 | — |
| `fal-ai/kling-video/v2.6/pro/text-to-video` | Kling 2.6 Pro T2V | 28 | Quality |
| `fal-ai/bytedance/seedance/v1.5/pro/text-to-video` | Seedance 1.5 Pro T2V | 32 | Premium |
| `xai/grok-imagine-video/text-to-video` | Grok Imagine Video | 30 | — |
| `fal-ai/minimax/hailuo-02/standard/text-to-video` | Hailuo 02 Std T2V | 24 | — |
| `fal-ai/minimax/hailuo-02/pro/text-to-video` | Hailuo 02 Pro T2V | 32 | Premium |
| `fal-ai/pixverse/v6/text-to-video` | Pixverse V6 T2V | 20 | — |
| `fal-ai/ltx-2.3/text-to-video` | LTX 2.3 Pro T2V | 22 | Quality |
| `fal-ai/ltx-2.3/text-to-video/fast` | LTX 2.3 Fast T2V | 16 | Fast |
| `fal-ai/wan/v2.2-a14b/text-to-video` | Wan 2.2 T2V | 20 | — |

**Image-to-Video (add to `videoGenerationModels`):**

| Model ID | Name | Credits | Badge |
|----------|------|---------|-------|
| `fal-ai/veo3.1/image-to-video` | Veo 3.1 I2V | 42 | Premium |
| `fal-ai/veo3.1/fast/image-to-video` | Veo 3.1 Fast I2V | 32 | Fast |
| `fal-ai/veo3.1/lite/image-to-video` | Veo 3.1 Lite I2V | 24 | — |
| `fal-ai/kling-video/v2.6/pro/image-to-video` | Kling 2.6 Pro I2V | 30 | Quality |
| `fal-ai/sora-2/image-to-video` | Sora 2 I2V | 38 | Premium |
| `fal-ai/bytedance/seedance/v1.5/pro/image-to-video` | Seedance 1.5 Pro I2V | 34 | Premium |
| `fal-ai/minimax/hailuo-02/standard/image-to-video` | Hailuo 02 Std I2V | 26 | — |
| `fal-ai/minimax/hailuo-02/pro/image-to-video` | Hailuo 02 Pro I2V | 34 | Premium |

## 3. New Audio Models (same as previous plan)

Add 25+ TTS, voice clone, music, SFX, and STT models to `AUDIO_MODELS` array (ElevenLabs, MiniMax Speech, Chatterbox, Qwen TTS, Lyria2, CassetteAI, Whisper, etc.)

## 4. Unify Cinema Studio with Central Catalog

**File: `src/components/kanvas/CinemaStudioSection.tsx`**

Replace the local `AUDIO_MODELS` array (lines 25-41) with imports from `studio-model-constants.ts`. Map the centralized `StudioModel` to the local `AudioModel` interface, deriving category from the centralized category field.

## 5. Add Audio Model Selector to Project Setup

- **`src/components/project-setup/types.ts`**: Add `baseAudioModel?: string` to `ProjectData`
- **`src/components/project-setup/TabNavigation.tsx`**: Add a 3rd model selector after video for "Audio Model"
- **`src/components/project-setup/ProjectContext.tsx`**: Wire `baseAudioModel` to save/load

## 6. Mobile Responsiveness

### 6a. Kanvas Page (`src/pages/KanvasPage.tsx`)
- Mobile bottom tab bar (`md:hidden`) for 7 studio icons
- Hide `KanvasSidebar` on mobile (`hidden md:block`)
- Safe area padding (`pb-[env(safe-area-inset-bottom)]`)

### 6b. Project Setup (`src/components/project-setup/ProjectSetupWizard.tsx`)
- Scrollable tabs on mobile (`overflow-x-auto flex-nowrap`)
- Responsive padding (`px-4 md:px-8`)
- Models popover width: `w-[calc(100vw-2rem)]` on mobile

### 6c. KanvasSidebar
- Add `hidden md:block` to sidebar wrapper and trigger zone

### 6d. Global PWA
- `index.html`: Add `viewport-fit=cover`, `apple-mobile-web-app-capable`, `apple-mobile-web-app-status-bar-style` meta tags

---

## Files Changed

| File | Change |
|------|--------|
| `src/lib/studio-model-constants.ts` | Add ~14 new image models, ~24 new video models, ~25 new audio models |
| `src/components/kanvas/CinemaStudioSection.tsx` | Replace local audio models with centralized imports |
| `src/components/project-setup/types.ts` | Add `baseAudioModel` to `ProjectData` |
| `src/components/project-setup/TabNavigation.tsx` | Add audio model selector, responsive popover |
| `src/components/project-setup/ProjectContext.tsx` | Wire `baseAudioModel` |
| `src/pages/KanvasPage.tsx` | Mobile bottom nav, safe areas, responsive header |
| `src/components/kanvas/KanvasSidebar.tsx` | `hidden md:block` for mobile |
| `src/components/project-setup/ProjectSetupWizard.tsx` | Responsive tabs and padding |
| `index.html` | PWA meta tags |

