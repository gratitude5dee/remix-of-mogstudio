

# Redesign Mock Editor Panel — Premium Cardboard-Inspired UI

## Current State
The mock editor (lines 86–157) is a simplified placeholder with basic track bars and a small AI Director pane. It lacks the detail and polish described in the prompt.

## Redesign

### Structure (left to right)

```text
┌──────────────────────────────────────────────────────────────┐
│ Top Bar: "WZRD"  │  "Project Timeline"  │  Export │ ● Ready  │
├────┬─────────────────────────────────────────────────┬───────┤
│Icon│  ┌─────────────────────────────────────┐        │Director│
│Bar │  │     16:9 Preview Window             │        │       │
│    │  │         ▶ Play icon                 │        │ Chat  │
│    │  └─────────────────────────────────────┘        │bubbles│
│    │  ◀  ▶  ▶▶    ━━━━━━━ 100%  🔊          │       │       │
│    ├─────────────────────────────────────────┤       │       │
│    │ 00:00  00:15  00:30  00:45  01:00       │ "What │       │
│    │ B-Roll  ▓▓▓░░░▓▓░░░░░░░░░░░░            │story  │       │
│    │ Main    ▓▓▓▓▓▓▓▓▓▓░░▓▓▓▓▓▓▓            │do you │       │
│    │ Music   ≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈≈            │want?" │       │
│    │         ┃ playhead                      │       │       │
├────┴─────────────────────────────────────────┴───────┘       │
│Media│ Media Library                                          │
│     │ Search assets… [Add]                                   │
│     │ ┌──┐┌──┐┌──┐┌──┐                                      │
│     │ └──┘└──┘└──┘└──┘                                      │
└──────────────────────────────────────────────────────────────┘
```

### 1. Top bar
- Slim bar: "WZRD" left, "Project Timeline" center, "Export" button + green dot "Ready" right
- `bg-white/[0.04]`, `text-[10px]` uppercase mono labels

### 2. Left icon bar
- Narrow 36px column with 5 icons (Film, Music, Type, Sparkles, Layers) stacked vertically
- White/30 default, white/60 on hover, one active with orange accent
- `border-r border-white/[0.06]`

### 3. Media Library sub-panel
- Below icon bar (or as expandable area under icons)
- "Media Library" header, search input placeholder, "Add" button
- 2×2 grid of empty thumbnail placeholders (rounded `bg-white/[0.04]` squares)
- Keep this compact — it's a decorative mockup

### 4. Central preview
- 16:9 aspect ratio preview area with subtle gradient background
- Centered play button icon
- Below: transport controls row (SkipBack, Play, SkipForward icons), zoom "100%" label, volume icon
- All `text-white/30`, hover brightens

### 5. Timeline
- Time ruler with markers: 00:00, 00:15, 00:30, 00:45, 01:00
- Three tracks with labels:
  - **B-Roll**: grey/purple clip blocks
  - **Main**: orange clip blocks (2-3 segments with thumbnail-like fills)
  - **Music**: teal/green waveform-style block spanning most of track
- Vertical playhead line (orange/teal, 1px) at ~30% position with triangular handle at top
- Clips have rounded corners, subtle borders, hover glow effect via CSS

### 6. Director panel (right)
- 160px wide, dark bg
- "Director" header with green dot
- 2-3 chat bubbles with placeholder AI prompts
- "Planning the next cut…" style text
- Bottom: input with "What story do you want to tell?" + send icon
- Subtle separator line from main content

### 7. Styling details
- Backgrounds: `#0a0a0a` to `#1a1a1a` range
- Accent: muted teal (`emerald-400/40`) for status, orange for active clips/playhead
- All text `font-mono`, uppercase labels `tracking-wide`
- Hover states: icons brighten, clips get subtle glow (`shadow-[0_0_8px_rgba(...)`)
- `max-w-5xl` (slightly wider than current 4xl) for more room
- Min-height increased to ~380px for detail

### File changed
- `src/components/landing/HeroSection.tsx` — Replace the mock editor div (lines 86–157) with the detailed Cardboard-inspired editor mockup

