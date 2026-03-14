

# Fix: 4 Build Errors

## Changes

### 1. `src/components/editor/EditorCanvas.tsx` (line 163)
Cast `EditorComposition` through `unknown` first to satisfy TypeScript:
```typescript
component={EditorComposition as unknown as React.ComponentType<Record<string, unknown>>}
```

### 2. `src/components/editor/tabs/ProjectAssetsTab.tsx` (line 91)
Remove the invalid `focusRingColor` CSS property — it's not a valid `style` property. The focus ring is already handled by the `onFocus` handler below it.

### 3. `src/components/landing/CinematicIntro.tsx` (line 160)
Type-assert `texture.image` to access `.width` and `.height`:
```typescript
const img = texture.image as { width: number; height: number } | undefined;
const aspect = img ? img.width / img.height : 2;
```

