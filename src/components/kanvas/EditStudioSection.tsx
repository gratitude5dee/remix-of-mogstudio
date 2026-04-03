import { useState, useMemo } from 'react';
import {
  Paintbrush, Wand2, Eraser, ZoomIn, Plus, Sparkles, Loader2, Upload,
  Video, Sun, Palette, ArrowUpCircle, ScanFace, RotateCcw, Hand, Undo2, Redo2,
  Download, MoreHorizontal, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { imageEditService } from '@/services/imageEditService';
import type { ImageEditOperation } from '@/types/imageEdit';
import type { KanvasAsset, KanvasJob, KanvasAssetType } from '@/features/kanvas/types';

/* ── Types ── */
type EditFeature = 'inpaint' | 'removeBackground' | 'upscale' | 'relight' | 'stylize' | 'skinEnhance' | 'angles' | 'productPlacement';

interface FeatureItem {
  id: EditFeature;
  label: string;
  description: string;
  icon: React.ElementType;
  operation: ImageEditOperation | null;
  badge?: 'TOP' | 'NEW' | 'SOON';
}

interface EditModelItem {
  id: string;
  name: string;
  badge?: 'TOP' | 'NEW';
  credits: number;
}

/* ── Data ── */
const FEATURES: FeatureItem[] = [
  { id: 'inpaint', label: 'Inpaint', description: 'Fill, replace, or extend regions with AI.', icon: Paintbrush, operation: 'inpaint', badge: 'TOP' },
  { id: 'removeBackground', label: 'Remove BG', description: 'Isolate subjects with precision cutouts.', icon: Wand2, operation: 'removeBackground' },
  { id: 'upscale', label: 'Upscale', description: 'Enhance resolution up to 4x with AI.', icon: ArrowUpCircle, operation: 'upscale' as ImageEditOperation },
  { id: 'relight', label: 'Relight', description: 'Change lighting direction and mood.', icon: Sun, operation: null, badge: 'NEW' },
  { id: 'stylize', label: 'AI Stylist', description: 'Apply artistic styles and transformations.', icon: Palette, operation: null, badge: 'SOON' },
  { id: 'skinEnhance', label: 'Skin Enhancer', description: 'Professional skin retouching.', icon: ScanFace, operation: null, badge: 'SOON' },
  { id: 'angles', label: 'Angles', description: 'Generate alternate viewpoints.', icon: RotateCcw, operation: null, badge: 'SOON' },
  { id: 'productPlacement', label: 'Product Placement', description: 'Embed products into scenes naturally.', icon: Video, operation: 'productPlacement' as ImageEditOperation },
];

const EDIT_MODELS: EditModelItem[] = [
  { id: 'fal-ai/nano-banana-pro/edit', name: 'Nano Banana Pro Inpaint', badge: 'TOP', credits: 8 },
  { id: 'fal-ai/nano-banana-2/edit', name: 'Nano Banana Inpaint', credits: 5 },
  { id: 'fal-ai/flux-pro/v1/fill', name: 'FLUX Pro Fill', badge: 'TOP', credits: 7 },
  { id: 'fal-ai/gpt-image-1-5/edit', name: 'GPT Image 1.5 Edit', credits: 4 },
  { id: 'fal-ai/grok-imagine/edit', name: 'Grok Imagine Edit', credits: 5 },
  { id: 'fal-ai/seedream-5-lite/edit', name: 'Seedream 5 Edit', badge: 'NEW', credits: 6 },
  { id: 'fal-ai/seedvr/upscale/image/seamless', name: 'Topaz Upscale', credits: 3 },
  { id: 'bria/embed-product', name: 'Product Placement', credits: 6 },
];

const FEATURE_IMAGES: Record<string, string> = {
  inpaint: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&q=80&auto=format',
  removeBackground: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&auto=format',
  upscale: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80&auto=format',
  relight: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80&auto=format',
  stylize: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80&auto=format',
  skinEnhance: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800&q=80&auto=format',
  angles: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80&auto=format',
  productPlacement: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80&auto=format',
};

/* ── Helpers ── */
function resolveAssetUrl(asset: KanvasAsset): string | null {
  return asset.cdn_url ?? asset.preview_url ?? asset.thumbnail_url;
}
function resolveAssetThumb(asset: KanvasAsset): string | null {
  return asset.thumbnail_url ?? asset.preview_url ?? asset.cdn_url;
}

/* ── Props ── */
interface EditStudioProps {
  assets: KanvasAsset[];
  jobs: KanvasJob[];
  selectedJob: KanvasJob | null;
  uploading: boolean;
  onUpload: (file: File, assetType: KanvasAssetType) => void;
}

type CanvasTool = 'brush' | 'eraser' | 'hand' | 'undo' | 'redo';

export default function EditStudioSection({ assets, jobs, selectedJob, uploading, onUpload }: EditStudioProps) {
  const [selectedFeature, setSelectedFeature] = useState<EditFeature>('inpaint');
  const [selectedModelId, setSelectedModelId] = useState(EDIT_MODELS[0].id);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<CanvasTool>('brush');
  const [inpaintPrompt, setInpaintPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImages, setResultImages] = useState<string[]>([]);
  const [resultIndex, setResultIndex] = useState(0);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? null,
    [assets, selectedAssetId]
  );

  const activeFeature = FEATURES.find((f) => f.id === selectedFeature)!;
  const hasWorkspace = selectedAsset !== null;
  const canvasImageUrl = resultImages[resultIndex] ?? (selectedAsset ? resolveAssetUrl(selectedAsset) : null);

  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === 'completed' && j.resultUrl),
    [jobs]
  );

  function handleUploadClick() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onUpload(file, 'image');
    };
    input.click();
  }

  async function handleGenerate() {
    if (!selectedAsset) {
      toast.error('Select an asset first');
      return;
    }
    const imageUrl = resolveAssetUrl(selectedAsset);
    if (!imageUrl) {
      toast.error('Asset has no accessible URL');
      return;
    }
    const operation = activeFeature.operation;
    if (!operation) {
      toast.info(`${activeFeature.label} coming soon`);
      return;
    }
    if (operation === 'inpaint' && !inpaintPrompt.trim()) {
      toast.error('Enter a prompt for inpainting');
      return;
    }

    setIsProcessing(true);
    try {
      const result = await imageEditService.executeOperation({
        projectId: selectedAsset.project_id ?? selectedAsset.id,
        nodeId: selectedAsset.id,
        operation,
        prompt: operation === 'inpaint' ? inpaintPrompt : undefined,
        imageUrl,
        modelId: selectedModelId,
      });

      if (result.asset?.url) {
        setResultImages((prev) => [...prev, result.asset!.url]);
        setResultIndex(resultImages.length);
        toast.success(`${activeFeature.label} complete`);
      } else if (result.layers && result.layers.length > 0) {
        const urls = result.layers.map((l: { url: string }) => l.url);
        setResultImages((prev) => [...prev, ...urls]);
        setResultIndex(resultImages.length);
        toast.success(`Split into ${result.layers.length} layers`);
      } else {
        toast.error('No result returned');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Operation failed');
    } finally {
      setIsProcessing(false);
    }
  }

  /* ── LANDING STATE ── */
  if (!hasWorkspace) {
    return (
      <div className="fixed inset-0 top-[80px] bg-[#090909] z-20 overflow-hidden flex" style={{ scrollbarWidth: 'none' }}>
        <style>{`::-webkit-scrollbar { display: none; }`}</style>

        {/* Left: Feature + Model Browser */}
        <div className="flex w-[560px] flex-shrink-0 h-full">
          {/* Features Column */}
          <div className="w-[280px] h-full bg-[#0e0e0e] border-r border-white/[0.06] overflow-y-auto p-6" style={{ scrollbarWidth: 'none' }}>
            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Features</p>
            <div className="flex flex-col gap-1">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;
                const isActive = selectedFeature === feature.id;
                return (
                  <button
                    key={feature.id}
                    onClick={() => setSelectedFeature(feature.id)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[#1a1a1a] border border-[#ccff00]/20 shadow-[0_0_20px_rgba(204,255,0,0.05)]'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <Icon className={`h-4 w-4 flex-shrink-0 ${isActive ? 'text-[#ccff00]' : 'text-zinc-500'}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-semibold ${isActive ? 'text-white' : 'text-zinc-400'}`}>{feature.label}</span>
                        {feature.badge && (
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${
                            feature.badge === 'TOP' ? 'bg-red-500/20 text-red-400' :
                            feature.badge === 'NEW' ? 'bg-[#ccff00]/20 text-[#ccff00]' :
                            'bg-zinc-700/50 text-zinc-500'
                          }`}>{feature.badge}</span>
                        )}
                      </div>
                      <p className="text-[10px] text-zinc-600 mt-0.5 leading-tight">{feature.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Models Column */}
          <div className="w-[280px] h-full bg-[#0b0b0b] border-r border-white/[0.06] overflow-y-auto p-6" style={{ scrollbarWidth: 'none' }}>
            <p className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Models</p>
            <div className="flex flex-col gap-1">
              {EDIT_MODELS.map((model) => {
                const isActive = selectedModelId === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => setSelectedModelId(model.id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                      isActive
                        ? 'bg-[#1a1a1a] border border-[#ccff00]/20'
                        : 'hover:bg-white/[0.03] border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`text-xs font-medium truncate ${isActive ? 'text-white' : 'text-zinc-400'}`}>{model.name}</span>
                      {model.badge && (
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${
                          model.badge === 'TOP' ? 'bg-red-500/20 text-red-400' : 'bg-[#ccff00]/20 text-[#ccff00]'
                        }`}>{model.badge}</span>
                      )}
                    </div>
                    <span className="text-[10px] text-zinc-600 flex-shrink-0">{model.credits}cr</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Feature Preview */}
        <div className="flex-1 h-full flex items-center justify-center bg-[#090909] relative overflow-hidden">
          {/* Faint watermark */}
          <span className="absolute -top-10 left-10 text-[180px] font-black text-white/[0.015] pointer-events-none select-none uppercase leading-none" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            EDIT
          </span>

          <div className="relative z-10 flex flex-col items-center max-w-lg text-center">
            <div className="w-[400px] h-[260px] rounded-2xl overflow-hidden mb-8 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
              <img
                src={FEATURE_IMAGES[selectedFeature] || FEATURE_IMAGES.inpaint}
                alt={activeFeature.label}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>

            <p className="text-[10px] uppercase tracking-[0.2em] text-[#ccff00] font-bold mb-2">{activeFeature.badge || 'FEATURE'}</p>
            <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {activeFeature.label}
            </h2>
            <p className="text-sm text-zinc-500 mb-8 max-w-sm">{activeFeature.description}</p>

            <button
              onClick={handleUploadClick}
              disabled={uploading}
              className="bg-[#ccff00] text-black font-bold uppercase tracking-widest text-[11px] px-8 py-3.5 rounded-full flex items-center gap-2 hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {uploading ? 'Uploading…' : 'Upload media'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* ── ACTIVE WORKSPACE ── */
  const TOOLS: { id: CanvasTool; icon: React.ElementType; label: string }[] = [
    { id: 'brush', icon: Paintbrush, label: 'Brush' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'hand', icon: Hand, label: 'Hand' },
    { id: 'undo', icon: Undo2, label: 'Undo' },
    { id: 'redo', icon: Redo2, label: 'Redo' },
  ];

  return (
    <div className="fixed inset-0 top-[80px] bg-[#090909] z-20 overflow-hidden flex" style={{ scrollbarWidth: 'none' }}>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>

      {/* Left: Thumbnail Rail */}
      <div className="w-[72px] flex-shrink-0 h-full bg-[#0a0a0a] border-r border-white/[0.06] flex flex-col items-center py-4 gap-2 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={handleUploadClick}
          disabled={uploading}
          className="w-12 h-12 rounded-xl bg-[#1a1a1a] border border-dashed border-[#ccff00]/30 flex items-center justify-center text-[#ccff00] hover:bg-[#1f1f1f] transition-colors flex-shrink-0"
        >
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
        </button>

        {assets.map((asset) => {
          const thumb = resolveAssetThumb(asset);
          const isActive = selectedAssetId === asset.id;
          return (
            <button
              key={asset.id}
              onClick={() => { setSelectedAssetId(asset.id); setResultImages([]); setResultIndex(0); }}
              className={`w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 transition-all ${
                isActive ? 'ring-2 ring-[#ccff00] ring-offset-1 ring-offset-[#090909]' : 'opacity-60 hover:opacity-100'
              }`}
            >
              {thumb ? (
                <img src={thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
              ) : (
                <div className="w-full h-full bg-[#1a1a1a]" />
              )}
            </button>
          );
        })}

        {completedJobs.slice(0, 4).map((job) => (
          <button
            key={job.id}
            onClick={() => job.resultUrl && setResultImages([job.resultUrl])}
            className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity border border-white/[0.06]"
          >
            {job.resultUrl ? (
              <img src={job.resultUrl} alt="" className="w-full h-full object-cover" loading="lazy" />
            ) : (
              <div className="w-full h-full bg-[#1a1a1a]" />
            )}
          </button>
        ))}
      </div>

      {/* Center Canvas */}
      <main className="flex-1 h-full bg-[#0e0e0e] relative flex items-center justify-center overflow-hidden">
        {/* Clear all */}
        <button
          onClick={() => { setSelectedAssetId(null); setResultImages([]); setResultIndex(0); }}
          className="absolute top-4 right-4 z-20 text-zinc-500 hover:text-white text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-colors"
        >
          <X className="h-3 w-3" />
          Clear all
        </button>

        {/* Canvas Image */}
        <div className="relative w-full max-w-4xl aspect-[4/3] rounded-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.5)]">
          {canvasImageUrl ? (
            <img src={canvasImageUrl} alt="Canvas" className="absolute inset-0 w-full h-full object-contain bg-black" />
          ) : (
            <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
              <Paintbrush className="h-12 w-12 text-zinc-700" />
            </div>
          )}

          {/* Carousel dots */}
          {resultImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 z-10">
              <button onClick={() => setResultIndex(Math.max(0, resultIndex - 1))} className="text-white/60 hover:text-white">
                <ChevronLeft className="h-5 w-5" />
              </button>
              {resultImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setResultIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${i === resultIndex ? 'bg-[#ccff00]' : 'bg-white/30'}`}
                />
              ))}
              <button onClick={() => setResultIndex(Math.min(resultImages.length - 1, resultIndex + 1))} className="text-white/60 hover:text-white">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>

        {/* Floating Tool Palette */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-[#131313]/90 backdrop-blur-xl border border-white/[0.08] rounded-2xl flex flex-col p-2 gap-1 z-10">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                title={tool.label}
                className={`rounded-xl p-3 transition-all ${
                  isActive ? 'bg-[#ccff00] text-black shadow-[0_0_15px_rgba(204,255,0,0.2)]' : 'text-zinc-400 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Icon className="h-4 w-4" />
              </button>
            );
          })}
          <div className="h-px bg-white/[0.06] my-1" />
          <button className="rounded-xl p-3 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all" title="Download">
            <Download className="h-4 w-4" />
          </button>
          <button className="rounded-xl p-3 text-zinc-400 hover:text-white hover:bg-white/[0.05] transition-all" title="More">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Bottom Prompt Bar */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30">
          <div className="bg-[#131313]/95 backdrop-blur-2xl border border-white/[0.06] rounded-2xl p-3 flex items-center gap-3 shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex-none w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-[#ccff00]" />
            </div>

            <input
              type="text"
              value={inpaintPrompt}
              onChange={(e) => setInpaintPrompt(e.target.value)}
              placeholder="Draw a mask, upload an image, and optionally enter a prompt..."
              className="flex-1 bg-transparent border-none text-white placeholder-zinc-600 text-sm focus:outline-none focus:ring-0"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
            />

            <button className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white border border-white/[0.06] rounded-full px-3 py-1.5 transition-colors flex-shrink-0">
              + Add Product
            </button>

            <button className="text-[10px] uppercase tracking-widest text-zinc-500 hover:text-white border border-white/[0.06] rounded-full px-3 py-1.5 transition-colors flex-shrink-0">
              Quality
            </button>

            <button
              onClick={handleGenerate}
              disabled={isProcessing || !activeFeature.operation}
              className="flex-none bg-[#ccff00] text-black font-bold uppercase tracking-widest text-[11px] px-6 py-2.5 rounded-full flex items-center gap-2 hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {isProcessing ? 'Processing…' : 'Edit'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
