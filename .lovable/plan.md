

# Move "Generation Models" to TabNavigation as a Dropdown

## Overview

Remove the "Generation Models" section from the bottom of `ConceptTab` and relocate it into the `TabNavigation` bar as a polished settings dropdown — a gear/sliders icon button positioned to the right of the step pills. Clicking it reveals a popover with the three model selectors and the JSON override field, styled consistently with the app's dark theme and orange accent colorway.

## Changes

### 1. `src/components/project-setup/TabNavigation.tsx` — Add models dropdown

- Import `Popover`, `PopoverTrigger`, `PopoverContent` from `@/components/ui/popover`
- Import `SlidersHorizontal` icon from lucide-react
- Import model data: `getModelsByTypeAndGroup`, `STORYLINE_MODEL_OPTIONS`, `formatModelLabel`, `formatStorylineModelLabel`
- Access `projectData` and `updateProjectData` from `useProjectContext()`
- Add a settings button after the tab pills (right side of the flex container), styled as a subtle pill with the `SlidersHorizontal` icon
- Button style: `bg-white/[0.03] border-[rgba(249,115,22,0.15)] hover:border-[rgba(249,115,22,0.3)]` — consistent with app's orange glow system
- Popover content: dark card (`bg-[#0f0f13] border-[rgba(249,115,22,0.15)]`) containing:
  - Header: "Generation Models" with subtle description text
  - 3 custom `<Select>` dropdowns (Storyline model, Default image model, Default video model) using the app's `Select` component with orange-tinted borders
  - Storyline JSON override `<Textarea>` with validation (move the state + blur handler logic here)
- Include local state for `storylineSettingsText` and `storylineSettingsError` inside TabNavigation
- Popover width: `w-[420px]`, max-height with scroll if needed

### 2. `src/components/project-setup/ConceptTab.tsx` — Remove models section

- Delete lines 191–265 (the entire `<motion.section>` containing "Generation Models")
- Remove unused imports: `getModelsByTypeAndGroup`, `formatModelLabel`, `STORYLINE_MODEL_OPTIONS`, `formatStorylineModelLabel`, `Textarea`
- Remove unused state: `storylineSettingsText`, `storylineSettingsError`, `imageGenerationModels`, `videoGenerationModels`, `storylineModelOptions`
- Remove `handleStorylineSettingsBlur` and the related `useEffect`

### 3. `src/components/project-setup/ProjectContext.tsx` — No changes needed

`projectData` and `updateProjectData` are already available via context, so TabNavigation can access them directly.

## Visual design

```text
┌─────────────────────────────────────────────────────────────┐
│  (1) Concept ──── (2) Storyline ──── (3) Settings ──── (4)  │  ⚙ ←── new button
└─────────────────────────────────────────────────────────────┘
                                                         │
                                                    ┌────▼────────────┐
                                                    │ Generation Models│
                                                    │                  │
                                                    │ Storyline model  │
                                                    │ [▼ llama-3.3.. ] │
                                                    │                  │
                                                    │ Image model      │
                                                    │ [▼ flux-dev..  ] │
                                                    │                  │
                                                    │ Video model      │
                                                    │ [▼ kling-o3.. ] │
                                                    │                  │
                                                    │ JSON override    │
                                                    │ [textarea      ] │
                                                    └──────────────────┘
```

## Files changed

| File | Change |
|------|--------|
| `src/components/project-setup/TabNavigation.tsx` | Add SlidersHorizontal icon button + Popover with model selectors |
| `src/components/project-setup/ConceptTab.tsx` | Remove "Generation Models" section and related imports/state |

