

# Fix Console Errors

## Analysis

### Errors NOT from your app (ignore these)
- `chrome-extension://` SyntaxError — browser extension, not your code
- `SES Removing unpermitted intrinsics` — MetaMask/lockdown, not your code
- `px.ads.linkedin.com`, `connect.facebook.net/fbevents.js` `ERR_BLOCKED_BY_CLIENT` — ad blocker blocking tracking pixels on the Lovable editor page itself
- `RS SDK - TikTok Ads / Google Ads` event name warnings — Lovable's own analytics SDK, not your app
- `Unrecognized feature: 'vr'`, `'ambient-light-sensor'`, `'battery'` — Lovable editor iframe sandbox permissions, not your app
- `preloaded using link preload but not used` — Lovable editor asset preloading, not your app

### Errors FROM your app (fixable)

**1. Supabase 404/400 on observability tables and columns**
All tables and columns exist in the database. The issue was **PostgREST's schema cache** not being reloaded after the migration. I've already executed `NOTIFY pgrst, 'reload schema'` which tells PostgREST to pick up the new tables/columns. This should resolve all 404s and 400s on the next page load.

**2. Performance mark warning in `useShotStream.ts`** (lines 127-134)
The `performance.mark()` is created with a timestamp-based name at stream start (line 156-158). When cleanup runs via `clearPerformance()` (called by `cancel()` at line 153), it clears the mark. But `recordMeasure('done')` at line 243 still tries to use that mark name — if the stream completes after a re-start or if `clearPerformance` ran, the mark no longer exists.

The current catch block (line 129) already swallows the error but logs a warning when `import.meta.env.DEV` is true. The warning is harmless. To suppress it entirely:

**File: `src/hooks/useShotStream.ts`**
- In `recordMeasure` (line 124), add a check: verify the mark actually exists before calling `performance.measure()`:
```ts
const recordMeasure = useCallback(
  (suffix: string) => {
    if (typeof performance === 'undefined' || !markRef.current) return;
    const measureName = `${markRef.current}:${suffix}`;
    measureNamesRef.current.push(measureName);
    try {
      // Verify mark exists before measuring
      const marks = performance.getEntriesByName(markRef.current, 'mark');
      if (marks.length === 0) return;
      performance.measure(measureName, markRef.current);
    } catch {
      // Silently ignore — mark may have been cleared
    }
  },
  []
);
```

## Summary

| Issue | Fix |
|-------|-----|
| 404/400 on observability tables | Already fixed — sent `NOTIFY pgrst, 'reload schema'` to refresh PostgREST cache |
| Performance mark warning | Guard `recordMeasure` with `getEntriesByName` check, remove DEV-only warn |
| External browser/extension errors | No action — not from your app |

One file changed: `src/hooks/useShotStream.ts`

