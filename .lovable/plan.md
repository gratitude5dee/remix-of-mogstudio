

# Redesign Edit Studio UI — Award-Winning Canvas Workspace

## Current Issues
- **Landing state**: Two narrow 280px columns (Features + Models) feel cramped and dated — not matching the full-width, hero-driven layouts used in Image and Video studios
- **Workspace state**: Floating tool/feature palettes are functional but visually sparse — the canvas area lacks hierarchy, status indicators, and the premium polish of the other studios
- **No sub-nav tabs**: Unlike Image (History/Community) and Video (Create/Edit/Motion) studios, Edit has no centered pill tab navigation
- **Bottom prompt bar**: Plain and thin — missing model selector, credit cost display, and the visual weight of the Image/Video prompt bars
- **Thumbnail rail**: Bare 72px column with no labels or context

## Design Overhaul

### 1. Landing State — Full-Width Hero Layout
Replace the dual-column browser with a hero-driven layout matching the Image studio pattern:
- **Centered hero**: Large "TRANSFORM YOUR IMAGES" heading in Space Grotesk, uppercase, tight tracking
- **Feature carousel**: 3-4 tilted perspective cards (like Image studio's use-case cards) showing Inpaint, Remove BG, Upscale, Relight — each with a preview image, gradient overlay, and label
- **Below hero**: Horizontal scrollable feature pills/cards showing all 8 features with icons, descriptions, and badges (TOP/NEW/SOON)
- **Full-width upload CTA**: Centered lime button "Upload to Start Editing"
- **Background**: Massive faded "EDIT" watermark text (already exists, keep it)

### 2. Workspace State — Premium Canvas Chrome

**Top bar** (new):
- Centered pill tab nav: `Inpaint | Remove BG | Upscale | Relight` — matching the Video studio's `bg-[#1A1A1A]` rounded-full pill slider with lime active state
- Right side: Model dropdown (compact, showing current model name + credit cost) + Close button

**Left tool palette** (refined):
- Wider pills (48px), with tiny labels below each icon
- Active tool gets lime bg with ambient glow
- Divider between canvas tools (Select/Draw/Eraser/Hand) and actions (Undo/Redo/Download)
- Add brush size slider (small vertical range input) below Draw tool when active

**Canvas area**:
- Subtle crosshatch grid pattern on the `#0e0e0e` background (like a cutting mat)
- When no strokes drawn: centered ghost text "Draw on the image to create a mask" with a dotted outline animation

**Right panel** — Replace floating feature icons with a collapsible settings panel (240px):
- Feature-specific controls: brush opacity slider, mask color toggle, strength slider for upscale
- Model selector dropdown with badge and credit cost
- Recent results thumbnails (2-column grid)

**Bottom prompt bar** (upgraded):
- Wider max-width (4xl instead of 3xl)
- Left: Active feature icon + label pill
- Center: Prompt input (taller, 48px)
- Right section: Model name chip (clickable to change) → Credit cost badge → Lime "Edit" button with glow
- Processing state: Progress bar animation across the full bar width

### 3. Thumbnail Rail (refined)
- Width increased to 80px
- Add "Assets" label at top (9px uppercase tracking)
- Upload button styled as dashed-border card with "+" and "Upload" micro-label
- Active thumbnail: thicker lime ring + subtle scale-105 transform
- Result thumbnails section: "Results" divider label, then result thumbs with a small sparkle icon overlay

### 4. Film Grain + Polish
- SVG noise overlay on the entire workspace (mix-blend-overlay, 4% opacity)
- Smooth transitions between landing and workspace states (opacity + scale)
- All interactive elements get `transition-all duration-200`

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/EditStudioSection.tsx` | Complete UI redesign: hero landing, pill tab nav, upgraded prompt bar, refined palettes, settings panel |

