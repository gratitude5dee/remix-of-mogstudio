

# Improve Audio Dial & Model Popup — Premium Design Polish

## Current Issues

1. **Dial is flat and small** — 72px circle with basic radial gradient, tick marks are barely visible dots, no tactile/skeuomorphic depth
2. **Mode labels are cramped** — 9px text stacked vertically beside the dial, no visual connection between label and dial position
3. **Model popup is plain** — Basic list with minimal hierarchy, no search, no visual model indicators, no smooth entry animation
4. **No haptic feedback cues** — No hover states on dial, no active press state, no transition polish

## Changes

### 1. Redesign the Turnable Dial (Premium Skeuomorphic)

- Increase dial size to **88px** with deeper layered shadows (outer ring, inner bevel, center cap)
- Add a **knurled edge texture** via repeating conic-gradient on the outer ring (subtle grooves like a real audio knob)
- Larger tick marks (**2px × 6px rounded bars**) positioned around the arc, active tick glows orange
- **Indicator line** instead of dot — a 3px-wide radial line from center outward, with orange glow trail
- **Center cap** with concentric rings (machined metal look) — 3 nested circles with alternating gradients
- Add `cursor-grab` on the dial body for future drag-to-rotate interaction hint
- Mode labels: increase to **10px**, add a subtle **connecting line/arc** from the active label to the dial tick

### 2. Upgrade Mode Label Navigation

- Arrange labels in a **vertical stack with left accent bar** (3px orange bar on active, transparent on inactive)
- Add the mode **Icon** inline before each label (Mic, RefreshCw, Languages, Music)
- Active label: orange text + orange left bar + subtle bg-white/[0.03] highlight
- Hover: text-zinc-300 + bg-white/[0.02]
- Smooth `transition-all duration-200`

### 3. Redesign Model Picker Popup

- **Wider popup** (340px) with frosted glass effect (backdrop-blur-2xl, bg-[#0e0e0e]/90)
- **Header**: "SELECT MODEL" with a small search input (filter models by name)
- **Category sections**: Sticky category headers with uppercase label + model count badge
- **Model cards** (not rows): Each model gets a mini-card layout:
  - Left: colored category dot (orange for voiceover, purple for music, blue for sfx)
  - Center: model name (bold) + endpoint (muted) on two lines
  - Right: credit cost in a rounded pill badge (bg-[#f97316]/10 text-[#f97316])
- **Active model**: orange left border (3px) + subtle orange bg tint
- **Entry animation**: `animate-in slide-in-from-bottom-2 fade-in` via Tailwind
- **Scrollbar**: styled thin with orange thumb

### 4. Polish & Micro-Interactions

- Dial hover: subtle outer glow `0 0 20px rgba(249,115,22,0.1)`
- Generate button: add subtle pulse animation when prompt is non-empty
- Model badge button: show chevron-up when picker is open, chevron-down when closed

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/CinemaStudioSection.tsx` | Redesign dial (88px, knurled edge, indicator line, layered shadows), upgrade mode labels (icons + accent bar), redesign model popup (wider, search, card layout, category dots, animation) |

