

# Cinema Studio: Audio Tab, Character Sync, and Orange Theme Unification

## Overview
Three major workstreams: (1) build out the Audio studio tab with real fal.ai audio models, (2) ensure characters created anywhere populate everywhere via the shared store, and (3) replace all lime green (#BEFF00) with orange (#f97316) across the Kanvas page and Cinema Studio.

## 1. Audio Studio Tab — Full Build-Out

Replace the placeholder `renderPlaceholderTab('Audio')` with a fully designed audio production interface inspired by the reference images.

**Design** (matching reference screenshots):
- Hero section with "CINEMA STUDIO 2.5 / Ready to give your scene a voice?" headline
- Subtle audio waveform/bar visualization in the background (CSS-only decorative bars)
- Bottom prompt bar with: Mode selector dial (Voiceover / Change Voice / Translate), text prompt input ("Describe the sound you imagine..."), model selector badge (e.g. "Eleven v3"), "CHOOSE VOICE" card, and orange "GENERATE" button
- "CHOOSE VOICE" overlay/modal: "SELECT OR ADD A VOICE" panel with "Create custom voice" button, voice list grid (empty state: "No voices yet"), and close button
- Reference video drop zone for "Change Voice" mode

**Audio Models Registry** (from fal.ai catalog, with credit costs):

| Model | Endpoint | Credits | Category |
|-------|----------|---------|----------|
| ElevenLabs TTS Turbo v2.5 | `fal-ai/elevenlabs/tts/turbo-v2.5` | 4 | Voiceover |
| MiniMax Speech-02 HD | `fal-ai/minimax/speech-02-hd` | 3 | Voiceover |
| MiniMax Speech 2.8 HD | `fal-ai/minimax/speech-2.8-hd` | 3 | Voiceover |
| MiniMax Speech-02 Turbo | `fal-ai/minimax/speech-02-turbo` | 2 | Voiceover |
| MiniMax Voice Cloning | `fal-ai/minimax/voice-clone` | 5 | Voice Clone |
| Chatterbox TTS | `fal-ai/chatterbox/text-to-speech` | 2 | Voiceover |
| Qwen 3 TTS 1.7B | `fal-ai/qwen-3-tts/text-to-speech/1.7b` | 2 | Voiceover |
| Index TTS 2.0 | `fal-ai/index-tts-2/text-to-speech` | 3 | Voiceover |
| VibeVoice 7B | `fal-ai/vibevoice/7b` | 4 | Multi-Speaker |
| Lux TTS | `fal-ai/lux-tts` | 3 | Voice Clone |
| Lyria 2 (Music) | `fal-ai/lyria2` | 6 | Music |
| CassetteAI Music | `cassetteai/music-generator` | 5 | Music |
| CassetteAI SFX | `cassetteai/sound-effects-generator` | 3 | Sound Effects |
| Pixverse Sound FX | `fal-ai/pixverse/sound-effects` | 4 | Video SFX |
| Video Sound FX | `cassetteai/video-sound-effects-generator` | 4 | Video SFX |

**Audio tab sub-modes** (via mode dial):
- **Voiceover**: Text prompt + voice selection + TTS model
- **Change Voice**: Reference video/audio upload + target voice
- **Translate**: Source audio + target language

**Bottom bar** (renderAudioBar): Mode dial, prompt input, model badge with credits, "CHOOSE VOICE" button, orange GENERATE button.

### File: `src/components/kanvas/CinemaStudioSection.tsx`
- Add `AUDIO_MODELS` constant array with all models above
- Add state: `audioMode` ('voiceover' | 'change-voice' | 'translate'), `showVoicePicker` (boolean), `selectedVoice`, `selectedAudioModel`
- Implement `renderAudioTab()` with hero, waveform bars, voice picker modal
- Implement `renderAudioBar()` bottom bar
- Wire into tab content and bottom bar rendering sections

## 2. Character Sync Across All Pages

The character system already uses `useCharacterCreationStore` as a shared Zustand store. Characters created in the "Characters" section (CharacterCreationSection) are stored in `blueprints[]` and exposed via `getMentionList()`. The Cinema Studio already receives `characterMentions={allCharacterMentions}` from KanvasPage.

**Current flow**: Characters created anywhere → stored in Zustand → `getMentionList()` → available in Cinema's cast tab and @mention prompts.

**What needs verification/fixing**:
- The `CharacterCreationSection` component calls `listBlueprints()` on mount to hydrate from Supabase. This same hydration needs to happen on KanvasPage mount if not already.
- Ensure KanvasPage hydrates the character store on mount (check if it already does via the Characters studio section).

### File: `src/pages/KanvasPage.tsx`
- Add a `useEffect` that calls `listBlueprints()` and populates the store on mount, ensuring characters are always available regardless of which studio the user visits first
- This guarantees @mention works across Image, Video, Cinema, and the project-setup pages

### File: `src/components/kanvas/CinemaStudioSection.tsx`
- Cast tab already reads from `characterMentions` prop — no change needed for display
- Audio tab voice picker can also reference character names for voice assignment

## 3. Orange Theme Unification

Replace every instance of `#BEFF00` (lime/neon green) with `#f97316` (orange) and update associated glows/shadows across all Kanvas files.

**Color mapping**:
- `#BEFF00` → `#f97316`
- `rgba(190,255,0,...)` → `rgba(249,115,22,...)`
- `bg-[#BEFF00]` → `bg-[#f97316]`
- `text-[#BEFF00]` → `text-[#f97316]`
- `border-[#BEFF00]` → `border-[#f97316]`
- `hover:text-[#BEFF00]` → `hover:text-[#f97316]`
- `hover:border-[#BEFF00]` → `hover:border-[#f97316]`

### Files to update:
| File | Estimated instances |
|------|-------------------|
| `src/components/kanvas/CinemaStudioSection.tsx` | ~30+ |
| `src/pages/KanvasPage.tsx` | ~15 |
| `src/components/kanvas/KanvasSidebar.tsx` | ~5 |
| `src/components/kanvas/VideoStudioSection.tsx` | check & replace |
| `src/components/kanvas/ImageStudioSection.tsx` | check & replace |
| `src/components/kanvas/EditStudioSection.tsx` | check & replace |
| `src/components/kanvas/LipsyncStudioSection.tsx` | check & replace |

## Files Changed

| File | Change |
|------|--------|
| `src/components/kanvas/CinemaStudioSection.tsx` | Build full Audio tab + Audio bar, add audio model registry, replace all #BEFF00 with #f97316 |
| `src/pages/KanvasPage.tsx` | Add character store hydration on mount, replace #BEFF00 with #f97316 |
| `src/components/kanvas/KanvasSidebar.tsx` | Replace #BEFF00 with #f97316 |
| `src/components/kanvas/VideoStudioSection.tsx` | Replace #BEFF00 with #f97316 |
| `src/components/kanvas/ImageStudioSection.tsx` | Replace #BEFF00 with #f97316 |
| `src/components/kanvas/EditStudioSection.tsx` | Replace #BEFF00 with #f97316 |
| `src/components/kanvas/LipsyncStudioSection.tsx` | Replace #BEFF00 with #f97316 |

