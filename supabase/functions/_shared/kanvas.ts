import type { CanonicalFalModel } from './falai-client.ts';

export type KanvasStudio = 'image' | 'video' | 'cinema' | 'lipsync';
export type KanvasMode =
  | 'text-to-image'
  | 'image-to-image'
  | 'text-to-video'
  | 'image-to-video'
  | 'cinematic-image'
  | 'talking-head'
  | 'lip-sync';

export type KanvasJobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type KanvasAssetType = 'image' | 'video' | 'audio';
export type KanvasMediaType = 'image' | 'video';

export interface KanvasSelectOption {
  label: string;
  value: string | number | boolean;
}

export interface KanvasControlDefinition {
  key: string;
  label: string;
  type: 'select' | 'number' | 'boolean';
  defaultValue?: string | number | boolean;
  options?: KanvasSelectOption[];
  min?: number;
  max?: number;
  step?: number;
}

export interface KanvasStudioModel {
  id: string;
  name: string;
  description: string;
  studio: KanvasStudio;
  mode: KanvasMode;
  mediaType: KanvasMediaType;
  workflowType: string;
  uiGroup: 'generation' | 'advanced';
  credits: number;
  requiresAssets: KanvasAssetType[];
  supportsPrompt: boolean;
  controls: KanvasControlDefinition[];
  defaults: Record<string, unknown>;
  aliases: string[];
}

export interface KanvasAssetRecord {
  id: string;
  userId: string;
  projectId: string | null;
  assetType: KanvasAssetType;
  originalFileName: string;
  url: string;
  previewUrl: string | null;
  thumbnailUrl: string | null;
  metadata: Record<string, unknown>;
}

export interface KanvasCinemaSettings {
  camera: string;
  lens: string;
  focalLength: number;
  aperture: string;
}

export interface KanvasGenerationBase {
  projectId?: string | null;
  modelId: string;
  settings?: Record<string, unknown>;
}

export interface KanvasTextToImageRequest extends KanvasGenerationBase {
  studio: 'image';
  mode: 'text-to-image';
  prompt: string;
}

export interface KanvasImageToImageRequest extends KanvasGenerationBase {
  studio: 'image';
  mode: 'image-to-image';
  prompt?: string;
  assetSelections: {
    imageIds: string[];
  };
}

export interface KanvasTextToVideoRequest extends KanvasGenerationBase {
  studio: 'video';
  mode: 'text-to-video';
  prompt: string;
}

export interface KanvasImageToVideoRequest extends KanvasGenerationBase {
  studio: 'video';
  mode: 'image-to-video';
  prompt?: string;
  assetSelections: {
    imageId: string;
  };
}

export interface KanvasCinemaRequest extends KanvasGenerationBase {
  studio: 'cinema';
  mode: 'cinematic-image';
  prompt: string;
  cinema: KanvasCinemaSettings;
}

export interface KanvasTalkingHeadRequest extends KanvasGenerationBase {
  studio: 'lipsync';
  mode: 'talking-head';
  prompt?: string;
  assetSelections: {
    imageId?: string;
    audioId: string;
  };
}

export interface KanvasLipSyncRequest extends KanvasGenerationBase {
  studio: 'lipsync';
  mode: 'lip-sync';
  prompt?: string;
  assetSelections: {
    videoId: string;
    audioId: string;
  };
}

export type KanvasGenerationRequest =
  | KanvasTextToImageRequest
  | KanvasImageToImageRequest
  | KanvasTextToVideoRequest
  | KanvasImageToVideoRequest
  | KanvasCinemaRequest
  | KanvasTalkingHeadRequest
  | KanvasLipSyncRequest;

