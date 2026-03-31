

# Fix Credits Display on Billing Page

## Problem

The "Credits remaining" card on the billing page always shows **0 available / 0 monthly quota** because:

1. `useCredits()` returns `wallet: null` — it uses the legacy `get_available_credits` RPC which only returns a number, not a wallet object
2. The billing page's `walletSummary` memo reads `wallet?.available_total` and `wallet?.monthly_quota`, both undefined → 0
3. The actual credit balance lives in `availableCredits` from `useCredits()`, which is never used on this page

## Fix

**File: `src/pages/SettingsBillingPage.tsx`**

1. Destructure `availableCredits` from `useCredits()` alongside `wallet` and `plan`
2. Update the `walletSummary` memo to fall back to `availableCredits` when `wallet` is null:
   - `available` = `wallet?.available_total ?? availableCredits ?? 0`
   - `monthlyQuota` = `wallet?.monthly_quota ?? 100` (fallback to the free plan default of 100)
   - Progress bar percentage calculated from these corrected values
3. This ensures the legacy credit system's balance is always reflected, while still supporting the wallet system if it's ever enabled

## Technical detail

```
walletSummary logic:
  available  = wallet?.available_total  ??  availableCredits  ??  0
  quota      = wallet?.monthly_quota    ??  plan?.monthly_quota  ??  100
  percentage = quota > 0 ? clamp(available / quota * 100) : (available > 0 ? 100 : 0)
```

## Files changed

| File | Change |
|------|--------|
| `src/pages/SettingsBillingPage.tsx` | Use `availableCredits` as fallback in wallet summary calculation |

