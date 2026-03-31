

# UI Consistency Polish — Home, Project Setup, and Timeline Pages

## Audit Summary

After reviewing all three pages against the Studio UI, here are the key inconsistencies:

1. **Home Page** — Uses `bg-background`, light/dark dual-mode tokens (`text-text-primary`, `surface-2`), purple accent system (`accent-purple`, `#8B5CF6`), and generic `border-border-default`. Doesn't match Studio's dark-only `bg-[#0a0a0a]` with orange glow borders.

2. **Project Setup** — Header uses generic card tokens (`bg-gradient-to-r from-card/95`), footer uses hardcoded blue (`bg-blue-600`, `bg-blue-500` dots), and `border-zinc-800`. Inconsistent with the orange glow system established in Studio and TabNavigation.

3. **Timeline (StoryboardPage)** — Closest to Studio but uses mixed purple (`border-purple-500/15`, `bg-[#1a1015]`) for action buttons alongside orange. The `border-white/8` instances haven't been migrated to orange glow.

## Changes

### 1. `src/components/project-setup/NavigationFooter.tsx` — Align with orange glow system

- Replace `bg-[#0F1219]` with `bg-[#0a0a0f]` to match Studio's base
- Replace `border-zinc-800` with `border-[rgba(249,115,22,0.12)]`
- Replace blue button colors (`bg-blue-600`, `bg-blue-700`) with orange (`bg-[#f97316]`, `hover:bg-[#ea580c]`)
- Replace blue dot indicators (`bg-blue-500`, `bg-blue-800`) with orange (`bg-[#f97316]`, `bg-[rgba(249,115,22,0.4)]`)
- Replace `border-zinc-700` on Back button with `border-[rgba(249,115,22,0.15)]`
- Add subtle orange glow shadow on Next button: `shadow-[0_0_20px_rgba(249,115,22,0.15)]`

### 2. `src/components/project-setup/ProjectSetupHeader.tsx` — Match Studio dark aesthetic

- Replace `bg-gradient-to-r from-card/95 via-card/80 to-card/95` with `bg-[#0a0a0f]/95 backdrop-blur-xl`
- Replace `border-border/30` with `border-[rgba(249,115,22,0.1)]`
- Replace progress bar `bg-muted` with `bg-zinc-800` and gradient with orange: `from-[#f97316] to-[#d4a574]`
- Style the progress step text with `text-[#f97316]` instead of `text-primary`
- Replace avatar `bg-primary` with `bg-[#f97316]`
- Replace Upgrade button generic styles with orange-tinted hover
- Add subtle top-border glow line matching Studio pattern

### 3. `src/pages/Home.tsx` — Unify with dark premium aesthetic

**Header section (lines 242-428):**
- Replace `bg-gradient-to-r from-surface-2 via-transparent to-surface-2` with `bg-[#0a0a0f]/90 backdrop-blur-xl`
- Replace `border-border-default` with `border-[rgba(249,115,22,0.1)]`
- Replace tab container `bg-surface-2` with `bg-white/[0.03]`
- Active tab: add orange glow border `border-[rgba(249,115,22,0.25)]` and `bg-[rgba(249,115,22,0.08)]`
- Replace Invite button `border-border-default` with `border-[rgba(249,115,22,0.15)]`
- Replace divider `bg-border-default` with `bg-[rgba(249,115,22,0.1)]`

**Stats section (lines 430-473):**
- Replace `border-border-default` with `border-[rgba(249,115,22,0.1)]`
- Replace `bg-gradient-to-b from-surface-2` with `bg-gradient-to-b from-[rgba(249,115,22,0.02)]`

**Settings dropdown (lines 286-337):**
- Replace `bg-surface-1 border-border-default` with `bg-[#0f0f13] border-[rgba(249,115,22,0.15)]`
- Style dropdown items with orange hover: `hover:bg-[rgba(249,115,22,0.06)]`

### 4. `src/components/home/StatCard.tsx` — Orange glow borders

