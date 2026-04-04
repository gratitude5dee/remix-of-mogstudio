

# Dashboard UI Polish — Glowing Sidebar + Layout Fix

## Problems Identified

1. **Dead space when collapsed**: The sidebar is now `fixed` (floating), but `Home.tsx` still animates `marginLeft: 64px` when collapsed — creating 64px of empty space on the left since the floating sidebar doesn't occupy flow space.
2. **No glowing orange stroke on floating sidebar**: The expanded sidebar has a `ShineBorder` on hover, but the collapsed floating pill has no animated border glow.
3. **Tooltips**: Already implemented for collapsed mode — no change needed there.
4. **Expanded sidebar**: Already has `ShineBorder` on hover — will enhance with a persistent subtle animated orange border glow instead of hover-only.

## Changes

### 1. `src/pages/Home.tsx` — Fix collapsed margin

Line 234: Change `animate={{ marginLeft: isCollapsed ? 64 : 256 }}` to `animate={{ marginLeft: isCollapsed ? 0 : 256 }}` since the collapsed sidebar is now a floating overlay (`fixed`) and doesn't consume layout space.

### 2. `src/components/home/Sidebar.tsx` — Glowing orange stroke on floating pill

**Collapsed (floating) mode** (lines 231-237):
- Add an animated orange border glow using a CSS `box-shadow` animation or the existing `ShineBorder` component
- Replace `border border-white/[0.06]` with an animated orange running stroke: wrap the `<aside>` content in a container with `ShineBorder` using `shineColor="#f97316"` and `borderWidth={1}`
- Add a subtle persistent outer glow: `shadow-[0_0_15px_rgba(249,115,22,0.15),0_0_30px_rgba(249,115,22,0.05)]`

**Expanded mode** (lines 336-347):
- Make the `ShineBorder` always visible (change `opacity-0 group-hover/sidebar:opacity-100` to `opacity-60 group-hover/sidebar:opacity-100`) so there's always a subtle running orange stroke
- Add matching outer glow shadow to the expanded sidebar container

### 3. `src/components/home/Sidebar.tsx` — Floating pill visual refinements

- Add a faint orange gradient top-highlight inside the floating pill (matching expanded mode's `from-orange-500/5`)
- Increase the lime-dot or add an orange dot at the bottom of the floating pill for brand consistency

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Fix collapsed marginLeft from 64 to 0 |
| `src/components/home/Sidebar.tsx` | Add ShineBorder glow to floating pill, make expanded glow persistent, add outer orange shadow |

