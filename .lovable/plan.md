

# Build Cinematic Video Studio Section for /kanvas

## Overview
Create a new dedicated Video studio layout that replaces the current generic studio UI when `studio === "video"` on the Kanvas page. The design follows the Noir Futurist reference with a left control panel, massive editorial hero, feature bento grid, and recent creations gallery.

## New Component

### `src/components/kanvas/VideoStudioSection.tsx`

A self-contained component that receives all the video-related props from KanvasPage and renders the cinematic editorial layout:

**Left Sidebar Panel (fixed-width ~320px):**
- Tab buttons: "Create Video" (active, lime), "Edit Video", "Motion Control"
- Two upload dropzones: "Start Frame" and "End Frame" (aspect-square, dashed border-white/10, hover:border-[#ccff00]/50)
- "Multi-shot" toggle row (bg-[#1a1919] rounded-2xl)
- "Creative Prompt" textarea (bg-[#262626] rounded-2xl, placeholder text)
- Model label ("Kling 3.0" in lime) with duration pills (5S/10S/15S) and aspect ratio pills (16:9/9:16/1:1/720P)
- Full-width "GENERATE VIDEO" button (bg-[#ccff00] text-black rounded-full, shadow-[0_0_30px_rgba(204,255,0,0.3)])

**Main Content Area (right of sidebar):**
- Massive headline: "MAKE VIDEOS IN" + "*ONE CLICK*" (italic, text-[#ccff00]), text-6xl tracking-tighter, Space Grotesk
- Subtitle: "250+ presets for camera control..." in text-zinc-400
- 3-column bento grid of feature cards (aspect-[4/5]):
  - "ADD IMAGE" — lime circle icon, gradient overlay, cinematic background
  - "CHOOSE PRESET" — tune icon, ghost border circle
  - "GET VIDEO" — pink accent, movie icon
  - Each card: dark image with gradient-to-t from-black overlay, title + description at bottom
- "Recent Creations" section: header with "VIEW ALL" link, 4-column grid of grayscale images that colorize on hover

**Bottom-right floating pill:**
- Glass panel with lime dot + "READY TO ANIMATE" text

## Integration in `src/pages/KanvasPage.tsx`

In the main render block (line ~1227), add a new condition before the generic studio UI:

```tsx
studio === "video" ? (
  <VideoStudioSection
    prompt={videoPrompt}
    onPromptChange={setVideoPrompt}
    referenceId={videoReferenceId}
    onReferenceChange={setVideoReferenceId}
    currentModel={currentVideoModel}
    models={currentVideoModels}
    onModelChange={(id) => { setVideoModelId(id); /* reset settings */ }}
    settings={videoSettings}
    onSettingsChange={(k, v) => setVideoSettings(c => ({...c, [k]: v}))}
    submitting={submitting}
    onGenerate={handleGenerate}
    jobs={currentStudioJobs}
    selectedJob={selectedJob}
    assets={imageAssets}
    uploading={uploadingByType.image}
    onUpload={handleAssetUpload}
    pageLoading={pageLoading}
    mentionProps={{ suggestions: mentionSuggestions, show: showMentionDropdown, onChange: onMentionChange, onSelect: onSelectSuggestion, close: closeMentionDropdown }}
  />
) : studio === "worldview" ? ...
```

The existing video generation logic (buildVideoRequest, model selection, asset upload, job polling) remains completely untouched — the new component is purely a UI shell that calls the same handlers.

## Design Tokens Applied
- Backgrounds: `bg-[#0e0e0e]` app, `bg-[#131313]` sidebar, `bg-[#262626]` cards/inputs
- Accent: `text-[#ccff00]`, `bg-[#ccff00]`
- Ghost borders: `border-white/10`, `border-white/5`
- Glass: `bg-white/5 backdrop-blur-md`
- Typography: Space Grotesk via inline `fontFamily` for headlines, Inter for body
- Glow: `shadow-[0_0_20px_rgba(204,255,0,0.2)]` on active states
- No opaque borders for section division
- Scrollbar hidden via CSS class

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/VideoStudioSection.tsx` | **New** — Full cinematic video studio layout |
| `src/pages/KanvasPage.tsx` | Import VideoStudioSection, add `studio === "video"` branch in render |

