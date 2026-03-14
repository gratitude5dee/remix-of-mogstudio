

# Fix: Add missing `short_film_data` column to `projects` table

## Problem
The error "Could not find the 'short_film_data' column of 'projects' in the schema cache" occurs because the code writes `short_film_data` to the `projects` table, but this column doesn't exist in the database.

The column is referenced in 3 places:
1. `src/components/project-setup/ProjectContext.tsx` — saves `short_film_data` when creating/updating projects
2. `supabase/functions/generate-storylines/index.ts` — selects it when generating storylines
3. `supabase/functions/generate-storylines/prompts.ts` — reads it for prompt building

The other format-specific columns (`ad_brief_data`, `music_video_data`, `infotainment_data`) already exist as `jsonb` columns. `short_film_data` simply needs to be added with the same pattern.

## Fix
Run a single database migration:

```sql
ALTER TABLE public.projects 
ADD COLUMN short_film_data jsonb DEFAULT NULL;
```

No code changes needed — the column name already matches what all 3 files expect.

