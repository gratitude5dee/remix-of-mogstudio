

# Kanvas Page UI Polish — Tooltips, Settings, and Refinements

## Problems

1. **Sidebar tooltips invisible**: `KanvasSidebar` has `overflow-hidden` on the aside always, clipping tooltip triggers. Same bug fixed on Home sidebar but never applied here.
2. **Settings dropdown is barebones**: Only 3 placeholder items vs. Home page's richer pattern with icons, badges, separators.
3. **Sidebar lacks visual polish**: No glow border (Home sidebar has `ShineBorder`), no gradient highlight, no brand dot.
4. **Header logo oversized at `h-20`**: Creates awkward vertical padding in the slim header bar. Should be `h-10` to fit the compact header while the sidebar carries the larger branding.

## Changes

### 1. `src/components/kanvas/KanvasSidebar.tsx` — Tooltip fix + visual polish

- Move `overflow-hidden` to collapsed-only state (same fix as Home sidebar)
- Add `sideOffset={8}` and `className="z-[60]"` to all `TooltipContent`
- Add `ShineBorder` with lime-green glow `["#BEFF00", "#86efac"]`
- Add faint lime gradient top-highlight overlay
- Add brand dot below logo (lime version of Home's orange dot)

### 2. `src/pages/KanvasPage.tsx` — Header + Settings refinement

**Logo**: Scale down from `h-20` to `h-10` for a compact, professional header bar.

**Settings dropdown upgrade**:
- Add icons to each menu item (lucide: `SlidersHorizontal`, `Keyboard`, `Info`)
- Add "Home" item with `Home` icon at top
- Add "Logout" item with `LogOut` icon at bottom with rose hover
- Add separators between groups
- Add `sideOffset={8}` for breathing room

**Home button**: Add tooltip on hover (wrap in `Tooltip`).

**Settings button**: Add tooltip on hover.

### 3. `src/components/ui/theme-toggle.tsx` — Already updated, no change needed

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/KanvasSidebar.tsx` | Fix tooltip visibility (overflow-hidden conditional), add ShineBorder glow, gradient overlay, sideOffset + z-index on tooltips |
| `src/pages/KanvasPage.tsx` | Shrink header logo to h-10, upgrade settings dropdown with icons and more items, add tooltips to action buttons |