export interface KanvasOutputFile {
  url: string;
  contentType?: string;
  fileName?: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface KanvasNormalizedResult {
  mediaType: KanvasMediaType;
  primaryUrl: string;
  previewUrl: string;
  outputs: KanvasOutputFile[];
  raw: unknown;
}

export interface KanvasQueueConfig {
  statusUrl: string | null;
  responseUrl: string | null;
}

export interface KanvasBillingConfig {
  holdId: string | null;
  skipped: boolean;
  amount: number;
}

export interface KanvasJobConfig {
  request: KanvasGenerationRequest;
  queue: KanvasQueueConfig;
  billing: KanvasBillingConfig;
}

export interface KanvasJobRecord {
  id: string;
  userId: string;
  projectId: string | null;
  studio: KanvasStudio;
  modelId: string;
  externalRequestId: string | null;
  jobType: KanvasMediaType;
  status: KanvasJobStatus;
  progress: number | null;
  resultUrl: string | null;
  errorMessage: string | null;
  config: KanvasJobConfig;
  inputAssets: string[];
  resultPayload: KanvasNormalizedResult | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface KanvasJobInsert {
  id: string;
  userId: string;
  projectId: string | null;
  studio: KanvasStudio;
  modelId: string;
  externalRequestId: string | null;
  jobType: KanvasMediaType;
  status: KanvasJobStatus;
  progress: number;
  resultUrl: string | null;
  errorMessage: string | null;
  config: KanvasJobConfig;
  inputAssets: string[];
  resultPayload: KanvasNormalizedResult | null;
  createdAt: string;
  startedAt: string | null;
  completedAt: string | null;
  updatedAt: string;
}

export interface KanvasJobUpdate {
  status?: KanvasJobStatus;
  progress?: number | null;
  resultUrl?: string | null;
  errorMessage?: string | null;
  externalRequestId?: string | null;
  resultPayload?: KanvasNormalizedResult | null;
  completedAt?: string | null;
  startedAt?: string | null;
  updatedAt: string;
  config?: KanvasJobConfig;
}

export interface KanvasJobRepository {
  getAssetById(assetId: string, userId: string): Promise<KanvasAssetRecord | null>;
  insertJob(job: KanvasJobInsert): Promise<KanvasJobRecord>;
  updateJob(jobId: string, updates: KanvasJobUpdate): Promise<KanvasJobRecord>;
  getJob(jobId: string, userId: string): Promise<KanvasJobRecord | null>;
}

export interface KanvasReservation {
  holdId: string | null;
  skipped: boolean;
}

export interface KanvasSubmitResponse {
  success: boolean;
  requestId?: string;
  statusUrl?: string | null;
  responseUrl?: string | null;
  data?: unknown;
  error?: string;
}

export interface KanvasPollResponse {
  success: boolean;
  status?: string;
  queuePosition?: number;
  result?: unknown;
  logs?: unknown[];
  error?: string;
}

export interface KanvasCreditsAdapter {
  reserve(input: {
    userId: string;
    modelId: string;
    resourceType: KanvasMediaType;
    referenceId: string;
    amount: number;
  }): Promise<KanvasReservation>;
  commit(input: {
    userId: string;
    holdId: string | null;
    skipped: boolean;
    amount: number;
    requestId: string | null;
    modelId: string;
  }): Promise<void>;
  release(input: {
    userId: string;
    holdId: string | null;
    skipped: boolean;
    amount: number;
    reason: string;
    requestId: string | null;
    modelId: string;
  }): Promise<void>;
}

export interface KanvasFalAdapter {
  submit(modelId: string, input: Record<string, unknown>): Promise<KanvasSubmitResponse>;
  poll(requestId: string, statusUrl?: string | null): Promise<KanvasPollResponse>;
  fetchResult(responseUrl: string): Promise<unknown>;
}

export interface KanvasServiceDeps {
  now(): string;
  randomId(): string;
  getCost(modelId: string, mediaType: KanvasMediaType): number;
  credits: KanvasCreditsAdapter;
  fal: KanvasFalAdapter;
}

const baseAspectRatios: KanvasSelectOption[] = [
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '1:1', value: '1:1' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
];

const imageResolutions: KanvasSelectOption[] = [
  { label: '1K', value: '1K' },
  { label: '2K', value: '2K' },
  { label: '4K', value: '4K' },
];

const videoDurations: KanvasSelectOption[] = [
  { label: '5 sec', value: 5 },
  { label: '8 sec', value: 8 },
  { label: '10 sec', value: 10 },
];

const videoResolutions: KanvasSelectOption[] = [
  { label: '480p', value: '480p' },
  { label: '720p', value: '720p' },
  { label: '1080p', value: '1080p' },
];

export const KANVAS_CAMERAS: Record<string, string> = {
  'Modular 8K Digital': 'modular 8K digital cinema camera',
  'Full-Frame Cine Digital': 'full-frame digital cinema camera',
  'Grand Format 70mm Film': 'grand format 70mm film camera',
  'Studio Digital S35': 'Super 35 studio digital camera',
  'Classic 16mm Film': 'classic 16mm film camera',
  'Premium Large Format Digital': 'premium large-format digital cinema camera',
};

export const KANVAS_LENSES: Record<string, string> = {
  'Creative Tilt Lens': 'creative tilt lens effect',
  'Compact Anamorphic': 'compact anamorphic lens',
  'Extreme Macro': 'extreme macro lens',
  '70s Cinema Prime': '1970s cinema prime lens',
  'Classic Anamorphic': 'classic anamorphic lens',
  'Premium Modern Prime': 'premium modern prime lens',
  'Warm Cinema Prime': 'warm-toned cinema prime lens',
  'Swirl Bokeh Portrait': 'swirl bokeh portrait lens',
  'Vintage Prime': 'vintage prime lens',
  'Halation Diffusion': 'halation diffusion filter',
  'Clinical Sharp Prime': 'ultra-sharp clinical prime lens',
};

const FOCAL_PERSPECTIVES: Record<number, string> = {
  8: 'ultra-wide perspective',
  14: 'wide-angle perspective',
  24: 'wide-angle dynamic perspective',
  35: 'natural cinematic perspective',
  50: 'standard portrait perspective',
  85: 'classic portrait perspective',
};

const APERTURE_EFFECTS: Record<string, string> = {
  'f/1.4': 'shallow depth of field, creamy bokeh',
  'f/4': 'balanced depth of field',
  'f/11': 'deep focus clarity, sharp foreground to background',
};

function selectControl(
  key: string,
  label: string,
  options: KanvasSelectOption[],
  defaultValue?: string | number | boolean
): KanvasControlDefinition {
  return { key, label, type: 'select', options, defaultValue };
}

function booleanControl(
  key: string,
  label: string,
  defaultValue = false
): KanvasControlDefinition {
  return { key, label, type: 'boolean', defaultValue };
}

function studioModel(input: KanvasStudioModel): KanvasStudioModel {
  return input;
}

export const KANVAS_MODELS: KanvasStudioModel[] = [
  studioModel({
    id: 'fal-ai/nano-banana-pro',
    name: 'Nano Banana Pro',
    description: 'High-fidelity text-to-image for the Image Studio.',
    studio: 'image',
    mode: 'text-to-image',
    mediaType: 'image',
    workflowType: 'text-to-image',
    uiGroup: 'generation',
    credits: 7,
    requiresAssets: [],
    supportsPrompt: true,
    controls: [
      selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9'),
      selectControl('resolution', 'Resolution', imageResolutions, '2K'),
    ],
    defaults: { aspect_ratio: '16:9', resolution: '2K', output_format: 'png', num_images: 1 },
    aliases: ['nano-banana-2', 'google/gemini-2.5-flash-image'],
  }),
  studioModel({
    id: 'fal-ai/qwen-image-2/text-to-image',
    name: 'Qwen Image 2',
    description: 'Balanced text-to-image for stylized and realistic scenes.',
    studio: 'image',
    mode: 'text-to-image',
    mediaType: 'image',
    workflowType: 'text-to-image',
    uiGroup: 'generation',
    credits: 5,
    requiresAssets: [],
    supportsPrompt: true,
    controls: [selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9')],
    defaults: { aspect_ratio: '16:9', output_format: 'png', num_images: 1 },
    aliases: ['qwen-image-2'],
  }),
  studioModel({
    id: 'fal-ai/ideogram/v3',
    name: 'Ideogram V3',
    description: 'Typography-friendly text-to-image generation.',
    studio: 'image',
    mode: 'text-to-image',
    mediaType: 'image',
    workflowType: 'text-to-image',
    uiGroup: 'generation',
    credits: 5,
    requiresAssets: [],
    supportsPrompt: true,
    controls: [selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9')],
    defaults: { aspect_ratio: '16:9' },
    aliases: ['ideogram-v3'],
  }),
  studioModel({
    id: 'fal-ai/nano-banana-pro/edit',
    name: 'Nano Banana Pro Edit',
    description: 'Natural-language multi-image editing.',
    studio: 'image',
    mode: 'image-to-image',
    mediaType: 'image',
    workflowType: 'image-edit',
    uiGroup: 'advanced',
    credits: 8,
    requiresAssets: ['image'],
    supportsPrompt: true,
    controls: [
      selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9'),
      selectControl('resolution', 'Resolution', imageResolutions, '2K'),
    ],
    defaults: { aspect_ratio: '16:9', resolution: '2K', output_format: 'png' },
    aliases: ['nano-banana-edit', 'flux-kontext-pro-i2i'],
  }),
  studioModel({
    id: 'fal-ai/qwen-image-2/edit',
    name: 'Qwen Image 2 Edit',
    description: 'Prompt-guided image transformations.',
    studio: 'image',
    mode: 'image-to-image',
    mediaType: 'image',
    workflowType: 'image-edit',
    uiGroup: 'advanced',
    credits: 6,
    requiresAssets: ['image'],
    supportsPrompt: true,
    controls: [selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9')],
    defaults: { aspect_ratio: '16:9', output_format: 'png' },
    aliases: ['gpt4o-image-to-image'],
  }),
  studioModel({
    id: 'fal-ai/seedream/v4.5/edit',
    name: 'Seedream 4.5 Edit',
    description: 'Edit-first image workflow with strong style transfer.',
    studio: 'image',
    mode: 'image-to-image',
    mediaType: 'image',
    workflowType: 'image-edit',
    uiGroup: 'advanced',
    credits: 6,
    requiresAssets: ['image'],
    supportsPrompt: true,
    controls: [selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9')],
    defaults: { aspect_ratio: '16:9' },
    aliases: ['seedream-5.0-edit'],
  }),
  studioModel({
    id: 'fal-ai/kling-video/o3/standard/text-to-video',
    name: 'Kling O3 Standard',
    description: 'Fast text-to-video generation.',
    studio: 'video',
    mode: 'text-to-video',
    mediaType: 'video',
    workflowType: 'text-to-video',
    uiGroup: 'generation',
    credits: 20,
    requiresAssets: [],
    supportsPrompt: true,
    controls: [
      selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9'),
      selectControl('duration', 'Duration', videoDurations, 5),
      booleanControl('generate_audio', 'Generate Audio', true),
    ],
    defaults: { aspect_ratio: '16:9', duration: '5', generate_audio: true },
    aliases: ['kling-2-1', 'kling-v3.0-standard-text-to-video'],
  }),
  studioModel({
    id: 'fal-ai/sora-2/text-to-video',
    name: 'Sora 2',
    description: 'Higher-fidelity text-to-video generation.',
    studio: 'video',
    mode: 'text-to-video',
    mediaType: 'video',
    workflowType: 'text-to-video',
    uiGroup: 'generation',
    credits: 35,
    requiresAssets: [],
    supportsPrompt: true,
    controls: [selectControl('duration_seconds', 'Duration', videoDurations, 5)],
    defaults: { duration_seconds: 5 },
    aliases: ['openai-sora-2-text-to-video'],
  }),
  studioModel({
    id: 'fal-ai/bytedance/seedance/v1/pro/text-to-video',
    name: 'Seedance Pro',
    description: 'Quality-first cinematic text-to-video generation.',
    studio: 'video',
    mode: 'text-to-video',
    mediaType: 'video',
    workflowType: 'text-to-video',
    uiGroup: 'generation',
    credits: 30,
    requiresAssets: [],
    supportsPrompt: true,
    controls: [selectControl('duration_seconds', 'Duration', videoDurations, 5)],
    defaults: { duration_seconds: 5 },
    aliases: ['seedance-v2.0-t2v', 'seedance-pro-t2v'],
  }),
  studioModel({
    id: 'fal-ai/kling-video/o3/standard/image-to-video',
    name: 'Kling O3 Standard I2V',
    description: 'Image-to-video with stable motion.',
    studio: 'video',
    mode: 'image-to-video',
    mediaType: 'video',
    workflowType: 'image-to-video',
    uiGroup: 'generation',
    credits: 24,
    requiresAssets: ['image'],
    supportsPrompt: true,
    controls: [
      selectControl('duration', 'Duration', videoDurations, 5),
      booleanControl('generate_audio', 'Generate Audio', false),
    ],
    defaults: { duration: '5', generate_audio: false },
    aliases: ['kling-o3-image-to-video'],
  }),
  studioModel({
    id: 'fal-ai/kling-video/v3/pro/image-to-video',
    name: 'Kling 3.0 Pro I2V',
    description: 'Cinematic image-to-video generation.',
    studio: 'video',
    mode: 'image-to-video',
    mediaType: 'video',
    workflowType: 'image-to-video',
    uiGroup: 'generation',
    credits: 30,
    requiresAssets: ['image'],
    supportsPrompt: true,
    controls: [
      selectControl('duration_seconds', 'Duration', videoDurations, 5),
      selectControl('fps', 'FPS', [
        { label: '24', value: 24 },
        { label: '30', value: 30 },
      ], 24),
      booleanControl('generate_audio', 'Generate Audio', true),
    ],
    defaults: { duration_seconds: 5, fps: 24, generate_audio: true },
    aliases: ['kling-v3.0-pro-image-to-video'],
  }),
  studioModel({
    id: 'fal-ai/bytedance/seedance/v1/pro/image-to-video',
    name: 'Seedance Pro I2V',
    description: 'High-fidelity image-to-video with strong motion consistency.',
    studio: 'video',
    mode: 'image-to-video',
    mediaType: 'video',
    workflowType: 'image-to-video',
    uiGroup: 'generation',
    credits: 32,
    requiresAssets: ['image'],
    supportsPrompt: false,
    controls: [selectControl('duration_seconds', 'Duration', videoDurations, 5)],
    defaults: { duration_seconds: 5 },
    aliases: ['seedance-v2.0-i2v'],
  }),
  studioModel({
    id: 'fal-ai/nano-banana-pro',
    name: 'Nano Banana Pro Cinema',
    description: 'Curated cinematic still generation.',
    studio: 'cinema',
    mode: 'cinematic-image',
    mediaType: 'image',
    workflowType: 'text-to-image',
    uiGroup: 'generation',
    credits: 7,
    requiresAssets: [],
    supportsPrompt: true,
    controls: [
      selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9'),
      selectControl('resolution', 'Resolution', imageResolutions, '2K'),
    ],
    defaults: { aspect_ratio: '16:9', resolution: '2K', output_format: 'png' },
    aliases: ['cinema-nano-banana'],
  }),
  studioModel({
    id: 'fal-ai/qwen-image-2/text-to-image',
    name: 'Qwen Cinema',
    description: 'Cinematic still generation with strong prompt adherence.',
    studio: 'cinema',
    mode: 'cinematic-image',
    mediaType: 'image',
    workflowType: 'text-to-image',
    uiGroup: 'generation',
    credits: 5,
    requiresAssets: [],
    supportsPrompt: true,
    controls: [selectControl('aspect_ratio', 'Aspect Ratio', baseAspectRatios, '16:9')],
    defaults: { aspect_ratio: '16:9', output_format: 'png' },
    aliases: ['cinema-qwen'],
  }),
  studioModel({
    id: 'veed/fabric-1.0',
    name: 'VEED Fabric 1.0',
    description: 'Turn a portrait and audio track into a talking video.',
    studio: 'lipsync',
    mode: 'talking-head',
    mediaType: 'video',
    workflowType: 'image-to-video',
    uiGroup: 'advanced',
    credits: 20,
    requiresAssets: ['image', 'audio'],
    supportsPrompt: false,
    controls: [selectControl('resolution', 'Resolution', videoResolutions.slice(0, 2), '720p')],
    defaults: { resolution: '720p' },
    aliases: ['VEED/fabric-1.0'],
  }),
  studioModel({
    id: 'fal-ai/creatify/aurora',
    name: 'Creatify Aurora',
    description: 'Studio-quality avatar speaking video generation.',
    studio: 'lipsync',
    mode: 'talking-head',
    mediaType: 'video',
    workflowType: 'image-to-video',
    uiGroup: 'advanced',
    credits: 20,
    requiresAssets: ['image', 'audio'],
    supportsPrompt: true,
    controls: [selectControl('resolution', 'Resolution', videoResolutions.slice(0, 2), '720p')],
    defaults: { resolution: '720p', guidance_scale: 1, audio_guidance_scale: 2 },
    aliases: ['creatify-aurora'],
  }),
  studioModel({
    id: 'fal-ai/wan/v2.2-14b/speech-to-video',
    name: 'Wan 2.2 Speech to Video',
    description: 'Speech-driven portrait animation with expressive motion.',
    studio: 'lipsync',
    mode: 'talking-head',
    mediaType: 'video',
    workflowType: 'audio-to-video',
    uiGroup: 'advanced',
    credits: 20,
    requiresAssets: ['image', 'audio'],
    supportsPrompt: true,
    controls: [
      selectControl('fps', 'FPS', [
        { label: '16', value: 16 },
        { label: '24', value: 24 },
      ], 16),
    ],
    defaults: { fps: 16, num_frames: 81 },
    aliases: ['wan2.2-speech-to-video'],
  }),
  studioModel({
    id: 'fal-ai/ltx-2.3/audio-to-video',
    name: 'LTX-2.3 Audio to Video',
    description: 'Generate visuals that follow an audio performance.',
    studio: 'lipsync',
    mode: 'talking-head',
    mediaType: 'video',
    workflowType: 'audio-to-video',
    uiGroup: 'advanced',
    credits: 20,
    requiresAssets: ['audio'],
    supportsPrompt: true,
    controls: [
      selectControl('resolution', 'Resolution', videoResolutions.slice(0, 2), '720p'),
      selectControl('fps', 'FPS', [
        { label: '24', value: 24 },
        { label: '48', value: 48 },
      ], 24),
    ],
    defaults: { resolution: '720p', fps: 24 },
    aliases: ['ltx-2.3-lipsync'],
  }),
  studioModel({
    id: 'fal-ai/sync-lipsync/v2',
    name: 'Sync Lipsync 2.0',
    description: 'Frame-accurate video lip sync from audio.',
    studio: 'lipsync',
    mode: 'lip-sync',
    mediaType: 'video',
    workflowType: 'video-to-video',
    uiGroup: 'advanced',
    credits: 20,
    requiresAssets: ['video', 'audio'],
    supportsPrompt: false,
    controls: [],
    defaults: { model: 'lipsync-2' },
    aliases: ['sync-lipsync', 'sync-lipsync-2'],
  }),
  studioModel({
    id: 'fal-ai/latentsync',
    name: 'LatentSync',
    description: 'Advanced audio-driven lip sync for existing video.',
    studio: 'lipsync',
    mode: 'lip-sync',
    mediaType: 'video',
    workflowType: 'video-to-video',
    uiGroup: 'advanced',
    credits: 20,
    requiresAssets: ['video', 'audio'],
    supportsPrompt: false,
    controls: [],
    defaults: {},
    aliases: ['latent-sync'],
  }),
];

function hasProperty(value: unknown, key: string): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && key in value);
}

function extractString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function extractNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function resolveCanonicalModel(model: KanvasStudioModel, canonicalModel?: CanonicalFalModel): KanvasStudioModel {
  if (!canonicalModel) {
    return model;
  }

  return {
    ...model,
    defaults: { ...canonicalModel.defaults, ...model.defaults },
  };
}

export function listKanvasModels(input?: {
  studio?: KanvasStudio;
  mode?: KanvasMode;
  canonicalModels?: Map<string, CanonicalFalModel>;
}): KanvasStudioModel[] {
  const canonicalMap = input?.canonicalModels;
  return KANVAS_MODELS
    .filter((model) => !input?.studio || model.studio === input.studio)
    .filter((model) => !input?.mode || model.mode === input.mode)
    .map((model) => resolveCanonicalModel(model, canonicalMap?.get(model.id)));
}

export function getKanvasModelById(
  modelId: string,
  canonicalModels?: Map<string, CanonicalFalModel>
): KanvasStudioModel | null {
  const normalizedId = normalizeKanvasModelId(modelId);
  const match = KANVAS_MODELS.find((model) => model.id === normalizedId);
  if (!match) {
    return null;
  }
  return resolveCanonicalModel(match, canonicalModels?.get(match.id));
}

export function normalizeKanvasModelId(modelId: string): string {
  const trimmed = modelId.trim();
  if (!trimmed) return trimmed;

  const direct = KANVAS_MODELS.find((model) => model.id === trimmed);
  if (direct) return direct.id;

  const alias = KANVAS_MODELS.find((model) => model.aliases.includes(trimmed));
  return alias?.id ?? trimmed;
}

export function buildCinemaPrompt(prompt: string, cinema: KanvasCinemaSettings): string {
  const camera = KANVAS_CAMERAS[cinema.camera] ?? cinema.camera;
  const lens = KANVAS_LENSES[cinema.lens] ?? cinema.lens;
  const perspective = FOCAL_PERSPECTIVES[cinema.focalLength] ?? '';
  const aperture = APERTURE_EFFECTS[cinema.aperture] ?? '';

  return [
    prompt,
    `shot on a ${camera}`,
    `using a ${lens} at ${cinema.focalLength}mm${perspective ? ` (${perspective})` : ''}`,
    `aperture ${cinema.aperture}`,
    aperture,
    'cinematic lighting',
    'natural color science',
    'high dynamic range',
    'professional photography, ultra-detailed, 8K resolution',
  ]
    .filter((part) => part.trim().length > 0)
    .join(', ');
}

export function collectAssetIds(request: KanvasGenerationRequest): string[] {
  switch (request.mode) {
    case 'image-to-image':
      return request.assetSelections.imageIds;
    case 'image-to-video':
      return [request.assetSelections.imageId];
    case 'talking-head':
      return [request.assetSelections.audioId, request.assetSelections.imageId]
        .filter((assetId): assetId is string => typeof assetId === 'string' && assetId.length > 0);
    case 'lip-sync':
      return [request.assetSelections.videoId, request.assetSelections.audioId];
    default:
      return [];
  }
}

export async function resolveAssetsForRequest(
  request: KanvasGenerationRequest,
  userId: string,
  repository: KanvasJobRepository
): Promise<KanvasAssetRecord[]> {
  const assetIds = collectAssetIds(request);
  const assets: KanvasAssetRecord[] = [];

  for (const assetId of assetIds) {
    const asset = await repository.getAssetById(assetId, userId);
    if (!asset) {
      throw new Error(`Asset ${assetId} was not found or is not accessible.`);
    }
    assets.push(asset);
  }

  return assets;
}

function findFirstAsset(assets: KanvasAssetRecord[], type: KanvasAssetType): KanvasAssetRecord | null {
  return assets.find((asset) => asset.assetType === type) ?? null;
}

function findAllAssets(assets: KanvasAssetRecord[], type: KanvasAssetType): KanvasAssetRecord[] {
  return assets.filter((asset) => asset.assetType === type);
}

export function buildFalInput(
  request: KanvasGenerationRequest,
  model: KanvasStudioModel,
  assets: KanvasAssetRecord[]
): Record<string, unknown> {
  const input: Record<string, unknown> = {
    ...model.defaults,
    ...(request.settings ?? {}),
  };

  if (request.studio === 'cinema') {
    input.prompt = buildCinemaPrompt(request.prompt, request.cinema);
  } else if ('prompt' in request && request.prompt) {
    input.prompt = request.prompt;
  }

  switch (request.mode) {
    case 'image-to-image': {
      const imageUrls = findAllAssets(assets, 'image').map((asset) => asset.url);
      input.image_urls = imageUrls;
      break;
    }
    case 'image-to-video': {
      const imageAsset = findFirstAsset(assets, 'image');
      if (!imageAsset) {
        throw new Error('Image-to-video requests require a reference image.');
      }
      input.image_url = imageAsset.url;
      break;
    }
    case 'talking-head': {
      const audioAsset = findFirstAsset(assets, 'audio');
      const imageAsset = findFirstAsset(assets, 'image');

      if (!audioAsset) {
        throw new Error('Talking-head requests require an audio file.');
      }

      if (model.requiresAssets.includes('image') && !imageAsset) {
        throw new Error('The selected talking-head model requires a portrait image.');
      }

      if (imageAsset) {
        input.image_url = imageAsset.url;
      }
      input.audio_url = audioAsset.url;
      break;
    }
    case 'lip-sync': {
      const videoAsset = findFirstAsset(assets, 'video');
      const audioAsset = findFirstAsset(assets, 'audio');
      if (!videoAsset || !audioAsset) {
        throw new Error('Lip-sync requests require a video and audio file.');
      }
      input.video_url = videoAsset.url;
      input.audio_url = audioAsset.url;
      break;
    }
    default:
      break;
  }

  if (model.id === 'fal-ai/wan/v2.2-14b/speech-to-video' && input.num_frames === undefined) {
    input.num_frames = 81;
  }

  return input;
}

export function normalizeKanvasResult(result: unknown, mediaType: KanvasMediaType): KanvasNormalizedResult {
  const outputs: KanvasOutputFile[] = [];

  if (hasProperty(result, 'images') && Array.isArray(result.images)) {
    for (const image of result.images) {
      if (!hasProperty(image, 'url')) continue;
      const url = extractString(image.url);
      if (!url) continue;
      outputs.push({
        url,
        contentType: extractString(hasProperty(image, 'content_type') ? image.content_type : undefined) ?? undefined,
        fileName: extractString(hasProperty(image, 'file_name') ? image.file_name : undefined) ?? undefined,
        width: extractNumber(hasProperty(image, 'width') ? image.width : undefined),
        height: extractNumber(hasProperty(image, 'height') ? image.height : undefined),
      });
    }
  }

  if (hasProperty(result, 'video') && hasProperty(result.video, 'url')) {
    const url = extractString(result.video.url);
    if (url) {
      outputs.push({
        url,
        contentType: extractString(hasProperty(result.video, 'content_type') ? result.video.content_type : undefined) ?? undefined,
        fileName: extractString(hasProperty(result.video, 'file_name') ? result.video.file_name : undefined) ?? undefined,
        width: extractNumber(hasProperty(result.video, 'width') ? result.video.width : undefined),
        height: extractNumber(hasProperty(result.video, 'height') ? result.video.height : undefined),
        duration: extractNumber(hasProperty(result.video, 'duration') ? result.video.duration : undefined),
      });
    }
  }

  if (hasProperty(result, 'image') && hasProperty(result.image, 'url')) {
    const url = extractString(result.image.url);
    if (url) {
      outputs.push({
        url,
        contentType: extractString(hasProperty(result.image, 'content_type') ? result.image.content_type : undefined) ?? undefined,
        fileName: extractString(hasProperty(result.image, 'file_name') ? result.image.file_name : undefined) ?? undefined,
      });
    }
  }

  if (outputs.length === 0 && hasProperty(result, 'url')) {
    const url = extractString(result.url);
    if (url) {
      outputs.push({ url });
    }
  }

  const primary = outputs[0];
  if (!primary) {
    throw new Error('Fal result did not contain a usable output URL.');
  }

  return {
    mediaType,
    primaryUrl: primary.url,
    previewUrl: primary.url,
    outputs,
    raw: result,
  };
}

function assertAuthenticatedUser(userId: string): void {
  if (!userId) {
    throw new Error('Authenticated user is required.');
  }
}

export async function submitKanvasJob(
  request: KanvasGenerationRequest,
  userId: string,
  repository: KanvasJobRepository,
  deps: KanvasServiceDeps
): Promise<KanvasJobRecord> {
  assertAuthenticatedUser(userId);

  const model = getKanvasModelById(request.modelId);
  if (!model || model.studio !== request.studio || model.mode !== request.mode) {
    throw new Error(`Unmapped model: ${request.modelId}`);
  }

  const assets = await resolveAssetsForRequest(request, userId, repository);
  const input = buildFalInput(request, model, assets);
  const now = deps.now();
  const jobId = deps.randomId();
  const cost = deps.getCost(model.id, model.mediaType);
  const reservation = await deps.credits.reserve({
    userId,
    modelId: model.id,
    resourceType: model.mediaType,
    referenceId: jobId,
    amount: cost,
  });

  const submission = await deps.fal.submit(model.id, input);
  if (!submission.success) {
    await deps.credits.release({
      userId,
      holdId: reservation.holdId,
      skipped: reservation.skipped,
      amount: cost,
      reason: 'submission_failed',
      requestId: null,
      modelId: model.id,
    });
    throw new Error(submission.error || 'Fal submission failed.');
  }

  const config: KanvasJobConfig = {
    request,
    queue: {
      statusUrl: submission.statusUrl ?? null,
      responseUrl: submission.responseUrl ?? null,
    },
    billing: {
      holdId: reservation.holdId,
      skipped: reservation.skipped,
      amount: cost,
    },
  };

  if (!submission.requestId && submission.data) {
    const result = normalizeKanvasResult(submission.data, model.mediaType);
    const completed = await repository.insertJob({
      id: jobId,
      userId,
      projectId: request.projectId ?? null,
      studio: request.studio,
      modelId: model.id,
      externalRequestId: null,
      jobType: model.mediaType,
      status: 'completed',
      progress: 100,
      resultUrl: result.primaryUrl,
      errorMessage: null,
      config,
      inputAssets: assets.map((asset) => asset.id),
      resultPayload: result,
      createdAt: now,
      startedAt: now,
      completedAt: now,
      updatedAt: now,
    });
    await deps.credits.commit({
      userId,
      holdId: reservation.holdId,
      skipped: reservation.skipped,
      amount: cost,
      requestId: null,
      modelId: model.id,
    });
    return completed;
  }

  return await repository.insertJob({
    id: jobId,
    userId,
    projectId: request.projectId ?? null,
    studio: request.studio,
    modelId: model.id,
    externalRequestId: submission.requestId ?? null,
    jobType: model.mediaType,
    status: 'queued',
    progress: 5,
    resultUrl: null,
    errorMessage: null,
    config,
    inputAssets: assets.map((asset) => asset.id),
    resultPayload: null,
    createdAt: now,
    startedAt: now,
    completedAt: null,
    updatedAt: now,
  });
}

export async function refreshKanvasJob(
  jobId: string,
  userId: string,
  repository: KanvasJobRepository,
  deps: KanvasServiceDeps
): Promise<KanvasJobRecord> {
  assertAuthenticatedUser(userId);

  const job = await repository.getJob(jobId, userId);
  if (!job) {
    throw new Error('Kanvas job not found.');
  }

  if (job.status === 'completed' || job.status === 'failed' || job.status === 'cancelled') {
    return job;
  }

  if (!job.externalRequestId) {
    throw new Error('Kanvas job is missing its Fal request ID.');
  }

  const polled = await deps.fal.poll(job.externalRequestId, job.config.queue.statusUrl);
  if (!polled.success) {
    const now = deps.now();
    const failed = await repository.updateJob(job.id, {
      status: 'failed',
      progress: 100,
      errorMessage: polled.error || 'Failed to refresh Kanvas job.',
      updatedAt: now,
      completedAt: now,
    });
    await deps.credits.release({
      userId,
      holdId: job.config.billing.holdId,
      skipped: job.config.billing.skipped,
      amount: job.config.billing.amount,
      reason: 'poll_failed',
      requestId: job.externalRequestId,
      modelId: job.modelId,
    });
    return failed;
  }

  const now = deps.now();
  const status = polled.status ?? 'IN_PROGRESS';
  if (status === 'COMPLETED') {
    const rawResult =
      job.config.queue.responseUrl
        ? await deps.fal.fetchResult(job.config.queue.responseUrl)
        : polled.result;
    const result = normalizeKanvasResult(rawResult, job.jobType);
    const updated = await repository.updateJob(job.id, {
      status: 'completed',
      progress: 100,
      resultUrl: result.primaryUrl,
      errorMessage: null,
      resultPayload: result,
      completedAt: now,
      updatedAt: now,
    });
    await deps.credits.commit({
      userId,
      holdId: job.config.billing.holdId,
      skipped: job.config.billing.skipped,
      amount: job.config.billing.amount,
      requestId: job.externalRequestId,
      modelId: job.modelId,
    });
    return updated;
  }

  if (status === 'FAILED') {
    const failed = await repository.updateJob(job.id, {
      status: 'failed',
      progress: 100,
      errorMessage: polled.error || 'Fal job failed.',
      updatedAt: now,
      completedAt: now,
    });
    await deps.credits.release({
      userId,
      holdId: job.config.billing.holdId,
      skipped: job.config.billing.skipped,
      amount: job.config.billing.amount,
      reason: 'job_failed',
      requestId: job.externalRequestId,
      modelId: job.modelId,
    });
    return failed;
  }

  const nextProgress = typeof polled.queuePosition === 'number'
    ? Math.max(10, 35 - polled.queuePosition)
    : 55;

  return await repository.updateJob(job.id, {
    status: 'processing',
    progress: nextProgress,
    errorMessage: null,
    updatedAt: now,
  });
}
