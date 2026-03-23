

# Landing Page Overhaul — Creative OS for SaaS, Cybersecurity & Media

Transform the current landing page from a creator-focused tool into a premium "Creative OS" platform targeting SaaS companies, cybersecurity firms, and media/entertainment distribution engines. Inspired by Flora AI's sophisticated dark aesthetic.

## Summary of Changes

### 1. Update HeroSection copy and styling
**File: `src/components/landing/HeroSection.tsx`**
- Headline: "Your *creative* environment." with italic emphasis on "creative"
- Subheadline: "Bring your ideas to life faster than ever before. Every creative AI tool, one unified process — built for SaaS, cybersecurity, and media distribution teams."
- Add a pill badge above headline: "New: 50+ AI models now live on WZRD" with "Try now" link
- Keep mock editor panel and ScrollingPartners as-is

### 2. Update MogPromoSection → Social Proof + Generative Workflows
**File: `src/components/landing/MogPromoSection.tsx`**
- Replace current content with two sub-sections:
  - **Social proof bar**: "Trusted by the world's top creative teams" with monochrome logos (NYU, Pentagram, Levi's, Lionsgate, R/GA, WPP, AKQA, NBCUniversal) — text-based placeholders
  - **Generative workflows**: "Generative workflows that scale." heading with organic blurred backdrop. Two CTAs: green "Get started for free" + "See all workflows" text link

### 3. New ModelLibrarySection component
**New file: `src/components/landing/ModelLibrarySection.tsx`**
- Heading: "One subscription to rule them all."
- Subtext: "One plan. 50+ models. Stay on the creative edge without chasing licenses."
- Grid of provider cards (Google, Runway, OpenAI, Black Forest Labs, Luma AI, Stability AI, Hailuo AI, WAN) each showing provider name + model list
- Cards use dark backgrounds with subtle gradient accents, rounded corners, hover lift

### 4. New GeneratedShowcaseSection component
**New file: `src/components/landing/GeneratedShowcaseSection.tsx`**
- Grid of placeholder "generated images" using gradient fills and overlay labels demonstrating capabilities: "Cybersecurity Dashboard UI", "SaaS Product Launch", "Film Key Art", "Brand Identity System", "Motion Graphics", "3D Product Viz"
- Each card has a dark overlay with title + "Generated with WZRD" badge
- Horizontal scrollable on mobile

### 5. New ThreeStepSection component
**New file: `src/components/landing/ThreeStepSection.tsx`**
- Three vertical cards: **01 Ideate**, **02 Iterate**, **03 Scale**
- Each has a miniature UI mockup inside (simple div-based illustrations), a headline, and a short description
- Dark cards with light outlines, staggered entrance animations

### 6. Update FeatureGrid copy for enterprise positioning
**File: `src/components/landing/FeatureGrid.tsx`**
- Update section heading: "An editor with superpowers." / "A full suite of AI features that speed up the boring parts, without taking control away."
- Rewrite feature cards for enterprise audiences:
  - "Content at Scale" (SaaS marketing teams)
  - "Secure Asset Pipeline" (cybersecurity firms)
  - "Distribution Engine" (media & entertainment)
  - "AI-Powered Creative" (keep)
  - "Platform-Ready Formats" (keep)
  - "Enterprise Workflows" (new)

### 7. Update UseCasesSection → Case Studies
**File: `src/components/landing/UseCasesSection.tsx`**
- Retitle: "Case studies from creative teams."
- Subheadline: "See how professionals across SaaS, cybersecurity, film, and media distribution are using WZRD."
- Update cards: "Brand System Design", "Security Operations Content", "Marketing & Advertising", "Media Distribution Pipeline"
- Add hover darkening effect + "Read more" CTA on each card

### 8. New FinalCTASection component
**New file: `src/components/landing/FinalCTASection.tsx`**
- "A new medium needs a new canvas."
- Two buttons: ghost "Contact sales" with arrow icon + solid orange "Sign up for free"
- Placed before the footer

### 9. Update StickyFooter
**File: `src/components/landing/StickyFooter.tsx`**
- Add three link columns: Company (Blog, Careers, Community), Product (Updates, Pricing, Teams, Capabilities), Resources (Docs, Support, Legal, Status)
- Add social icons row (X, YouTube, LinkedIn, Discord)
- Add status indicator: green dot + "All systems operational"

### 10. Update Landing.tsx section order
**File: `src/pages/Landing.tsx`**
- New section order:
  1. Hero (with mock editor + ScrollingPartners)
  2. MogPromoSection (social proof + generative workflows)
  3. ModelLibrarySection (new)
  4. GeneratedShowcaseSection (new)
  5. FeatureGrid
  6. ThreeStepSection (new)
  7. UseCasesSection (case studies)
  8. Testimonials
  9. Pricing
  10. FinalCTASection (new)
  11. FAQ
  12. Footer

### 11. General styling updates
- Green accent (`emerald-500`) for primary CTAs alongside existing orange
- Italic emphasis on key words in headings using `<em>` with serif font
- Add to `index.css`: `em { font-family: 'Georgia', serif; font-style: italic; }`
- Consistent dot-grid background already exists in the page wrapper

## Files summary
| File | Action |
|------|--------|
| `src/components/landing/HeroSection.tsx` | Update copy + add pill badge |
| `src/components/landing/MogPromoSection.tsx` | Rewrite as social proof + workflows |
| `src/components/landing/FeatureGrid.tsx` | Update copy for enterprise |
| `src/components/landing/UseCasesSection.tsx` | Rewrite as case studies |
| `src/components/landing/StickyFooter.tsx` | Add link columns + status |
| `src/components/landing/ModelLibrarySection.tsx` | **New** — model provider grid |
| `src/components/landing/GeneratedShowcaseSection.tsx` | **New** — showcase grid |
| `src/components/landing/ThreeStepSection.tsx` | **New** — 3-step value prop |
| `src/components/landing/FinalCTASection.tsx` | **New** — final CTA banner |
| `src/pages/Landing.tsx` | Reorder sections, add new imports |
| `src/index.css` | Add italic serif styling |

