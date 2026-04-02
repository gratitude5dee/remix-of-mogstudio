

# Fix Character Blueprints Table & Build Errors

## Problem
1. **Migration not applied**: The file `20260401120000_create_character_creation.sql` exists but `character_blueprints` and `character_blueprint_images` tables were never created in the database — hence the "Could not find table in schema cache" error.
2. **Mammoth import error**: `supabase/functions/document-parse/index.ts` uses `import('npm:mammoth')` which Deno can't resolve without a `deno.json` mapping. This causes the edge function build to fail for the entire project.
3. **TypeScript errors**: `characterBlueprintService.ts` has `as Record<string, unknown>` casts that conflict with the Supabase `SelectQueryError` type since the table isn't in the generated types yet.

## Plan

### Step 1: Create the database tables via migration tool
Run the SQL from the existing migration file to create `character_blueprints` and `character_blueprint_images` with all indexes, RLS policies, and the trigger. Then reload the PostgREST schema cache with `NOTIFY pgrst, 'reload schema'`.

### Step 2: Fix the mammoth import in document-parse
**File: `supabase/functions/document-parse/index.ts`** (line 59)

Change `import('npm:mammoth')` to use an ESM CDN like the PDF import on line 50:
```ts
const mammoth = await import('https://esm.sh/mammoth@1.8.0');
```

### Step 3: Fix TypeScript cast errors in characterBlueprintService.ts
**File: `src/services/characterBlueprintService.ts`**

Change all `as Record<string, unknown>` and `as Record<string, unknown>[]` casts to go through `unknown` first to satisfy TypeScript's overlap check:
- Line 58: `(data as unknown as Record<string, unknown>[])` 
- Line 73: `(data as unknown as Record<string, unknown>)`
- Line 120: same pattern
- Line 166: same pattern  
- Line 214: same pattern for array
- Line 235: same pattern

### Step 4: Regenerate Supabase types
After the migration applies, the generated types file will update to include `character_blueprints` and `character_blueprint_images`, eliminating the `SelectQueryError` type issues long-term.

## Files Changed

| File | Change |
|------|--------|
| Database (migration) | Create `character_blueprints` + `character_blueprint_images` tables, indexes, RLS, trigger |
| `supabase/functions/document-parse/index.ts` | Fix mammoth import to use esm.sh CDN |
| `src/services/characterBlueprintService.ts` | Fix TypeScript cast errors with `unknown` intermediate |

