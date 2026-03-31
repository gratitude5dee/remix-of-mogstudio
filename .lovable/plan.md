

# Aura View — Project Observability List on Home Page

## Current Behavior
Clicking "Aura" in the sidebar navigates away to `/projects/:id/observability` for the most recent project. The user wants it to show an inline list of all projects with expandable evaluation summaries, right on the `/home` page.

## Plan

### 1. New component: `AuraProjectList.tsx`
**File: `src/components/home/AuraProjectList.tsx`**

- Receives `projects: Project[]` as prop
- For each project, renders a card with:
  - Project title, format, last updated
  - Expandable accordion showing a quick observability summary (fetched lazily on expand):
    - Completed evaluations count, open review tasks, failed judge families
    - Mini status dots (green/red/amber)
  - "View Details →" button that navigates to `appRoutes.projects.observability(project.id)`
- Uses `observabilityService.fetchAll(projectId)` to load summary data when a card is expanded
- Loading skeleton while fetching; error state if fetch fails
- Styled consistently with existing dark theme cards (glass effect, border-l status indicator)

### 2. Update `Sidebar.tsx` — make Aura a view, not a route
**File: `src/components/home/Sidebar.tsx`** (line 45)

Change Aura from `isRoute: true` to `isRoute: false` (or remove the flag). This makes clicking "Aura" call `onViewChange('aura')` instead of navigating away.

Remove the special-case `if (item.id === 'aura')` block (lines 78-85).

### 3. Update `MobileSidebarDrawer.tsx` — same change
**File: `src/components/home/MobileSidebarDrawer.tsx`** (line 35, 46-51)

Same treatment: remove `isRoute: true` from Aura nav item and remove the special navigation logic.

### 4. Update `Home.tsx` — render `AuraProjectList` when `activeView === 'aura'`
**File: `src/pages/Home.tsx`**

- Import `AuraProjectList`
- In the content area (around line 482), add a condition: when `activeView === 'aura'`, render `<AuraProjectList projects={projects} />` instead of the project grid/list
- Remove `auraProjectId` prop from `Sidebar` and `MobileSidebarDrawer` (no longer needed)
- Remove `latestProjectForAura` computation (lines 202-207)

## Files changed

| File | Change |
|------|--------|
| `src/components/home/AuraProjectList.tsx` | **New** — expandable project list with lazy-loaded observability summaries |
| `src/components/home/Sidebar.tsx` | Make Aura a view toggle, not a route navigation |
| `src/components/home/MobileSidebarDrawer.tsx` | Same sidebar change for mobile |
| `src/pages/Home.tsx` | Render AuraProjectList when activeView is 'aura'; remove auraProjectId prop |

