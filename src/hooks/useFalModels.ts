import { useState, useEffect, useMemo } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  IMAGE_MODELS,
  VIDEO_MODELS,
  type StudioModel,
  type StudioModelMediaType,
  type StudioModelUiGroup,
} from '@/lib/studio-model-constants';

export interface FalModel {
  id: string;
  name: string;
  description: string;
  category: string;
  media_type: StudioModelMediaType;
  workflow_type: string;
  ui_group: StudioModelUiGroup;
  supports: string[];
  defaults: Record<string, unknown>;
  icon?: string;
  credits?: number;
  time?: string;
}

interface UseFalModelsOptions {
  category?: string;
  mediaType?: StudioModelMediaType;
  uiGroup?: StudioModelUiGroup;
  autoFetch?: boolean;
}

const FALLBACK_MODELS: FalModel[] = [...IMAGE_MODELS, ...VIDEO_MODELS].map((model: StudioModel) => ({
  id: model.id,
  name: model.name,
  description: model.description,
  category: model.category,
  media_type: model.mediaType,
  workflow_type: model.workflowType,
  ui_group: model.uiGroup,
  supports: model.supports || [],
  defaults: model.defaults || {},
  icon: model.icon,
  credits: model.credits,
  time: model.time,
}));

export const useFalModels = (options: UseFalModelsOptions = {}) => {
  const { category, mediaType, uiGroup, autoFetch = true } = options;
  const [models, setModels] = useState<FalModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchModels = async (overrides: Partial<UseFalModelsOptions> = {}) => {
    setIsLoading(true);
    setError(null);

    const effectiveCategory = overrides.category || category;
    const effectiveMediaType = overrides.mediaType || mediaType;
    const effectiveUiGroup = overrides.uiGroup || uiGroup;

    try {
      const { data, error: supabaseError } = await supabase.functions.invoke('falai-models', {
        body: {
          category: effectiveCategory,
          media_type: effectiveMediaType,
          ui_group: effectiveUiGroup,
        },
      });

      if (supabaseError) {
        throw new Error(supabaseError.message);
      }

      if (!data?.models || !Array.isArray(data.models)) {
        throw new Error('Malformed model payload');
      }

      const transformedModels: FalModel[] = data.models.map((model: any) => ({
        id: model.id,
        name: model.name,
        description: model.description,
        category: model.category || 'uncategorized',
        media_type: model.media_type,
        workflow_type: model.workflow_type,
        ui_group: model.ui_group,
        supports: Array.isArray(model.supports) ? model.supports : [],
        defaults: model.defaults && typeof model.defaults === 'object' ? model.defaults : {},
        icon: model.icon || 'image',
        credits: model.credits || 1,
        time: model.time || '~30s',
      }));

      setModels(transformedModels);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch models';
      setError(errorMessage);

      const fallback = FALLBACK_MODELS.filter((model) => {
        const matchesCategory = !effectiveCategory || model.category === effectiveCategory;
        const matchesMedia = !effectiveMediaType || model.media_type === effectiveMediaType;
        const matchesGroup = !effectiveUiGroup || model.ui_group === effectiveUiGroup;
        return matchesCategory && matchesMedia && matchesGroup;
      });
      setModels(fallback);

      toast({
        title: 'Model catalog fallback',
        description: 'Using local model registry while network catalog is unavailable.',
        variant: 'default',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const grouped = useMemo(() => {
    return {
      generation: models.filter((model) => model.ui_group === 'generation'),
      advanced: models.filter((model) => model.ui_group === 'advanced'),
    };
  }, [models]);

  const getModelById = (modelId: string) => models.find((model) => model.id === modelId);

  useEffect(() => {
    if (autoFetch) {
      fetchModels();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category, mediaType, uiGroup, autoFetch]);

  return {
    models,
    grouped,
    isLoading,
    error,
    fetchModels,
    getModelById,
    refetch: () => fetchModels(),
  };
};
