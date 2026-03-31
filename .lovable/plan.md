

# Add 100 Credits to All Accounts

## Current State
- 14 existing users in `user_credits` table
- New account trigger (`grant_free_credits`) already grants 100 credits on profile creation — no change needed there

## Plan

### 1. Database migration: Add 100 credits to all existing accounts

Run a single SQL migration that:
- Adds 100 to `total_credits` for every row in `user_credits`
- Records a `credit_transactions` entry for each user (type `free`, resource `credit`, metadata noting "Bonus credits grant")

```sql
-- Add 100 credits to all existing users
UPDATE public.user_credits
SET total_credits = total_credits + 100,
    updated_at = now();

-- Record transactions for audit trail
INSERT INTO public.credit_transactions (user_id, amount, transaction_type, resource_type, metadata)
SELECT user_id, 100, 'free', 'credit', '{"description": "Bonus 100 credits grant"}'::jsonb
FROM public.user_credits;
```

### 2. New accounts — already handled
The existing `grant_free_credits` trigger on `profiles` already inserts 100 credits for every new user. No changes needed.

## Files changed
| File | Change |
|------|--------|
| New migration SQL | Add 100 credits to all 14 existing accounts + transaction records |

