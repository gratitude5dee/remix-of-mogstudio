

# Delete GeneratedShowcaseSection

Remove the `GeneratedShowcaseSection` from the landing page.

## Changes

**File: `src/pages/Landing.tsx`**
- Remove the `import` for `GeneratedShowcaseSection`
- Remove the `<GeneratedShowcaseSection />` JSX usage (around line 216)

No other files reference this component, so the component file itself can remain (unused) or be deleted optionally.

