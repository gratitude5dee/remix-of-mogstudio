

# Rebrand FLORA → WZRD + Orange Glow Borders on Studio Page

## Changes

### 1. Rename visible "FLORA" text to "WZRD"

User-facing text changes only (internal variable/function names stay as-is to avoid breaking changes):

| File | Change |
|------|--------|
| `src/components/studio/EmptyCanvasState.tsx` | `'FLORA Example'` → `'WZRD Example'`, `'Start FLORA example'` → `'Start WZRD example'`, `'seed the FLORA example'` → `'seed the WZRD example'` |
| `src/components/studio/StudioCanvas.tsx` | `'Inserted FLORA example'` → `'Inserted WZRD example'`, `'FLORA example inserted.'` → `'WZRD example inserted.'` |

### 2. Orange glow borders across studio components

Replace `border-zinc-800`, `border-zinc-700`, `border-white/10`, `border-white/5` with `border-[#f97316]/15` and add subtle orange glow shadows where appropriate.

| File | What changes |
|------|-------------|
| `src/components/studio/StudioInspectorPanel.tsx` | `border-zinc-800` → `border-[#f97316]/15` on aside, inputs, dividers; add glow shadow |
| `src/components/studio/canvas/FloraPromptBar.tsx` | `border-white/10` → `border-[#f97316]/20`, `border-white/5` → `border-[#f97316]/10` |
| `src/components/studio/HistoryPanel.tsx` | `border-zinc-800` → `border-[#f97316]/15` on container, search input, header border |
| `src/components/studio/BlockSettingsModal.tsx` | `border-zinc-800` → `border-[#f97316]/15` |
| `src/components/studio/ConnectionNodeSelector.tsx` | `border-zinc-800/60` → `border-[#f97316]/15` |
| `src/components/studio/nodes/OutputNode.tsx` | `border-zinc-800` → `border-[#f97316]/15` on node container and dividers |
| `src/components/studio/nodes/UploadVideoNode.tsx` | `border-zinc-800` / `border-zinc-700` → `border-[#f97316]/15` |
| `src/components/studio/nodes/NodeHandle.tsx` | `border-white/10` → `border-[#f97316]/20` for flora variant |
| `src/components/studio/panels/SettingsPanel.tsx` | `border-zinc-800/50` → `border-[#f97316]/15` on panel container, dividers |
| `src/components/studio/EmptyCanvasState.tsx` | `border-white/10` → `border-[#f97316]/20` on shimmer button |

All border replacements follow the same pattern established in the storyboard sidebar — `border-[#f97316]/15` with optional `shadow-[0_0_8px_rgba(249,115,22,0.06)]` for key containers.

