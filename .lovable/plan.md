

# Switch gen-shots to Groq API + Confirm Performance Measure Fix

## 1. Switch gen-shots AI call from Lovable Gateway to Groq

**File: `supabase/functions/gen-shots/index.ts` (lines 184-202)**

Replace:
```ts
const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'google/gemini-3-flash-preview',
    messages: [...],
  }),
});
```

With:
```ts
const aiResp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${Deno.env.get('GROQ_API_KEY')}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'llama-3.3-70b-versatile',
    messages: [...],
  }),
});
```

Same messages/system prompt, just different endpoint, key, and model. The existing `GROQ_API_KEY` is already configured (used by `groq-stream` function).

Redeploy `gen-shots` after editing.

## 2. Performance measure error — already fixed

The guard in `useShotStream.ts` (lines 128-129) already checks `performance.getEntriesByName()` before calling `measure()`, and the catch block silently ignores errors. The errors the user sees are from a **cached previous build** — the old code had a `console.warn` in the catch block. A fresh page reload after the next build will resolve this. No code changes needed.

## Files changed

| File | Change |
|------|--------|
| `supabase/functions/gen-shots/index.ts` | Switch from Lovable AI Gateway to Groq API (`GROQ_API_KEY` + `llama-3.3-70b-versatile`) |

