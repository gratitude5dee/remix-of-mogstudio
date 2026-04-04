# Transform Left Sidebar into Floating Hover Menu

## Problem

The left sidebar (`KanvasSidebar`) is currently a static, full-height docked column (`w-14`, `h-screen`) that permanently consumes horizontal space. The user wants it converted to a floating, rounded-edge overlay that hovers above the content across all `/kanvas` sections.

## Design Approach

A vertically-centered floating pill on the left edge that auto-hides and reveals on hover — think macOS Dock behavior but vertical that disappears when mouse isn't near the left nav area and appears when mouse moves within 100px range of the left nav bar

```text
                ┌─────────────────────────────────┐
                │                                  │
   ┌────┐       │                                  │
   │ 🏠 │       │       Canvas / Studio Content    │
   │ 🖼 │       │                                  │
   │ 🎬 │       │       (full width, no sidebar    │
   │ ✏️ │       │        column eating space)       │
   │ 🎤 │       │                                  │
   │ 🎬 │       │                                  │
   │ 🌍 │       │                                  │
   │ 👤 │       │                                  │
   │ ● │       │                                  │
   └────┘       └─────────────────────────────────┘
   floating     
   pill         
```

## Changes

### 1. `src/components/kanvas/KanvasSidebar.tsx`

- **Remove** `h-screen`, `border-r`, `flex-shrink-0` static layout styles
- **Add** floating positioning: `fixed left-3 top-1/2 -translate-y-1/2 z-50`
- **Add** rounded pill container: `rounded-2xl bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)]`
- **Add** hover reveal behavior: sidebar starts as a narrow semi-transparent sliver (`w-3 opacity-40`) and expands to full width (`w-14 opacity-100`) on hover with `transition-all duration-300`
- **Add** `group` class on the outer container so child elements can react to hover state
- **Adjust** padding: `py-3 px-1.5` for compact floating feel
- Active indicator remains the lime left accent bar
- WZRD dot stays at the bottom

### 2. `src/pages/KanvasPage.tsx`

- **Remove** `<KanvasSidebar />` from the flex layout flow (it's now `fixed`, so it doesn't need to be a flex child — but can stay in the tree)
- **Remove** the `flex` layout dependency — the main content area becomes full-width: `<div className="w-full h-screen overflow-auto">` instead of `flex-1`
- The sidebar renders as a fixed overlay on top of everything

## Technical Details

- `fixed` positioning ensures visibility across all studio sections regardless of scroll
- `z-50` keeps it above content but below modals
- `backdrop-blur-xl` gives frosted glass depth
- Hover transition: `w-3 → w-14` with `overflow-hidden` so icons clip gracefully during collapse
- `group-hover` on icon labels can optionally show text labels on wider hover (stretch goal)

## Files Changed


| File                                      | Change                                                                                             |
| ----------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `src/components/kanvas/KanvasSidebar.tsx` | Convert from static sidebar to floating hover pill with rounded edges, backdrop blur, hover expand |
| `src/pages/KanvasPage.tsx`                | Remove sidebar from flex layout flow, make content full-width                                      |
