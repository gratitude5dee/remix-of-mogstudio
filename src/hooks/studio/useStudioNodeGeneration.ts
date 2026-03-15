import { useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

import { supabase } from '@/integrations/supabase/client';
import { SUPABASE_URL } from '@/integrations/supabase/config';
import { buildCanonicalFalInputs } from '@/lib/falModelNormalization';
import { getNodeImagePreviewUrl } from '@/lib/imageEdit';
import { getModelById, type StudioModel } from '@/lib/studio-model-constants';
import { useStudioGraphActions } from '@/hooks/studio/useStudioGraphActions';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import type { EdgeDefinition, NodeDefinition } from '@/types/computeFlow';
import {
  applyNodeModelSelection,
  getDefaultModelForNodeKind,
  getNodeModelSelection,
  getNodePromptValue,
  type NodeModelSelection,
} from '@/lib/studio/nodeUtils';
import {
  normalizeGenerationErrorMessage,
  resolveStudioGenerationModel,
} from '@/lib/studio/generationExecution';

type StudioGeneratableKind = 'Text' | 'Prompt' | 'Image' | 'Video' | 'Audio';

function toStudioNodeType(kind: StudioGeneratableKind): 'text' | 'image' | 'video' | 'audio' {
  if (kind === 'Text' || kind === 'Prompt') {
    return 'text';
  }
  if (kind === 'Video') {
    return 'video';
  }
  if (kind === 'Audio') {
    return 'audio';
  }
  return 'image';
}

function resolveTargetPortId(
  originalNode: NodeDefinition,
  targetNode: NodeDefinition,
  edge: EdgeDefinition
): string | null {
  const sourcePort = originalNode.outputs.find((port) => port.id === edge.source.portId);
  const originalTargetPort = originalNode.inputs.find((port) => port.id === edge.target.portId);

  if (originalTargetPort) {
    const byName = targetNode.inputs.find((port) => port.name === originalTargetPort.name);
    if (byName) {
      return byName.id;
    }
  }

  const byType = targetNode.inputs.find((port) => port.datatype === (sourcePort?.datatype ?? edge.dataType));
  return byType?.id ?? targetNode.inputs[0]?.id ?? null;
}

interface ParsedFalResult {
  url?: string;
  raw: any;
  requestedModelId?: string;
  resolvedModelId?: string;
  fallbackUsed?: boolean;
  fallbackReason?: string;
}

function extractImageResultUrl(result: any): string | undefined {
  return (
    result?.images?.[0]?.url ??
    result?.image?.url ??
    result?.data?.images?.[0]?.url ??
    result?.url
  );
}

function extractVideoResultUrl(result: any): string | undefined {
  return (
    result?.video?.url ??
    result?.videos?.[0]?.url ??
    result?.data?.video?.url ??
    result?.url
  );
}

function addSupportedInput(
  supports: string[],
  target: Record<string, unknown>,
  keys: string[],
  value: unknown
) {
  if (value === undefined || value === null || value === '') {
    return;
  }

  const supportedKey = keys.find((key) => supports.includes(key));
  if (!supportedKey) {
    return;
  }

  target[supportedKey] = value;
}

function buildImageInputs(
  model: StudioModel | undefined,
  params: Record<string, unknown>,
  prompt: string,
  incomingImageUrls: string[]
) {
  const supports = model?.supports ?? [];
  const inputs: Record<string, unknown> = { prompt };

  addSupportedInput(supports, inputs, ['image_urls'], incomingImageUrls.length > 0 ? incomingImageUrls : undefined);
  addSupportedInput(supports, inputs, ['image_url'], incomingImageUrls[0]);
  addSupportedInput(supports, inputs, ['aspect_ratio'], params.aspectRatio);
  addSupportedInput(supports, inputs, ['resolution'], params.resolution);
  addSupportedInput(supports, inputs, ['image_size'], params.imageSize);
  addSupportedInput(supports, inputs, ['output_format'], params.outputFormat ?? 'png');
  addSupportedInput(supports, inputs, ['num_images'], 1);
  addSupportedInput(supports, inputs, ['safety_tolerance'], params.safetyTolerance);

  if (params.settings !== undefined) {
    inputs.settings = params.settings;
  }
  if (params.settings_override !== undefined) {
    inputs.settings_override = params.settings_override;
  }

  return inputs;
}

function buildVideoInputs(
  model: StudioModel | undefined,
  params: Record<string, unknown>,
  prompt: string,
  incomingImageUrls: string[]
) {
  const workflowType = model?.workflowType ?? 'text-to-video';
  const supports = model?.supports ?? [];
  const needsReferenceImage =
    workflowType === 'image-to-video' || workflowType === 'reference-to-video';

  if (needsReferenceImage && incomingImageUrls.length === 0) {
    throw new Error(`"${model?.name ?? 'Selected model'}" requires an input image.`);
  }

  if (!needsReferenceImage && incomingImageUrls.length > 0 && workflowType === 'text-to-video') {
    // Omit image inputs entirely for text-only models.
  }

  if (
    workflowType !== 'text-to-video' &&
    workflowType !== 'image-to-video' &&
    workflowType !== 'reference-to-video'
  ) {
    throw new Error(`"${model?.name ?? 'Selected model'}" is not supported in the Studio video node.`);
  }

  const inputs: Record<string, unknown> = { prompt };
  addSupportedInput(supports, inputs, ['image_urls'], incomingImageUrls.length > 0 ? incomingImageUrls : undefined);
  addSupportedInput(supports, inputs, ['image_url'], incomingImageUrls[0]);
  addSupportedInput(supports, inputs, ['aspect_ratio'], params.aspectRatio ?? '16:9');
  addSupportedInput(supports, inputs, ['duration_seconds'], params.duration ?? 5);
  addSupportedInput(supports, inputs, ['duration'], params.duration ?? 5);
  addSupportedInput(supports, inputs, ['fps'], params.fps ?? 24);
  addSupportedInput(supports, inputs, ['resolution'], params.resolution);
  addSupportedInput(supports, inputs, ['generate_audio'], params.generateAudio ?? true);

  if (params.settings !== undefined) {
    inputs.settings = params.settings;
  }
  if (params.settings_override !== undefined) {
    inputs.settings_override = params.settings_override;
  }

  return inputs;
}

export function useStudioNodeGeneration(projectId?: string) {
  const {
    nodeDefinitions,
    edgeDefinitions,
    updateNode,
    addNodesAndEdgesAtomic,
  } = useComputeFlowStore();
  const { buildNode, scheduleSave } = useStudioGraphActions(projectId);

  const nodeDefinitionsById = useMemo(
    () => new Map(nodeDefinitions.map((node) => [node.id, node])),
    [nodeDefinitions]
  );

  const getIncomingContext = useCallback(
    (nodeId: string) => {
      const incomingEdges = edgeDefinitions.filter((edge) => edge.target.nodeId === nodeId);
      const incomingPrompt = incomingEdges
        .map((edge) => {
          const sourceNode = nodeDefinitionsById.get(edge.source.nodeId);
          if (!sourceNode) {
            return '';
          }
          const sourcePort = sourceNode.outputs.find((port) => port.id === edge.source.portId);
          if (edge.dataType !== 'text' && sourcePort?.datatype !== 'text') {
            return '';
          }

          const previewData = sourceNode.preview as { data?: unknown } | undefined;
          if (typeof previewData?.data === 'string') {
            return previewData.data;
          }
          if (previewData?.data && typeof previewData.data === 'object') {
            const record = previewData.data as Record<string, unknown>;
            const value = record.text ?? record.prompt ?? record.content;
            return typeof value === 'string' ? value : '';
          }

          return getNodePromptValue(sourceNode);
        })
        .find((value) => typeof value === 'string' && value.trim().length > 0);

      const incomingImageUrls = incomingEdges
        .map((edge) => {
          const sourceNode = nodeDefinitionsById.get(edge.source.nodeId);
          if (!sourceNode) {
            return null;
          }
          const sourcePort = sourceNode.outputs.find((port) => port.id === edge.source.portId);
          if (edge.dataType !== 'image' && sourcePort?.datatype !== 'image') {
            return null;
          }
          return getNodeImagePreviewUrl(sourceNode);
        })
        .filter((value): value is string => typeof value === 'string' && value.length > 0);

      const incomingVideoUrls = incomingEdges
        .map((edge) => {
          const sourceNode = nodeDefinitionsById.get(edge.source.nodeId);
          if (!sourceNode) {
            return null;
          }
          const sourcePort = sourceNode.outputs.find((port) => port.id === edge.source.portId);
          if (edge.dataType !== 'video' && sourcePort?.datatype !== 'video') {
            return null;
          }
          const preview = sourceNode.preview as { url?: string; data?: unknown } | undefined;
          if (typeof preview?.url === 'string' && preview.url.length > 0) {
            return preview.url;
          }
          return null;
        })
        .filter((value): value is string => typeof value === 'string' && value.length > 0);

      return {
        incomingEdges,
        incomingImageUrls,
        incomingPrompt,
        incomingVideoUrls,
      };
    },
    [edgeDefinitions, nodeDefinitionsById]
  );

  const updateNodeModelSelection = useCallback(
    (nodeId: string, selection: NodeModelSelection) => {
      const node = nodeDefinitionsById.get(nodeId);
      if (!node) {
        return;
      }

      updateNode(nodeId, {
        params: applyNodeModelSelection(node.params, node.kind, selection),
      });
      scheduleSave();
    },
    [nodeDefinitionsById, scheduleSave, updateNode]
  );

  const prepareTargetsForModels = useCallback(
    (nodeId: string, selection: NodeModelSelection): NodeDefinition[] => {
      const sourceNode = nodeDefinitionsById.get(nodeId);
      if (!sourceNode) {
        return [];
      }

      const selectedModelIds = selection.selectedModelIds.length
        ? selection.selectedModelIds
        : [getDefaultModelForNodeKind(sourceNode.kind)];
      const primaryModelId = selectedModelIds[0];

      updateNode(nodeId, {
        params: applyNodeModelSelection(sourceNode.params, sourceNode.kind, {
          ...selection,
          selectedModelIds,
        }),
      });

      if (
        sourceNode.kind !== 'Text' &&
        sourceNode.kind !== 'Prompt' &&
        sourceNode.kind !== 'Image' &&
        sourceNode.kind !== 'Video'
      ) {
        scheduleSave();
        return [sourceNode];
      }

      const currentState = useComputeFlowStore.getState();
      const latestNodesById = new Map(currentState.nodeDefinitions.map((node) => [node.id, node]));
      const latestSourceNode = latestNodesById.get(nodeId) ?? sourceNode;
      const sourceIncomingEdges = currentState.edgeDefinitions.filter((edge) => edge.target.nodeId === nodeId);
      const existingVariants = currentState.nodeDefinitions.filter(
        (node) => node.metadata?.variantSourceNodeId === nodeId
      );

      const nodesToCreate: NodeDefinition[] = [];
      const edgesToCreate: EdgeDefinition[] = [];
      const targets: NodeDefinition[] = [latestSourceNode];

      selectedModelIds.slice(1).forEach((modelId, index) => {
        const existingVariant = existingVariants.find(
          (candidate) => candidate.metadata?.variantModelId === modelId
        );

        if (existingVariant) {
          updateNode(existingVariant.id, {
            params: applyNodeModelSelection(existingVariant.params, existingVariant.kind, {
              auto: false,
              selectedModelIds: [modelId],
              useMultipleModels: false,
            }),
          });
          targets.push(existingVariant);
          return;
        }

        const created = buildNode(
          toStudioNodeType(sourceNode.kind as StudioGeneratableKind),
          {
            x: sourceNode.position.x + 360 + index * 360,
            y: sourceNode.position.y + (index % 2) * 34,
          },
          {
            label: sourceNode.label,
            params: applyNodeModelSelection(sourceNode.params, sourceNode.kind, {
              auto: false,
              selectedModelIds: [modelId],
              useMultipleModels: false,
            }),
            metadata: {
              ...(sourceNode.metadata ?? {}),
              variantSourceNodeId: nodeId,
              variantModelId: modelId,
            },
            size: sourceNode.size,
          }
        );

        nodesToCreate.push(created);
        sourceIncomingEdges.forEach((edge) => {
          const targetPortId = resolveTargetPortId(sourceNode, created, edge);
          if (!targetPortId) {
            return;
          }

          edgesToCreate.push({
            id: uuidv4(),
            source: edge.source,
            target: {
              nodeId: created.id,
              portId: targetPortId,
            },
            dataType: edge.dataType,
            status: 'idle',
            metadata: edge.metadata,
          });
        });
        targets.push(created);
      });

      if (nodesToCreate.length > 0 || edgesToCreate.length > 0) {
        addNodesAndEdgesAtomic(
          nodesToCreate,
          edgesToCreate,
          `Created ${selectedModelIds.length} model variants`
        );
      }

      scheduleSave();
      return targets;
    },
    [addNodesAndEdgesAtomic, buildNode, nodeDefinitionsById, scheduleSave, updateNode]
  );

  const getAuthToken = useCallback(async () => {
    const { data } = await supabase.auth.getSession();
    return data.session?.access_token ?? null;
  }, []);

  const runFalStream = useCallback(
    async (
      modelId: string,
      inputs: Record<string, unknown>,
      onProgress: (progress: number) => void,
      extractUrl: (result: any) => string | undefined
    ): Promise<ParsedFalResult> => {
      const token = await getAuthToken();
      const canonical = buildCanonicalFalInputs(modelId, inputs);
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/fal-stream`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            modelId: canonical.modelId,
            inputs: canonical.inputs,
          }),
        }
      );

      if (!response.ok) {
        const message = await response.text();
        throw new Error(normalizeGenerationErrorMessage(message) || 'Generation failed');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No generation stream returned');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      const streamMetadata: ParsedFalResult = {
        raw: null,
        requestedModelId: modelId,
        resolvedModelId: canonical.modelId,
        fallbackUsed: false,
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) {
            continue;
          }

          const payload = line.slice(6).trim();
          if (!payload) {
            continue;
          }

          try {
            const parsed = JSON.parse(payload);
            if (parsed.type === 'meta') {
              streamMetadata.requestedModelId =
                typeof parsed.requested_model === 'string'
                  ? parsed.requested_model
                  : streamMetadata.requestedModelId;
              streamMetadata.resolvedModelId =
                typeof parsed.resolved_model === 'string'
                  ? parsed.resolved_model
                  : streamMetadata.resolvedModelId;
              streamMetadata.fallbackUsed = Boolean(parsed.fallback_used);
              streamMetadata.fallbackReason =
                typeof parsed.fallback_reason === 'string'
                  ? parsed.fallback_reason
                  : streamMetadata.fallbackReason;
            }
            if (parsed.type === 'fallback') {
              streamMetadata.fallbackUsed = true;
              streamMetadata.fallbackReason =
                typeof parsed.reason === 'string' ? parsed.reason : streamMetadata.fallbackReason;
              streamMetadata.resolvedModelId =
                typeof parsed.fallback_model === 'string'
                  ? parsed.fallback_model
                  : streamMetadata.resolvedModelId;
            }
            if (parsed.type === 'progress') {
              onProgress(Math.max(8, Math.round((parsed.event?.progress ?? 0.1) * 100)));
            }
            if (parsed.type === 'done') {
              return {
                raw: parsed.result,
                url: extractUrl(parsed.result),
                requestedModelId:
                  typeof parsed.requested_model === 'string'
                    ? parsed.requested_model
                    : streamMetadata.requestedModelId,
                resolvedModelId:
                  typeof parsed.model === 'string'
                    ? parsed.model
                    : streamMetadata.resolvedModelId,
                fallbackUsed:
                  typeof parsed.fallback_used === 'boolean'
                    ? parsed.fallback_used
                    : streamMetadata.fallbackUsed,
                fallbackReason:
                  typeof parsed.fallback_reason === 'string'
                    ? parsed.fallback_reason
                    : streamMetadata.fallbackReason,
              };
            }
            if (parsed.type === 'error') {
              throw new Error(normalizeGenerationErrorMessage(parsed) || 'Generation failed');
            }
          } catch (error) {
            if (error instanceof Error) {
              throw error;
            }
          }
        }
      }

      throw new Error('Generation finished without a result');
    },
    [getAuthToken]
  );

  const generateTextNode = useCallback(
    async (nodeId: string) => {
      const node = nodeDefinitionsById.get(nodeId);
      if (!node || (node.kind !== 'Text' && node.kind !== 'Prompt')) {
        return;
      }

      const selection = getNodeModelSelection(node);
      const targets = prepareTargetsForModels(nodeId, selection);

      await Promise.all(
        targets.map(async (targetNode, index) => {
          const modelId = selection.selectedModelIds[index] ?? selection.selectedModelIds[0];
          const latestNode = useComputeFlowStore.getState().nodeDefinitions.find((candidate) => candidate.id === targetNode.id) ?? targetNode;
          const { incomingPrompt } = getIncomingContext(targetNode.id);
          const prompt = getNodePromptValue(latestNode) || incomingPrompt;

          if (!prompt.trim()) {
            toast.error('Enter a prompt before generating text.');
            return;
          }

          updateNode(targetNode.id, {
            status: 'queued',
            progress: 0,
            error: undefined,
          });

          // Brief delay to show queued status before transitioning to running
          await new Promise((resolve) => setTimeout(resolve, 50));

          updateNode(targetNode.id, {
            status: 'running',
            progress: 5,
            error: undefined,
            params: {
              ...latestNode.params,
              model: modelId,
            },
            preview: {
              id: `${targetNode.id}-preview`,
              type: 'text',
              data: { text: '' },
            },
          });

          const token = await getAuthToken();
          const response = await fetch(
            `${SUPABASE_URL}/functions/v1/gemini-text-generation`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              body: JSON.stringify({
                prompt,
                model: modelId,
                stream: true,
              }),
            }
          );

          if (!response.ok) {
            const message = await response.text();
            updateNode(targetNode.id, {
              status: 'failed',
              progress: 0,
              error: message || 'Text generation failed',
            });
            return;
          }

          const reader = response.body?.getReader();
          if (!reader) {
            updateNode(targetNode.id, {
              status: 'failed',
              progress: 0,
              error: 'No text stream returned',
            });
            return;
          }

          const decoder = new TextDecoder();
          let buffer = '';
          let output = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              break;
            }

            buffer += decoder.decode(value, { stream: true });
            let newlineIndex = buffer.indexOf('\n');
            while (newlineIndex !== -1) {
              const line = buffer.slice(0, newlineIndex).trim();
              buffer = buffer.slice(newlineIndex + 1);

              if (line.startsWith('data: ')) {
                const payload = line.slice(6).trim();
                if (payload !== '[DONE]') {
                  try {
                    const parsed = JSON.parse(payload);
                    const chunk = parsed.choices?.[0]?.delta?.content;
                    if (typeof chunk === 'string' && chunk.length > 0) {
                      output += chunk;
                      updateNode(targetNode.id, {
                        status: 'running',
                        progress: Math.min(92, 10 + output.length / 16),
                        params: {
                          ...latestNode.params,
                          prompt,
                          content: output,
                          model: modelId,
                        },
                        preview: {
                          id: `${targetNode.id}-preview`,
                          type: 'text',
                          data: { text: output },
                        },
                      });
                    }
                  } catch {
                    // Ignore partial chunks.
                  }
                }
              }

              newlineIndex = buffer.indexOf('\n');
            }
          }

          updateNode(targetNode.id, {
            status: 'succeeded',
            progress: 100,
            params: {
              ...latestNode.params,
              prompt,
              content: output,
              model: modelId,
            },
            preview: {
              id: `${targetNode.id}-preview`,
              type: 'text',
              data: { text: output },
            },
          });
        })
      );

      scheduleSave();
    },
    [getAuthToken, getIncomingContext, nodeDefinitionsById, prepareTargetsForModels, scheduleSave, updateNode]
  );

  const generateImageNode = useCallback(
    async (nodeId: string) => {
      const node = nodeDefinitionsById.get(nodeId);
      if (!node || node.kind !== 'Image') {
        return;
      }

      const selection = getNodeModelSelection(node);
      const targets = prepareTargetsForModels(nodeId, selection);

      await Promise.all(
        targets.map(async (targetNode, index) => {
          const modelId = selection.selectedModelIds[index] ?? selection.selectedModelIds[0];
          const latestNode = useComputeFlowStore.getState().nodeDefinitions.find((candidate) => candidate.id === targetNode.id) ?? targetNode;
          const params = (latestNode.params ?? {}) as Record<string, unknown>;
          const { incomingImageUrls, incomingPrompt } = getIncomingContext(targetNode.id);
          const prompt = getNodePromptValue(latestNode) || incomingPrompt;
          const resolution = resolveStudioGenerationModel({
            kind: 'Image',
            requestedModelId: modelId,
            hasImageInputs: incomingImageUrls.length > 0,
          });
          const selectedModel = resolution.requestedModel ?? getModelById(modelId);
          const executionModel = resolution.resolvedModel ?? selectedModel;

          if (!prompt.trim()) {
            toast.error('Enter a prompt before generating an image.');
            return;
          }

          updateNode(targetNode.id, {
            status: 'queued',
            progress: 0,
            error: undefined,
          });

          // Brief delay to show queued status before transitioning to running
          await new Promise((resolve) => setTimeout(resolve, 50));

          updateNode(targetNode.id, {
            status: 'running',
            progress: 8,
            error: undefined,
            params: {
              ...latestNode.params,
              model: modelId,
              requestedModelId: resolution.requestedModelId,
              resolvedModelId: resolution.resolvedModelId,
              fallbackUsed: resolution.fallbackUsed,
              fallbackReason: resolution.fallbackReason,
            },
          });

          try {
            const result = await runFalStream(
              resolution.resolvedModelId,
              buildImageInputs(executionModel, params, prompt, incomingImageUrls),
              (progress) => {
                updateNode(targetNode.id, {
                  status: 'running',
                  progress,
                });
              },
              extractImageResultUrl
            );

            if (!result.url) {
              throw new Error('Image generation did not return a URL.');
            }

            updateNode(targetNode.id, {
              status: 'succeeded',
              progress: 100,
              params: {
                ...latestNode.params,
                prompt,
                model: modelId,
                requestedModelId: resolution.requestedModelId,
                resolvedModelId: result.resolvedModelId ?? resolution.resolvedModelId,
                fallbackUsed: Boolean(result.fallbackUsed ?? resolution.fallbackUsed),
                fallbackReason: result.fallbackReason ?? resolution.fallbackReason,
                imageUrl: result.url,
                outputAssetUrl: result.url,
              },
              preview: {
                id: `${targetNode.id}-preview`,
                type: 'image',
                url: result.url,
                data: {
                  url: result.url,
                  result: result.raw,
                  requestedModelId: resolution.requestedModelId,
                  resolvedModelId: result.resolvedModelId ?? resolution.resolvedModelId,
                  fallbackUsed: Boolean(result.fallbackUsed ?? resolution.fallbackUsed),
                  fallbackReason: result.fallbackReason ?? resolution.fallbackReason,
                },
              },
            });
          } catch (error) {
            const normalizedError = normalizeGenerationErrorMessage(error);
            updateNode(targetNode.id, {
              status: 'failed',
              progress: 0,
              error: normalizedError,
              params: {
                ...latestNode.params,
                model: modelId,
                requestedModelId: resolution.requestedModelId,
                resolvedModelId: resolution.resolvedModelId,
                fallbackUsed: resolution.fallbackUsed,
                fallbackReason: resolution.fallbackReason,
              },
            });
          }
        })
      );

      scheduleSave();
    },
    [getIncomingContext, nodeDefinitionsById, prepareTargetsForModels, runFalStream, scheduleSave, updateNode]
  );

  const generateVideoNode = useCallback(
    async (nodeId: string) => {
      const node = nodeDefinitionsById.get(nodeId);
      if (!node || node.kind !== 'Video') {
        return;
      }

      const selection = getNodeModelSelection(node);
      const targets = prepareTargetsForModels(nodeId, selection);

      await Promise.all(
        targets.map(async (targetNode, index) => {
          const modelId = selection.selectedModelIds[index] ?? selection.selectedModelIds[0];
          const latestNode = useComputeFlowStore.getState().nodeDefinitions.find((candidate) => candidate.id === targetNode.id) ?? targetNode;
          const params = (latestNode.params ?? {}) as Record<string, unknown>;
          const { incomingImageUrls, incomingPrompt } = getIncomingContext(targetNode.id);
          const prompt = getNodePromptValue(latestNode) || incomingPrompt;
          const resolution = resolveStudioGenerationModel({
            kind: 'Video',
            requestedModelId: modelId,
            hasImageInputs: incomingImageUrls.length > 0,
          });
          const selectedModel = resolution.requestedModel ?? getModelById(modelId);
          const executionModel = resolution.resolvedModel ?? selectedModel;

          if (!prompt.trim()) {
            toast.error('Enter a prompt before generating a video.');
            return;
          }

          updateNode(targetNode.id, {
            status: 'queued',
            progress: 0,
            error: undefined,
          });

          // Brief delay to show queued status before transitioning to running
          await new Promise((resolve) => setTimeout(resolve, 50));

          updateNode(targetNode.id, {
            status: 'running',
            progress: 8,
            error: undefined,
            params: {
              ...latestNode.params,
              model: modelId,
              requestedModelId: resolution.requestedModelId,
              resolvedModelId: resolution.resolvedModelId,
              fallbackUsed: resolution.fallbackUsed,
              fallbackReason: resolution.fallbackReason,
            },
          });

          try {
            const result = await runFalStream(
              resolution.resolvedModelId,
              buildVideoInputs(executionModel, params, prompt, incomingImageUrls),
              (progress) => {
                updateNode(targetNode.id, {
                  status: 'running',
                  progress,
                });
              },
              extractVideoResultUrl
            );

            if (!result.url) {
              throw new Error('Video generation did not return a URL.');
            }

            updateNode(targetNode.id, {
              status: 'succeeded',
              progress: 100,
              params: {
                ...latestNode.params,
                prompt,
                model: modelId,
                requestedModelId: resolution.requestedModelId,
                resolvedModelId: result.resolvedModelId ?? resolution.resolvedModelId,
                fallbackUsed: Boolean(result.fallbackUsed ?? resolution.fallbackUsed),
                fallbackReason: result.fallbackReason ?? resolution.fallbackReason,
                videoUrl: result.url,
                outputAssetUrl: result.url,
              },
              preview: {
                id: `${targetNode.id}-preview`,
                type: 'video',
                url: result.url,
                data: {
                  url: result.url,
                  result: result.raw,
                  requestedModelId: resolution.requestedModelId,
                  resolvedModelId: result.resolvedModelId ?? resolution.resolvedModelId,
                  fallbackUsed: Boolean(result.fallbackUsed ?? resolution.fallbackUsed),
                  fallbackReason: result.fallbackReason ?? resolution.fallbackReason,
                },
              },
            });
          } catch (error) {
            const normalizedError = normalizeGenerationErrorMessage(error);
            updateNode(targetNode.id, {
              status: 'failed',
              progress: 0,
              error: normalizedError,
              params: {
                ...latestNode.params,
                model: modelId,
                requestedModelId: resolution.requestedModelId,
                resolvedModelId: resolution.resolvedModelId,
                fallbackUsed: resolution.fallbackUsed,
                fallbackReason: resolution.fallbackReason,
              },
            });
          }
        })
      );

      scheduleSave();
    },
    [getIncomingContext, nodeDefinitionsById, prepareTargetsForModels, runFalStream, scheduleSave, updateNode]
  );

  const generateAudioNode = useCallback(
    async (nodeId: string) => {
      const node = nodeDefinitionsById.get(nodeId);
      if (!node || node.kind !== 'Audio') {
        return;
      }

      const { incomingPrompt } = getIncomingContext(nodeId);
      const params = (node.params ?? {}) as Record<string, unknown>;
      const prompt = getNodePromptValue(node) || incomingPrompt;
      const audioModel = (params.audioModel as string) ?? (params.model as string) ?? 'elevenlabs-sfx';

      if (!prompt.trim()) {
        toast.error('Enter a prompt before generating audio.');
        return;
      }

      updateNode(nodeId, {
        status: 'queued',
        progress: 0,
        error: undefined,
      });

      // Brief delay to show queued status before transitioning to running
      await new Promise((resolve) => setTimeout(resolve, 50));

      updateNode(nodeId, {
        status: 'running',
        progress: 8,
        error: undefined,
        params: { ...params, model: audioModel },
      });

      try {
        const token = await getAuthToken();
        let functionName: string;
        let body: Record<string, unknown>;

        if (audioModel === 'elevenlabs-tts') {
          functionName = 'elevenlabs-tts';
          body = {
            text: prompt,
            voiceId: (params.voiceId as string) ?? 'JBFqnCBsd6RMkjVDRZzb',
          };
        } else if (audioModel === 'elevenlabs-music') {
          functionName = 'elevenlabs-music';
          body = { prompt, duration: (params.duration as number) ?? 30 };
        } else {
          functionName = 'elevenlabs-sfx';
          body = { prompt, duration: (params.duration as number) ?? 5 };
        }

        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/${functionName}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Audio generation failed');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        updateNode(nodeId, {
          status: 'succeeded',
          progress: 100,
          params: {
            ...params,
            prompt,
            model: audioModel,
            audioUrl,
            outputAssetUrl: audioUrl,
          },
          preview: {
            id: `${nodeId}-preview`,
            type: 'json',
            url: audioUrl,
            data: { audioUrl, prompt, model: audioModel },
          },
        });
      } catch (error) {
        const normalizedError = normalizeGenerationErrorMessage(error);
        updateNode(nodeId, {
          status: 'failed',
          progress: 0,
          error: normalizedError,
          params: { ...params, model: audioModel },
        });
      }

      scheduleSave();
    },
    [getAuthToken, getIncomingContext, nodeDefinitionsById, scheduleSave, updateNode]
  );

  const generateNode = useCallback(
    async (nodeId: string) => {
      const node = nodeDefinitionsById.get(nodeId);
      if (!node) {
        return;
      }

      if (node.kind === 'Text' || node.kind === 'Prompt') {
        await generateTextNode(nodeId);
        return;
      }

      if (node.kind === 'Image') {
        await generateImageNode(nodeId);
        return;
      }

      if (node.kind === 'Video') {
        await generateVideoNode(nodeId);
        return;
      }

      if (node.kind === 'Audio') {
        await generateAudioNode(nodeId);
        return;
      }
    },
    [generateAudioNode, generateImageNode, generateTextNode, generateVideoNode, nodeDefinitionsById]
  );

  return {
    generateNode,
    updateNodeModelSelection,
  };
}

export default useStudioNodeGeneration;
