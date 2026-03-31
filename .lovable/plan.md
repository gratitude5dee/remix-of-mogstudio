

# Replace White Borders with Orange Glow in StudioRightPanel

All `border-white/10`, `border-white/8`, and `border-white/15` instances in the right panel need to be replaced with the brand-aligned orange glow border used throughout the rest of the app.

## Border token mapping

| Current | Replacement |
|---------|------------|
| `border-white/10` | `border-[rgba(249,115,22,0.12)]` |
| `border-white/8` | `border-[rgba(249,115,22,0.10)]` |
| `border-white/15` | `border-[rgba(249,115,22,0.18)]` |
| `hover:border-white/15` | `hover:border-[rgba(249,115,22,0.20)]` |
| `hover:border-white/10` | `hover:border-[rgba(249,115,22,0.15)]` |

## Affected locations in `src/components/studio/StudioRightPanel.tsx`

1. **ActionIconButton** (line 131) — button border + hover border
2. **NodeInspector header** (line 216) — `border-b border-white/8`
3. **Kind badge** (line 221) — `border border-white/8`
4. **Close button** (line 242) — border + hover border
5. **Preview section** (line 264) — outer card border
6. **Preview image container** (line 266) — inner border
7. **Metadata section** (line 276) — section border
8. **Actions section** (line 295) — section border
9. **Generate section** (line 307) — section border
10. **Web Search toggle row** (line 352) — border
11. **Aspect Ratio select** (line 327) — border
12. **Resolution select** (line 341) — border
13. **Seed input** (line 369) — `border-white/10`
14. **Prompt textarea** (line 385) — `border-white/10`
15. **Text preview section** (line 393) — section + inner border
16. **NodeCreationSection** (line 421) — section border
17. **Collapsed panel** (line 524) — outer border
18. **Collapsed icon container** (line 529) — border
19. **Expanded panel** (line 566) — outer border
20. **Tab bar** (line 570) — `border-b border-white/8`
21. **Collapse button** (line 598) — border + hover border
22. **ImageEdit header** (line 636) — border-b + badge border
23. **No-selection section** (line 677) — section border

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/StudioRightPanel.tsx` | Replace all ~23 white border instances with orange glow equivalents |

