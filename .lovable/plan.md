

# Fix: Auto-select newly uploaded asset in Edit Studio

## Problem
After uploading an image in the Edit Studio, the workspace (tldraw canvas) never appears because:
1. `selectedAssetId` starts as `null` → `hasWorkspace` is `false` → landing state renders
2. The thumbnail rail (where you'd click to select an asset) only appears in workspace mode
3. Nothing auto-selects the newly uploaded asset

This is a chicken-and-egg bug — you can't select an asset because the selection UI is hidden behind the workspace gate.

## Fix — `src/components/kanvas/EditStudioSection.tsx`

Add a `useEffect` that watches the `assets` array and auto-selects the latest asset when:
- A new asset appears (array length increases)
- No asset is currently selected

```tsx
// Auto-select newly uploaded asset
const prevAssetsLenRef = useRef(assets.length);
useEffect(() => {
  if (assets.length > prevAssetsLenRef.current && !selectedAssetId) {
    const newest = assets[assets.length - 1];
    if (newest) setSelectedAssetId(newest.id);
  }
  prevAssetsLenRef.current = assets.length;
}, [assets, selectedAssetId]);
```

This ensures that after an upload completes and the asset appears in the `assets` prop, the workspace automatically transitions to the tldraw canvas with that image loaded.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/EditStudioSection.tsx` | Add `useEffect` to auto-select newly uploaded assets |

