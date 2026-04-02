

# Fix Character Blueprints Schema Mismatch

## Problem
The `character_blueprints` table in the database has a different schema than what the service code expects. The code references columns (`slug`, `kind`, `body_details`, `face_details`, `style_details`, `prompt_fragment`, `image_url`, `project_id`, `is_favorite`, `usage_count`) that don't exist. Similarly, `character_blueprint_images` is missing `label`, `is_primary`, and `sort_order` columns.

**Actual DB columns** for `character_blueprints`: `id, user_id, name, description, style, traits, visual_prompt, status, thumbnail_url, metadata, created_at, updated_at`

**Code expects**: `id, user_id, project_id, name, slug, kind, traits, face_details, body_details, style_details, prompt_fragment, image_url, thumbnail_url, is_favorite, usage_count, created_at, updated_at`

## Plan

### Step 1: Add missing columns via migration

Add the missing columns to `character_blueprints`:
- `slug` (text, not null, default '')
- `kind` (text, default 'character')
- `project_id` (uuid, nullable, references projects)
- `face_details` (jsonb, default '{}')
- `body_details` (jsonb, default '{}')
- `style_details` (jsonb, default '{}')
- `prompt_fragment` (text, default '')
- `image_url` (text, nullable)
- `is_favorite` (boolean, default false)
- `usage_count` (integer, default 0)

Add missing columns to `character_blueprint_images`:
- `label` (text, nullable)
- `is_primary` (boolean, default false)
- `sort_order` (integer, default 0)

Add indexes on `slug` and `project_id`. Reload PostgREST schema cache.

### Step 2: Update `rowToBlueprint` mapping

The mapper already reads the correct snake_case column names, so once the columns exist it will work. No code changes needed for the mapper.

### Step 3: Update `rowToImage` mapping

Same — the mapper already reads `label`, `is_primary`, `sort_order`. Just needs the columns to exist.

## Files Changed

| File | Change |
|------|--------|
| Database (migration) | Add missing columns to both tables, add indexes, reload schema |

No code changes required — the service already maps correctly, the columns just don't exist yet.

