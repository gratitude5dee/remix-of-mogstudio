

# Audio Bottom Bar — Turnable Dial + Model Popup + Music/SFX Mode

## Changes

### 1. Add `music-sfx` to AudioMode type (line 43)

Expand `AudioMode` to include `'music-sfx'` as a 4th option:
```
type AudioMode = 'voiceover' | 'change-voice' | 'translate' | 'music-sfx';
```

### 2. Add `showAudioModelPicker` state (line 143 area)

New boolean state for the popup model selector.

### 3. Redesign `renderAudioBar()` (lines 698-778)

Replace the flat pill-button mode selector with a **turnable dial** component matching the reference image:

- **Circular dial** (~80px): Dark radial-gradient circle with a subtle border, containing a small orange indicator dot that rotates to point at the active mode
- **Mode labels** arranged vertically to the right of the dial: Voiceover, Change Voice, Translate, Music/SFX — each clickable, active one highlighted in orange with the dot indicator
- **Tick marks** on the dial arc corresponding to each mode position (4 notches at ~0°, ~90°, ~180°, ~270° mapped to the 4 modes)
- CSS `transform: rotate(Xdeg)` on the indicator dot based on active mode index

**Prompt input**: Stays as-is but placeholder adapts for `music-sfx` mode ("Describe the music or sound effect...")

**Model badge → Popup menu**:
- Clicking the model badge opens an absolutely-positioned popup panel above the bar
- Panel grouped by category (Voiceover, Voice Clone, Music, SFX, Video SFX) with category headers
- Each model row shows: name, endpoint shorthand, credit cost badge
- Active model highlighted with orange left border
- Click-outside or Escape closes the popup

**Music/SFX mode adjustments**:
- Hides "Choose Voice" button (not relevant for music/sfx)
- Auto-filters model popup to show only music/sfx/video-sfx category models
- Prompt placeholder: "Describe the music or sound effect..."

### 4. Wire the new mode into prompt placeholders and conditional UI

- `music-sfx` mode hides the voice picker button
- Model popup auto-filters based on current `audioMode` (voiceover modes show TTS models, music-sfx shows music/sfx models)

## Technical Details

- Dial rotation: `const rotation = audioModeIndex * 72` (72° per mode for 5 positions, or use fixed angles for 4 modes: 0°, 60°, 120°, 180°)
- Model popup uses `absolute bottom-full mb-2` positioning with `z-50`
- Click-outside handled via `useEffect` with `mousedown` listener
- Grouped models: `AUDIO_MODELS.filter(m => relevantCategories.includes(m.category))`

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/CinemaStudioSection.tsx` | Add music-sfx mode, redesign audio bar with turnable dial, add model picker popup |

