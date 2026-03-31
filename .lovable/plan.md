

# Fix NodeHoverMenu Centering — Use `left` offset instead of `translate-x`

## Problem

The `translate-x` percentage is relative to **the menu's own width**, not the node's width. So changing from `-translate-x-1/2` to `-translate-x-[58%]` only shifts a few pixels — barely noticeable. To actually move the menu leftward, we need to change the `left` anchor point.

## Change

**File: `src/components/studio/nodes/NodeHoverMenu.tsx` (line 153)**

| Property | Current | Updated |
|----------|---------|---------|
| `left` | `left-1/2` (50%) | `left-[42%]` |
| `translate-x` | `-translate-x-[58%]` | `-translate-x-1/2` |

By moving the anchor from `left: 50%` to `left: 42%`, the menu shifts 8% of the **node's width** to the left (~22px on a 280px node). Then `-translate-x-1/2` correctly centers the menu around that anchor point. This produces a visible, meaningful shift.

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Change `left-1/2` → `left-[42%]` and `-translate-x-[58%]` → `-translate-x-1/2` |

