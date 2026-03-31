

# Fix NodeHoverMenu Placement & Spacing

Based on the reference images, the hover menu needs to sit closer to the node (tighter gap) and remain horizontally centered.

## Changes

### `src/components/studio/nodes/NodeHoverMenu.tsx` (line 153)

Reduce the vertical gap from `12px` to `6px` and tighten internal padding:

| Property | Current | Updated |
|----------|---------|---------|
| Vertical offset | `-translate-y-[calc(100%+12px)]` | `-translate-y-[calc(100%+6px)]` |
| Internal padding | `px-1.5 py-1` | `px-1 py-0.5` |
| Item gap | `gap-1` | `gap-0.5` |
| Border radius | `rounded-[16px]` | `rounded-[12px]` |

This brings the toolbar snug against the top edge of the node while keeping it centered via the existing `left-1/2 -translate-x-1/2`.

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Tighten spacing: smaller gap, padding, and border radius |