- Replace `border-white/[0.08]` with `border-[rgba(249,115,22,0.1)]`
- Replace purple hover glow `hover:border-[rgba(139,92,246,0.35)]` with `hover:border-[rgba(249,115,22,0.3)]`
- Replace purple icon gradient `from-[rgba(139,92,246,0.2)]` with `from-[rgba(249,115,22,0.15)]`
- Replace icon text color `text-[#A78BFA]` with `text-[#f97316]`
- Replace ShineBorder colors from `["#8B5CF6", "#06B6D4"]` to `["#f97316", "#d4a574"]`

### 5. `src/components/home/Sidebar.tsx` — Orange accent migration

- Replace `accent-purple` references in active nav items with orange: `text-[#f97316]`, `bg-[rgba(249,115,22,0.15)]`
- Replace `ShineBorder` color from `#FF6B4A` (close but inconsistent label) to unified `#f97316`
- Replace sidebar shine colors from `accent-purple/amber` array to `["#f97316", "#d4a574"]`
- Active nav border: `border-[rgba(249,115,22,0.2)]`

### 6. `src/components/home/ProjectCard.tsx` — Orange hover consistency

- Replace hover title color `text-accent-purple` / `text-purple-400` with `text-[#f97316]`
- Replace underline `bg-accent-purple` with `bg-[#f97316]`
- Replace empty-state icon gradients from `accent-purple` to `from-[rgba(249,115,22,0.2)] to-[rgba(249,115,22,0.05)]`

### 7. `src/pages/StoryboardPage.tsx` — Purge remaining purple from action buttons

- Lines 447-450: Replace `border-purple-500/15` with `border-[rgba(249,115,22,0.15)]` on Director's Cut button
- Lines 468-474: Replace `border-purple-500/25`, `border-purple-400/20`, `text-purple-100/50` with orange equivalents on Generate All button
- Replace `hover:border-purple-500/30` with `hover:border-[rgba(249,115,22,0.25)]`

### 8. `src/components/AppHeader.tsx` — Subtle orange accent touches

- Replace `border-zinc-800/50` with `border-[rgba(249,115,22,0.08)]`
- Active view tab: replace `bg-white/10` with `bg-[rgba(249,115,22,0.12)] text-[#f97316]`
- Credits display border: replace `border-zinc-800/50` with `border-[rgba(249,115,22,0.12)]`
- Settings dropdown: replace `bg-zinc-900 border-zinc-800` with `bg-[#0f0f13] border-[rgba(249,115,22,0.15)]`
- Dropdown items: replace `hover:bg-zinc-800` with `hover:bg-[rgba(249,115,22,0.06)]`

## Design rationale

The Studio page established a cohesive visual identity: dark `#0a0a0a`/`#0f0f13` surfaces, orange glow borders (`rgba(249,115,22, 0.10-0.20)`), warm shadows, and `#f97316` as the primary interactive accent. The other three pages still use a mix of purple accents, generic surface tokens, and blue buttons that break the premium "Creative OS" identity. This plan systematically replaces every off-brand token to create a unified, award-worthy dark interface across the entire application.

## Files changed

| File | Change |
|------|--------|
| `src/components/project-setup/NavigationFooter.tsx` | Replace blue with orange; align borders with glow system |
| `src/components/project-setup/ProjectSetupHeader.tsx` | Dark Studio aesthetic; orange progress bar and accents |
| `src/pages/Home.tsx` | Unify header, tabs, dropdowns with orange glow borders |
| `src/components/home/StatCard.tsx` | Orange glow borders and icon accents |
| `src/components/home/Sidebar.tsx` | Replace purple active states with orange |
| `src/components/home/ProjectCard.tsx` | Orange hover accents and title underline |
| `src/pages/StoryboardPage.tsx` | Replace purple action button borders with orange |
| `src/components/AppHeader.tsx` | Orange accent on active tabs, dropdown, and borders |

