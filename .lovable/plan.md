

# Build Cinematic "Edit" View for /kanvas

## Overview
Add a new `"edit"` studio mode to the Kanvas page with a 4-pane layout: Tool Sidebar, Asset Library, Main Canvas with dotted grid, and Asset Detail panel. Follows the Noir Futurist design system.

## Changes

### 1. Add "edit" to KanvasStudio type

**`src/features/kanvas/types.ts`** — Add `"edit"` to the union:
```ts
export type KanvasStudio = "image" | "video" | "cinema" | "lipsync" | "worldview" | "character-creation" | "edit";
```

### 2. Register "edit" in helpers

**`src/features/kanvas/helpers.ts`**:
- Add `"edit"` to `KANVAS_STUDIO_ORDER` array (after `"video"`)
- Add entry in `KANVAS_STUDIO_META` with label "Edit", headline "Edit Studio"
- Add `"edit"` case in `normalizeStudioParam`

### 3. Register icon in KanvasPage

**`src/pages/KanvasPage.tsx`**:
- Import `Pencil` from lucide-react
- Add `edit: Pencil` to `STUDIO_ICONS`
- Add `studio === "edit"` branch (after video, before worldview) rendering `<EditStudioSection>`
- Pass relevant props: `assets`, `jobs`, `uploading`, `onUpload`, `pageLoading`

### 4. Create EditStudioSection component (NEW)

**`src/components/kanvas/EditStudioSection.tsx`**

A self-contained fixed overlay (same pattern as Image/Video studios: `fixed inset-0 top-[80px] bg-[#050506] z-20`).

**Internal layout — 4 panels:**

```text
┌──────┬────────────┬─────────────────────┬──────────────┐
│ 80px │   320px    │    Flex center      │    380px     │
│ Tool │   Asset    │    Edit Canvas      │   Asset      │
│ Bar  │  Library   │   (dotted grid)     │   Detail     │
└──────┴────────────┴─────────────────────┴──────────────┘
         ← Fixed bottom toolbar spans canvas area →
```

**EditToolBar (far left, 80px):**
- Header: lime wand icon + "TOOLS" + "V2.0.4"
- Nav stack: Inpaint (active, lime border-right + lime text), Placement, Relight, Upscale, History (inactive zinc-600)
- Bottom: "+" FAB with "New Asset" label
- Internal state `activeTool` controls which tool is highlighted

**AssetLibrary (next, 320px):**
- Header: "Library" title + circular "+" button
- 2-column grid of placeholder asset cards (atmospheric gradient backgrounds)
- First card has lime border (selected state)
- Internal state `selectedAssetIndex`

**EditWorkspace (center, remaining width):**
- Dotted grid background: `bg-[radial-gradient(circle,#333_1px,transparent_1px)]` with `background-size: 24px 24px`
- Centered image container with deep shadow
- 4 corner selection brackets (lime 2px borders on corners)
- Floating label: lime dot + "SELECTED: ASSET_026"
- Inpaint mask glow: absolute div with `bg-[#ccff00]/40 blur-xl mix-blend-color-dodge`

**AssetDetailSidebar (right, 380px):**
- "ASSET DETAIL" overline in hot pink (#ff3399)
- Title "Volume 8 : WZRD.tech" in Space Grotesk
- Rating: lime star + "4.8" + "Based on 124 curated views"
- METADATA grid: Resolution (4096x2160), Format (PNG Alpha)
- CTA buttons: "Add to Cart" (white solid pill), "Wishlist" (transparent bordered pill)
- Bottom warning: "CREDITS ARE RUNNING LOW" amber alert

**EditBottomBar (floating toolbar):**
- Fixed bottom, centered between left panels and right panel
- Glass pill with backdrop-blur
- Active: "Brush" (lime pill), Inactive: "Selection", "Pan"
- Separator + Undo/Redo/Download icons

### 5. Edge function type (optional, no-op)

**`supabase/functions/_shared/kanvas.ts`** — The backend `KanvasStudio` type doesn't include `"edit"` but this is fine since edit mode is client-only (no generation requests). No backend changes needed.

## Files Changed

| File | Change |
|------|--------|
| `src/features/kanvas/types.ts` | Add `"edit"` to KanvasStudio union |
| `src/features/kanvas/helpers.ts` | Add edit to studio order, meta, and normalizer |
| `src/components/kanvas/EditStudioSection.tsx` | **New** — Full 4-pane edit layout |
| `src/pages/KanvasPage.tsx` | Import EditStudioSection, add icon + render branch |

