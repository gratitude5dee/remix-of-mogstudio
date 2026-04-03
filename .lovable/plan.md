

# Fix Cinema Studio: Tab-Aware Prompt Bar & Cast Polish

## Problem
The bottom prompt bar is identical for Image and Video tabs, but the reference shows distinct controls per tab. The Cast tab design also needs polish to match reference image 3.

## Changes — `src/components/kanvas/CinemaStudioSection.tsx`

### 1. Split `renderBottomBar()` into two tab-specific bars

**Image tab bar** (ref image 1):
- Left: Image/Video mode toggle (pill)
- Center: `+` button + prompt input (rounded)
- Right: `Scenes` pill, `— 1/4 +` stepper, `16:9` pill, `♡ 2K` quality pill, `Characters and Locations` button (dark card with icons), `GENERATE ✦ 2` lime button

**Video tab bar** (ref image 2):
- Left: Image/Video mode toggle in the sidebar area (already there)
- Center: prompt input "Describe your scene - use @ to add characters & locations"
- Right row 1: `Single shot` pill, `16:9`, `1080p`, `General` (with color dot), `Sound On`, `— 1/4 +` stepper
- Right row 2: `+ START FRAME` button, `+ END FRAME` button, `GENERATE ✦ 24` lime button

The bottom bar becomes two separate functions: `renderImageBar()` and `renderVideoBar()`.

### 2. Move Image/Video toggle to left sidebar
In the reference, the Image/Video toggle is at the bottom-left of the sidebar (not inside the prompt bar for video tab). Add two icon buttons (Image icon + "Image" label, Video icon + "Video" label) at the bottom of the left icon rail, with active state matching the `genMode`.

### 3. Polish Cast tab to match reference image 3
- Remove the `text-[#ccff00]` from "DREAM" — reference shows all white heading: "Craft Your Dream Movie Cast" in normal case (not uppercase)
- Add subtitle: "Select options of your cast to generate"
- Add instruction text above carousel: "Select the genre of your movie"
- Add `< >` arrow buttons flanking the genre carousel
- Genre card titles should be normal case (Action, Adventure, etc.) not uppercase
- Bottom: shuffle icon + "Generate ✦" lime button (wider, centered)

### 4. Tab nav styling
Move tab nav from current position to match reference — tabs should be in the top bar area (Image, Video, Audio, Cast, All, Liked). Currently only showing image/video/cast. Add "Audio", "All", "Liked" as additional tabs (Audio/All/Liked can be placeholder).

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/CinemaStudioSection.tsx` | Split bottom bar per tab, move mode toggle to sidebar, polish Cast tab, update tab nav |

