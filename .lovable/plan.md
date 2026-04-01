

# Fix Upside-Down Marble Model in SparkSplatViewer

## Problem
The Gaussian splat model loaded via SparkJS renders upside-down. This is a common issue with splat files exported from certain pipelines — the Y-axis convention differs (Z-up vs Y-up).

## Fix

**File: `src/components/worldview/SparkSplatViewer.tsx`**

After the splat mesh is added to the scene (line 142), rotate it 180° around the X-axis to flip it right-side up:

```ts
scene.add(splatMesh as unknown as import('three').Object3D);
// Flip the splat upright — splat files often use Z-up convention
(splatMesh as unknown as import('three').Object3D).rotation.x = Math.PI;
```

This single-line rotation correction will orient the world correctly so users can navigate through the scene naturally.

## Files Changed

| File | Change |
|------|--------|
| `src/components/worldview/SparkSplatViewer.tsx` | Add `rotation.x = Math.PI` to the splat mesh after adding to scene |

