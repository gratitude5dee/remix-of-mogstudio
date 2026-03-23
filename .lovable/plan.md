

# BG Video in Second Section + Generated Card Images + iPhone Lobster + GIF in Editor

## Summary of 4 changes

### 1. Use bgvid.mp4 as background for MogPromoSection
**File: `src/components/landing/MogPromoSection.tsx`**
- Import and embed `VideoBackground` component (or inline a `<video>` tag with the same `bgvid.mp4`)
- Wrap section in `relative overflow-hidden`, place the video absolutely behind content
- Add dark overlay for text legibility (same gradient approach as the hero's VideoBackground)

### 2. Use uploaded GIF as the preview "video" in the mock editor
**File: Copy `user-uploads://wzrdstudiointro1-ezgif.com-optimize.gif` → `src/assets/wzrd-intro.gif`**
**File: `src/components/landing/HeroSection.tsx`**
- Import the GIF asset
- Replace the placeholder preview window content (the play button + "1920×1080" text at lines 159–168) with an `<img>` tag showing the GIF, `object-cover`, filling the preview area
- Keep the gradient overlay on top for depth

### 3. Generate AI images for card backgrounds with gradient noise overlay
Use the Lovable AI image gateway to generate 6 images for `GeneratedShowcaseSection` cards + 8 images for `ModelLibrarySection` cards. Each image will be generated with a prompt matching the card's topic, then stored in Supabase storage or as base64 embedded assets.

**Approach**: Create a Supabase edge function or use `code--exec` to call the image generation API for each card, save results to `src/assets/cards/`, then update the components to use them as `<img>` backgrounds with a gradient noise overlay on top.

**Cards to generate images for:**
- GeneratedShowcaseSection (6): Cybersecurity Dashboard, SaaS Product Launch, Film Key Art, Brand Identity, Motion Graphics, 3D Product Viz
- ModelLibrarySection (8): One abstract image per provider (Google, OpenAI, Runway, Black Forest Labs, Luma AI, Stability AI, Hailuo AI, WAN)

**File: `src/components/landing/GeneratedShowcaseSection.tsx`**
- Add `<img>` behind each card with `object-cover`, keep existing gradient overlay
- Add CSS noise texture overlay (SVG filter)

**File: `src/components/landing/ModelLibrarySection.tsx`**
- Add subtle background images to each provider card
- Maintain the existing gradient hover effect on top

### 4. Add iPhone mockup with lobster claw in a bottom section
**New file: `src/components/landing/IPhoneMockup.tsx`**
- Create an iPhone frame (CSS/SVG — rounded rect with notch, bezel)
- Inside the phone screen, render the `LobsterSilhouette` component (already exists at `src/components/landing/LobsterSilhouette.tsx`)
- Add a dark gradient background behind the lobster with subtle particle effects

**File: `src/pages/Landing.tsx`**
- Insert `<IPhoneMockup />` in one of the bottom sections — between UseCasesSection and TestimonialsSection, or within the FinalCTASection area
- Style it as a centered floating phone with a caption like "Experience WZRD on mobile"

## Files summary
| File | Action |
|------|--------|
| `src/assets/wzrd-intro.gif` | Copy uploaded GIF |
| `src/components/landing/HeroSection.tsx` | Replace preview placeholder with GIF |
| `src/components/landing/MogPromoSection.tsx` | Add bgvid.mp4 video background |
| `src/components/landing/GeneratedShowcaseSection.tsx` | Add generated images + noise overlay |
| `src/components/landing/ModelLibrarySection.tsx` | Add generated images + noise overlay |
| `src/components/landing/IPhoneMockup.tsx` | **New** — iPhone frame with lobster |
| `src/pages/Landing.tsx` | Insert IPhoneMockup in bottom section |

## Technical note on image generation
Will use `code--exec` to call the Lovable AI gateway (`ai.gateway.lovable.dev`) with the Nano banana 2 model to generate card background images. Each image will be saved as a PNG in `src/assets/cards/`. This requires the `LOVABLE_API_KEY` env var. Will generate all 14 images (6 showcase + 8 provider) in batches.

