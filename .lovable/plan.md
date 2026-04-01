

# Fix Kanvas Page: Generation Crash & SparkJS/Fabric Loading

## Problems Identified

### 1. Frontend disappears during image generation
The KanvasPage is lazy-loaded (`React.lazy`) and wrapped in a `<Suspense>` fallback, but has **no error boundary**. When generation fails with an unhandled error (e.g., network timeout, malformed response, or an uncaught exception in `submitKanvasJob` or `refreshKanvasJobStatus`), the entire component tree unmounts — the page "disappears."

Key failure points:
- `handleGenerate()` catches errors properly, but the **polling interval** (`refreshKanvasJobStatus` in `useEffect` on line 921-940) does a `Promise.all` with only a `.catch(console.error)` — if `normalizeKanvasJobRow` throws on a malformed row, React re-renders with corrupt state, potentially causing a cascade crash.
- `loadInitialState()` calls `Promise.all` for models, assets, and jobs — if one rejects with a non-Error value, the catch block's `error instanceof Error` check fails silently and the UI freezes in the loading state.

### 2. SparkJS/WorldLabs model not loading in the Worldview studio
The `SparkSplatViewer` component dynamically imports `@sparkjsdev/spark` and `three`. The Vite config correctly excludes `@sparkjsdev/spark` from `optimizeDeps`, but:
- The viewer has no error boundary wrapping it — if SparkJS WASM initialization throws asynchronously (outside the `try/catch` in `initSpark`), the entire WorldviewSection crashes.
- The `wasmFailed` fallback only triggers if the error is caught in the `try/catch` block. An uncaught rejection from the WASM loader would bypass this.

### 3. Fabric.js is not relevant to this page
Fabric.js is used in `InfiniteCanvas.tsx` and `ImageEditDock.tsx` — separate studio features. It does not affect the Kanvas page or Worldview section. No fabric.js fix needed here.

---

## Plan

### Step 1: Add Error Boundary to KanvasPage route
Wrap `<KanvasPage />` in `App.tsx` with the existing `StudioErrorBoundary` to prevent white-screen crashes.

**File: `src/App.tsx`**
- Import `StudioErrorBoundary`
- Wrap the KanvasPage route element: `<StudioErrorBoundary><KanvasPage /></StudioErrorBoundary>`

### Step 2: Harden the job polling interval
The polling `useEffect` (KanvasPage line ~921-940) catches errors with `console.error` only. If `normalizeKanvasJobRow` throws on a corrupt row, the `mergeJobs` call never runs, but the error is swallowed. Strengthen this:

**File: `src/pages/KanvasPage.tsx`**
- Wrap the polling `.then()` handler in a try/catch so that a single malformed job row doesn't break the entire poll cycle
- Filter out any jobs that fail to normalize instead of crashing

### Step 3: Harden the initial load
If any individual model studio fetch fails, the entire `Promise.all` rejects and **no** data loads. Switch to `Promise.allSettled` for model fetches so partial data loads gracefully.

**File: `src/pages/KanvasPage.tsx`**
- Change the model-fetching portion of `loadInitialState()` from `Promise.all` to `Promise.allSettled`
- Extract fulfilled values, log warnings for rejected ones
- Assets and jobs remain in `Promise.all` since they're critical

### Step 4: Add Error Boundary around SparkSplatViewer
Wrap `SparkSplatViewer` with a lightweight error boundary so WASM crashes fall back to the iframe viewer or static image gracefully.

**File: `src/components/worldview/WorldviewSection.tsx`**
- Add a small `SparkErrorBoundary` class component that catches render/lifecycle errors
- On error, render the iframe fallback (`viewerUrl`) or the static `fallbackImageUrl`
- Wrap the `<SparkSplatViewer>` usage in `GSplatViewer` with this boundary

### Step 5: Improve SparkSplatViewer async error handling
The `initSpark()` function has a `try/catch` but the SplatMesh `onLoad` callback isn't guarded, and unhandled promise rejections from the WASM loader won't be caught.

**File: `src/components/worldview/SparkSplatViewer.tsx`**
- Add a global `unhandledrejection` listener scoped to the component lifecycle to catch WASM failures
- Ensure the `wasmFailed` state is set on any async error, not just synchronous throws

### Step 6: Fix "MogStudio" branding to "WZRD Studio"
Line 1121 of KanvasPage still says "MogStudio". Change to "WZRD Studio".

**File: `src/pages/KanvasPage.tsx`** (line 1121)

---

## Files Changed

| File | Change |
|------|--------|
| `src/App.tsx` | Wrap KanvasPage route with `StudioErrorBoundary` |
| `src/pages/KanvasPage.tsx` | `Promise.allSettled` for models, harden polling, fix branding |
| `src/components/worldview/WorldviewSection.tsx` | Add `SparkErrorBoundary` around the 3D viewer |
| `src/components/worldview/SparkSplatViewer.tsx` | Catch async WASM failures more robustly |

