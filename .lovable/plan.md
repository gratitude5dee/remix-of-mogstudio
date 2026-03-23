

# Redesign Hero Section + Move ScrollingPartners

## 1. Move ScrollingPartners below Trust Indicators section

**File: `src/components/landing/MogPromoSection.tsx`**
- Remove the `ScrollingPartners` import and its `<div className="mb-16">` wrapper (lines 4, 61-64)

**File: `src/pages/Landing.tsx`**
- Insert `<ScrollingPartners />` after the Trust Indicators section (after line 450), before the Features section divider. Add a "Built With" label is already in the component. Wrap in a simple `<div>`.

## 2. Redesign HeroSection — Cardboard-inspired premium design

**File: `src/components/landing/HeroSection.tsx`** — Full rewrite with these elements:

### Layout & Typography
- Full viewport height (`min-h-screen`), centered content
- Headline: extra-bold, 48-72px responsive (`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl`), gradient from white to white/60 — keep existing gradient text approach
- Subheadline: `text-lg sm:text-xl lg:text-2xl`, `text-white/50`, max-w-2xl, generous leading
- Remove the badge pill at top — cleaner, more minimal

### CTA Buttons — Cardboard style
- **Primary**: White/light button with dark text, rounded-xl, right-arrow icon, slight hover lift + glow. Label: "Get Started"
- **Secondary**: Ghost button with play icon, border-white/10, label: "Watch Demo"
- Both use `px-8 py-4`, consistent sizing

### Mock Editor UI Panel
- Below CTAs, add a rounded dark container (`bg-white/[0.03] border border-white/[0.08] rounded-2xl`) showing a simplified timeline editor mockup
- Contains: a preview window area, 3 track lanes (labeled "B-Roll", "Main", "Music") with colored bars, and a small "AI Director" chat pane on the right
- This panel overlaps slightly into the next section via negative margin-bottom (`-mb-20 relative z-20`)
- Staggered entrance animation with delay

### Scroll indicator
- Keep the existing mouse-wheel scroll indicator at bottom

### Stars/trust line
- Remove from HeroSection (it's redundant with the Trust Indicators section below)

### Animations
- Staggered motion entrance: headline (0.1s), subheadline (0.2s), CTAs (0.3s), editor mockup (0.6s)
- Smooth hover transitions on buttons (scale, shadow elevation)

## Files changed
| File | Change |
|------|--------|
| `src/components/landing/HeroSection.tsx` | Full redesign with Cardboard-inspired layout + mock editor panel |
| `src/components/landing/MogPromoSection.tsx` | Remove ScrollingPartners import + JSX |
| `src/pages/Landing.tsx` | Insert ScrollingPartners after Trust Indicators section |

