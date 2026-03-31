

# NodeHoverMenu Gap + Model Marketplace UI Polish + Remove Idle Badge

## 1. Reduce NodeHoverMenu gap by 5px

**File: `src/components/studio/nodes/NodeHoverMenu.tsx` (line 148)**

Change `-translate-y-[calc(100%+10px)]` → `-translate-y-[calc(100%+5px)]` on the outer static wrapper.

## 2. Remove the "Idle" status badge

**File: `src/components/studio/status/NodeStatusBadge.tsx`**

Return `null` early when `status === 'idle'` (line ~22, before `getStatusConfig`). The default case currently renders a visible "Idle" pill — users should see nothing when a node is idle.

## 3. Redesign FloraModelMarketplace dropdown

**File: `src/components/studio/model-selector/FloraModelMarketplace.tsx`**

Major UI improvements to match a world-class design standard:

**Pin/unpin models:**
- Add local state `pinnedIds` (Set) for user-pinned models
- Replace the static `Pin` icon in `renderModelRow` with an interactive pin button that toggles pin state on click (with `e.stopPropagation()` to avoid selecting the model)
- Pinned icon: filled `Pin` in orange; unpinned: outline `Pin` in zinc-500, visible on hover only
- Pinned models appear in the "Pinned models" section dynamically

**Model row improvements:**
- Tighter, cleaner layout — reduce vertical padding slightly for compact rows
- Add subtle hover animation (scale 1.005 or bg transition)
- Selected state: stronger orange left-border accent (3px solid `#f97316` on left side) instead of full border color change
- Capability badges: use dot-separated inline text instead of individual badges to reduce visual noise (e.g., `⊕13 · 8s · I · R`)
- "New" badge: smaller, more refined pill

**Provider list improvements:**
- Active provider: add a left accent bar (2px orange) instead of just border change
- Provider icon: use first 2 letters instead of 1 for better recognition
- Subtle chevron rotation on active provider

**Right pane (provider detail) header:**
- Add model count badge with refined styling
- Add a subtle separator line below header

**Search bar:**
- Add a keyboard shortcut hint (`⌘K` or just `/`) as trailing element
- Slightly larger search icon

**Settings panel (auto select / multi-model toggles):**
- Add subtle descriptions under each toggle label in zinc-500 text
- e.g., "Auto select model" → sub-text: "Let WZRD pick the best model"
- e.g., "Use multiple models" → sub-text: "Generate with multiple models at once"

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/nodes/NodeHoverMenu.tsx` | Reduce vertical gap from 10px to 5px |
| `src/components/studio/status/NodeStatusBadge.tsx` | Return null for idle status |
| `src/components/studio/model-selector/FloraModelMarketplace.tsx` | Pin/unpin interactivity, refined model rows, provider accent bars, search hint, toggle descriptions |

