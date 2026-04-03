

# Transform Edit Studio into a Full Visual Canvas with tldraw + fal.ai

## Overview
Replace the current static image display in the Edit Studio workspace with a real infinite canvas powered by **tldraw** — a production-grade React canvas SDK. Users will be able to draw, annotate, mask, and manipulate images directly on canvas, then run fal.ai operations (inpaint, upscale, remove BG, etc.) on their selections.

## Why tldraw
- Drop-in React component (`npm i tldraw`)
- Built-in drawing tools (pen, eraser, shapes, text, selection, hand)
- Image support as first-class shapes
- Custom tools and shape support for masking
- Programmatic access to canvas state (export regions, get selections)
- MIT-compatible license (tldraw license)

## Architecture

```text
┌──────────────────────────────────────────────────┐
│ EditStudioSection (fixed overlay)                │
├─────────┬────────────────────────────────────────┤
│ Landing │  Feature/Model browser (no change)     │
│ State   │  Upload → transitions to Workspace     │
├─────────┼────────────────────────────────────────┤
│         │ ┌──────────────────────────────────┐   │
│ Thumb   │ │        <Tldraw />                │   │
│ Rail    │ │  - Uploaded image as background   │   │
│ (72px)  │ │  - Draw masks with pen tool       │   │
│         │ │  - Add text, shapes, annotations  │   │
│         │ │  - Pan/zoom infinite canvas        │   │
│         │ └──────────────────────────────────┘   │
│         │ ┌──────────────────────────────────┐   │
│         │ │ Bottom Prompt Bar (floating)      │   │
│         │ │ Feature selector + model + Edit   │   │
│         │ └──────────────────────────────────┘   │
└─────────┴────────────────────────────────────────┘
```

## Implementation Plan

### 1. Install tldraw package
- `npm i tldraw` — adds the SDK (~2MB)
- Import `tldraw/tldraw.css` in the component

### 2. Create `EditCanvas` wrapper component
**New file**: `src/components/kanvas/EditCanvas.tsx`

This thin wrapper around `<Tldraw />` handles:
- **Image loading**: When an asset is selected, programmatically create a tldraw image shape at the center of the canvas using the `editor.createShape()` API
- **Dark theme**: Configure tldraw with dark mode to match `#090909` background
- **Tool restriction**: Hide unnecessary tldraw UI chrome (menus, pages, debug) — expose only: Select, Draw (for masking), Eraser, Hand, Text, Arrow
- **Mask export**: Provide a `getMaskImage()` method that exports drawn strokes as a black/white mask PNG (white = masked area) for inpainting
- **Canvas export**: Provide a `getCanvasImage()` method that exports the visible canvas as a PNG for operations like upscale/relight
- **Result injection**: After fal.ai returns a result, insert the result image as a new shape on the canvas (side-by-side or layered)

Key tldraw APIs used:
- `editor.createShape({ type: 'image', ... })` — add uploaded images
- `editor.getSvgString()` or `editor.toImage()` — export canvas/mask
- `editor.setCurrentTool('draw')` — switch tools
- `editor.updateInstanceState({ isDebugMode: false })` — hide debug UI

### 3. Rewrite `EditStudioSection.tsx` workspace state

**Landing state** — Keep as-is (feature/model browser + upload)

**Workspace state** — Replace the static `<img>` and fake tool palette with:
- **Left rail**: Keep thumbnail rail (72px) — no change
- **Center**: Mount `<EditCanvas />` filling the remaining space
  - The uploaded/selected asset image is loaded onto the canvas automatically
  - Users draw masks directly on the image for inpainting
  - Drawing uses a semi-transparent lime color (`#ccff00` at 40% opacity) so users see where they're masking
- **Floating feature bar** (replaces old tool palette): Small vertical bar on the left showing the current feature icons (Inpaint, Remove BG, Upscale, etc.) — clicking switches the active operation
- **Bottom prompt bar**: Keep the existing prompt bar but wire it to:
  1. Export the mask from tldraw (for inpaint)
  2. Export the canvas image (for upscale/remove BG)
  3. Call `imageEditService.executeOperation()` with the exported data
  4. On success, inject the result image back onto the canvas as a new shape

### 4. Mask-to-Inpaint pipeline

When the user selects "Inpaint" and clicks "Edit":
1. `EditCanvas.getMaskImage()` — exports all drawn strokes as a white-on-black mask PNG
2. `EditCanvas.getCanvasImage()` — exports the base image
3. Both are uploaded to Supabase storage (or converted to data URLs)
4. Passed to `imageEditService.executeOperation({ operation: 'inpaint', imageUrl, maskUrl, prompt, modelId })`
5. Result image is placed on the canvas beside the original

For non-mask operations (upscale, remove BG):
1. Export the selected image shape from canvas
2. Send directly to the edge function
3. Inject result back

### 5. Update `imageEditService` for mask support
- Add `maskUrl` parameter to `executeOperation`
- Pass it through to the edge function
- Update `image-edit-operation/index.ts` to forward `mask_url` to fal.ai inpaint endpoints (FLUX Pro Fill and Nano Banana both accept mask images)

### 6. Style tldraw to match Noir Futurist theme
- Override tldraw CSS variables for dark theme:
  - `--color-background: #0e0e0e`
  - `--color-panel: #131313`
  - `--color-primary: #ccff00`
- Hide tldraw's default toolbar/menu bar (use `hideUi` prop or custom `components` override)
- Custom toolbar rendered as the existing floating palette style
- Hidden scrollbars, film grain overlay on the outer container

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Add `tldraw` dependency |
| `src/components/kanvas/EditCanvas.tsx` | **New** — tldraw wrapper with image loading, mask export, result injection, dark theme |
| `src/components/kanvas/EditStudioSection.tsx` | Replace static image workspace with `<EditCanvas />`, wire mask export to generation pipeline |
| `src/services/imageEditService.ts` | Add `maskUrl` parameter support |
| `src/types/imageEdit.ts` | Add `maskUrl` to `ImageEditOperationRequest` |
| `supabase/functions/image-edit-operation/index.ts` | Forward `mask_url` to fal.ai inpaint models |

## What stays the same
- Landing state (feature/model browser) — untouched
- Left thumbnail rail — untouched  
- Bottom prompt bar — kept, just rewired to canvas exports
- All other studio sections (Image, Video, Cinema, Lipsync) — untouched
- Backend model registry — untouched

