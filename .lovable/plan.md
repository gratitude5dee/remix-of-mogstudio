

# Fix SparkJS Splat Loading + Camera Capture

## Issues Found

1. **WASM loading failure**: SparkJS's internal WASM module uses `data:` URLs that fail to load. The `SplatMesh.staticInitialize()` call fails with "HTTP status code is not ok" on WebAssembly compile. This is likely caused by SparkJS trying to fetch its WASM from a relative path that doesn't exist in the Vite dev server context.

2. **SparkRenderer not added to scene**: Per SparkJS docs, `scene.add(spark)` is required. Current code creates the SparkRenderer but never adds it to the scene — splats won't render even if WASM loads.

3. **Capture Take doesn't capture the canvas**: `handleCaptureTake` uses the fallback image URL instead of calling `renderer.domElement.toDataURL()` or `worldLabsService.captureTake(canvas)`. The WebGL canvas is never read.

4. **No ref bridge between SparkSplatViewer and GSplatViewer**: The parent GSplatViewer has no way to access the WebGL canvas inside SparkSplatViewer to capture frames.

## Plan

### 1. Fix SparkSplatViewer initialization
- Add `scene.add(spark)` after creating SparkRenderer (required by docs)
- Set `preserveDrawingBuffer: true` on WebGLRenderer so `toDataURL()`/`toBlob()` works for capture
- Add `onReady` callback prop that exposes the THREE renderer and canvas to the parent
- Add `onError` handling that falls back gracefully to iframe viewer

### 2. Add canvas capture support
- Add `captureFrame(): string | null` method exposed via `useImperativeHandle` / ref forwarding on SparkSplatViewer
- This calls `renderer.render(scene, camera)` then `renderer.domElement.toDataURL('image/png')`

### 3. Fix GSplatViewer capture flow
- Get a ref to SparkSplatViewer
- In `handleCaptureTake`, call `sparkRef.current.captureFrame()` to get the current camera view as a data URL
- If SparkJS canvas isn't available, fall back to `worldLabsService.captureTake()` with the iframe's canvas or the fallback image

### 4. Handle WASM loading gracefully
- Wrap `SplatMesh` creation in a try/catch that detects WASM failures
- On WASM failure, automatically fall back to the iframe viewer URL instead of showing a broken state
- Log the error but don't show it to the user — just seamlessly switch to iframe mode

### Files changed
- `src/components/worldview/SparkSplatViewer.tsx` — Fix initialization, add ref-based capture, add WASM fallback
- `src/components/worldview/WorldviewSection.tsx` — Wire up SparkSplatViewer ref for capture in `handleCaptureTake`

