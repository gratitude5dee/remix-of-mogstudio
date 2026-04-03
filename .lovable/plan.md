

# Improve Video Studio Tab Navigation

## Problem
The tab buttons ("Create Video", "Edit Video", "Motion Control") use plain underline styling and are left-aligned. They need a premium, centered pill/slider design matching the Noir Futurist system.

## Solution
Replace the current `border-b-2` tab buttons with a centered, rounded pill container (`bg-[#1A1A1A]` with `border-white/[0.06]`). Active tab gets a lime-highlighted inner pill (`bg-[#ccff00]/10 text-[#ccff00]`). The entire tab group is centered using `justify-center`.

## Changes — `src/components/kanvas/VideoStudioSection.tsx`

**Lines 178-193** — Replace the sub-nav tab row:

- Wrap tabs in a centered container: `flex justify-center`
- Inner pill group: `inline-flex bg-[#1A1A1A] rounded-full p-1 border border-white/[0.06]`
- Each tab button: `px-5 py-2 rounded-full text-sm font-medium transition-all duration-200`
- Active state: `bg-white/10 text-[#ccff00] shadow-[inset_0_0_12px_rgba(204,255,0,0.06)]`
- Inactive state: `text-zinc-500 hover:text-zinc-300`
- Remove `border-b-2` styling entirely

| File | Change |
|------|--------|
| `src/components/kanvas/VideoStudioSection.tsx` | Restyle tab nav as centered rounded pill slider (lines 178-193) |

