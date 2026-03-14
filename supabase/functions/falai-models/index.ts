import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { authenticateRequest, AuthError } from '../_shared/auth.ts';
import { errorResponse, successResponse, handleCors } from '../_shared/response.ts';
import {
  CANONICAL_FAL_MODELS,
  getCanonicalFalModel,
  normalizeFalModelId,
} from '../_shared/falai-client.ts';
import {
  getKanvasModelById,
  listKanvasModels,
  type KanvasMode,
  type KanvasStudio,
} from '../_shared/kanvas.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return handleCors();
  }

  try {
    await authenticateRequest(req.headers);

    // Handle both URL params and request body params
    const url = new URL(req.url);
    let category = url.searchParams.get('category');
    let mediaType = url.searchParams.get('media_type');
    let uiGroup = url.searchParams.get('ui_group');
    let search = url.searchParams.get('search');
    let capabilities = url.searchParams.getAll('capabilities');
    let modelId = url.searchParams.get('id');
    let studioSurface = url.searchParams.get('studio');
    let kanvasStudio = url.searchParams.get('kanvas_studio');
    let kanvasMode = url.searchParams.get('kanvas_mode');

    // If request has a body, parse params from it
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.params) {
          const bodyParams = new URLSearchParams(body.params);
          category = category || bodyParams.get('category');
          mediaType = mediaType || bodyParams.get('media_type');
          uiGroup = uiGroup || bodyParams.get('ui_group');
          search = search || bodyParams.get('search');
          if (!capabilities.length) {
            capabilities = bodyParams.getAll('capabilities');
          }
          modelId = modelId || bodyParams.get('id');
          studioSurface = studioSurface || bodyParams.get('studio');
          kanvasStudio = kanvasStudio || bodyParams.get('kanvas_studio');
          kanvasMode = kanvasMode || bodyParams.get('kanvas_mode');
        } else {
          category = category || body.category;
          mediaType = mediaType || body.media_type;
          uiGroup = uiGroup || body.ui_group;
          search = search || body.search;
          modelId = modelId || body.id;
          studioSurface = studioSurface || body.studio;
          kanvasStudio = kanvasStudio || body.kanvas_studio;
          kanvasMode = kanvasMode || body.kanvas_mode;
          if (!capabilities.length && Array.isArray(body.capabilities)) {
            capabilities = body.capabilities.map((cap: unknown) => String(cap));
          }
        }
      } catch (e) {
        // If body parsing fails, continue with URL params
      }
    }

    const canonicalMap = new Map(CANONICAL_FAL_MODELS.map((model) => [model.id, model]));

    if (studioSurface === 'kanvas') {
      if (modelId) {
        const model = getKanvasModelById(modelId, canonicalMap);
        if (!model) {
          return errorResponse('Model not found', 404);
        }
        return successResponse({ model });
      }

      let models = listKanvasModels({
        studio: (kanvasStudio as KanvasStudio | null) ?? undefined,
        mode: (kanvasMode as KanvasMode | null) ?? undefined,
        canonicalModels: canonicalMap,
      });

      if (search) {
        const normalizedSearch = search.toLowerCase();
        models = models.filter((model) =>
          model.name.toLowerCase().includes(normalizedSearch) ||
          model.description.toLowerCase().includes(normalizedSearch)
        );
      }

      return successResponse({
        models,
        total: models.length,
        studios: Array.from(new Set(models.map((model) => model.studio))),
      });
    }

    // Get specific model by ID
    if (modelId) {
      const normalizedId = normalizeFalModelId(modelId);
      const model = getCanonicalFalModel(normalizedId);
      if (!model) {
        return errorResponse('Model not found', 404);
      }
      return successResponse({ model });
    }

    let filteredModels = [...CANONICAL_FAL_MODELS];

    // Filter by category
    if (category) {
      filteredModels = filteredModels.filter((model) => model.category === category);
    }

    // Filter by media type
    if (mediaType) {
      filteredModels = filteredModels.filter((model) => model.media_type === mediaType);
    }

    // Filter by UI group
    if (uiGroup) {
      filteredModels = filteredModels.filter((model) => model.ui_group === uiGroup);
    }

    // Filter by search term
    if (search) {
      filteredModels = filteredModels.filter((model) =>
        model.name.toLowerCase().includes(search.toLowerCase()) ||
        model.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by capabilities
    if (capabilities.length > 0) {
      filteredModels = filteredModels.filter((model) => {
        const modelCapabilities = model.supports;
        return capabilities.every(cap => modelCapabilities.includes(cap));
      });
    }

    const categories = Array.from(new Set(CANONICAL_FAL_MODELS.map((model) => model.category)));

    return successResponse({
      models: filteredModels,
      total: filteredModels.length,
      categories,
    });
  } catch (error) {
    console.error('Edge function error:', error);
    
    if (error instanceof AuthError) {
      return errorResponse(error.message, 401);
    }
    
    const message = error instanceof Error ? error.message : 'Failed to get models';
    return errorResponse(message, 500);
  }
});
