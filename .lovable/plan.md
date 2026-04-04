

# Worldview Studio Redesign + Left Sidebar Nav for /kanvas

## Overview
Two changes: (1) Redesign the Worldview studio to match the Noir Futurist aesthetic of the other studios, with a generation history gallery so users can access past worlds without regenerating. (2) Add a persistent left icon sidebar nav to the /kanvas page for quick studio switching + home navigation, replacing the overhead of the top pill-slider for primary nav.

## Part 1: Left Sidebar Navigation

### New Component: `src/components/kanvas/KanvasSidebar.tsx`

A narrow 56px vertical icon sidebar on the left edge of the /kanvas page:

```text
┌──┐
│🏠│  ← Home (tooltip: "Home")
│──│  
│🖼│  ← Image
│🎬│  ← Video  
│✏️│  ← Edit
│🎤│  ← Lipsync
│🎬│  ← Cinema
│🌍│  ← Worldview
│👤│  ← Characters
└──┘
```

- `w-14` fixed left column, `bg-[#0A0A0A]` with `border-r border-white/[0.04]`
- Each icon is 40px rounded-lg button with tooltip (using `title` attribute or a small tooltip component)
- Active studio: `bg-white/10` with lime left border accent (`border-l-2 border-[#BEFF00]`)
- Inactive: `text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]`
- Home button at top, separated by a divider from studio icons
- Icons from lucide-react matching the existing `STUDIO_ICONS` map

### `src/pages/KanvasPage.tsx` Changes

- Wrap the main content in a flex layout: `flex h-screen` with the sidebar on the left and content area on the right
- Keep the top header but make it slimmer or remove redundant nav (the sidebar handles navigation now)
- The top header becomes a thin status bar with just the WZRD wordmark + current studio name
- Layout: `<KanvasSidebar /> + <div className="flex-1 overflow-auto">...</div>`

## Part 2: Worldview Studio Redesign

### `src/components/worldview/WorldviewSection.tsx` — Full Redesign

**Current problems:**
- Collapsible section header pattern (click to expand) — no other studio uses this; feels like a sidebar widget, not a full studio
- No generation history — worlds stored only in Zustand memory, lost on refresh
- Amber/orange accent colors don't match the lime (#BEFF00) Noir Futurist system
- No hero landing state like Image/Video/Edit studios

**Landing State** (no worlds yet):
- Full-width hero with large "WORLDVIEW" watermark text (like Image studio's "IMAGE" watermark)
- Centered heading: "CREATE 3D WORLDS" in Space Grotesk, uppercase
- Subtitle: "Generate immersive environments, capture takes, compose AI shots"
- Feature cards row: "Text to World", "Image to World", "Camera Takes", "Shot Composer" — perspective-tilted cards
- Centered CTA: Lime "Create Your First World" button
- Remove the collapsible header pattern entirely — render as a full studio section

**Generation History Gallery** (below the workspace):
- Section title: "YOUR WORLDS" — uppercase tracking
- Grid of WorldCard thumbnails (3-column on desktop, 2 on tablet)
- Each card shows: thumbnail, world name, model badge, date created, "Enter World" hover overlay
- Data source: `useWorldviewStore.worlds` array (already persisted in Zustand)
- For true persistence across sessions: store world metadata (id, name, model, thumbnailUrl, viewerUrl, splatUrl, createdAt) in Supabase `generation_jobs` table with `studio = 'worldview'`
- Clicking a history card loads that world into the active scene

**Workspace State** (world selected):
- Remove the collapsible wrapper — render scene strip + canvas/viewer/composer directly
- Top: Centered pill-tab nav for modes: `Canvas | World Viewer | Shot Composer`
- Accent colors: Switch from amber/orange to lime (#BEFF00) to match system
- Bottom prompt bar: Match the upgraded style from other studios — wider, with model chip and credit cost

**Color Migration:**
- `amber-400/500` → `[#BEFF00]` / `lime-400`
- `border-amber-500/40` → `border-[#BEFF00]/30`
- `bg-amber-500/20` → `bg-[#BEFF00]/10`
- Keep functional orange only for model badges if needed

### Persistence via Supabase

Query existing `generation_jobs` where `studio = 'worldview'` on mount to populate the history gallery. The `result_payload` JSONB column already stores the world data (thumbnailUrl, viewerUrl, splatUrl). On successful generation, insert a row into `generation_jobs`.

This uses the existing table — no migration needed.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/KanvasSidebar.tsx` | **New** — 56px icon sidebar with tooltips, home button, studio switching |
| `src/pages/KanvasPage.tsx` | Add sidebar to layout, slim down top header, pass studio setter to sidebar |
| `src/components/worldview/WorldviewSection.tsx` | Full redesign: hero landing, generation history gallery, lime color migration, remove collapsible pattern, add mode pill-tabs |

