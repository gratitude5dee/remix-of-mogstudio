

# Fix Evaluation Job Failures + Switch to Gemini 3.1 Flash

## Root Cause

The `evaluate-storyboard-packet` edge function fails because the remote `evaluation_runs` table has an **old schema** with `user_id NOT NULL`, `models NOT NULL`, and `tests NOT NULL` columns. The migration's `CREATE TABLE IF NOT EXISTS` was silently skipped (table already existed), so these old NOT NULL constraints remain. The edge function insert omits these fields, causing the constraint violation.

## Plan

### 1. Migration: Fix `evaluation_runs` schema drift

New migration to reconcile the old table with the expected shape:

```sql
-- Make old NOT NULL columns nullable or provide defaults
ALTER TABLE public.evaluation_runs ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.evaluation_runs ALTER COLUMN models SET DEFAULT '[]'::jsonb;
ALTER TABLE public.evaluation_runs ALTER COLUMN models DROP NOT NULL;
ALTER TABLE public.evaluation_runs ALTER COLUMN tests SET DEFAULT '[]'::jsonb;
ALTER TABLE public.evaluation_runs ALTER COLUMN tests DROP NOT NULL;

-- Fix status default to match new schema
ALTER TABLE public.evaluation_runs ALTER COLUMN status SET DEFAULT 'queued';

-- Fix mode check constraint to allow new values
ALTER TABLE public.evaluation_runs DROP CONSTRAINT IF EXISTS evaluation_runs_mode_check;
ALTER TABLE public.evaluation_runs ADD CONSTRAINT evaluation_runs_mode_check
  CHECK (mode IS NULL OR mode IN ('off', 'shadow', 'soft_gate', 'hard_gate', 'text-to-image'));

-- Fix status check constraint
ALTER TABLE public.evaluation_runs DROP CONSTRAINT IF EXISTS evaluation_runs_status_check;
ALTER TABLE public.evaluation_runs ADD CONSTRAINT evaluation_runs_status_check
  CHECK (status IS NULL OR status IN ('queued', 'running', 'completed', 'failed', 'pending'));

-- Notify PostgREST to reload
NOTIFY pgrst, 'reload schema';
```

### 2. Redeploy `evaluate-storyboard-packet` (no code changes needed)

The edge function code is correct — it just needs the DB schema to match. Once migration is applied, existing code will work.

### 3. LinkedIn/ad-blocker errors — not from your app

The `px.ads.linkedin.com` and `ERR_BLOCKED_BY_CLIENT` errors are from an ad blocker blocking tracking pixels on the Lovable editor page. No action needed.

## Files changed

| File | Change |
|------|--------|
| New migration SQL | Fix `evaluation_runs` NOT NULL constraints and check constraints |

