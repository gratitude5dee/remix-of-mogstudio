

# Batch 1 Plan: Landing Page + Kanvas Fixes + Model Additions + Billing

This batch covers the four priority areas. Estimated ~15 file changes.

---

## 1. Landing Page (Section 1A + 1B)

### 1A. Add "Documentation" and "API" nav links

**File: `src/pages/Landing.tsx`**

- Desktop nav (line ~151-188): Insert two `<a>` links for "Documentation" (`href="/docs"`) and "API" (`href="/api"`) between "Features" and "Pricing", using the same `text-white/50 hover:text-white transition-colors` styling.
- Mobile menu (line ~277-301): Insert two matching `<button>` entries for "Documentation" and "API" with the same pattern.

### 1B. Update Hero Section copy

**File: `src/pages/Landing.tsx`** (lines 359-362):
- Change headline to `"Turn Ideas Into Cinema-Quality Content in Minutes"`
- Change subheadline to `"WZRD Studio combines AI image generation, video production, lip sync, 3D worldbuilding, and a complete timeline editor — all in one powerful creative platform."`

**File: `src/components/landing/HeroSection.tsx`** (line 32):
- Change badge text from "Now in Public Beta" to "AI-Powered Creative Studio"
- Update trust line (if present in HeroSection or Landing) to "Trusted by 2,000+ creators, agencies, and brands worldwide"

### 1B (cont). Section spacing and dividers

The landing page already has gradient dividers between sections (`h-px bg-gradient-to-r from-transparent via-orange-500/20 to-transparent`). Increase vertical breathing room:
- Wrap each section `<div>` with `py-24 md:py-32` padding where missing (currently `py-20` on trust indicators — bump to `py-24 md:py-32`).
- Ensure all section content uses `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.

---

## 2. Kanvas Fixes (Sections 2A, 2B, 2C)

### 2B. Remove "fal-native" badge

**File: `src/pages/KanvasPage.tsx`** (line 1090):
- Delete the line `<Badge className="bg-lime-300 text-black hover:bg-lime-300">fal-native</Badge>`.

### 2C. Fix generation hanging — improve loading UX

**File: `src/pages/KanvasPage.tsx`**:
- Locate the generate button and ensure it is disabled while a job is in-progress (`isJobActive` check). Add a `<Loader2 className="animate-spin" />` spinner icon on the button while generating.
- In the output/preview area, when a job is active, show an animated skeleton placeholder with shimmer effect and a multi-step progress label ("Queued → Processing → Completing") based on job status.
- Add a toast notification on generation start: `toast.info("Generation started — " + modelName)`.
- Add error recovery: if job fails, show error message with a "Retry" button.
- Add a "Cancel" button visible during active generation.

### 2A. User persistence for generations

This requires verifying that `kanvas_jobs` or `generation_jobs` table has a `user_id` column. The edge function `kanvas-generate` likely already stores the authenticated user. The main change:
- In `KanvasPage.tsx`, on mount, call `listKanvasJobs()` to load the user's past generations.
- Add a "History" tab/panel in the sidebar showing past jobs with thumbnails, prompts, and timestamps.
- This is already partially implemented via `listKanvasJobs` and `mergeJobs` — just needs to be surfaced in the UI.

---

## 3. Model Additions (Sections 3B, 4A, 5A)

### 3B. New image models

**File: `src/lib/studio-model-constants.ts`**

Add to `imageGenerationModels` array (before the closing `]` at line 183):
- Stable Diffusion 3.5 Large, Recraft V3, AuraFlow, HiDream I1, OmniGen V1

Add to `imageAdvancedModels` array (before the closing `]` at line 337):
- FLUX Dev Image-to-Image, FLUX Pro Ultra Redux, IC-Light V2, Creative Upscaler, Clarity Upscaler

Each entry follows the existing `StudioModel` interface shape with proper `description`, `credits`, `time`, `supports`, `defaults`.

### 4A. New video models

Add to `videoGenerationModels` (before closing `]` at line 605):
- MiniMax Video-01 Live, MiniMax Video-01 I2V, HunyuanVideo, Wan 2.1 T2V, Wan 2.1 I2V, CogVideoX-5B, Vidu V2.5 T2V, Vidu V2.5 I2V

Add to `videoAdvancedModels` (before closing `]` at line 910):
- Kling O3 Video Extend, Stable Video Diffusion

### 5A. Lip-sync models

There is no separate `LIPSYNC_MODELS` array currently. Add one after `AUDIO_MODELS`:
```
export const LIPSYNC_MODELS: StudioModel[] = [
  // Kling O3 Pro Lip Sync, Kling 2.5 Turbo Lip Sync, SadTalker, LivePortrait, LatentSync, Hallo2, Sonic
];
```
Update `getModelById` and `getModelsByType` to include LIPSYNC_MODELS (treating them as `video` mediaType but with a `lipsync` uiGroup).

### Credit costs update

**File: `supabase/functions/_shared/credits.ts`** (line 11-25 `MODEL_COST_OVERRIDES`):
Add entries for all new models matching their `credits` values from the model catalog.

---

## 4. Billing & Credits (Section 11A)

### Fix billing-catalog 500 errors

**File: `supabase/functions/billing-catalog/index.ts`**:
- Wrap DB queries in try/catch. If queries fail, return a hardcoded fallback catalog with Free (0, 100 credits), Pro ($49, 2000 credits), Business ($149, 10000 credits) plans and credit packs.
- Add a Free plan to `FALLBACK_PLANS` in `src/pages/SettingsBillingPage.tsx` (currently missing — only has Pro, Business, Enterprise).

### Fix billing-portal 400 errors

**File: `supabase/functions/billing-portal/index.ts`**:
- When no Stripe customer exists, return `{ success: false, error: 'no_subscription', message: 'No active subscription. Please choose a plan.' }` with status 200 instead of 400.

### Free 100-credit grant for new users

**Database migration**: Create a trigger on `profiles` table:
```sql
CREATE OR REPLACE FUNCTION public.grant_free_credits()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_credits (user_id, total_credits)
  VALUES (NEW.id, 100)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO '';

CREATE TRIGGER on_profile_created_grant_credits
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.grant_free_credits();
```

### Billing mode messaging

**File: `src/pages/SettingsBillingPage.tsx`**:
- When `billingMode === 'disabled'`: Show "Billing is not configured. Contact support."
- When `billingMode === 'test_only'`: Show "Billing is in test mode. Payments are simulated."

---

## Summary of files to modify

| File | Changes |
|------|---------|
| `src/pages/Landing.tsx` | Add nav links, update hero copy, increase section padding |
| `src/components/landing/HeroSection.tsx` | Update badge text |
| `src/pages/KanvasPage.tsx` | Remove fal-native badge, improve generation UX, add history panel |
| `src/lib/studio-model-constants.ts` | Add ~22 new models + LIPSYNC_MODELS array |
| `supabase/functions/_shared/credits.ts` | Add credit cost overrides for new models |
| `supabase/functions/billing-catalog/index.ts` | Add fallback catalog, wrap queries in try/catch |
| `supabase/functions/billing-portal/index.ts` | Handle missing Stripe customer gracefully |
| `src/pages/SettingsBillingPage.tsx` | Add Free plan to fallback, billing mode messaging |
| Database migration | `grant_free_credits` trigger on profiles |

