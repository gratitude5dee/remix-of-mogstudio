

# Fix Image Studio Background Integration

## Problem
The `ImageStudioSection` renders inside the KanvasPage's flex layout (which has its own radial gradient background `bg-[#050506]` with green glows, padding, and a compact sidebar). The Image studio's `bg-black` doesn't fully cover the parent's background, and the fixed sidebar at `left-0` overlaps the page's own compact nav sidebar. This creates visible background bleed-through and layout conflicts.

## Fix

### `src/components/kanvas/ImageStudioSection.tsx`

**Root container**: Change from `relative min-h-screen bg-black` to a fixed full-screen overlay that sits below the header but covers everything else:
```
fixed inset-0 top-[80px] bg-[#050506] z-20 overflow-y-auto
```
This ensures the Image studio's dark background completely covers the parent page's radial gradients and sidebars.

**Sidebar**: Keep the fixed positioning but ensure `z-30` so it layers above the content.

**Main content**: Adjust `pb-48` to account for the fixed container scroll context.

### `src/pages/KanvasPage.tsx`

No changes needed — the ImageStudioSection will visually take over the viewport when active, which is the same pattern VideoStudioSection uses.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/ImageStudioSection.tsx` | Change root div to fixed overlay with proper z-indexing and matching page background color |

