import { describe, expect, it } from 'vitest';

import {
  normalizeGenerationErrorMessage,
  resolveStudioGenerationModel,
} from '@/lib/studio/generationExecution';

describe('generationExecution', () => {
  it('falls back image generation requests to a compatible default when the model is missing', () => {
    const resolution = resolveStudioGenerationModel({
      kind: 'Image',
      requestedModelId: 'missing/image-model',
      hasImageInputs: false,
    });

    expect(resolution.fallbackUsed).toBe(true);
    expect(resolution.resolvedModelId).toBe('fal-ai/flux/schnell');
    expect(resolution.fallbackReason).toContain('unknown_model');
  });

  it('falls back video generation requests to image-to-video when references exist', () => {
    const resolution = resolveStudioGenerationModel({
      kind: 'Video',
      requestedModelId: 'fal-ai/kling-video/o3/standard/text-to-video',
      hasImageInputs: true,
    });

    expect(resolution.fallbackUsed).toBe(true);
    expect(resolution.resolvedModelId).toBe('fal-ai/kling-video/o3/standard/image-to-video');
    expect(resolution.fallbackReason).toContain('incompatible_with_reference_input');
  });

  it('normalizes stringified JSON error payloads into user-facing text', () => {
    expect(
      normalizeGenerationErrorMessage('{"ERROR":"Request failed. Please try again."}')
    ).toBe('Request failed. Please try again.');

    expect(
      normalizeGenerationErrorMessage(
        new Error('{"error":"Model temporarily unavailable","details":{"message":"Retry later"}}')
      )
    ).toBe('Model temporarily unavailable');
  });
});
