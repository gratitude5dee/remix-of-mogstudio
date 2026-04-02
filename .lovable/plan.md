

# Fix TS2367 Build Errors — Remove Dead Video Branches

## Problem
After the `VideoStudioSection` renders for `studio === "video"` (around line 1228), TypeScript narrows `studio` to `"image" | "cinema" | "lipsync"` in the else block. The 10 remaining `(studio as string) === "video"` comparisons are dead code causing build errors.

## Fix

**File: `src/pages/KanvasPage.tsx`**

Remove all video-specific branches from the legacy UI block. Each change simplifies a ternary or conditional chain:

1. **Lines 1320-1326** (MentionDropdown onSelect — current prompt): Remove the `(studio as string) === "video" ? videoPrompt :` branch. Chain becomes `image → cinema → lipsync`.

2. **Line 1329**: Remove `else if ((studio as string) === "video") setVideoPrompt(replaced);`

3. **Lines 1336-1342** (Textarea value): Remove `(studio as string) === "video" ? videoPrompt :` branch.

4. **Lines 1346-1349** (Textarea onChange): Remove `else if ((studio as string) === "video") { setVideoPrompt(nextValue); }`

5. **Lines 1363-1366** (placeholder): Remove `(studio as string) === "video" ? Boolean(videoReferenceId) :` branch.

6. **Lines 1391-1404** (AssetSelector for video): Delete the entire `{(studio as string) === "video" && <AssetSelector ... />}` block.

7. **Lines 1549-1554** (Select onValueChange): Remove `else if ((studio as string) === "video") { ... }` block.

8. **Lines 1574-1577** (SelectContent model list): Remove `(studio as string) === "video" ? currentVideoModels :` branch.

9. **Lines 1623-1626** (ModelControls settings): Remove `(studio as string) === "video" ? videoSettings :` branch.

10. **Lines 1632-1635** (ModelControls onChange): Remove `else if ((studio as string) === "video") { ... }` block.

All video functionality is already fully handled by `VideoStudioSection` — these removals just clean up unreachable code.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/KanvasPage.tsx` | Remove 10 dead `(studio as string) === "video"` branches |

