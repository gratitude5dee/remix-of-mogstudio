

# Contain Video to Hero + Add ScrollingPartners + Reference-Inspired Background

## Changes

### 1. Contain background video to hero section only

**File: `src/components/landing/VideoBackground.tsx`**
- Change from `fixed inset-0` to `absolute inset-0` positioning so it only fills its parent container, not the entire viewport.

**File: `src/pages/Landing.tsx`**
- Move `<VideoBackground />` inside the hero area (wrap `<MogPromoSection />` and `<HeroSection />` in a `relative overflow-hidden` container with `<VideoBackground />` inside it).
- The rest of the page below hero gets a dark background inspired by the reference image: dark grid/dot pattern with purple and blue gradient accents.

### 2. Add reference-inspired background for rest of page

Inspired by the uploaded screenshot — dark background with subtle grid texture, purple/blue radial glow accents.

**File: `src/pages/Landing.tsx`**
- After the hero wrapper, the remaining sections get a wrapper `div` with:
  - `bg-black` base
  - CSS background with subtle dot-grid pattern (like the reference)
  - Radial gradient accents: purple glow top-center, blue glow offset
  - Floating purple orb element (like the reference image's purple sphere)

### 3. Add ScrollingPartners component

**New file: `src/components/landing/ScrollingPartners.tsx`**
- Implement the marquee partners component with the logos array.
- Since actual logo assets don't exist yet, use placeholder text-based logos (styled spans) with the partner names.
- Triple-duplicated row for seamless infinite scroll.

**New CSS in `src/index.css`**
- Add `@keyframes marquee` and `.animate-marquee` class.

**New dir: `src/assets/partners/`**
- Won't have the actual SVG/PNG files, so the component will use text placeholders.

**File: `src/pages/Landing.tsx`**
- Insert `<ScrollingPartners />` immediately after the hero section wrapper, before the Trust Indicators section. Add "BUILT WITH" overline label.

### 4. Files changed
- `src/components/landing/VideoBackground.tsx` — change `fixed` → `absolute`
- `src/pages/Landing.tsx` — restructure: hero wrapper with video, add ScrollingPartners, add styled background for remaining sections
- `src/components/landing/ScrollingPartners.tsx` — new component
- `src/index.css` — add marquee keyframes

