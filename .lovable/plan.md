

# Fix Duplicate Shot Prompts with AI-Generated Unique Ideas

## Problem
All auto-generated shots get the same generic prompt: `"Shot N: Cinematic moment in [Scene] at [Location]"`. Need to replace with AI-generated distinct descriptions, and ensure "Shot #" prefix is NOT included in the prompt text.

## Change

### `supabase/functions/gen-shots/index.ts` (lines 175-179)

Replace the static `placeholderIdeas` block with an AI call to generate distinct shot descriptions:

```ts
const sceneContext = [
  scene?.description && `Scene: ${scene.description}`,
  scene?.location && `Location: ${scene.location}`,
  scene?.lighting && `Lighting: ${scene.lighting}`,
  scene?.weather && `Weather: ${scene.weather}`,
].filter(Boolean).join('\n');

let placeholderIdeas: string[];
try {
  const aiResp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'google/gemini-3-flash-preview',
      messages: [
        {
          role: 'system',
          content: 'You generate distinct cinematic shot descriptions for storyboards. Each shot must describe a DIFFERENT moment, angle, or subject. Do NOT include shot numbers or "Shot #:" prefixes. Return ONLY a JSON object with a "shots" array of strings.',
        },
        {
          role: 'user',
          content: `Generate exactly ${desiredShotCount} distinct shot descriptions for this scene:\n${sceneContext}\n\nVary shot types (wide establishing, medium, close-up detail, reaction, POV, etc). Each description should be 1-2 sentences capturing a specific visual moment. No numbering.`,
        },
      ],
    }),
  });
  const aiData = await aiResp.json();
  const content = aiData.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);
  const ideas = Array.isArray(parsed) ? parsed : parsed.shots || parsed.ideas || parsed.descriptions || [];
  if (ideas.length >= desiredShotCount) {
    placeholderIdeas = ideas.slice(0, desiredShotCount);
  } else {
    throw new Error('Insufficient ideas');
  }
} catch {
  // Fallback with varied angles, no "Shot #" prefix
  const sceneLabel = scene?.title || scene?.description || `Scene ${scene?.scene_number ?? ''}`;
  const location = scene?.location ? ` at ${scene.location}` : '';
  const angles = [
    'Establishing wide shot of', 'Character-focused moment in',
    'Close-up detail from', 'Action beat in',
    'Atmospheric insert from', 'Reaction shot in',
  ];
  placeholderIdeas = Array.from({ length: desiredShotCount }).map((_, i) =>
    `${angles[i % angles.length]} ${sceneLabel}${location}`
  );
}
```

Key points:
- AI prompt explicitly says "Do NOT include shot numbers or 'Shot #:' prefixes"
- Fallback also omits "Shot N:" prefix
- Shot numbering is handled separately by `shotNumber` variable (line 205), not embedded in the prompt text

### Redeploy
Deploy `gen-shots` edge function after editing.

## Files changed
| File | Change |
|------|--------|
| `supabase/functions/gen-shots/index.ts` | Replace static placeholder with AI-generated distinct shot ideas, no "Shot #" prefix |

