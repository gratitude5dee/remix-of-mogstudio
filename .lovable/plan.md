

# Fix: WorldLabs 401 + gen-shots Credit Race Condition

## Two Distinct Issues

### Issue 1: WorldLabs "Unauthorized" (401)
The `worldlabs-proxy` edge function correctly passes the `WORLDLABS_API_KEY` to the WorldLabs API, but WorldLabs rejects it. The key stored in your Supabase secrets is invalid, expired, or revoked.

**Action required (by you):**
1. Get a valid API key from [World Labs](https://my.worldlabs.ai/)
2. Update the secret in Supabase Dashboard → Settings → Edge Function Secrets
3. Set `WORLDLABS_API_KEY` to the new value

No code changes needed for this issue.

### Issue 2: gen-shots "Credit deduction failed after retries" (500)
When generating shots for multiple scenes in parallel (e.g. via "Generate All"), many `gen-shots` invocations simultaneously try to CAS-update the same `user_credits` row. The current approach reads `used_credits`, then tries `UPDATE ... WHERE used_credits = <expected>`. With 5+ concurrent calls, all but one fail each round, and 6 retries with short backoff isn't enough.

**Fix:** Replace the application-level CAS loop with a PostgreSQL function that uses `SELECT ... FOR UPDATE` row locking. This guarantees atomic credit deduction without retries.

#### Changes:

1. **New DB migration** — Create a `deduct_credits` PL/pgSQL function:
   - Takes `p_user_id`, `p_amount` 
   - `SELECT ... FOR UPDATE` on `user_credits` row
   - Checks available >= requested, updates `used_credits` in one atomic step
   - Returns new available balance or raises exception if insufficient

2. **Update `supabase/functions/_shared/credits.ts`** — Replace the CAS retry loop in `reserveCredits` with a single `.rpc('deduct_credits', ...)` call. Remove the retry logic entirely.

This eliminates all race conditions regardless of concurrency level.

