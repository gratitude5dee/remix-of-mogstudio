

# Fix Evaluation Job Failures + Improve Observability UI

## Root Cause

The `evaluate-storyboard-packet` edge function inserts into `evaluation_results` without providing `test_id` or `model_id`, both of which are `NOT NULL` in the remote DB. The shadow evaluator doesn't use these legacy columns (they're from an older text-to-image evaluation schema).

## Plan

### 1. Migration: Make `test_id` and `model_id` nullable

```sql
ALTER TABLE public.evaluation_results ALTER COLUMN test_id DROP NOT NULL;
ALTER TABLE public.evaluation_results ALTER COLUMN model_id DROP NOT NULL;

-- Clean up stuck evaluation runs
UPDATE public.evaluation_runs
SET status = 'failed', completed_at = now(),
    error_message = 'Orphaned by schema constraint failure'
WHERE status = 'running'
  AND started_at < now() - interval '5 minutes';

NOTIFY pgrst, 'reload schema';
```

### 2. Redeploy `evaluate-storyboard-packet`

No code changes needed — the function is correct, it's just the DB constraints that were blocking it.

### 3. Improve Observability Page UI

Redesign `src/pages/ProjectObservabilityPage.tsx` with:

- **Refined header**: Gradient accent bar, better hierarchy with a subtle system status indicator (green dot when healthy, amber when jobs failing)
- **Overview tab**: Replace plain `MetricCard` with animated stat cards showing sparkline-style indicators; use color-coded status dots; add a mini timeline strip showing last 24h activity
- **Runs tab**: Add status icon (check/x/spinner) per row, color-code the left border of each card by status (green=completed, red=failed, amber=running), add relative timestamps ("2 min ago"), add filter chips for status
- **Judges tab**: Render score as a visual bar (not just text), show confidence as a subtle opacity gauge, better layout for criterion breakdowns
- **Review tab**: Cleaner action buttons with better spacing, inline status transitions
- **Overall**: Use consistent `border-l-2` status indicators, softer card backgrounds with glass effect, better typography hierarchy

## Files changed

| File | Change |
|------|--------|
| New migration SQL | Drop NOT NULL on `test_id`, `model_id`; fail stuck runs |
| `src/pages/ProjectObservabilityPage.tsx` | UI redesign with status indicators, visual scores, better layout |

