
Goal: eliminate the startup crash (`supabaseUrl is required`) and clean the related console noise so GitHub-based rebuilds stay stable.

What I found
1) `.gitignore` currently ignores `.env` and `.env.*`, so GitHub sync/rebuild can drop your env file again.
2) `src/integrations/supabase/client.ts` already has fallback values, but many other files still read `import.meta.env.VITE_SUPABASE_URL` directly. If env is missing, those calls become broken URLs.
3) `noise.png` is referenced in CSS/pages but does not exist in `public/`, causing the 404.
4) `lovable.js postMessage origin mismatch` is from the injected Lovable helper script, not your app logic (non-blocking warning).

Implementation plan
1) Make env persistence GitHub-safe
- Update `.gitignore` so `.env` is tracked (remove `.env` and `.env.*`, or explicitly unignore `.env` while keeping `.env.local` ignored).
- Keep the root `.env` with:
  - `VITE_SUPABASE_PROJECT_ID`
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `VITE_SUPABASE_ANON_KEY`

2) Centralize Supabase config (single source of truth)
- Add `src/integrations/supabase/config.ts`:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - normalize bad env values (`''`, `'undefined'`, `'null'`) to fallback constants.
- Update `src/integrations/supabase/client.ts` to consume this config instead of reading `import.meta.env` directly.

3) Remove direct env usage from runtime fetch paths
- Replace `import.meta.env.VITE_SUPABASE_URL` and direct anon-key reads in files like:
  - `src/services/unifiedGenerationService.ts`
  - `src/hooks/useAudioGeneration.ts`
  - `src/components/timeline/sections/SoundSection.tsx`
  - `src/hooks/studio/useStudioNodeGeneration.ts`
  - `src/utils/uploadFile.ts`, `downloadFile.ts`, `shareWorkflow.ts`, `fal.ts`
  - `src/components/editor/ToolbarPanel.tsx`
- Point them all to `SUPABASE_URL` / `SUPABASE_ANON_KEY` from config.

4) Fix the 404 asset error
- Add `public/noise.png` (or replace all `/noise.png` references with an existing asset).
- This removes `noise.png:1 404`.

5) Validate deployment path (important)
- After changes, verify in Preview first (hard refresh).
- Then publish frontend update so old hashed bundle (`index-CtvbTVrM.js`) is replaced.
- Recheck console on published URL to confirm startup crash is gone.

Technical notes
- The fatal issue is startup client initialization with missing URL in some deployed builds.
- Centralized fallback config + tracked `.env` prevents recurrence across GitHub syncs.
- The `lovable.js` postMessage warning is platform-script noise; it is not the cause of the crash.
