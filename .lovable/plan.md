

# Chevron Expand Button + Award-Winning Light Mode Polish

## 1. Chevron to Re-Open Collapsed Sidebar

**File: `src/pages/Home.tsx`**

Add a `ChevronRight` button that appears to the left of the WZRD logo in the header **only when `isCollapsed` is true**. Clicking it calls `setIsCollapsed(false)`.

- Position: inline before the logo image (line ~250), wrapped in `AnimatePresence` for smooth enter/exit
- Style: 28px circle, subtle border, orange hover glow, `ChevronRight` icon
- Imports: add `ChevronRight` from lucide, `AnimatePresence` already imported via framer-motion, `useSidebar` already imported

## 2. Light Mode — Award-Winning Design Overhaul

The current light mode uses hardcoded dark colors (`bg-[#0a0a0f]`, `text-white/60`, `bg-white/[0.04]`, `bg-[#1A1A1A]`) throughout the dashboard, making it look broken in light mode. The fix involves updating multiple components to use proper light/dark adaptive classes.

### 2a. Header (`src/pages/Home.tsx` lines 242-421)

- `bg-[#0a0a0f]/90` → `bg-white/90 dark:bg-[#0a0a0f]/90` — warm white with blur in light mode
- Tabs container `bg-white/[0.03]` → `bg-zinc-100 dark:bg-white/[0.03]`
- Active tab: add `dark:` prefix to orange bg/border styles; light mode gets `bg-orange-50 border-orange-200 text-orange-600`
- Inactive tab text: use `text-zinc-500 dark:text-text-tertiary`
- Settings dropdown content: `bg-[#0f0f13]` → `bg-white dark:bg-[#0f0f13]`, text colors adaptive
- Invite button: light mode gets `bg-zinc-100 border-zinc-200 text-zinc-600`

### 2b. Stats Row (`src/pages/Home.tsx` line 424)

- Gradient background: adaptive `from-orange-50/50 dark:from-[rgba(249,115,22,0.02)]`

### 2c. StatCard (`src/components/home/StatCard.tsx`)

- `glass-stat` class doesn't exist — replace with `bg-white dark:bg-white/[0.03]`
- Border: `border-orange-100 dark:border-[rgba(249,115,22,0.1)]`
- Hover: `hover:border-orange-200 dark:hover:border-[rgba(249,115,22,0.3)]`
- Trend badges: light-mode variants (e.g., `text-orange-600 bg-orange-50` for up trends)
- Label text: ensure readable in light (`text-zinc-500 dark:text-muted-foreground/70`)

### 2d. ProjectViewModeSelector (`src/components/home/ProjectViewModeSelector.tsx`)

- Container: `bg-zinc-100 dark:bg-white/[0.04]`, `border-zinc-200 dark:border-white/[0.08]`
- Inactive text: `text-zinc-500 dark:text-white/60`
- Active: keep orange gradient (works on both)

### 2e. SortDropdown (`src/components/home/SortDropdown.tsx`)

- Trigger: `bg-zinc-100 dark:bg-white/[0.04]`, `border-zinc-200 dark:border-white/[0.08]`, `text-zinc-600 dark:text-white/60`
- Content: `bg-white dark:bg-[#1A1A1A]`, `border-zinc-200 dark:border-white/[0.08]`
- Items: `text-zinc-700 dark:text-white/60`, hover `text-zinc-900 dark:text-white`

### 2f. ProjectCard (`src/components/home/ProjectCard.tsx`)

- Already has `dark:` variants — mostly fine
- Empty state play icon bg: add light variant `bg-orange-50 dark:bg-[rgba(249,115,22,0.2)]`

### 2g. SearchBar (`src/components/home/SearchBar.tsx`)

- Already uses CSS variables (`bg-card/60`, `text-foreground`) — should work. No changes needed.

## Files Changed

| File | Change |
|------|--------|
| `src/pages/Home.tsx` | Add chevron expand button next to logo when sidebar collapsed; fix all hardcoded dark colors in header/tabs/stats to use light/dark adaptive classes |
| `src/components/home/StatCard.tsx` | Replace `glass-stat` with adaptive bg, fix trend badge colors for light mode |
| `src/components/home/ProjectViewModeSelector.tsx` | Add light-mode adaptive backgrounds and text |
| `src/components/home/SortDropdown.tsx` | Add light-mode adaptive backgrounds, text, and dropdown content |
| `src/components/home/ProjectCard.tsx` | Minor light-mode fixes for empty state icon |

