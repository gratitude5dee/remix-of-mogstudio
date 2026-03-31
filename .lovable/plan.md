

# Center NodeHoverMenu Properly Over Node

## Problem

The menu uses a hardcoded `-translate-x-[62%]` which is a fragile hack. Since the menu is absolutely positioned inside the node's `position: relative` container, `left-1/2 -translate-x-1/2` should produce true centering — the menu centers itself relative to the node's width.

The previous off-center appearance was likely caused by the menu's internal content being asymmetric (model selector chip on the left), making a true 50% center *look* off. The fix is to keep true centering but ensure the menu's visual weight is balanced.

## Changes

### `src/components/studio/nodes/NodeHoverMenu.tsx`

**Line 153 — restore true centering with proper gap:**

| Property | Current | New |
|----------|---------|-----|
| Horizontal translate | `-translate-x-[62%]` | `-translate-x-1/2` |
| Vertical gap | `calc(100%+14px)` | `calc(100%+10px)` |

This uses the mathematically correct center. The menu will be centered over the node's full width (including handles/ports), which matches the reference image.

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Fix translate to true 50% center, adjust vertical gap |

