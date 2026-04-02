import { useState, useMemo } from 'react';
import {
  Paintbrush,
  Wand2,
  Eraser,
  ZoomIn,
  Plus,
  Library,
  Wrench,
  Layers,
  Clock,
  Box,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  LogOut,
  Loader2,
  Upload,
} from 'lucide-react';
import { toast } from 'sonner';
import { imageEditService } from '@/services/imageEditService';
import type { ImageEditOperation } from '@/types/imageEdit';
import type { KanvasAsset, KanvasJob, KanvasAssetType } from '@/features/kanvas/types';

type SidebarTab = 'library' | 'tools' | 'layers' | 'history' | 'assets';
type CanvasTool = 'brush' | 'wand' | 'eraser' | 'zoom';

interface EditStudioProps {
  assets: KanvasAsset[];
  jobs: KanvasJob[];
  selectedJob: KanvasJob | null;
  uploading: boolean;
  onUpload: (file: File, assetType: KanvasAssetType) => void;
}

const SIDEBAR_TABS: { id: SidebarTab; label: string; icon: typeof Library }[] = [
  { id: 'library', label: 'Library', icon: Library },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'assets', label: 'Assets', icon: Box },
];

const CANVAS_TOOLS: { id: CanvasTool; icon: typeof Paintbrush; label: string; operation: ImageEditOperation | null }[] = [
  { id: 'brush', icon: Paintbrush, label: 'Inpaint', operation: 'inpaint' },
  { id: 'wand', icon: Wand2, label: 'Remove BG', operation: 'removeBackground' },
  { id: 'eraser', icon: Eraser, label: 'Split Layers', operation: 'splitLayers' },
  { id: 'zoom', icon: ZoomIn, label: 'Zoom', operation: null },
];

function resolveAssetUrl(asset: KanvasAsset): string | null {
  return asset.cdn_url ?? asset.preview_url ?? asset.thumbnail_url;
}

