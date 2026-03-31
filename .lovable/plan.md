

# Fix NodeHoverMenu Centering — Stronger Adjustment

The previous changes (`-translate-x-[56%]`, `10px` gap) are in the code but the visual difference is too subtle. The menu needs a more aggressive leftward shift and the gap needs to be larger.

## Change

**File: `src/components/studio/nodes/NodeHoverMenu.tsx` (line 153)**

| Property | Current | Updated |
|----------|---------|---------|
| Horizontal translate | `-translate-x-[56%]` | `-translate-x-[62%]` |
| Vertical gap | `calc(100%+10px)` | `calc(100%+14px)` |

The `62%` shift pushes the menu further left to visually center it over the node content area. The `14px` gap provides clearer separation between the toolbar and the node.

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Update translate-x to 62% and gap to 14px on line 153 |

