

# Fix Missing Hover Tooltips on Floating Sidebar

## Problem
The floating sidebar has `overflow-hidden` in its className (line 236), which clips content during the width transition. While Radix tooltips portal to `<body>`, the `overflow-hidden` combined with the narrow `w-3` collapsed state and `pointer-events-none` prevents tooltip triggers from receiving hover events properly. The tooltips ARE in the code but never visually appear.

## Root Cause
Line 236-237 in `Sidebar.tsx`:
```
'transition-all duration-300 ease-out overflow-hidden',
isFloatingVisible ? 'w-14 opacity-100 translate-x-0' : 'w-3 opacity-0 -translate-x-2 pointer-events-none',
```

The `overflow-hidden` is needed for the width collapse animation (so icons don't leak out during the `w-14 → w-3` transition), but it can interfere with tooltip positioning. More critically, the tooltip content needs explicit `z-50` or higher to appear above other elements.

## Fix — `src/components/home/Sidebar.tsx`

1. **Keep `overflow-hidden` only during transition, remove when fully visible**: Change the aside className so `overflow-hidden` is only applied when NOT visible. When `isFloatingVisible` is true, remove it so tooltips can render properly.

2. **Add explicit `sideOffset` to all `TooltipContent`**: Add `sideOffset={8}` to give tooltips breathing room from the pill edge.

3. **Ensure `TooltipContent` has high z-index**: Add `className="z-[60]"` to all `TooltipContent` instances in the floating section to guarantee they render above the `z-50` sidebar.

### Specific line changes:

**Line 236-237** — swap `overflow-hidden` to be conditional:
```tsx
'transition-all duration-300 ease-out',
isFloatingVisible ? 'w-14 opacity-100 translate-x-0' : 'w-3 opacity-0 -translate-x-2 pointer-events-none overflow-hidden',
```

**Lines 263, 305, 330** (all `TooltipContent` in floating section) — add sideOffset and z-index:
```tsx
<TooltipContent side="right" sideOffset={8} className="z-[60]">
```

## Files Changed

| File | Change |
|------|--------|
| `src/components/home/Sidebar.tsx` | Move `overflow-hidden` to collapsed-only state, add `sideOffset={8}` and `z-[60]` to all floating tooltip contents |