function resolveAssetThumb(asset: KanvasAsset): string | null {
  return asset.thumbnail_url ?? asset.preview_url ?? asset.cdn_url;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function EditStudioSection({ assets, jobs, selectedJob, uploading, onUpload }: EditStudioProps) {
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('library');
  const [activeCanvasTool, setActiveCanvasTool] = useState<CanvasTool>('brush');
  const [inpaintPrompt, setInpaintPrompt] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultImageUrl, setResultImageUrl] = useState<string | null>(null);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? null,
    [assets, selectedAssetId]
  );

  const activeToolConfig = CANVAS_TOOLS.find((t) => t.id === activeCanvasTool)!;
  const showPromptBar = activeCanvasTool === 'brush';
  const showMask = activeCanvasTool === 'brush' && selectedAsset !== null;

  const canvasImageUrl = resultImageUrl ?? (selectedAsset ? resolveAssetUrl(selectedAsset) : null);

  const completedJobs = useMemo(
    () => jobs.filter((j) => j.status === 'completed' && j.resultUrl),
    [jobs]
  );

  const assetProperties = useMemo(() => {
    if (!selectedAsset) return [];
    const meta = selectedAsset.media_metadata as Record<string, unknown> | null;
    const w = meta?.width as number | undefined;
    const h = meta?.height as number | undefined;
    return [
      { label: 'Resolution', value: w && h ? `${w} × ${h}` : 'Unknown' },
      { label: 'Format', value: selectedAsset.mime_type.split('/')[1]?.toUpperCase() ?? 'Unknown' },
      { label: 'Size', value: formatFileSize(selectedAsset.file_size_bytes) },
      { label: 'Status', value: selectedAsset.processing_status },
    ];
  }, [selectedAsset]);

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

    const operation = activeToolConfig.operation;
    if (!operation) return;

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
      });

      if (result.asset?.url) {
        setResultImageUrl(result.asset.url);
        toast.success(`${activeToolConfig.label} complete`);
      } else if (result.layers && result.layers.length > 0) {
        setResultImageUrl(result.layers[0].url);
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

  return (
    <div className="fixed inset-0 top-[80px] bg-[#000000] z-20 overflow-hidden flex" style={{ scrollbarWidth: 'none' }}>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>

      {/* ── Left Sidebar ── */}
      <aside className="w-[260px] flex-none h-full bg-[#090909] border-r border-white/5 flex flex-col overflow-hidden">
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-baseline gap-3">
            <span className="text-white font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>STUDIO</span>
            <span className="text-zinc-600 text-[8px] font-medium">V1.0.4-NOIR</span>
          </div>
        </div>

        <div className="px-6 mb-4">
          <button
            onClick={handleUploadClick}
            disabled={uploading}
            className="w-full bg-[#1a1919] text-[#ccff00] border border-white/5 rounded-full py-3 text-[10px] font-bold uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-[#222] transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            {uploading ? 'Uploading…' : 'New Asset'}
          </button>
        </div>

        <nav className="flex flex-col">
          {SIDEBAR_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeSidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSidebarTab(tab.id)}
                className={`flex items-center gap-4 px-6 py-4 text-[10px] uppercase tracking-widest transition-colors ${
                  active
                    ? 'bg-[#1a1919]/50 border-r-2 border-[#ccff00] text-[#ccff00] font-bold'
                    : 'text-zinc-500 hover:text-white font-medium'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 flex-1 min-h-0 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          <p className="px-6 mb-4 text-[9px] uppercase tracking-widest text-zinc-600 font-bold">
            {assets.length > 0 ? `Library (${assets.length})` : 'Library'}
          </p>
          <div className="px-6 grid grid-cols-2 gap-2">
            {assets.length === 0 && (
              <div className="col-span-2 flex flex-col items-center justify-center py-8 text-zinc-600">
                <Upload className="h-6 w-6 mb-2" />
                <p className="text-[10px] uppercase tracking-widest">Upload assets</p>
              </div>
            )}
            {assets.map((asset) => {
              const thumb = resolveAssetThumb(asset);
              const isSelected = selectedAssetId === asset.id;
              return (
                <button
                  key={asset.id}
                  onClick={() => {
                    setSelectedAssetId(asset.id);
                    setResultImageUrl(null);
                  }}
                  className={`aspect-square rounded-md cursor-pointer transition-all overflow-hidden relative ${
                    isSelected ? 'ring-2 ring-[#ccff00] ring-offset-1 ring-offset-[#090909]' : 'hover:opacity-80'
                  }`}
                >
                  {thumb ? (
                    <img src={thumb} alt={asset.original_file_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0d1117]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-auto p-6 flex flex-col gap-3">
          <button className="flex items-center gap-3 text-zinc-600 hover:text-zinc-400 text-[10px] uppercase tracking-widest transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
            Support
          </button>
          <button className="flex items-center gap-3 text-zinc-600 hover:text-zinc-400 text-[10px] uppercase tracking-widest transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Center Canvas ── */}
      <main className="flex-1 h-full bg-[#0e0e0e] relative flex items-center justify-center overflow-hidden">
        <div className="aspect-[4/3] w-full max-w-4xl relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {canvasImageUrl ? (
            <img src={canvasImageUrl} alt="Canvas" className="absolute inset-0 w-full h-full object-contain bg-black" />
          ) : (
            <div className="absolute inset-0 bg-[#0a0a0a] flex items-center justify-center">
              <div className="text-center">
                <Paintbrush className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-600 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  Select an asset from the library
                </p>
              </div>
            </div>
          )}

          {/* Tool palette */}
          <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-[#090909]/80 backdrop-blur-xl border border-white/10 rounded-full flex flex-col p-2 gap-2 z-10">
            {CANVAS_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const active = activeCanvasTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveCanvasTool(tool.id)}
                  title={tool.label}
                  className={`rounded-full p-3 transition-colors ${
                    active ? 'bg-[#ccff00] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          {/* Active Mask overlay – only for inpaint tool with an asset selected */}
          {showMask && (
            <div className="absolute top-[20%] left-[30%] w-64 h-80 border-[1.5px] border-[#ccff00] pointer-events-none z-10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ccff00] text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap">
                Active Mask
              </div>
            </div>
          )}

          {/* Layer info */}
          {selectedAsset && (
            <div className="absolute bottom-8 left-8 z-10">
              <p className="text-[9px] uppercase tracking-widest text-[#ccff00] font-bold mb-1">Current Layer</p>
              <p className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {selectedAsset.original_file_name?.replace(/\.[^.]+$/, '').toUpperCase() ?? 'UNTITLED'}
              </p>
            </div>
          )}
        </div>

        {/* Floating Prompt / Action Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30">
          <div className="bg-[#131313]/90 backdrop-blur-2xl border border-white/5 rounded-full p-2 flex items-center gap-4 shadow-2xl">
            <div className="flex-none w-10 h-10 rounded-full bg-[#1a1919] flex items-center justify-center ml-1">
              <Sparkles className="h-4 w-4 text-[#ccff00]" />
            </div>

            {showPromptBar ? (
              <input
                type="text"
                value={inpaintPrompt}
                onChange={(e) => setInpaintPrompt(e.target.value)}
                placeholder="Describe how to fill the masked area…"
                className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-0"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
            ) : (
              <span className="flex-1 text-zinc-400 text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {activeToolConfig.label} — {selectedAsset ? 'Ready' : 'Select an asset'}
              </span>
            )}

            <button
              onClick={handleGenerate}
              disabled={isProcessing || !selectedAsset || !activeToolConfig.operation}
              className="flex-none bg-[#ccff00] text-black font-bold uppercase tracking-widest text-[11px] px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Sparkles className="h-3.5 w-3.5" />
              )}
              {isProcessing ? 'Processing…' : activeToolConfig.label}
            </button>
          </div>
        </div>
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="w-[340px] flex-none h-full bg-[#090909] border-l border-white/5 p-8 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-4">Asset Detail</p>

        {selectedAsset ? (
          <>
            <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-6 bg-black">
              {resolveAssetUrl(selectedAsset) ? (
                <img src={resolveAssetUrl(selectedAsset)!} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#1a1a2e] to-[#0f3460]" />
              )}
            </div>

            <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              {selectedAsset.original_file_name?.replace(/\.[^.]+$/, '') ?? 'Untitled'}
            </h2>
            <p className="text-xs text-zinc-500 mb-8">Ref: #{selectedAsset.id.slice(0, 8).toUpperCase()}</p>

            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Properties</p>
            <div className="flex flex-col gap-3 mb-8">
              {assetProperties.map((prop) => (
                <div key={prop.label} className="flex items-center justify-between">
                  <span className="text-zinc-500 text-xs">{prop.label}</span>
                  <span className="text-white font-mono text-xs">{prop.value}</span>
                </div>
              ))}
            </div>

            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Active Tool</p>
            <p className="text-xs text-zinc-400 leading-relaxed mb-8">
              <span className="text-[#ccff00] font-bold">{activeToolConfig.label}</span>
              {activeCanvasTool === 'brush' && ' — Draw a mask region and describe the replacement content.'}
              {activeCanvasTool === 'wand' && ' — Removes the background, isolating the subject.'}
              {activeCanvasTool === 'eraser' && ' — Splits the image into distinct visual layers.'}
              {activeCanvasTool === 'zoom' && ' — Client-side zoom for inspection (no backend call).'}
            </p>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-zinc-600 text-xs text-center uppercase tracking-widest">
              Select an asset<br />to view details
            </p>
          </div>
        )}

        {/* Recent Results */}
        {completedJobs.length > 0 && (
          <div className="mb-6">
            <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Recent Results</p>
            <div className="grid grid-cols-3 gap-2">
              {completedJobs.slice(0, 6).map((job) => (
                <button
                  key={job.id}
                  onClick={() => job.resultUrl && setResultImageUrl(job.resultUrl)}
                  className="aspect-square rounded-lg overflow-hidden hover:opacity-80 transition-opacity"
                >
                  {job.resultUrl ? (
                    <img src={job.resultUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-[#1a1919]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-auto bg-[#ff3399]/5 border border-[#ff3399]/30 rounded-[2rem] p-6 relative">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[#ff3399]" />
            <span className="text-[10px] text-[#ff3399] uppercase tracking-widest font-bold">Low Credits</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Your credits are running low. <span className="text-white underline cursor-pointer">Top up now</span> for uninterrupted generation.
          </p>
        </div>

        <button className="w-full mt-4 py-4 bg-[#1a1919] text-white text-[10px] uppercase font-bold tracking-widest rounded-full hover:bg-white/10 transition-colors">
          Manage Workflow
        </button>
      </aside>
    </div>
  );
}
