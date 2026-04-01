

# Add "Worldview" Section to Timeline Sidebar

## Overview
Add a new collapsible "Worldview" section below "Sound & Audio" in the timeline left navbar. It will contain a "Generate Worldview" button that opens the same WorldviewSection UI from `/kanvas`. Once a world is generated, a preview thumbnail displays inline in the sidebar.

## Plan

### 1. Create `WorldviewSidebarSection` component
**New file: `src/components/timeline/sections/WorldviewSidebarSection.tsx`**

- Follows the same collapsible pattern as `SoundSection` (Collapsible + motion + same styling)
- Props: `sceneId`, `isOpen`, `onToggle` (matching existing section interface)
- Contains a "Generate Worldview" button that opens a Dialog/Sheet with `<WorldviewSection />` embedded
- Uses `useWorldviewStore` to check if an active world exists — if so, displays a thumbnail preview (the world's `assets.thumbnailUrl` or `assets.panoramaUrl`) inline
- Globe2 icon with amber/orange accent color to match the existing Worldview branding

**Key structure:**
```text
[Collapsible Trigger: Globe2 icon + "Worldview" label]
  └─ [CollapsibleContent]
       ├─ If world exists: thumbnail preview + "View World" button
       └─ If no world: "Generate Worldview" button
            └─ Opens Dialog containing <WorldviewSection />
```

### 2. Integrate into `EnhancedStoryboardSidebar`
**File: `src/components/storyboard/EnhancedStoryboardSidebar.tsx`**

- Import `WorldviewSidebarSection`
- Add `worldview: false` to `openSections` state
- Render `<WorldviewSidebarSection>` after `<SoundSection>` (line ~208)

### 3. Dialog for full Worldview UI
The "Generate Worldview" button opens a large Dialog (or Sheet) that renders the full `<WorldviewSection />` component from `src/components/worldview/WorldviewSection.tsx`. This reuses the entire world generation pipeline already built for `/kanvas`.

## Technical Details

- Reuses `useWorldviewStore` (Zustand) — same store powers both `/kanvas` and this sidebar
- The `WorldviewSection` component is self-contained with its own scene management, so embedding it in a Dialog works without additional wiring
- Thumbnail preview uses the `World.assets.thumbnailUrl` or `panoramaUrl` from the store
- The Dialog will use `max-w-5xl` sizing to give the 3D viewer adequate space

## Files Changed

| File | Change |
|------|--------|
| `src/components/timeline/sections/WorldviewSidebarSection.tsx` | **New** — Collapsible section with generate button + preview |
| `src/components/storyboard/EnhancedStoryboardSidebar.tsx` | Import & render WorldviewSidebarSection after SoundSection |

