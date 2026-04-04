

# Mobile-Optimized Kanvas Page — Award-Winning Redesign

## Problems Identified

1. **Header**: The centered pill-slider nav overflows on mobile (7 icons + labels). The right action buttons (Home, Theme, Settings) are hidden/cramped. The logo is too large at `h-14` for mobile.
2. **Image Studio prompt bar**: Fixed at `bottom-8 left-8 right-8` with many inline controls (model selector, aspect ratio, image count, draw, @mention, generate) — all overflow on small screens. Uses `#ccff00` lime green colors.
3. **Video Studio**: Fixed padding `p-8` doesn't scale. Content layout assumes desktop widths.
4. **Edit Studio**: Landing page uses `pt-24` large hero text at `text-5xl md:text-7xl` which works, but the workspace view has fixed sidebars (80px asset rail + 240px right panel) that don't collapse on mobile.
5. **Lipsync Studio**: Fixed left sidebar at `w-[260px]` with `left-[260px]` content offset — completely breaks on mobile (sidebar covers entire viewport). Uses `#ccff00` lime.
6. **Cinema Studio**: Audio tab has a 88px turnable dial in the bottom bar — too large for mobile. Cast/Image/Video tabs have horizontal layouts that overflow.
7. **Worldview**: Uses `#BEFF00` lime green throughout. Feature cards grid `grid-cols-2 md:grid-cols-4` is decent but CTA and text need mobile sizing.
8. **Characters**: Appears to work (max-w-1200px centered) but the gallery header gets clipped on small screens (visible in screenshot).
9. **Remaining lime green (`#ccff00`, `#BEFF00`)**: Still present in Image Studio, Video Studio, Lipsync Studio, Worldview, and various shared components.
10. **Mobile bottom nav overlaps studio content**: Studios use `fixed inset-0 top-[68px]` but don't account for the ~56px mobile bottom nav.

## Solution

### 1. Header — Mobile-First Redesign (`KanvasPage.tsx`)

- On `md:hidden`: Hide the center pill-slider nav entirely (replaced by bottom nav)
- Shrink logo to `h-10` on mobile, keep `h-14` on desktop
- Right actions: Show only Settings dropdown on mobile (contains Home + Theme toggle inside)
- On `md:` and up: Keep current layout unchanged

### 2. Image Studio — Mobile Prompt Bar (`ImageStudioSection.tsx`)

- Wrap prompt bar controls in a responsive layout:
  - Mobile: Stack into 2 rows — top row: input + generate button; bottom row: model pill, aspect ratio, count (horizontally scrollable)
  - Reduce `bottom-8 left-8 right-8` to `bottom-16 left-3 right-3 md:bottom-8 md:left-8 md:right-8` (clear mobile bottom nav)
- Replace all `#ccff00` with `#f97316` (orange)
- Gallery columns: `columns-2 md:columns-4 lg:columns-5` (already correct)

### 3. Video Studio — Responsive Layout (`VideoStudioSection.tsx`)

- Change `p-8` to `px-4 py-4 md:p-8`
- Add `bottom-16 md:bottom-0` padding to account for mobile nav
- Replace `#ccff00` with `#f97316`
- Generate button: Replace `bg-[#ccff00]` with `bg-[#f97316]`

### 4. Edit Studio — Collapsible Panels (`EditStudioSection.tsx`)

- Landing: Replace `#ccff00` with `#f97316`
- Workspace: On mobile, hide the right settings panel and show it as a slide-up sheet triggered by a floating gear button
- Asset rail: Collapse to a horizontal strip at top on mobile instead of fixed left column
- Bottom padding for mobile nav clearance

### 5. Lipsync Studio — Drawer Sidebar (`LipsyncStudioSection.tsx`)

- Replace fixed `w-[260px]` sidebar with:
  - Desktop (`md:`): Keep current sidebar
  - Mobile: Convert to a horizontal step indicator at the top + collapsible drawer
- Content area: `left-0 md:left-[260px]`
- Replace `#ccff00` with `#f97316`

### 6. Cinema Studio — Compact Audio Bar (`CinemaStudioSection.tsx`)

- Audio bottom bar dial: Scale down to `w-[64px] h-[64px] md:w-[88px] md:h-[88px]` on mobile
- Model picker popup: Make full-width on mobile `w-[calc(100vw-2rem)] md:w-[340px]`
- Cast/Image tab grids: `grid-cols-1 md:grid-cols-3` for character cards
- Add `pb-16 md:pb-0` for mobile nav clearance

### 7. Worldview — Orange Theme (`WorldviewSection.tsx`)

- Replace all `#BEFF00` with `#f97316` (orange)
- Replace `bg-[#BEFF00]` buttons with `bg-[#f97316]`
- Feature cards hover: `hover:border-[#f97316]/20`
- Responsive: Already decent, just color swap

### 8. Characters — Mobile Polish (`CharacterCreationSection.tsx` + `CharacterGallery.tsx`)

- Add responsive padding `px-4 md:px-0`
- Ensure "Create New" button and search bar don't get clipped

### 9. Global — Bottom Nav Clearance

All studio sections that use `fixed inset-0 top-[68px]` need `pb-16 md:pb-0` or equivalent to prevent content from being hidden behind the mobile bottom nav.

### 10. Remaining Lime → Orange Sweep

Search and replace across all Kanvas-related files:
- `#ccff00` → `#f97316`
- `#BEFF00` → `#f97316`
- `lime-300` → `orange-400` (contextually)
- `rgba(204,255,0,` → `rgba(249,115,22,`
- `rgba(190,242,100,` → `rgba(249,115,22,`
- `rgba(190,255,0,` → `rgba(249,115,22,`

---

## Files Changed

| File | Change |
|------|--------|
| `src/pages/KanvasPage.tsx` | Hide header pill nav on mobile, shrink logo, consolidate right actions, add bottom nav clearance, lime→orange sweep |
| `src/components/kanvas/ImageStudioSection.tsx` | Responsive prompt bar (2-row mobile layout), mobile margins, lime→orange |
| `src/components/kanvas/VideoStudioSection.tsx` | Responsive padding, mobile bottom clearance, lime→orange |
| `src/components/kanvas/EditStudioSection.tsx` | Collapsible panels on mobile, responsive asset rail, lime→orange |
| `src/components/kanvas/LipsyncStudioSection.tsx` | Drawer sidebar on mobile, horizontal step indicator, lime→orange |
| `src/components/kanvas/CinemaStudioSection.tsx` | Compact dial on mobile, full-width model picker, responsive grids, bottom nav clearance |
| `src/components/worldview/WorldviewSection.tsx` | Full lime→orange color swap |
| `src/components/character-creation/CharacterCreationSection.tsx` | Mobile padding |
| `src/components/character-creation/CharacterGallery.tsx` | Responsive header, prevent clipping |

