

# Kanvas Header: Double Logo + Settings & Theme Controls

## Changes

### 1. `src/pages/KanvasPage.tsx` — Header redesign

**Left section** (lines 1175-1178):
- Double the logo size: `h-10` → `h-20`
- Add `ALPHA` badge (matching Home page style)

**Right section** (lines 1212-1213): Replace empty spacer with action buttons:
- **Home button**: icon button navigating to `appRoutes.home`
- **Theme toggle**: import and render `ThemeToggle` component
- **Settings dropdown**: `DropdownMenu` with items for "Preferences", "Keyboard Shortcuts", "About" (visual placeholders for now) — uses `Settings` icon from lucide

All buttons styled as `h-9 w-9 rounded-full bg-white/[0.04] border border-white/[0.06]` with hover states, matching the Noir Futurist aesthetic.

### 2. `src/components/kanvas/KanvasSidebar.tsx` — Double logo

- Line 122: Change bottom logo from `h-6 w-6` → `h-10 w-10` (container `h-8 w-8` → `h-12 w-12`)

### 3. `src/components/ui/theme-toggle.tsx` — Dark-mode safe styling

- Update button classes to work on the dark Kanvas background (currently uses `bg-muted/50` which may not contrast well)

## Files Changed

| File | Change |
|------|--------|
| `src/pages/KanvasPage.tsx` | Double logo, add Home/ThemeToggle/Settings dropdown to right side of header |
| `src/components/kanvas/KanvasSidebar.tsx` | Double bottom logo size |
| `src/components/ui/theme-toggle.tsx` | Ensure dark-bg compatibility |

