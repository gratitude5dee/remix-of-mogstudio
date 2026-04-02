

# Fix & Optimize Image Studio — Add Generation Gallery

## Problem
The Image Studio section currently shows only the hero typography and preset cards, but lacks the **Recent Creations gallery** showing previous generations. The `jobs` prop is passed but never used.

## Changes

### `src/components/kanvas/ImageStudioSection.tsx`

1. **Use the `jobs` and `selectedJob` props** — currently destructured away. Import `getJobPrimaryUrl` from `@/features/kanvas/helpers` and `ImageIcon`/`Eye` from lucide.

2. **Add Recent Creations gallery below preset cards** — filter completed jobs, display up to 8 in a responsive grid (`grid-cols-2 md:grid-cols-4`) with:
   - Aspect-square thumbnails, rounded-2xl, grayscale → color on hover
   - Gradient overlay from bottom
   - Lime eye icon overlay on hover
   - Click to select (could call a callback or just preview)

3. **Layout refinement** — Change `min-h-screen` to `min-h-0` on main content, remove `fixed` positioning on footer (it clips the gallery), and increase `pb-48` to ensure prompt bar doesn't overlap the gallery.

4. **Fix prompt bar overlap on narrow viewports** — The pills (model, aspect, count, settings) stack poorly. Wrap the controls section in a responsive container that hides less critical pills on smaller widths.

5. **Sidebar scroll** — Add `scrollbar-hide` CSS class alongside the inline `scrollbarWidth: none` for webkit browsers.

### Specific Implementation

**Gallery section** (inserted after preset cards, inside `renderMainContent`):

```text
┌─────────────────────────────────────────┐
│  Gallery (overline)                     │
│  Recent Creations    [View All →]       │
│  ─────── lime bar ──────                │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │
│  │ img  │ │ img  │ │ img  │ │ img  │  │
│  │      │ │      │ │      │ │      │  │
│  └──────┘ └──────┘ └──────┘ └──────┘  │
└─────────────────────────────────────────┘
```

- Filter `jobs` to `status === "completed"`, take first 8
- Use `getJobPrimaryUrl(job)` for image src
- Grid uses `aspect-square` cards with `rounded-2xl`, `border border-white/5`
- Grayscale default → full color on hover (matches Video studio pattern)
- Empty state: show nothing (no placeholder needed)

**Footer** — convert from `fixed` to inline at the bottom of the scrollable content, so it doesn't overlap the gallery.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/ImageStudioSection.tsx` | Add jobs gallery, fix layout/footer positioning, import helpers |

