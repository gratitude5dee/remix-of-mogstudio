import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import {
  Background,
  BackgroundVariant,
  Connection,
  ConnectionMode,
  Edge,
  EdgeTypes,
  Node,
  NodeTypes,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

import { ReactFlowTextNode } from './nodes/ReactFlowTextNode';
import { ReactFlowImageNode } from './nodes/ReactFlowImageNode';
import { ReactFlowImageEditNode } from './nodes/ReactFlowImageEditNode';
import { ReactFlowVideoNode } from './nodes/ReactFlowVideoNode';
import { ReactFlowUploadNode } from './nodes/ReactFlowUploadNode';
import { ComputeNode } from './nodes/ComputeNode';
import { ComputeEdge } from './edges/ComputeEdge';
import { ImprovedEdge } from './edges/ImprovedEdge';
import { GlowingEdge } from './edges/GlowingEdge';
import { BezierConnection } from './connections/BezierConnection';
import { CustomConnectionLine } from './ConnectionLine';
import { ConnectionNodeSelector } from './ConnectionNodeSelector';
import { CanvasToolbar } from './canvas/CanvasToolbar';
import { ConnectionModeIndicator } from './canvas/ConnectionModeIndicator';
import { KeyboardShortcutsOverlay } from './KeyboardShortcutsOverlay';
import { QueueIndicator } from './QueueIndicator';

import EmptyCanvasState from './EmptyCanvasState';
import { FloraCollaboratorCursors } from './canvas/FloraCollaboratorCursors';
import { FloraPromptBar } from './canvas/FloraPromptBar';
import { StudioErrorBoundary } from './StudioErrorBoundary';
import { NodeErrorBoundary } from './NodeErrorBoundary';
import CommentNode from './nodes/CommentNode';
import { UploadImageNode } from './nodes/UploadImageNode';
import { UploadVideoNode } from './nodes/UploadVideoNode';
import { UploadAudioNode } from './nodes/UploadAudioNode';
import { UploadDocumentNode } from './nodes/UploadDocumentNode';
import { Upload3DNode } from './nodes/Upload3DNode';
import { ReactFlowAudioNode } from './nodes/ReactFlowAudioNode';
import { ReactFlow3DNode } from './nodes/ReactFlow3DNode';
import { OutputNode } from './nodes/OutputNode';

import { useStrictConnectionValidation } from '@/hooks/useStrictConnectionValidation';
import { useConnectionFeedback } from '@/hooks/useConnectionFeedback';
import { ConnectionErrorTooltip } from './ConnectionErrorTooltip';
import { useConnectionMode } from '@/hooks/useConnectionMode';
import { useStudioKeyboardShortcuts } from '@/hooks/studio/useStudioKeyboardShortcuts';
import { useNodePositionSync } from '@/hooks/studio/useNodePositionSync';
import { useUnsavedChangesWarning } from '@/hooks/useUnsavedChangesWarning';
import { useComputeFlowRealtime } from '@/hooks/useComputeFlowRealtime';
import { usePresence } from '@/hooks/usePresence';
import { useComputeFlowStore } from '@/store/computeFlowStore';
import { useStudioGraphActions } from '@/hooks/studio/useStudioGraphActions';
import { useStudioNodeGeneration } from '@/hooks/studio/useStudioNodeGeneration';
import { HANDLE_COLORS, type DataType, type EdgeDefinition, type NodeDefinition } from '@/types/computeFlow';
import { useAuth } from '@/providers/AuthProvider';
import { getNodeImagePreviewUrl } from '@/lib/imageEdit';
import { buildFloraSeedGraph, FLORA_EXAMPLE_COPY, isFloraSeedNode } from '@/lib/studio/floraSeed';
import { supabase } from '@/integrations/supabase/client';

interface StudioCanvasProps {
  projectId?: string;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
}

function withErrorBoundary(Component: React.ComponentType<any>) {
  return React.memo((props: any) => (
    <NodeErrorBoundary nodeId={props.id}>
      <Component {...props} />
    </NodeErrorBoundary>
  ));
}

const nodeTypes: NodeTypes = {
  text: withErrorBoundary(ReactFlowTextNode),
  image: withErrorBoundary(ReactFlowImageNode),
  imageEdit: withErrorBoundary(ReactFlowImageEditNode),
  video: withErrorBoundary(ReactFlowVideoNode),
  upload: withErrorBoundary(ReactFlowUploadNode),
  compute: withErrorBoundary(ComputeNode),
  uploadImage: withErrorBoundary(UploadImageNode),
  uploadVideo: withErrorBoundary(UploadVideoNode),
  uploadAudio: withErrorBoundary(UploadAudioNode),
  uploadDocument: withErrorBoundary(UploadDocumentNode),
  upload3D: withErrorBoundary(Upload3DNode),
  audio: withErrorBoundary(ReactFlowAudioNode),
  '3d': withErrorBoundary(ReactFlow3DNode),
  output: withErrorBoundary(OutputNode),
  comment: withErrorBoundary(CommentNode),
};

const edgeTypes: EdgeTypes = {
  glow: GlowingEdge,
  compute: ComputeEdge,
  improved: ImprovedEdge,
  default: BezierConnection,
};

const defaultEdgeOptions = {
  type: 'compute',
  animated: false,
  data: {
    status: 'idle',
    dataType: 'data',
  },
};



function getNodeTextValue(node?: Pick<NodeDefinition, 'preview' | 'params'> | null): string | undefined {
  if (!node) {
    return undefined;
  }

  const preview = node.preview as { data?: unknown } | undefined;
  if (typeof preview?.data === 'string' && preview.data.trim().length > 0) {
    return preview.data;
  }

  if (preview?.data && typeof preview.data === 'object') {
    const textData = preview.data as Record<string, unknown>;
    const previewText = textData.text ?? textData.prompt ?? textData.content;
    if (typeof previewText === 'string' && previewText.trim().length > 0) {
      return previewText;
    }
  }

  const params = node.params as Record<string, unknown> | undefined;
  const paramText = params?.prompt ?? params?.text ?? params?.content;
  if (typeof paramText === 'string' && paramText.trim().length > 0) {
    return paramText;
  }

  return undefined;
}

function truncatePromptLabel(prompt: string) {
  return prompt
    .trim()
    .split(/\s+/)
    .slice(0, 4)
    .join(' ')
    .replace(/[^\w\s'-]/g, '')
    .trim() || 'Generated Image';
}

function cloneValue<T>(value: T): T {
  if (typeof structuredClone === 'function') {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

const StudioCanvasInner: React.FC<StudioCanvasProps> = ({
  projectId,
  selectedNodeId,
  onSelectNode,
}) => {
  const { user } = useAuth();
  const { screenToFlowPosition, fitView, zoomIn, zoomOut } = useReactFlow();
  const { validateNewEdge } = useStrictConnectionValidation();
  const { rejection, showRejection, clearRejection } = useConnectionFeedback();
  const {
    connectionState,
    isClickMode,
    isConnecting,
    toggleMode,
    cancelClickConnection,
  } = useConnectionMode();
  const {
    nodeDefinitions,
    edgeDefinitions,
    loadGraph,
    saveGraph,
    addNodesAndEdgesAtomic,
    addNode,
    executeGraphStreaming,
    cancelExecution,
    execution,
    isSaving,
    removeNode,
    removeEdge,
  } = useComputeFlowStore();
  const { buildNode, addNodeOfType, connectNodes, createConnectedNode, scheduleSave } =
    useStudioGraphActions(projectId);
  const { generateNode, updateNodeModelSelection } = useStudioNodeGeneration(projectId);

  useComputeFlowRealtime(projectId);
  const { onlineUsers, updateCursor, clearCursor, updateSelection } = usePresence(projectId ?? null);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const cursorThrottleRef = useRef<number | null>(null);
  const pendingCursorPositionRef = useRef<{ x: number; y: number } | null>(null);
  const nodeDefinitionsById = useMemo(
    () => new Map(nodeDefinitions.map((node) => [node.id, node])),
    [nodeDefinitions]
  );
  const incomingEdgesByTargetNode = useMemo(() => {
    const next = new Map<string, typeof edgeDefinitions>();
    edgeDefinitions.forEach((edge) => {
      const existing = next.get(edge.target.nodeId);
      if (existing) {
        existing.push(edge);
      } else {
        next.set(edge.target.nodeId, [edge]);
      }
    });
    return next;
  }, [edgeDefinitions]);

  const [nodes, setNodes, onNodesChangeBase] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChangeBase] = useEdgesState<Edge>([]);
  const { onNodeDragStart, onNodeDragStop, filterNodeChanges } = useNodePositionSync({
    useComputeFlow: true,
    projectId,
  });

  const [showNodeSelector, setShowNodeSelector] = useState(false);
  const [nodeSelectorFlowPosition, setNodeSelectorFlowPosition] = useState({ x: 0, y: 0 });
  const [nodeSelectorScreenPosition, setNodeSelectorScreenPosition] = useState({ x: 0, y: 0 });
  const [activeConnection, setActiveConnection] = useState<{
    sourceNodeId: string;
    sourcePortId: string;
  } | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [promptDraft, setPromptDraft] = useState('');
  const [isPromptSubmitting, setIsPromptSubmitting] = useState(false);

  useUnsavedChangesWarning();

  const getNodeTypeFromKind = useCallback((kind: string): string => {
    const kindToType: Record<string, string> = {
      upload: 'upload',
      upload_image: 'uploadImage',
      upload_video: 'uploadVideo',
      upload_audio: 'uploadAudio',
      upload_document: 'uploadDocument',
      upload_3d: 'upload3D',
      text_to_image: 'image',
      image_edit: 'imageEdit',
      text_to_video: 'video',
      text_to_text: 'text',
      image_to_video: 'video',
      audio_generate: 'audio',
      '3d_generate': '3d',
      output: 'output',
      Text: 'text',
      Image: 'image',
      ImageEdit: 'imageEdit',
      Video: 'video',
      Prompt: 'text',
      Model: 'compute',
      Transform: 'compute',
      Output: 'output',
      Gateway: 'compute',
      Audio: 'audio',
      Comment: 'comment',
      comment: 'comment',
    };

    return kindToType[kind] || 'compute';
  }, []);

  const flushCursorUpdate = useCallback(() => {
    cursorThrottleRef.current = null;
    if (!pendingCursorPositionRef.current) {
      return;
    }

    const { x, y } = pendingCursorPositionRef.current;
    void updateCursor(x, y);
  }, [updateCursor]);

  const handleCanvasPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!projectId || !canvasContainerRef.current) {
        return;
      }

      const rect = canvasContainerRef.current.getBoundingClientRect();
      pendingCursorPositionRef.current = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };

      if (cursorThrottleRef.current === null) {
        cursorThrottleRef.current = window.setTimeout(flushCursorUpdate, 60);
      }
    },
    [flushCursorUpdate, projectId]
  );

  const handleCanvasPointerLeave = useCallback(() => {
    pendingCursorPositionRef.current = null;
    if (cursorThrottleRef.current !== null) {
      window.clearTimeout(cursorThrottleRef.current);
      cursorThrottleRef.current = null;
    }
    void clearCursor();
  }, [clearCursor]);

  const onNodesChange = useCallback(
    (changes: any[]) => {
      const safeChanges = changes.filter((change) => change.type !== 'remove');
      onNodesChangeBase(filterNodeChanges(safeChanges));
    },
    [filterNodeChanges, onNodesChangeBase]
  );

  const onEdgesChange = useCallback(
    (changes: any[]) => {
      const removedEdgeIds = changes
        .filter((change) => change.type === 'remove')
        .map((change) => change.id as string);

      if (removedEdgeIds.length > 0) {
        removedEdgeIds.forEach((edgeId) => removeEdge(edgeId));
        scheduleSave();
      }

      const visualOnlyChanges = changes.filter(
        (change) => change.type !== 'remove' && change.type !== 'add' && change.type !== 'replace'
      );
      if (visualOnlyChanges.length > 0) {
        onEdgesChangeBase(visualOnlyChanges);
      }
    },
    [onEdgesChangeBase, removeEdge, scheduleSave]
  );

  const handleDuplicateNode = useCallback(
    (nodeDef: NodeDefinition) => {
      const duplicated = cloneValue(nodeDef);
      const newId = uuidv4();
      const nextNode: NodeDefinition = {
        ...duplicated,
        id: newId,
        label: `${nodeDef.label} Copy`,
        position: {
          x: nodeDef.position.x + 40,
          y: nodeDef.position.y + 40,
        },
        status: 'idle',
        progress: 0,
        error: undefined,
        inputs: (duplicated.inputs || []).map((port, index) => ({
          ...port,
          id: `${newId}-input-${index}`,
        })),
        outputs: (duplicated.outputs || []).map((port, index) => ({
          ...port,
          id: `${newId}-output-${index}`,
        })),
      };
      addNode(nextNode);
      scheduleSave();
      return nextNode;
    },
    [addNode, scheduleSave]
  );

  const openConnectionMenuFromPort = useCallback(
    (sourceNodeId: string, sourcePortId: string, rect?: DOMRect | null) => {
      const fallbackX = rect ? rect.right + 14 : (canvasContainerRef.current?.getBoundingClientRect().left ?? 0) + 240;
      const fallbackY = rect ? rect.top + rect.height / 2 : (canvasContainerRef.current?.getBoundingClientRect().top ?? 0) + 240;
      const flowPosition = screenToFlowPosition({
        x: fallbackX,
        y: fallbackY,
      });

      setNodeSelectorFlowPosition(flowPosition);
      setNodeSelectorScreenPosition({ x: fallbackX, y: fallbackY });
      setShowNodeSelector(true);
      setActiveConnection({ sourceNodeId, sourcePortId });
    },
    [screenToFlowPosition]
  );

  useEffect(() => {
    const computeNodes: Node[] = nodeDefinitions.map((nodeDef) => {
      const incomingEdges = incomingEdgesByTargetNode.get(nodeDef.id) || [];
      const incomingReferenceSources = incomingEdges
        .map((edge) => {
          const sourceNode = nodeDefinitionsById.get(edge.source.nodeId);
          const sourcePort = sourceNode?.outputs.find((port) => port.id === edge.source.portId);
          if (!sourceNode) {
            return null;
          }

          const sourceType = sourcePort?.datatype ?? edge.dataType;
          if (sourceType !== 'image' && sourceType !== 'video') {
            return null;
          }

          const previewUrl =
            sourceType === 'image'
              ? getNodeImagePreviewUrl(sourceNode)
              : typeof sourceNode.preview?.url === 'string'
                ? sourceNode.preview.url
                : null;
          if (!previewUrl) {
            return null;
          }

          return {
            sourceNodeId: sourceNode.id,
            name: sourceNode.label || 'Image Layer',
            type: sourceType,
            url: previewUrl,
          };
        })
        .filter(Boolean);

      const incomingImageSources = incomingReferenceSources.filter(
        (source): source is { sourceNodeId: string; name: string; type: 'image' | 'video'; url: string } =>
          Boolean(source) && source.type === 'image'
      );

      const incomingPrompt = incomingEdges
        .map((edge) => {
          const sourceNode = nodeDefinitionsById.get(edge.source.nodeId);
          const sourcePort = sourceNode?.outputs.find((port) => port.id === edge.source.portId);
          const isTextEdge = edge.dataType === 'text' || sourcePort?.datatype === 'text';
          return isTextEdge ? getNodeTextValue(sourceNode) : undefined;
        })
        .find((value) => typeof value === 'string' && value.trim().length > 0);

      // Compute pass-through relay data for Output/Gateway/Transform nodes
      let inputValue: string | undefined;
      let inputType: 'image' | 'video' | 'audio' | 'text' | '3d' | 'unknown' = 'unknown';
      if (nodeDef.kind === 'Output' || nodeDef.kind === 'Gateway' || nodeDef.kind === 'Transform' || nodeDef.kind === 'Combine') {
        for (const edge of incomingEdges) {
          const sourceNode = nodeDefinitionsById.get(edge.source.nodeId);
          if (!sourceNode) continue;

          const sourcePort = sourceNode.outputs.find((port) => port.id === edge.source.portId);
          const dataType = sourcePort?.datatype ?? edge.dataType;

          if (dataType === 'image' || dataType === 'video') {
            const previewUrl =
              dataType === 'image'
                ? getNodeImagePreviewUrl(sourceNode)
                : typeof sourceNode.preview?.url === 'string'
                  ? sourceNode.preview.url
                  : null;
            if (previewUrl) {
              inputValue = previewUrl;
              inputType = dataType as 'image' | 'video';
              break;
            }
          } else if (dataType === 'audio') {
            const audioUrl =
              (sourceNode.preview as any)?.url ??
              (sourceNode.preview as any)?.data?.audioUrl ??
              (sourceNode.params as any)?.audioUrl;
            if (typeof audioUrl === 'string' && audioUrl.length > 0) {
              inputValue = audioUrl;
              inputType = 'audio';
              break;
            }
          } else if (dataType === 'text' || dataType === 'string') {
            const textValue = getNodeTextValue(sourceNode);
            if (textValue) {
              inputValue = textValue;
              inputType = 'text';
              break;
            }
          }
        }
      }

      return {
        id: nodeDef.id,
        type: getNodeTypeFromKind(nodeDef.kind),
        position: nodeDef.position,
        selected: selectedNodeId === nodeDef.id,
        data: {
          nodeDefinition: nodeDef,
          label: nodeDef.label,
          kind: nodeDef.kind,
          inputs: nodeDef.inputs,
          outputs: nodeDef.outputs,
          params: nodeDef.params,
          status: nodeDef.status || 'idle',
          progress: nodeDef.progress || 0,
          preview: nodeDef.preview,
          error: nodeDef.error,
          modelSelection: {
            auto: Boolean(nodeDef.params?.modelAuto),
            selectedModelIds: Array.isArray(nodeDef.params?.selectedModels)
              ? (nodeDef.params?.selectedModels as string[])
              : [String(nodeDef.params?.model || nodeDef.metadata?.model || '')].filter(Boolean),
            useMultipleModels: Boolean(nodeDef.params?.useMultipleModels),
          },
          initialData: nodeDef.params,
          blockPosition: nodeDef.position,
          incomingImageSources,
          incomingReferenceSources,
          incomingPrompt,
          inputValue,
          inputType,
          popoverBoundary: canvasContainerRef.current,
          popoverContainer: canvasContainerRef.current,
          onExecute: () => generateNode(nodeDef.id),
          onGenerate: () => generateNode(nodeDef.id),
          onDuplicate: () => handleDuplicateNode(nodeDef),
          onDelete: () => {
            removeNode(nodeDef.id);
            scheduleSave();
            if (selectedNodeId === nodeDef.id) {
              onSelectNode(null);
            }
          },
          onModelSelectionChange: (selection: { auto: boolean; selectedModelIds: string[]; useMultipleModels: boolean }) =>
            updateNodeModelSelection(nodeDef.id, selection),
          onUpdateNode: (nodeUpdates: Partial<NodeDefinition>) => {
            useComputeFlowStore.getState().updateNode(nodeDef.id, nodeUpdates);
            scheduleSave();
          },
          onUpdateParams: (paramUpdates: Record<string, unknown>) => {
            useComputeFlowStore.getState().updateNode(nodeDef.id, {
              params: {
                ...nodeDef.params,
                ...paramUpdates,
              },
            });
            scheduleSave();
          },
          onOpenConnectionMenu: (sourcePortId: string, rect?: DOMRect | null) =>
            openConnectionMenuFromPort(nodeDef.id, sourcePortId, rect),
          onSelectNode,
        },
        draggable: true,
        selectable: true,
        connectable: true,
      };
    });

    setNodes(computeNodes);
  }, [
    generateNode,
    getNodeTypeFromKind,
    handleDuplicateNode,
    incomingEdgesByTargetNode,
    nodeDefinitions,
    nodeDefinitionsById,
    openConnectionMenuFromPort,
    onSelectNode,
    removeNode,
    scheduleSave,
    selectedNodeId,
    setNodes,
    updateNodeModelSelection,
  ]);

  useEffect(() => {
    const computeEdges: Edge[] = edgeDefinitions.flatMap((edgeDef) => {
      const sourceNode = nodeDefinitionsById.get(edgeDef.source.nodeId);
      const targetNode = nodeDefinitionsById.get(edgeDef.target.nodeId);
      if (!sourceNode || !targetNode) {
        return [];
      }

      return [
        {
          id: edgeDef.id,
          source: edgeDef.source.nodeId,
          target: edgeDef.target.nodeId,
          sourceHandle: edgeDef.source.portId,
          targetHandle: edgeDef.target.portId,
          type: 'compute',
          data: {
            dataType: edgeDef.dataType,
            status: edgeDef.status,
          },
          style: {
            stroke: HANDLE_COLORS[edgeDef.dataType as DataType] || HANDLE_COLORS.any,
            strokeWidth: 2,
          },
        },
      ];
    });

    setEdges(computeEdges);
  }, [edgeDefinitions, nodeDefinitionsById, setEdges]);

  useEffect(() => {
    if (projectId) {
      void loadGraph(projectId);
    }
  }, [loadGraph, projectId]);

  useEffect(() => {
    const handleFitViewEvent = (event: Event) => {
      const customEvent = event as CustomEvent<{ animate: boolean }>;
      setTimeout(() => {
        fitView({ padding: 0.3, duration: customEvent.detail.animate ? 400 : 0 });
      }, 50);
    };

    window.addEventListener('fitViewToWorkflow', handleFitViewEvent);
    return () => window.removeEventListener('fitViewToWorkflow', handleFitViewEvent);
  }, [fitView]);

  const selectedNodes = useMemo(() => nodes.filter((node) => node.selected), [nodes]);
  const selectedCount = selectedNodes.length;
  const selectedImageEditNode = useMemo(
    () => (selectedNodeId ? nodeDefinitionsById.get(selectedNodeId) : null),
    [nodeDefinitionsById, selectedNodeId]
  );
  const hasFloraSeedNodes = useMemo(
    () => nodeDefinitions.some((node) => isFloraSeedNode(node)),
    [nodeDefinitions]
  );
  const showPromptBar = nodeDefinitions.length === 0 || hasFloraSeedNodes;

  const getCanvasCenterPosition = useCallback(() => {
    const bounds = canvasContainerRef.current?.getBoundingClientRect();
    if (!bounds) {
      return { x: 480, y: 320 };
    }

    return screenToFlowPosition({
      x: bounds.left + bounds.width / 2,
      y: bounds.top + bounds.height / 2,
    });
  }, [screenToFlowPosition]);

  const handleStartFloraExample = useCallback(() => {
    const center = getCanvasCenterPosition();
    const seedGraph = buildFloraSeedGraph({ x: center.x - 640, y: center.y - 220 });
    addNodesAndEdgesAtomic(seedGraph.nodes, seedGraph.edges, 'Inserted WZRD example');
    scheduleSave();
    toast.success('FLORA example inserted.');
    requestAnimationFrame(() => {
      fitView({ padding: 0.22, duration: 420 });
    });
  }, [addNodesAndEdgesAtomic, fitView, getCanvasCenterPosition, scheduleSave]);

  const handlePromptSubmit = useCallback(async () => {
    if (!projectId) {
      toast.error('Prompt creation requires an open Studio project.');
      return;
    }

    const trimmedPrompt = promptDraft.trim();
    if (!trimmedPrompt) {
      return;
    }

    const center = getCanvasCenterPosition();
    const textNode = buildNode('text', { x: center.x - 320, y: center.y - 48 }, {
      label: 'Text 1',
      params: {
        prompt: trimmedPrompt,
        content: trimmedPrompt,
        floraSource: 'prompt-bar',
      },
    });
    const imageNode = buildNode('image', { x: center.x + 100, y: center.y - 72 }, {
      label: truncatePromptLabel(trimmedPrompt),
      params: {
        prompt: trimmedPrompt,
        aspectRatio: '16:9',
      },
    });

    const newEdges: EdgeDefinition[] = [
      {
        id: uuidv4(),
        source: { nodeId: textNode.id, portId: textNode.outputs[0]?.id ?? '' },
        target: { nodeId: imageNode.id, portId: imageNode.inputs[0]?.id ?? '' },
        dataType: 'text',
        status: 'idle',
        metadata: { label: 'prompt' },
      },
    ];

    if (selectedImageEditNode?.kind === 'ImageEdit') {
      const promptPort =
        selectedImageEditNode.inputs.find((port) => port.name === 'prompt')?.id ??
        selectedImageEditNode.inputs[0]?.id ??
        '';
      const imagePort =
        selectedImageEditNode.inputs.find((port) => port.name === 'image')?.id ??
        selectedImageEditNode.inputs[1]?.id ??
        selectedImageEditNode.inputs[0]?.id ??
        '';

      if (promptPort && imagePort) {
        newEdges.push(
          {
            id: uuidv4(),
            source: { nodeId: textNode.id, portId: textNode.outputs[0]?.id ?? '' },
            target: { nodeId: selectedImageEditNode.id, portId: promptPort },
            dataType: 'text',
            status: 'idle',
            metadata: { label: 'prompt' },
          },
          {
            id: uuidv4(),
            source: { nodeId: imageNode.id, portId: imageNode.outputs[0]?.id ?? '' },
            target: { nodeId: selectedImageEditNode.id, portId: imagePort },
            dataType: 'image',
            status: 'idle',
            metadata: { label: 'image' },
          }
        );
      }
    }

    addNodesAndEdgesAtomic([textNode, imageNode], newEdges, 'Created prompt nodes');
    useComputeFlowStore.getState().updateNode(imageNode.id, {
      status: 'running',
      progress: 15,
    });
    scheduleSave();
    setPromptDraft('');
    setIsPromptSubmitting(true);
    toast.loading('Generating image...', { id: 'flora-prompt-generate' });

    try {
      const { data, error } = await supabase.functions.invoke('gemini-image-generation', {
        body: {
          prompt: trimmedPrompt,
          editMode: false,
          aspectRatio: '16:9',
        },
      });

      if (error) {
        throw error;
      }

      const imageUrl = data?.imageUrl as string | undefined;
      if (!imageUrl) {
        throw new Error('Image generation did not return a URL.');
      }

      useComputeFlowStore.getState().updateNode(imageNode.id, {
        status: 'succeeded',
        progress: 100,
        params: {
          ...imageNode.params,
          imageUrl,
          generationSource: 'flora-prompt-bar',
        },
        preview: {
          id: `${imageNode.id}-preview`,
          type: 'image',
          url: imageUrl,
          data: { url: imageUrl },
        },
      });
      scheduleSave();
      toast.success('Image generated.', { id: 'flora-prompt-generate' });
    } catch (error) {
      useComputeFlowStore.getState().updateNode(imageNode.id, {
        status: 'failed',
        progress: 0,
        error: error instanceof Error ? error.message : 'Image generation failed',
      });
      toast.error(error instanceof Error ? error.message : 'Image generation failed', {
        id: 'flora-prompt-generate',
      });
    } finally {
      setIsPromptSubmitting(false);
    }
  }, [
    addNodesAndEdgesAtomic,
    buildNode,
    getCanvasCenterPosition,
    projectId,
    promptDraft,
    scheduleSave,
    selectedImageEditNode,
  ]);

  useStudioKeyboardShortcuts({
    onAddTextNode: () => {
      const node = addNodeOfType('text', getCanvasCenterPosition());
      onSelectNode(node.id);
    },
    onAddImageNode: () => {
      const node = addNodeOfType('image', getCanvasCenterPosition());
      onSelectNode(node.id);
    },
    onAddVideoNode: () => {
      const node = addNodeOfType('video', getCanvasCenterPosition());
      onSelectNode(node.id);
    },
    onDelete: (nodeIds) => {
      nodeIds.forEach((id) => removeNode(id));
      scheduleSave();
      if (nodeIds.includes(selectedNodeId || '')) {
        onSelectNode(null);
      }
    },
    onDuplicate: (nodeIds) => {
      const nodesToDuplicate = nodeDefinitions.filter((node) => nodeIds.includes(node.id));
      nodesToDuplicate.forEach((node) => {
        handleDuplicateNode(node);
      });
    },
    selectedNodeIds: selectedNodes.map((node) => node.id),
  });

  const isValidConnection = useCallback(
    (connection: Connection): boolean => {
      const { source, target, sourceHandle, targetHandle } = connection;
      if (!source || !target || !sourceHandle || !targetHandle) {
        return false;
      }

      const result = validateNewEdge(source, sourceHandle, target, targetHandle);
      if (!result.valid && result.error) {
        showRejection(result.error, target);
      }
      return result.valid;
    },
    [validateNewEdge, showRejection]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      const { source, sourceHandle, target, targetHandle } = connection;
      if (!source || !target || !sourceHandle || !targetHandle) {
        toast.error('Connect nodes from a real output port to a compatible input port.');
        return;
      }

      // Clear any lingering rejection tooltip on successful connect
      clearRejection();
      connectNodes(source, sourceHandle, target, targetHandle);
    },
    [connectNodes, clearRejection]
  );

  const onConnectEnd = useCallback(
    (event: MouseEvent | TouchEvent, connectionStateLike: any) => {
      if (connectionStateLike.isValid) {
        return;
      }

      const eventTarget = event.target as HTMLElement | null;
      const droppedOnPane = Boolean(
        eventTarget?.closest('.react-flow__pane') || eventTarget?.closest('.react-flow__viewport')
      );
      if (!droppedOnPane) {
        return;
      }

      const sourceNodeId = connectionStateLike.fromNode?.id as string | undefined;
      const sourcePortId =
        (typeof connectionStateLike.fromHandle === 'string'
          ? connectionStateLike.fromHandle
          : connectionStateLike.fromHandle?.id) ??
        undefined;

      if (!sourceNodeId || !sourcePortId) {
        return;
      }

      const handleElement = document.querySelector(
        `.react-flow__handle[data-nodeid="${sourceNodeId}"][data-handleid="${sourcePortId}"]`
      ) as HTMLElement | null;
      const handleRect = handleElement?.getBoundingClientRect();

      if (handleRect) {
        openConnectionMenuFromPort(sourceNodeId, sourcePortId, handleRect);
        return;
      }

      const pointer =
        'changedTouches' in event ? event.changedTouches[0] : event;
      openConnectionMenuFromPort(sourceNodeId, sourcePortId, {
        left: pointer.clientX,
        top: pointer.clientY,
        right: pointer.clientX,
        bottom: pointer.clientY,
        width: 0,
        height: 0,
        x: pointer.clientX,
        y: pointer.clientY,
        toJSON: () => ({}),
      } as DOMRect);
    },
    [openConnectionMenuFromPort]
  );

  const handleSelectNodeType = useCallback(
    (type: 'text' | 'image' | 'video' | 'imageEdit', positionOverride?: { x: number; y: number }) => {
      const position = positionOverride ?? nodeSelectorFlowPosition;
      const node = activeConnection
        ? createConnectedNode(activeConnection.sourceNodeId, activeConnection.sourcePortId, type, position)
        : addNodeOfType(type, position);

      if (node) {
        onSelectNode(node.id);
      }

      requestAnimationFrame(() => {
        setShowNodeSelector(false);
        setActiveConnection(null);
      });
    },
    [activeConnection, addNodeOfType, createConnectedNode, nodeSelectorFlowPosition, onSelectNode]
  );

  const handleCanvasDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('.react-flow__node')) {
        return;
      }

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNodeSelectorFlowPosition(position);
      setNodeSelectorScreenPosition({ x: event.clientX, y: event.clientY });
      setShowNodeSelector(true);
      setActiveConnection(null);
    },
    [screenToFlowPosition]
  );

  const handlePaneClick = useCallback(() => {
    setShowNodeSelector(false);
    onSelectNode(null);
  }, [onSelectNode]);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNodeSelector(false);
        setActiveConnection(null);
        cancelClickConnection();
      }

      if (((event.metaKey || event.ctrlKey) && event.key === '0') || event.key === 'f' || event.key === 'F') {
        event.preventDefault();
        fitView({ padding: 0.2, duration: 300 });
      }

      if ((event.key === 'g' || event.key === 'G') && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        setShowGrid((current) => !current);
      }

      if ((event.key === 'c' || event.key === 'C') && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        toggleMode();
      }

      if (event.key === '+' || event.key === '=') {
        event.preventDefault();
        zoomIn();
      }

      if (event.key === '-' || event.key === '_') {
        event.preventDefault();
        zoomOut();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cancelClickConnection, fitView, toggleMode, zoomIn, zoomOut]);

  useEffect(() => {
    if (nodeDefinitions.length > 0) {
      const timer = window.setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 100);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [fitView, nodeDefinitions.length]);

  useEffect(() => {
    return () => {
      if (cursorThrottleRef.current !== null) {
        window.clearTimeout(cursorThrottleRef.current);
      }
    };
  }, []);

  useEffect(() => {
    void updateSelection(selectedNodeId ?? null);
  }, [selectedNodeId, updateSelection]);

  return (
    <div
      ref={canvasContainerRef}
      className="relative h-full w-full overflow-hidden bg-[#0A0A0A]"
      data-walkthrough="canvas"
      onPointerMove={handleCanvasPointerMove}
      onPointerLeave={handleCanvasPointerLeave}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          opacity: 0.6,
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(212,165,116,0.08),transparent_42%),radial-gradient(circle_at_72%_18%,rgba(249,115,22,0.08),transparent_22%),radial-gradient(circle_at_bottom,rgba(0,0,0,0.46),transparent_48%)]" />

      <FloraCollaboratorCursors
        users={onlineUsers}
        currentUserId={user?.id}
      />

      <ConnectionErrorTooltip rejection={rejection} />

      <AnimatePresence>
        {showNodeSelector ? (
          <div
            style={{
              position: 'fixed',
              left: nodeSelectorScreenPosition.x + 12,
              top: nodeSelectorScreenPosition.y - 22,
              zIndex: 1100,
            }}
          >
            <ConnectionNodeSelector
              position={nodeSelectorFlowPosition}
              onSelectType={handleSelectNodeType}
              onNavigate={() => {
                setShowNodeSelector(false);
                setActiveConnection(null);
              }}
              onCancel={() => {
                setShowNodeSelector(false);
                setActiveConnection(null);
              }}
            />
          </div>
        ) : null}
      </AnimatePresence>

      <StudioErrorBoundary
        fallbackTitle="Canvas Error"
        fallbackDescription="The studio canvas encountered an error"
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onConnectEnd={onConnectEnd}
          onNodeClick={handleNodeClick}
          onNodeDragStart={onNodeDragStart}
          onNodeDragStop={onNodeDragStop}
          onPaneClick={handlePaneClick}
          onDoubleClick={handleCanvasDoubleClick}
          onSelectionChange={({ nodes: selectionNodes }) => {
            onSelectNode(selectionNodes[0]?.id ?? null);
          }}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          connectionLineComponent={CustomConnectionLine}
          connectionMode={ConnectionMode.Strict}
          connectionRadius={30}
          isValidConnection={isValidConnection}
          defaultEdgeOptions={defaultEdgeOptions}
          nodesDraggable
          nodesConnectable
          elementsSelectable
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.1}
          maxZoom={2}
          deleteKeyCode={null}
          className="bg-transparent"
        >
          {showGrid ? (
            <Background
              color="rgba(255,255,255,0.08)"
              gap={40}
              variant={BackgroundVariant.Dots}
            />
          ) : null}
        </ReactFlow>
      </StudioErrorBoundary>

      {nodeDefinitions.length === 0 ? (
        <div className="pointer-events-none absolute inset-0">
          <EmptyCanvasState
            onAddBlock={(type) => {
              const node = addNodeOfType(type, getCanvasCenterPosition());
              onSelectNode(node.id);
            }}
            onStartFloraExample={handleStartFloraExample}
          />
        </div>
      ) : null}

      <ConnectionModeIndicator
        isClickMode={isClickMode}
        isConnecting={isConnecting}
        sourceNodeLabel={connectionState.sourceNode ? `Node ${connectionState.sourceNode.slice(0, 8)}` : undefined}
        onCancel={cancelClickConnection}
      />

      <CanvasToolbar
        connectionMode={isClickMode ? 'click' : 'drag'}
        onToggleConnectionMode={toggleMode}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((current) => !current)}
        onFitView={() => fitView({ padding: 0.2, duration: 300 })}
        onZoomIn={() => zoomIn()}
        onZoomOut={() => zoomOut()}
        selectedCount={selectedCount}
        onDeleteSelected={() => {
          selectedNodes.forEach((node) => removeNode(node.id));
          scheduleSave();
          if (selectedCount > 0) {
            onSelectNode(null);
          }
        }}
        onDuplicateSelected={() => {
          selectedNodes.forEach((node) => {
            const definition = nodeDefinitionsById.get(node.id);
            if (definition) {
              const duplicated = handleDuplicateNode(definition);
              onSelectNode(duplicated.id);
            }
          });
        }}
        isExecuting={execution.isRunning}
        executionProgress={execution}
        onExecute={projectId ? () => executeGraphStreaming(projectId) : undefined}
        onCancelExecution={cancelExecution}
        onSave={projectId ? () => saveGraph(projectId) : undefined}
        isSaving={isSaving}
        interactionMode="select"
        onToggleInteractionMode={() => {}}
      />

      <KeyboardShortcutsOverlay triggerClassName="left-[56px]" />
      {projectId ? (
        <QueueIndicator alwaysVisible />
      ) : null}

      {showPromptBar ? (
        <FloraPromptBar
          value={promptDraft}
          onChange={setPromptDraft}
          onSubmit={handlePromptSubmit}
          isSubmitting={isPromptSubmitting}
          disabled={!projectId}
          placeholder={FLORA_EXAMPLE_COPY.landingPrompt}
        />
      ) : null}
    </div>
  );
};

const StudioCanvas: React.FC<StudioCanvasProps> = (props) => (
  <ReactFlowProvider>
    <StudioCanvasInner {...props} />
  </ReactFlowProvider>
);

export default StudioCanvas;
