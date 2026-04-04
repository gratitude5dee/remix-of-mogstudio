

# Kanvas Page — Award-Winning Layout Polish + New Design Features

## Current Issues
- `py-6` on content area (line 1303) creates excessive dead space below header
- Header logo `h-10` is fine but `py-2` padding adds bulk
- No bottom status bar — page floats in void, feels unfinished for a PWA shell
- No film grain texture — missing the Noir Futurist cinematic quality from landing page
- No credits indicator visible on Kanvas page
- Sidebar vertical position doesn't account for potential bottom bar

## Changes

### 1. `src/pages/KanvasPage.tsx` — Layout tightening + bottom status bar + film grain

**Header slim-down**:
- Reduce logo from `h-10` to `h-7`
- Tighten padding from `py-2` to `py-1.5`
- Replace box-shadow with a 1px lime-to-transparent gradient bottom border

**Content area**:
- Reduce `py-6` to `py-2` and `px-4 md:px-6` to `px-3 md:px-4` — kills the dead space gap
- Add `pb-12` to account for the new bottom bar

**Film grain overlay** (new, after line 1189):
- Full-page SVG noise overlay: `mix-blend-overlay opacity-[0.03]` using an inline SVG `feTurbulence` filter — adds cinematic texture across all studios

**Bottom status bar** (new, fixed at bottom):
- `fixed bottom-0 left-0 right-0 h-8 z-40`
- `bg-[#0A0A0A]/80 backdrop-blur-xl border-t border-white/[0.04]`
- Left: "WZRD Studio" wordmark in zinc-600 uppercase tracking-widest
- Center: lime pulse dot + active studio name
- Right: credits display (reuse `CreditsDisplay` component) + `⌘K` keyboard shortcut hint badge

### 2. `src/components/kanvas/KanvasSidebar.tsx` — Position adjustment

- Shift vertical center from `top-1/2` to `top-[calc(50%-1rem)]` to account for bottom bar height
- Ensures sidebar pill doesn't visually overlap the footer

## Files Changed

| File | Change |
|------|--------|
| `src/pages/KanvasPage.tsx` | Slim header (h-7 logo, py-1.5), reduce content gap (py-2, pb-12), add film grain overlay, add fixed bottom status bar with credits + studio indicator |
| `src/components/kanvas/KanvasSidebar.tsx` | Adjust vertical centering for bottom bar |

