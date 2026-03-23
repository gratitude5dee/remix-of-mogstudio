
Fix the side-shadow issue by replacing the current black edge overlays with a true content fade mask.

## Why it still looks wrong
The current left/right fade elements in `ScrollingPartners.tsx` use hardcoded black gradients (`#000...`). Since the hero background is video/gradient (not flat black), those overlays appear as visible dark bands/blobs at the edges.

## Implementation plan

1. Update `src/components/landing/ScrollingPartners.tsx`
- Remove the two absolute overlay divs used for edge fades.
- Wrap the marquee row in a dedicated mask container class (e.g. `partners-fade-mask`).
- Keep marquee animation logic as-is, but add small horizontal inner padding so first/last logos don’t get abruptly clipped.

2. Add mask-based fade in `src/index.css`
- Add a reusable class:
  - `-webkit-mask-image` + `mask-image` with `linear-gradient(to right, transparent -> opaque -> transparent)`.
  - Include `mask-size` and `mask-repeat` to ensure stable rendering.
- Add responsive tuning (wider fade on mobile, narrower on desktop) so logos remain readable.
- Optional fallback via `@supports not (mask-image: ...)` to apply a very subtle overlay if a browser lacks mask support.

3. Fine-tune spacing for visual balance
- Slightly reduce logo side margins and/or add wrapper `px-*` so text doesn’t disappear too early at edges.
- Keep hover and marquee speed unchanged unless clipping still occurs after mask conversion.

## Technical details
- Files to edit:
  - `src/components/landing/ScrollingPartners.tsx`
  - `src/index.css`
- Core change:
  - From: color overlays (paint over background)
  - To: alpha mask (fade only the moving logos)
- Expected result:
  - No visible side “black shadow bars”
  - Smooth edge fade that blends with any background (video, gradient, image)

## Validation
- Desktop (current viewport): confirm no dark side blobs and full readability of left/right logos.
- Mobile width: confirm fade is softer and logos are not heavily clipped.
- Verify marquee remains seamless (no jump) and hover styles still work.
