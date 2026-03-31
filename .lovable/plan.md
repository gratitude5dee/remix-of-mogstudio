

# Fix Supabase Schema Drift + TypeScript Build Errors

## Problem Summary

1. **Migration exists but hasn't been applied** — `20260330170000_shadow_evaluation_observability.sql` is well-written and idempotent, but the remote Supabase DB doesn't have these changes yet. The migration needs to be deployed.

2. **TypeScript type mismatches** — The app's `Scene`, `Character`, etc. interfaces use rich types like `EvaluationSummary` and `ReviewStatus`, but Supabase's generated types use `Json`. When passing these to `.update()` or receiving from `.select()`, TS complains about incompatibility.

3. **`unpdf` Deno import error** — The `document-parse` edge function imports `npm:unpdf` which isn't in `deno.json`. This is a pre-existing issue unrelated to the evaluation work.

4. **`ProjectObservabilityPage.tsx`** passes `task.target_type` (typed as `string`) to `submitReview` which expects a union type.

## Plan

### Step 1: Deploy the existing migration

Use the Supabase migration tool to apply `20260330170000_shadow_evaluation_observability.sql` to the remote database. The SQL is already idempotent — no changes needed to the migration file itself.

### Step 2: Fix TypeScript errors in `src/services/supabaseService.ts`

The `Scene` interface has `evaluation_summary?: EvaluationSummary | null` but Supabase returns `Json`. Fix by:

- In `sceneService.listByProject`: cast the return `data as Scene[]` (already effectively doing this, but need explicit cast)
- In `sceneService.create` and `sceneService.update`: cast the updates payload `as any` before passing to Supabase `.insert()` / `.update()` to avoid the `EvaluationSummary` vs `Json` incompatibility

**Lines ~855, ~866**: Add `as any` cast on the data passed to `.insert()` and `.update()`.

### Step 3: Fix TypeScript errors in `src/pages/Storyboard.tsx` and `src/pages/StoryboardPage.tsx`

Both pages call `supabase.from('scenes').update(updates)` where `updates` contains `evaluation_summary: EvaluationSummary`. Fix by casting `updates as any` in the `.update()` call at:
- `Storyboard.tsx` line ~254
- `StoryboardPage.tsx` line ~251

### Step 4: Fix `ProjectObservabilityPage.tsx` type errors

Lines 411, 422, 433: `task.target_type` is `string` but `submitReview` expects a union. Fix by casting:
```ts
task.target_type as 'character' | 'scene' | 'shot' | 'storyline'
```

### Step 5: Fix `unpdf` Deno import

Add `unpdf` to the import map in `supabase/functions/deno.json` (or the function-local `deno.json`), or switch to a dynamic `npm:` specifier that Deno can resolve. Check if there's a `deno.json` at the functions level.

### Step 6: Regenerate Supabase types

After the migration is applied, the types in `src/integrations/supabase/types.ts` should already reflect the new columns (the current file already has them — `canon_facts`, `evaluation_summary`, etc.). Verify no regeneration is needed.

## Files to modify

| File | Change |
|------|--------|
| `src/services/supabaseService.ts` | Cast scene/character data to `any` for Supabase insert/update |
| `src/pages/Storyboard.tsx` | Cast `updates as any` in `.update()` call |
| `src/pages/StoryboardPage.tsx` | Cast `updates as any` in `.update()` call |
| `src/pages/ProjectObservabilityPage.tsx` | Cast `task.target_type` to union type |
| `supabase/functions/document-parse/index.ts` or `deno.json` | Fix `unpdf` import resolution |

## Migration deployment

Apply the existing `20260330170000_shadow_evaluation_observability.sql` via the Supabase migration tool. No SQL changes needed — the file is already correct and idempotent.

