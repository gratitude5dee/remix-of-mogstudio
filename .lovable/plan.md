

# Fix Groq 429 Rate Limiting with Exponential Backoff

## Problem
The `generate-storylines` flow makes 3-4 sequential Groq API calls (quick title, streaming story, structured scenes, analysis). Groq's free tier has aggressive rate limits, and these rapid successive calls trigger 429 errors.

## Solution
Add retry-with-backoff logic at two levels:

### 1. Create shared retry helper (`supabase/functions/_shared/retry.ts`)
A `fetchWithRetry` utility that:
- Retries on 429 responses up to 3 times
- Respects `Retry-After` header if present
- Uses exponential backoff with jitter (2^attempt * 1000 + random jitter)
- Passes through non-retryable errors immediately (400, 401, 403, 404)

### 2. Update `groq-stream/index.ts`
Replace the direct `fetch` to Groq API with `fetchWithRetry`.

### 3. Update `gemini-storyline-generation/index.ts`
Replace the direct `fetch` to Groq API with `fetchWithRetry`.

### 4. Update `groq-chat/index.ts`
Replace the direct `fetch` to Groq API with `fetchWithRetry`.

### 5. Add delays between calls in `generate-storylines/index.ts`
Add a 2-second delay between the sequential Groq calls (after quick title, after streaming, after structured data) to reduce burst pressure on the rate limiter.

### Files changed
- **New**: `supabase/functions/_shared/retry.ts`
- **Edit**: `supabase/functions/groq-stream/index.ts`
- **Edit**: `supabase/functions/gemini-storyline-generation/index.ts`
- **Edit**: `supabase/functions/groq-chat/index.ts`
- **Edit**: `supabase/functions/generate-storylines/index.ts`

