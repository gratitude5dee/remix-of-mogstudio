

# Move ScrollingPartners Under MogPromoSection CTA Buttons

The "Explore Feed" and "API Documentation" buttons are in `MogPromoSection.tsx`, not `HeroSection.tsx`. The ScrollingPartners needs to go inside that component, right after those CTA buttons.

## Changes

### 1. `src/components/landing/MogPromoSection.tsx`
- Import `ScrollingPartners`
- Insert `<ScrollingPartners />` after the CTA `motion.div` (after line 181), before the closing `</div>` and `</section>`

### 2. `src/components/landing/HeroSection.tsx`
- Remove the `<ScrollingPartners />` and its import (added in previous edit around the CTA buttons area)

Two files, minimal edit.

