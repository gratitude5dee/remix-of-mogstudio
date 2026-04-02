

# Wire Up Edit Studio to Backend

## Current State
The Edit Studio (`EditStudioSection`) is a **static mockup** — hardcoded placeholder gradients, no real assets, no connection to the backend `image-edit-operation` edge function, and the Generate button does nothing. The backend already supports `inpaint`, `removeBackground`, `splitLayers`, and `enhancePrompt` operations via the `imageEditService`.

## Plan

### 1. Pass props from KanvasPage to EditStudioSection

**`src/pages/KanvasPage.tsx`** — Pass the same asset/job/generation props already available:
```tsx
<EditStudioSection
  assets={imageAssets}
  jobs={currentStudioJobs}
  selectedJob={selectedJob}
  uploading={uploadingByType.image}
  onUpload={handleAssetUpload}
  projectId={projectId}
/>
```

### 2. Rewrite EditStudioSection to be functional

**`src/components/kanvas/EditStudioSection.tsx`** — Major changes:

**Props & State:**
- Accept `assets`, `jobs`, `selectedJob`, `uploading`, `onUpload`, `projectId`
- Track `selectedAssetId` — the user-selected image from their library
- Track `activeOperation` — which edit tool is active (inpaint, removeBackground, etc.)
- Track `isProcessing` — loading state during backend calls
- Track `resultImageUrl` — the output from the last operation

**Left Sidebar — Real Asset Library:**
- Replace hardcoded gradient squares with actual `assets` from props
- Clicking an asset sets it as the active canvas image
- "New Asset" button triggers `onUpload`
- Show upload spinner when `uploading` is true

**Center Canvas — Selected Asset Display:**
- Show the selected asset's actual image (or the result image after an operation)
- The canvas tool palette maps to real `ImageEditTool` operations:
  - Brush → `inpaint`
  - Wand → `removeBackground`
  - Eraser → `splitLayers`
  - Zoom → (client-side zoom, no backend call)
- The "Active Mask" overlay only shows when `inpaint` tool is selected
- Generate button calls `imageEditService.executeOperation()` with the selected operation, image URL, and prompt
- Show loading spinner on the Generate button while processing
- On success, display the result image on the canvas and show a toast

**Right Sidebar — Dynamic Asset Detail:**
- Show metadata from the selected asset (filename, dimensions, format) instead of hardcoded values
- "Low Credits" warning uses actual credit count from `useCredits` hook (conditionally shown)
- Rating section hidden (not applicable for user assets)

**Recent Creations (below canvas or in sidebar):**
- Show completed `jobs` with thumbnails, similar to Image/Video studios

### 3. Connect to imageEditService

**In EditStudioSection**, import and call `imageEditService.executeOperation()`:

```ts
const handleGenerate = async () => {
  if (!selectedAsset || !projectId) return;
  setIsProcessing(true);
  try {
    const result = await imageEditService.executeOperation({
      projectId,
      nodeId: selectedAsset.id,
      operation: activeOperation,
      prompt: inpaintPrompt,
      imageUrl: selectedAsset.url,
    });
    if (result.asset) setResultImageUrl(result.asset.url);
    toast.success('Edit complete');
  } catch (err) {
    toast.error(err.message);
  } finally {
    setIsProcessing(false);
  }
};
```

### 4. Map sidebar tools to operations

| UI Tool | Backend Operation | Requires Prompt | Requires Mask |
|---------|------------------|-----------------|---------------|
| Brush (Inpaint) | `inpaint` | Yes | Yes (future) |
| Wand (Remove BG) | `removeBackground` | No | No |
| Eraser (Split Layers) | `splitLayers` | No | No |
| Zoom | Client-only | — | — |

The prompt bar is only shown/enabled when `inpaint` is the active tool. For `removeBackground` and `splitLayers`, clicking Generate executes immediately.

## Design Preservation
All Noir Futurist styling stays intact — backgrounds, typography, lime accents, panel widths. Only the data sources and interactivity change.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/EditStudioSection.tsx` | Accept props, wire assets/jobs, connect to imageEditService, make Generate functional |
| `src/pages/KanvasPage.tsx` | Pass assets, jobs, projectId, upload props to EditStudioSection |

