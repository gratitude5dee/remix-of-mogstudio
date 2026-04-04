

# Fix Dead Space — Update Studio Section Top Offset

## Problem
All studio sections (Image, Video, Edit, Lipsync) use `top-[80px]` for their fixed positioning, assuming an 80px-tall header. After slimming the header down to ~44px (`py-1.5` + `h-7` logo), this creates ~36px of visible dead space between the header and content.

## Solution
Change every `top-[80px]` to `top-[44px]` across all four studio section components to match the new slim header height.

## Files Changed

| File | Instances | Change |
|------|-----------|--------|
| `src/components/kanvas/VideoStudioSection.tsx` | Line 638 | `top-[80px]` → `top-[44px]` |
| `src/components/kanvas/ImageStudioSection.tsx` | Line 445 | `top-[80px]` → `top-[44px]` |
| `src/components/kanvas/EditStudioSection.tsx` | Lines 207, 211, 333, 337 | `top-[80px]` → `top-[44px]` |
| `src/components/kanvas/LipsyncStudioSection.tsx` | Lines 105, 664 | `top-[80px]` → `top-[44px]` |

Total: 8 replacements across 4 files. No logic changes — purely a CSS offset fix.

