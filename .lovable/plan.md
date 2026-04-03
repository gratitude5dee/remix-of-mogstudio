

# Fix ImageStudioSection crash: `Cannot read properties of undefined (reading 'id')`

## Problem
`getModelProvider(currentModel ?? models[0])` on line 365 crashes when both `currentModel` is null/undefined AND `models` is an empty array — `models[0]` is `undefined`, so `model.id` throws.

## Fix

### `src/components/kanvas/ImageStudioSection.tsx`

1. **Guard `getModelProvider`** — add a null check at the top of the function:
```ts
function getModelProvider(model: KanvasModel | undefined | null): string {
  if (!model) return "other";
  const id = model.id.toLowerCase();
  // ... rest unchanged
}
```

2. **Guard the prompt bar render** — wrap the model-dependent UI in a fallback when no model is available. Specifically on line 365, the `currentModel ?? models[0]` expression should already be safe after the guard above, but also guard the model name display on line ~367-368.

This is a one-line root cause fix in the `getModelProvider` function signature + early return.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/ImageStudioSection.tsx` | Add null guard to `getModelProvider` |

