

# Cinematic Editorial Landing Page Redesign

## Overview
Build 6 new sections below the existing hero scroll indicator, following the "Noir Futurist" design system from the uploaded reference. The existing IPhoneMockup component stays and gets integrated into the new layout. The accent color shifts from the current orange (#FF6B4A) to Neon Lime (#ccff00) for these new sections, matching the reference design.

## New Components to Create

### 1. `src/components/landing/ArenaZeroHero.tsx`
Full-width cinematic hero banner with rounded corners, dark sci-fi city background image (Unsplash), gradient overlay, "ARENA ZERO" massive headline (Space Grotesk, text-8xl, tracking-tighter), "Watch now" glass pill button, and right-aligned "AVAILABLE ON WZRD.STUDIO" text. Container: `mx-6 rounded-[2rem] h-[500px] relative overflow-hidden`.

### 2. `src/components/landing/CreateTodaySection.tsx`
Two-column layout: left 30% with stacked "WHAT WILL YOU / CREATE TODAY?" (lime accent), muted subtext, "Explore all tools" lime pill button. Right 70%: horizontal scrolling row of 5 creation cards (Create Image, Create Video, Motion Control, Soul 2.0, Soul ID) with cinematic Unsplash images, hover scale, arrow icons, and a "NEW" lime badge on card 4. No-scrollbar horizontal overflow.

### 3. `src/components/landing/TopChoiceGrid.tsx`
Header with "TOP CHOICE" + subtitle left, "SEE ALL >" glass pill right. 8-column grid of tool cards with grayscale images that colorize on hover, tiny bold titles, muted descriptions. Uses the reference card data (Nano Banana Pro, Motion Control, Skin Enhancer, Shots, Angles 2.0, Kling 3.0, Seedream 5.0 Lite, Soul Cast).

### 4. `src/components/landing/PhotodumpBanner.tsx`
Full-width rounded banner with dark metallic wave background, left-aligned content: lime "PHOTODUMP" pill badge, massive italic "DIFFERENT SCENES / SAME STAR" heading, muted description, white pill "TRY PHOTODUMP" button.

### 5. `src/components/landing/SoulCinemaGallery.tsx`
"WZRD.STUDIO SOUL CINEMA" header with glass arrow buttons. 4x2 grid of cinematic images with rounded corners, hover scale effect, no text on cards.

### 6. `src/components/landing/CinematicFooter.tsx`
Minimal footer: W logo + copyright left, PRIVACY / TERMS / STUDIO API / CAREERS links right. Uppercase tracking-widest, tiny text, border-t border-white/5.

## Integration in `src/pages/Landing.tsx`

Insert the new sections between the hero area (line 183) and the "REST OF PAGE" div (line 186). The existing IPhoneMockup stays in its current position within the "REST OF PAGE" block. Layout order:

1. Existing Hero (stays)
2. **ArenaZeroHero** (new)
3. **CreateTodaySection** (new)
4. **TopChoiceGrid** (new)
5. **PhotodumpBanner** (new)
6. **SoulCinemaGallery** (new)
7. Existing sections (ModelLibrary, FeatureGrid, ThreeStep, UseCases, IPhoneMockup, etc.)
8. **CinematicFooter** replaces the existing StickyFooter

## Design Tokens Used Throughout
- Backgrounds: `bg-black` (#000), `bg-[#0e0e0e]`, `bg-[#131313]`, `bg-[#262626]`
- Accent: `text-[#ccff00]`, `bg-[#ccff00]`
- Secondary: `text-[#ff3399]`, `bg-[#ff3399]`
- Ghost borders: `border border-white/10` or `border-white/5`
- Glass: `bg-white/5 backdrop-blur-md`
- Typography: Space Grotesk for headlines (via `font-headline` class or inline), Inter for body
- No opaque borders for section division — tonal background shifts and `py-24` spacing only
- All images: `object-cover`, high-contrast cinematic Unsplash placeholders

## Files Changed

| File | Change |
|------|--------|
| `src/components/landing/ArenaZeroHero.tsx` | **New** |
| `src/components/landing/CreateTodaySection.tsx` | **New** |
| `src/components/landing/TopChoiceGrid.tsx` | **New** |
| `src/components/landing/PhotodumpBanner.tsx` | **New** |
| `src/components/landing/SoulCinemaGallery.tsx` | **New** |
| `src/components/landing/CinematicFooter.tsx` | **New** |
| `src/pages/Landing.tsx` | Import & render new sections after hero, replace StickyFooter with CinematicFooter |
| `index.html` | Add Space Grotesk Google Font link |

