

# Cinema Studio + @Mention Integration + Kanvas Header Redesign

## Problems Identified

1. **Cinema Studio lacks @mention integration**: The prompt inputs in `CinemaStudioSection` call `onPromptChange` directly but never trigger `onMentionChange` from `useCharacterMention`. The `MentionDropdown` component is imported in `KanvasPage.tsx` but never rendered for Cinema. Characters in the prompt bar are hardcoded stock photos instead of real character blueprints.

2. **Header is generic and cluttered**: The current header uses rounded-2xl bordered buttons for 7+ studios, a plain "Back to Home" button, and a redundant sidebar + mobile scroll area. It doesn't match the premium pill-slider pattern used inside studios.

3. **Runtime error**: Stale HMR cache — will be resolved by the file changes.

## Phase 1: Wire @Mention into Cinema Studio

### `src/components/kanvas/CinemaStudioSection.tsx`

**New props** added to `CinemaStudioProps`:
- `mentionSuggestions: CharacterMention[]`
- `showMentionDropdown: boolean`
- `onMentionSelect: (mention: CharacterMention) => void`
- `onCloseMentions: () => void`

**Prompt input changes** (both Image and Video bars):
- Wrap prompt input in a `relative` container
- Render `<MentionDropdown>` positioned above the input
- On input change: call both `onPromptChange(value)` and trigger mention detection
- On selecting a mention: replace the @query in the prompt string

**Character avatars**: Replace hardcoded `CHARACTER_AVATARS` array with a new prop `characterMentions: CharacterMention[]` from the store's `getMentionList()`. Fall back to placeholder avatars when no characters exist. The left icon rail and Cast tab will show real character blueprint images.

### `src/pages/KanvasPage.tsx`

- Pass `mentionSuggestions`, `showMentionDropdown`, `onMentionSelect`, `onCloseMentions` to `CinemaStudioSection`
- Wire `onPromptChange` to also call `onMentionChange` for cinema prompt (same pattern used for image/video)

## Phase 2: Redesign Kanvas Header

### `src/pages/KanvasPage.tsx` — Header section (lines 1159-1218)

Replace the current header with a premium, award-winning design:

**Structure**:
```text
┌──────────────────────────────────────────────────────────────┐
│  WZRD logo    │  ● Image  Video  Edit  Lipsync  Cinema ...  │  ⌂  │
│  (glow mark)  │  (centered pill-slider nav)                  │     │
└──────────────────────────────────────────────────────────────┘
```

- **Left**: Small WZRD wordmark with lime dot indicator, no "Back to Home" button (home icon on right suffices)
- **Center**: Pill-slider nav matching the Video/Edit studio pattern — `inline-flex bg-[#111] rounded-full p-1 border border-white/[0.06]`. Active tab: `bg-white/10 text-[#BEFF00] shadow-[inset_0_0_12px_rgba(190,255,0,0.06)]`. Icons + labels.
- **Right**: Home icon button only
- **Remove**: Redundant `xl:flex` sidebar of studio buttons (lines 1221-1231) — the header nav is sufficient
- **Remove**: Mobile scroll area duplicate — the pill slider is already responsive
- **Height**: Reduce from py-4 to py-2.5 for a sleeker bar
- **Background**: `bg-[#0A0A0A]/80 backdrop-blur-xl` with no visible border — use a subtle `shadow-[0_1px_0_rgba(255,255,255,0.04)]` instead

### `StudioNavButton` component
Replace entirely — no longer needed as separate component. The header renders tabs inline using the pill-slider pattern.

## Phase 3: Cinema Studio UI Polish

### Tab navigation (lines 581-613)
- Move from left-aligned pills to centered pill-slider matching the Video studio pattern
- `bg-[#1A1A1A] rounded-full p-1 border border-white/[0.06]` container
- Active: `bg-white/10 text-[#BEFF00]` with inset glow

### Cast tab improvements
- Wire "Create Character" button to navigate to `?studio=character-creation`
- Wire "Create Location" similarly
- Show real character blueprints from the mention list instead of stock photos

### Remove floating FAB
The FAB duplicates the generate button in the bottom bar — remove it to reduce clutter.

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/CinemaStudioSection.tsx` | Add @mention props, wire MentionDropdown to prompt inputs, replace hardcoded avatars with character data, redesign tab nav as centered pill slider, remove FAB |
| `src/pages/KanvasPage.tsx` | Redesign header as centered pill-slider nav, remove redundant sidebar, pass mention props to CinemaStudioSection, wire cinema prompt to onMentionChange |

