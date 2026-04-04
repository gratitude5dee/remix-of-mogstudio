

# Cinema Studio Section — Layout & Design Optimization

## Problems Identified

1. **Top offset mismatch**: Line 577 uses `top-[57px]` — doesn't match the new 44px header, creating ~13px dead space
2. **Left character rail blocks floating sidebar**: The 56px left icon rail (lines 581-624) overlaps/conflicts with the floating KanvasSidebar hover zone. Should move to the right side
3. **Bottom bar overlaps status footer**: The image/video bottom bars use `absolute bottom-0` but don't account for the 32px fixed status bar at the bottom — content gets hidden behind it
4. **Bottom bar padding**: `pb-24`/`pb-32` on scrollable content areas may not be enough given the combined bottom bar + status footer height

## Changes

### 1. `src/components/kanvas/CinemaStudioSection.tsx`

**Fix top offset** (line 577):
- `top-[57px]` → `top-[44px]`

**Move left icon rail to right side** (lines 580-624):
- Move the entire `<div className="w-[56px]">` block from before the main content to after it (swap DOM order)
- Change `border-r` to `border-l` since it's now on the right edge
- This frees the left side for the floating KanvasSidebar hover zone

**Fix bottom bar positioning** (lines 159, 246):
- Change `bottom-0` to `bottom-8` on both image and video bottom bars to sit above the fixed status footer
- Alternatively add `mb-8` or `pb-8` offset

**Adjust scroll padding**:
- Image tab (line 300): ensure `pb-` accounts for bottom bar + status footer (~`pb-36`)
- Video tab (line 363): same adjustment
- Cast tab (line 446): same adjustment

### 2. Summary of all offset changes

| Location | Current | New |
|----------|---------|-----|
| Line 577: `top-[57px]` | 57px | `top-[44px]` |
| Lines 159, 246: bottom bars `bottom-0` | 0 | `bottom-8` |
| Line 581: left rail `border-r` | left side | right side, `border-l` |
| Scroll areas: `pb-24`/`pb-32` | varies | `pb-40` |

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/CinemaStudioSection.tsx` | Fix top offset to 44px, move character rail from left to right, offset bottom bars above status footer, adjust scroll padding |

