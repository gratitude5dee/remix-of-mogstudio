

# Fix Kanvas Image Rendering After Generation

## Root Cause

The `normalizeKanvasJobRow` function in `src/features/kanvas/helpers.ts` expects **snake_case** database column names (`row.result_payload`, `row.result_url`, `row.created_at`, etc.). This works for the initial `listKanvasJobs()` call which reads directly from the Supabase DB.

However, `submitKanvasJob` and `refreshKanvasJobStatus` return data from edge functions that have already been mapped to **camelCase** (`resultPayload`, `resultUrl`, `createdAt`). When `normalizeKanvasJobRow` reads `row.result_payload` on a camelCase object, it gets `undefined`, producing `resultPayload: null`. The preview then shows "Ready to generate" because there's no result URL to display.

This affects **all models** — the first-loaded jobs from the DB show fine, but any newly generated or polled job never renders its output.

## Fix

### Step 1: Make `normalizeKanvasJobRow` handle both formats
**File: `src/features/kanvas/helpers.ts`**

Update the normalizer to read both snake_case and camelCase property names with fallback logic:

```ts
// For each field, try snake_case first (DB rows), then camelCase (edge function responses)
const rawResultPayload = row.result_payload ?? row.resultPayload;
const rawResultUrl = row.result_url ?? row.resultUrl;
const rawCreatedAt = row.created_at ?? row.createdAt;
const rawUpdatedAt = row.updated_at ?? row.updatedAt;
// ... same pattern for all fields
```

This single change fixes the entire rendering pipeline because `submitKanvasJob`, `refreshKanvasJobStatus`, and `listKanvasJobs` all funnel through this normalizer.

### Step 2: Verify `mergeAssets` sort safety
**File: `src/pages/KanvasPage.tsx`**

The `mergeAssets` function (line 112-114) also uses `.localeCompare` on `created_at` without null-safety. Apply the same fallback pattern used in `mergeJobs`.

## Files Changed

| File | Change |
|------|--------|
| `src/features/kanvas/helpers.ts` | Dual snake_case/camelCase field resolution in `normalizeKanvasJobRow` |
| `src/pages/KanvasPage.tsx` | Null-safe `mergeAssets` sort |

