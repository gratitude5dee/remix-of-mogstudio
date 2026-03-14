import {
  getDefaultImageModel,
  getDefaultVideoModel,
  getModelById,
  getModelsByTypeAndGroup,
  type StudioModel,
} from '@/lib/studio-model-constants';
import { normalizeFalModelId } from '@/lib/falModelNormalization';

type StudioGenerationKind = 'Image' | 'Video';

export interface StudioGenerationResolution {
  requestedModelId: string;
  resolvedModelId: string;
  requestedModel?: StudioModel;
  resolvedModel?: StudioModel;
  fallbackUsed: boolean;
  fallbackReason?: string;
}

function getCompatibleModels(kind: StudioGenerationKind, hasImageInputs: boolean): StudioModel[] {
  const mediaType = kind === 'Image' ? 'image' : 'video';
  const generationModels = getModelsByTypeAndGroup(mediaType, 'generation');

  if (kind === 'Image') {
    return generationModels.filter((model) => model.workflowType === 'text-to-image');
  }

  if (hasImageInputs) {
    return generationModels.filter(
      (model) =>
        model.workflowType === 'image-to-video' || model.workflowType === 'reference-to-video'
    );
  }

  return generationModels.filter((model) => model.workflowType === 'text-to-video');
}

function getDefaultCompatibleModel(kind: StudioGenerationKind, hasImageInputs: boolean): StudioModel {
  const compatibleModels = getCompatibleModels(kind, hasImageInputs);
  if (compatibleModels.length > 0) {
    return compatibleModels[0];
  }

  const fallbackId = kind === 'Video' ? getDefaultVideoModel() : getDefaultImageModel();
  const fallbackModel = getModelById(fallbackId);
  if (!fallbackModel) {
    throw new Error(`No default ${kind.toLowerCase()} model is configured.`);
  }

  return fallbackModel;
}

export function resolveStudioGenerationModel(args: {
  kind: StudioGenerationKind;
  requestedModelId?: string | null;
  hasImageInputs?: boolean;
}): StudioGenerationResolution {
  const { kind, requestedModelId, hasImageInputs = false } = args;
  const compatibleModels = getCompatibleModels(kind, hasImageInputs);
  const compatibleModelIds = new Set(compatibleModels.map((model) => model.id));
  const normalizedRequestedModelId = requestedModelId
    ? normalizeFalModelId(requestedModelId)
    : undefined;
  const requestedModel = normalizedRequestedModelId
    ? getModelById(normalizedRequestedModelId)
    : undefined;
  const fallbackModel = getDefaultCompatibleModel(kind, hasImageInputs);
  const requestedIsCompatible =
    requestedModel && compatibleModelIds.has(requestedModel.id);

  const resolvedModel = requestedIsCompatible ? requestedModel : fallbackModel;
  const effectiveRequestedModelId =
    normalizedRequestedModelId || fallbackModel.id;

  let fallbackReason: string | undefined;
  if (!requestedModelId) {
    fallbackReason = 'missing_model';
  } else if (!requestedModel) {
    fallbackReason = `unknown_model:${requestedModelId}`;
  } else if (!requestedIsCompatible) {
    fallbackReason = hasImageInputs
      ? `incompatible_with_reference_input:${requestedModel.workflowType}`
      : `incompatible_with_text_only:${requestedModel.workflowType}`;
  }

  return {
    requestedModelId: effectiveRequestedModelId,
    resolvedModelId: resolvedModel.id,
    requestedModel,
    resolvedModel,
    fallbackUsed: effectiveRequestedModelId !== resolvedModel.id,
    fallbackReason,
  };
}

export function normalizeGenerationErrorMessage(error: unknown): string {
  const fallbackMessage = 'Generation failed';

  const unwrap = (value: unknown): string | undefined => {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return undefined;
      }

      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed) as Record<string, unknown>;
          return unwrap(parsed);
        } catch {
          return trimmed;
        }
      }

      return trimmed;
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return (
        unwrap(record.ERROR) ||
        unwrap(record.error) ||
        unwrap(record.Error) ||
        unwrap(record.message) ||
        unwrap(record.details) ||
        unwrap(record.reason) ||
        unwrap(record.original_error)
      );
    }

    return undefined;
  };

  if (error instanceof Error) {
    return unwrap(error.message) || fallbackMessage;
  }

  return unwrap(error) || fallbackMessage;
}
