

# Fix Cinema Studio Spacing + Sidebar/Bottom Bar Conflict

## Problems

1. **Top dead space**: Header is ~68px tall (`h-14` logo = 56px + `py-1.5` = 12px padding) but Cinema Studio uses `top-[44px]`, leaving ~24px gap. Other studios also use `top-[44px]`.
2. **Sidebar overlaps bottom bar**: `KanvasSidebar` hover zone uses `h-screen` and the floating pill doesn't account for the 32px bottom status bar — it can extend behind or visually conflict with the footer.

## Changes

### 1. `src/components/kanvas/CinemaStudioSection.tsx` — Fix top offset
- Change `top-[44px]` to `top-[68px]` to match the actual header height

### 2. `src/components/kanvas/VideoStudioSection.tsx`, `ImageStudioSection.tsx`, `EditStudioSection.tsx`, `LipsyncStudioSection.tsx` — Same fix
- Change all `top-[44px]` to `top-[68px]`

### 3. `src/components/kanvas/KanvasSidebar.tsx` — Clear bottom bar
- Hover trigger zone: change `h-screen` to `h-[calc(100vh-2rem)]` so it stops above the bottom status bar
- Floating pill: change `top-[calc(50%-1rem)]` to `top-[calc(50%-1.5rem)]` to vertically center between header and bottom bar
- Add `bottom-10` or equivalent constraint so the pill never visually overlaps the footer

### 4. `src/pages/KanvasPage.tsx` — Bottom status bar z-index
- Ensure bottom bar `z-50` (currently `z-40`) so it always renders above the sidebar (`z-50`) — or bump sidebar down to `z-45`. Simplest: set bottom bar to `z-[55]`.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/CinemaStudioSection.tsx` | `top-[44px]` → `top-[68px]` |
| `src/components/kanvas/VideoStudioSection.tsx` | `top-[44px]` → `top-[68px]` |
| `src/components/kanvas/ImageStudioSection.tsx` | `top-[44px]` → `top-[68px]` |
| `src/components/kanvas/EditStudioSection.tsx` | `top-[44px]` → `top-[68px]` |
| `src/components/kanvas/LipsyncStudioSection.tsx` | `top-[44px]` → `top-[68px]` |
| `src/components/kanvas/KanvasSidebar.tsx` | Shorten hover zone height, adjust vertical centering to clear bottom bar |
| `src/pages/KanvasPage.tsx` | Bump bottom bar z-index to `z-[55]` |

