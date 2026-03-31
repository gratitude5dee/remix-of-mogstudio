

# Fix NodeHoverMenu Centering — Separate Positioning from Animation

## Root Cause

The `motion.div` owns both the CSS `transform` (via Tailwind's `-translate-x-1/2`, `-translate-y-[calc(100%+10px)]`) **and** the Framer Motion animation (`scale`, `y`). Framer Motion compiles all transform properties into a single `transform` string at render time, overriding Tailwind's translate values. This causes the menu's left edge to sit at the anchor point instead of centering.

The `left-[42%]` hack was an attempt to compensate but doesn't solve the fundamental conflict.

## Fix

Split into two elements: a **static outer wrapper** for positioning and an **animated inner div** for visual effects.

### `src/components/studio/nodes/NodeHoverMenu.tsx` (~line 144–157)

**Current:**
```tsx
<AnimatePresence>
  {isVisible ? (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        'absolute left-[42%] top-0 z-30 flex -translate-x-1/2 -translate-y-[calc(100%+10px)] items-center gap-1 rounded-[16px] border border-[rgba(249,115,22,0.12)] bg-[#111111] px-1.5 py-1 shadow-[0_0_12px_rgba(249,115,22,0.08),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md',
        className
      )}
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
```

**New:**
```tsx
<AnimatePresence>
  {isVisible ? (
    <div
      className="absolute left-1/2 top-0 z-30 -translate-x-1/2 -translate-y-[calc(100%+10px)]"
      onMouseDown={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
    >
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8, scale: 0.96 }}
        transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'flex items-center gap-1 rounded-[16px] border border-[rgba(249,115,22,0.12)] bg-[#111111] px-1.5 py-1 shadow-[0_0_12px_rgba(249,115,22,0.08),0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-md',
          className
        )}
      >
```

And close both elements at the end (add `</div>` after `</motion.div>`).

Key points:
- `left-1/2` restored (no more `42%` hack) — true mathematical center
- Positioning classes on static `div` so Framer Motion can't override them
- Animation `y` / `scale` on inner `motion.div` only affects visual appearance, not positioning
- Event guards moved to outer wrapper so clicks anywhere on the menu are caught
- `className` prop still applied to inner visual surface
- No prop/API changes

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Wrap `motion.div` in static positioning `div`; move anchor classes to wrapper |

