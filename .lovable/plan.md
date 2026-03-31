

# Replace White Borders with Orange Glow in WorkflowGeneratorTab

The Generate tab renders `WorkflowGeneratorTab`, which still uses `border-white/8`, `border-white/10`, `border-white/12`, and `border-white/15` throughout. These need to match the orange glow colorway used in the rest of the app.

## Border token mapping

| Current | Replacement |
|---------|------------|
| `border-white/8` | `border-[rgba(249,115,22,0.10)]` |
| `border-white/10` | `border-[rgba(249,115,22,0.12)]` |
| `border-white/12` | `border-[rgba(249,115,22,0.15)]` |
| `border-white/15` | `border-[rgba(249,115,22,0.18)]` |
| `hover:border-white/12` | `hover:border-[rgba(249,115,22,0.18)]` |
| `hover:border-white/15` | `hover:border-[rgba(249,115,22,0.20)]` |

## Affected locations in `WorkflowGeneratorTab.tsx`

1. **Outer container** (line 97) — `border-white/10`
2. **Header border-b** (line 103) — `border-white/8`
3. **Close button** (line 127) — `border-white/10` + `hover:border-white/15`
4. **"New workflow" badge** (line 136) — `border-white/10`
5. **Examples section card** (line 151) — `border-white/8`
6. **Example buttons** (line 168) — `border-white/8` + `hover:border-white/12`
7. **Example icon containers** (line 171) — `border-white/8`
8. **Prompt section card** (line 185) — `border-white/8`
9. **Prompt textarea** (line 206) — `border-white/10`
10. **"Workflow only" badge** (line 221) — `border-white/8`
11. **Error/status border-t** (line 243) — `border-white/8`
12. **Footer border-t (panel)** (line 254) — `border-white/8`
13. **Footer border-t (popup)** (line 258) — `border-white/8`

## Files changed

| File | Change |
|------|--------|
| `src/components/studio/WorkflowGeneratorTab.tsx` | Replace all ~13 white border instances with orange glow equivalents |

