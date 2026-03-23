

# Move ScrollingPartners Inside HeroSection

The `ScrollingPartners` is currently a sibling of `<HeroSection />` in `Landing.tsx`. It needs to render **inside** the hero, directly under the "Start Creating Free" / "Watch Demo" buttons and before the star ratings.

## Changes

### 1. `src/components/landing/HeroSection.tsx`
- Import `ScrollingPartners`
- Insert `<ScrollingPartners />` between the CTA buttons `motion.div` (line 105) and the trust/stars `motion.div` (line 107)
- Reduce the `mb-16` on the CTA container to `mb-8` to tighten spacing

### 2. `src/pages/Landing.tsx`
- Remove the standalone `<ScrollingPartners />` from line 389 (it will now render inside HeroSection)

Two files changed, minimal edit.

