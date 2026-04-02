

# Redesign Edit Studio → Cinematic Inpaint Workspace

## Overview
Replace the current 4-pane `EditStudioSection` with the reference "Studio/Inpaint" layout: a 260px left sidebar with nav + recent library grid, a central canvas with floating tool palette + active mask overlay + prompt bar, and a 340px right detail sidebar with properties, editor notes, and credits warning.

## Changes

### `src/components/kanvas/EditStudioSection.tsx` — Full Rewrite

**Left Sidebar (260px):**
- Header: "STUDIO" bold + "V1.0.4-NOIR" muted
- "NEW ASSET" wide pill button (`bg-[#1a1919] text-[#ccff00] border border-white/5 rounded-full`)
- Nav menu: Library (active with lime border-right), Tools, Layers, History, Assets (inactive zinc-500)
- "RECENT LIBRARY" 2×2 grid of placeholder images below nav
- Footer: Support + Sign Out links at `mt-auto`

**Center Canvas (flex-grow, `ml-[260px] mr-[340px]`):**
- Background: `bg-[#0e0e0e]`
- Large image container: `aspect-[4/3] max-w-4xl rounded-3xl` with placeholder gradient
- Vertical floating tool palette inside image (left edge): brush (active lime), wand, eraser, zoom in a backdrop-blur pill
- Active Mask rectangle overlay: lime border box with "ACTIVE MASK" badge on top
- Layer info bottom-left: "CURRENT LAYER" overline + "MAIN_COVER_01" title
- Floating prompt bar at bottom center: glass pill with sparkle icon, text input, lime "Generate" button

**Right Sidebar (340px):**
- "ASSET DETAIL" overline (zinc-500, not pink)
- Hero image thumbnail (aspect-[21/9])
- Title "Ancient Ledger" + rating pill (star 4.8)
- Ref line: "#STUDIO-9921"
- "PROPERTIES" section: Resolution, Format, Material as flex rows (not cards)
- "EDITOR NOTES" section: paragraph text
- "LOW CREDITS" warning: hot pink border/text, rounded-[2rem], with triangle icon
- "MANAGE WORKFLOW" button: wide dark pill

**Bottom bar removed** — replaced by the in-canvas floating prompt bar and vertical tool palette.

### State
- `activeSidebarTab`: "library" | "tools" | "layers" | "history" | "assets"
- `activeCanvasTool`: "brush" | "wand" | "eraser" | "zoom"
- `inpaintPrompt`: string

### No other files changed
The `KanvasPage.tsx` already renders `<EditStudioSection />` for `studio === "edit"`. No type or helper changes needed.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/EditStudioSection.tsx` | Full rewrite to match reference inpaint workspace |

