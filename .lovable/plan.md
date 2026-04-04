

# Apply Floating Hover Menu to Home Sidebar (Collapsed Mode)

## Problem
The home page sidebar in collapsed mode is a static 64px docked column. The user wants the same floating, hover-reveal pill design from the Kanvas sidebar (`KanvasSidebar.tsx`) applied when the sidebar is collapsed.

## Design
When `isCollapsed` is true, the sidebar transforms from a static full-height column into a floating vertically-centered pill that auto-hides and reveals on mouse proximity — identical behavior to the Kanvas floating nav.

```text
Expanded (unchanged)          Collapsed (new floating pill)
┌────────────┐                         
│ Workspace  │                ┌────┐   
│ ─────────  │                │ WS │   
│ All Proj   │    ←→          │ ── │   
│ Kanvas     │                │ 📁 │   
│ Aura       │                │ 🎨 │   
│ ─────────  │                │ ✨ │   
│ Shared     │                │ ── │   
│ Community  │                │ 👥 │   
│            │                │ 🌐 │   
│ ─────────  │                │ ── │   
│ Credits    │                │ 🚪 │   
│ Logout     │                └────┘   
└────────────┘                floating 
```

## Changes — `src/components/home/Sidebar.tsx`

### 1. Add hover-reveal state (collapsed only)
- Add `isVisible` state + `mousemove` listener (same as `KanvasSidebar`)
- Only active when `isCollapsed === true`
- Trigger zone: `e.clientX <= 80`

### 2. Swap container styles when collapsed
- **Remove**: `h-screen fixed left-0 top-0 border-r` (full-height docked)
- **Add**: `fixed left-3 top-1/2 -translate-y-1/2 rounded-2xl` (centered floating pill)
- **Add**: `bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/[0.06]` (frosted glass)
- **Add**: `shadow-[0_8px_32px_rgba(0,0,0,0.5)]` (depth shadow)
- **Add**: Hover transition: `w-14 opacity-100 translate-x-0` ↔ `w-3 opacity-0 -translate-x-2`
- **Add**: `onMouseEnter`/`onMouseLeave` handlers on the `<aside>`
- Add invisible 80px trigger zone div (same as Kanvas)

### 3. Simplify collapsed content
When collapsed + floating:
- Remove section headers ("Main Menu", "Collaborate" text)
- Remove credits card, favorites expand
- Keep: icon buttons with tooltips, dividers between sections, logout at bottom
- Keep the collapse toggle button (repositioned to work with floating pill)

### 4. Expanded mode — unchanged
When `isCollapsed === false`, everything stays exactly as it is today (full-height docked sidebar with all sections).

## Files Changed

| File | Change |
|------|--------|
| `src/components/home/Sidebar.tsx` | Add hover-reveal logic for collapsed state, swap to floating pill container styles, add trigger zone |

