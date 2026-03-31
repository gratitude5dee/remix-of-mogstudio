

# Fix Model Marketplace Overflow — Make Left Pane Scrollable

## Problem

The left pane (settings + pinned + featured + providers) has no scroll container wrapping it as a whole. When there are enough pinned/featured models, the content overflows beyond the popover's max height and gets clipped — the user can't scroll to see all items.

## Fix

**File: `src/components/studio/model-selector/FloraModelMarketplace.tsx`**

1. **Wrap the entire left pane in a `ScrollArea`** — The `<div className="min-h-0 space-y-2.5">` (line 338) needs to become a scroll container so all its children (settings, pinned, featured, providers) scroll together when content exceeds the available height.

2. **Remove the inner provider-only `ScrollArea`** (line 404) — It's redundant once the whole left pane scrolls. Keeping it creates nested scroll regions which is bad UX.

3. **Ensure the grid row uses `min-h-0 overflow-hidden`** on both columns so flex/grid children respect the max-height constraint and allow scrolling.

### Specific changes (line 338):

| Current | Updated |
|---------|---------|
| `<div className="min-h-0 space-y-2.5">` | `<ScrollArea className="min-h-0" style={{ maxHeight: rightPaneMaxHeight }}>` + inner `<div className="space-y-2.5 pr-2">` |

### Remove nested ScrollArea (line 404):

Replace:
```tsx
<ScrollArea className={cn('pr-2', ...)} style={{ maxHeight: providerListMaxHeight }}>
  <div className="space-y-1.5">
    {providers.map(...)}
  </div>
</ScrollArea>
```

With just:
```tsx
<div className="space-y-1.5">
  {providers.map(...)}
</div>
```

4. **Reduce NodeHoverMenu gap** — Change `-translate-y-[calc(100%+10px)]` to `-translate-y-[calc(100%+5px)]` in `NodeHoverMenu.tsx` (line 148) to bring it 5px closer to the node.

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/model-selector/FloraModelMarketplace.tsx` | Wrap left pane in ScrollArea, remove nested provider ScrollArea |
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Reduce vertical gap from 10px to 5px |

