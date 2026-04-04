

# Restore Top Pill-Slider Nav to Kanvas Header

## Problem
The last edit replaced the top header's centered pill-slider studio navigation with a minimal "WZRD / Studio Name" status bar. The sidebar handles navigation, but the user wants BOTH — the sidebar AND the top pill-slider nav.

## Solution
Restore the centered pill-slider nav inside the existing slim header (lines 1173-1182 of `KanvasPage.tsx`). Keep the WZRD wordmark on the left, add the pill-slider center nav with all studios, and keep the layout otherwise unchanged.

### `src/pages/KanvasPage.tsx` — Header (lines 1173-1182)

Replace the current slim header content with:

```text
┌──────────────────────────────────────────────────────────────┐
│  ● WZRD   │  Image  Video  Edit  Lipsync  Cinema  ...  │     │
└──────────────────────────────────────────────────────────────┘
```

- **Left**: Keep WZRD wordmark + lime dot (existing)
- **Center**: Add `inline-flex bg-[#111] rounded-full p-1 border border-white/[0.06]` container mapping `KANVAS_STUDIO_ORDER` with icon + label buttons
- Active tab: `bg-white/10 text-[#BEFF00] shadow-[inset_0_0_12px_rgba(190,255,0,0.06)]`
- Inactive: `text-zinc-500 hover:text-zinc-300`
- Each button calls `setStudio(studio)` (same as sidebar)
- Use icons from the same `STUDIO_ICONS` map as the sidebar

## Files Changed

| File | Change |
|------|--------|
| `src/pages/KanvasPage.tsx` | Add centered pill-slider studio nav back into the top header bar |

