

# Redesign NodeHoverMenu Toolbar + Model Marketplace Dropdown

The current toolbar looks rough — inconsistent spacing, wrong border treatments, and the model marketplace dropdown still uses white borders. The reference images show a polished, professional toolbar with clean pill segments and a refined dropdown.

## Changes

### 1. `NodeHoverMenu.tsx` — Polished toolbar

| Element | Current | Updated |
|---------|---------|---------|
| Container | `gap-0.5 rounded-[12px] px-1 py-0.5` | `gap-1 rounded-[16px] px-1.5 py-1` — slightly more breathing room |
| Container border | `border-[rgba(249,115,22,0.15)]` | `border-[rgba(249,115,22,0.12)]` — subtler glow |
| Container shadow | single glow | `shadow-[0_0_12px_rgba(249,115,22,0.08),0_8px_32px_rgba(0,0,0,0.4)]` — depth + glow |
| Leading chip (line 173) | `border-white/10` | `border-[rgba(249,115,22,0.12)]` |
| Aspect ratio chip (line 179) | `border-white/10` | `border-[rgba(249,115,22,0.12)]` |
| Dividers (lines 185, 251) | `bg-white/8` | `bg-[rgba(249,115,22,0.1)]` |
| Tools button (line 193) | `border-white/10` | `border-[rgba(249,115,22,0.12)]` |
| Tools popover (line 207) | `border-white/10` | `border-[rgba(249,115,22,0.12)] shadow-[0_0_12px_rgba(249,115,22,0.06),0_20px_50px_rgba(0,0,0,0.5)]` |
| Tool item icons (lines 233-234) | `border-white/6`, `border-white/8` | `border-[rgba(249,115,22,0.08)]`, `border-[rgba(249,115,22,0.1)]` |
| Action button hover (line 68) | `hover:border-white/8` | `hover:border-[rgba(249,115,22,0.15)]` |
| Action button size | `h-8 w-8 rounded-[10px]` | `h-8 w-8 rounded-[10px]` (keep) |

### 2. `FloraModelMarketplace.tsx` — Orange glow on trigger + dropdown

| Element | Current | Updated |
|---------|---------|---------|
| Trigger button border (line 254) | `border-white/10` | `border-[rgba(249,115,22,0.15)]` |
| Trigger icon ring (line 265) | `border-white/10` | `border-[rgba(249,115,22,0.12)]` |
| Popover border (line 285) | `border-white/10` | `border-[rgba(249,115,22,0.12)]` |
| Popover shadow (line 285) | basic shadow | `shadow-[0_0_12px_rgba(249,115,22,0.06),0_28px_90px_rgba(0,0,0,0.58)]` |
| Search bar border (line 291) | `border-white/8` | `border-[rgba(249,115,22,0.1)]` |
| Settings panel borders (line 311) | `border-white/6` | `border-[rgba(249,115,22,0.08)]` |
| Right pane border (line 401) | `border-white/6` | `border-[rgba(249,115,22,0.08)]` |
| Right pane header divider (line 404) | `border-white/6` | `border-[rgba(249,115,22,0.08)]` |
| Provider buttons (lines 376-378) | `border-white/12`, `border-white/6` | `border-[rgba(249,115,22,0.15)]`, `border-[rgba(249,115,22,0.08)]` |
| Provider icon rings (line 382) | `border-white/8` | `border-[rgba(249,115,22,0.1)]` |
| Model row unselected (line 198) | `border-white/5` | `border-[rgba(249,115,22,0.06)]` |
| Model row icon (line 201) | `border-white/8` | `border-[rgba(249,115,22,0.1)]` |
| Capability badges (lines 217-227) | `border-white/8` | `border-[rgba(249,115,22,0.1)]` |
| Empty pinned state (line 346) | `border-white/6` | `border-[rgba(249,115,22,0.08)]` |
| Models pill (line 411) | `border-white/8` | `border-[rgba(249,115,22,0.1)]` |
| Unselected radio (line 240) | `border-white/10` | `border-[rgba(249,115,22,0.12)]` |
| "Search compatible models" text | `placeholder="Search"` | `placeholder="Search compatible models"` to match reference |

### 3. Label updates to match reference images

| Element | Current | Updated |
|---------|---------|---------|
| Auto toggle label (line 314) | `Auto` | `Auto select model` |
| Section header (line 340-341) | `Pinned Models` | `Pinned models` (lowercase m) |
| Section header (line 354) | `Featured Models` | `Featured models` |
| Providers section (line 362) | `Providers` | `Providers` (keep) |
| Provider count format | `{n} model{s}` | `{n} model{s}` (keep) |

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Replace all white borders/dividers with orange glow, refine spacing |
| `src/components/studio/model-selector/FloraModelMarketplace.tsx` | Orange glow on all borders, label updates, search placeholder |

