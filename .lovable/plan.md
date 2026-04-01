

# Fix KanvasPage `localeCompare` Crash & Improve Image Loading

## Root Cause

The `mergeJobs` function on line 122-124 of `KanvasPage.tsx` sorts jobs using:
```ts
right.createdAt.localeCompare(left.createdAt)
```

When a job comes back from the backend with `created_at` as `null` or `undefined`, `normalizeKanvasJobRow` maps it directly (`createdAt: row.created_at`), producing an undefined `createdAt`. The `.localeCompare()` call then throws.

## Plan

### 1. Fix the `mergeJobs` sort crash
**File: `src/pages/KanvasPage.tsx` (lines 122-124)**

Add null-safe sorting:
```ts
return Array.from(map.values()).sort((left, right) =>
  (right.createdAt ?? '').localeCompare(left.createdAt ?? '')
);
```

### 2. Add defensive default in `normalizeKanvasJobRow`
**File: `src/features/kanvas/helpers.ts` (line 330)**

Ensure `createdAt` always has a fallback:
```ts
createdAt: row.created_at ?? new Date().toISOString(),
updatedAt: row.updated_at ?? new Date().toISOString(),
```

### 3. Improve image rendering performance
**File: `src/pages/KanvasPage.tsx`**

Add `loading="lazy"` and `decoding="async"` to the 4 `<img>` tags (asset thumbnails at lines ~416, ~502, ~1601, and the main preview at ~612) to reduce blocking during render:
- Thumbnail images: add `loading="lazy" decoding="async"`
- Main preview image: add `decoding="async"` (keep eager loading since it's above the fold)

## Files Changed

| File | Change |
|------|--------|
| `src/pages/KanvasPage.tsx` | Null-safe `mergeJobs` sort; add `loading`/`decoding` attrs to images |
| `src/features/kanvas/helpers.ts` | Fallback defaults for `createdAt`/`updatedAt` in normalizer |

