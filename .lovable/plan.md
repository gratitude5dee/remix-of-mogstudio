

# Fix NodeHoverMenu Centering & Spacing

## Change

**File: `src/components/studio/nodes/NodeHoverMenu.tsx` (line 153)**

Shift the horizontal center slightly left and increase the vertical gap:

| Property | Current | Updated |
|----------|---------|---------|
| Horizontal translate | `-translate-x-1/2` | `-translate-x-[56%]` |
| Vertical gap | `calc(100%+6px)` | `calc(100%+10px)` |

The `56%` compensates for asymmetric node content that makes a pure `50%` center appear right-biased. The `10px` gap gives more breathing room between the toolbar and the node.

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Update translate values on line 153 |

