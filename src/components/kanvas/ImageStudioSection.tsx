import { useRef, useState } from "react";
import {
  Check,
  Film,
  Loader2,
  Plus,
  Settings2,
  Sparkles,
  User,
  Zap,
  Camera,
  Aperture,
  Layers,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { KanvasAsset, KanvasAssetType, KanvasJob, KanvasModel } from "@/features/kanvas/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ImageStudioSectionProps {
  prompt: string;
  onPromptChange: (v: string) => void;
  referenceId: string | null;
  onReferenceChange: (id: string | null) => void;
  currentModel: KanvasModel | null;
  models: KanvasModel[];
  onModelChange: (id: string) => void;
  settings: Record<string, unknown>;
  onSettingsChange: (key: string, value: string | number | boolean) => void;
  submitting: boolean;
  onGenerate: () => void;
  jobs: KanvasJob[];
  selectedJob: KanvasJob | null;
  assets: KanvasAsset[];
  uploading: boolean;
  onUpload: (file: File, type: KanvasAssetType) => Promise<void>;
  pageLoading: boolean;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const SIDEBAR_FEATURES = [
  { id: "create", label: "Create Image", icon: Sparkles, active: true },
  { id: "cinema", label: "Cinema Studio", icon: Film },
  { id: "soulid", label: "Soul ID", icon: User },
  { id: "influencer", label: "AI Influencer", icon: Aperture },
  { id: "photodump", label: "Photodump", icon: Layers },
];

const PRESET_CARDS = [
  {
    category: "PRESET",
    title: "Stage Your Product",
    subtitle: "AI-powered product photography with cinematic lighting",
    gradient: "from-[#1a0a2e] via-[#16213e] to-[#0a0a0a]",
  },
  {
    category: "ENVIRONMENT",
    title: "Change Background",
    subtitle: "Replace any backdrop with AI-generated environments",
    gradient: "from-[#0a1628] via-[#1a1a2e] to-[#0a0a0a]",
  },
  {
    category: "CHARACTERS",
    title: "Create Characters",
    subtitle: "Generate consistent character designs across scenes",
    gradient: "from-[#1a1206] via-[#201a0e] to-[#0a0a0a]",
  },
  {
    category: "STYLE",
    title: "Apply Art Styles",
    subtitle: "Transform images into any artistic medium instantly",
    gradient: "from-[#0a1a1a] via-[#0e2020] to-[#0a0a0a]",
  },
  {
    category: "UPSCALE",
    title: "Enhance & Upscale",
    subtitle: "4K resolution enhancement with detail preservation",
    gradient: "from-[#1a0a1a] via-[#200e20] to-[#0a0a0a]",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ImageStudioSection({
  prompt,
  onPromptChange,
  currentModel,
  models,
  onModelChange,
  submitting,
  onGenerate,
}: ImageStudioSectionProps) {
  const [imageCount, _setImageCount] = useState(1);
  const inputRef = useRef<HTMLInputElement>(null);

  /* ---- Sidebar ---- */
  const renderSidebar = () => (
    <aside className="fixed left-0 top-[80px] h-[calc(100vh-80px)] w-[260px] border-r border-white/5 bg-black p-6 flex flex-col gap-8 overflow-y-auto z-30"
      style={{ scrollbarWidth: "none" }}
    >
      {/* Studio Features */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
          STUDIO FEATURES
        </p>
        <div className="space-y-1">
          {SIDEBAR_FEATURES.map((f) =>
            f.active ? (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-xl bg-[#ccff00] px-4 py-3 text-black font-bold text-sm cursor-pointer"
              >
                <f.icon className="h-4 w-4" />
                {f.label}
              </div>
            ) : (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-xl px-4 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-sm"
              >
                <f.icon className="h-4 w-4" />
                {f.label}
              </div>
            )
          )}
        </div>
      </div>

      {/* AI Models */}
      <div className="space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-zinc-600">
          AI MODELS
        </p>
        <div className="space-y-1.5">
          {models.map((m) => {
            const isActive = currentModel?.id === m.id;
            return (
              <button
                key={m.id}
                onClick={() => onModelChange(m.id)}
                className={cn(
                  "w-full flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all text-left",
                  isActive
                    ? "bg-white/5 border border-[#ccff00]/30 text-white"
                    : "text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent"
                )}
              >
                <span className="flex items-center gap-2.5">
                  {isActive && <Zap className="h-3.5 w-3.5 text-[#ccff00]" />}
                  {m.label}
                </span>
                {isActive && <Check className="h-3.5 w-3.5 text-[#ccff00]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Storage Usage — pinned bottom */}
      <div className="mt-auto">
        <div className="rounded-2xl bg-white/5 border border-white/5 p-4 space-y-3">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em]">
            <span className="text-zinc-400">STORAGE USAGE</span>
            <span className="text-white">64%</span>
          </div>
          <div className="h-1 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full w-2/3 rounded-full bg-[#ccff00]" />
          </div>
          <button className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-300 hover:bg-white/10 transition-colors">
            Upgrade Plan
          </button>
        </div>
      </div>
    </aside>
  );

  /* ---- Main Content ---- */
  const renderMainContent = () => (
    <div className="ml-[260px] pt-20 pb-48 px-12 min-h-screen flex flex-col items-center w-full">
      {/* Hero Typography */}
      <div className="text-center">
        <h1
          className="text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.85]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span className="text-white">TURN IDEAS</span>
          <br />
          <span className="text-[#ccff00]">INTO VISUALS</span>
        </h1>
        <p className="mt-8 max-w-2xl mx-auto text-zinc-400 font-medium text-base leading-relaxed">
          Experience the next generation of cinematic AI artistry.
          <br />
          High-fidelity renders, infinite possibilities.
        </p>
      </div>

      {/* Presets Gallery */}
      <div
        className="flex gap-6 overflow-x-auto w-full max-w-[1200px] mt-16 pb-8 snap-x"
        style={{ scrollbarWidth: "none" }}
      >
        {PRESET_CARDS.map((card, i) => (
          <div
            key={i}
            className="min-w-[340px] aspect-[4/5] rounded-3xl relative overflow-hidden group cursor-pointer border border-white/5 snap-center flex-shrink-0"
          >
            {/* Gradient Background */}
            <div className={cn("absolute inset-0 bg-gradient-to-br", card.gradient)} />

            {/* Atmospheric shimmer */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#ccff00]">
                {card.category}
              </p>
              <h3 className="text-xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {card.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{card.subtitle}</p>
            </div>

            {/* Hover scale on inner element */}
            <div className="absolute inset-0 bg-white/0 group-hover:bg-white/[0.02] transition-colors duration-700" />
          </div>
        ))}
      </div>
    </div>
  );

  /* ---- Floating Prompt Bar ---- */
  const renderPromptBar = () => (
    <div className="fixed bottom-12 left-[calc(260px+2rem)] right-12 flex justify-center z-50">
      <div className="bg-[#131313]/90 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex items-center gap-3 shadow-[0_20px_50px_rgba(0,0,0,0.8)] w-full max-w-[1000px] mx-auto">
        {/* Plus button */}
        <button className="flex-shrink-0 w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
          <Plus className="h-5 w-5 text-zinc-400" />
        </button>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder="Describe the image you want to create..."
          className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-white placeholder-zinc-500 font-medium text-base px-4"
        />

        {/* Model Pill */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
          <Zap className="h-3 w-3 text-[#ccff00]" />
          <span className="text-[11px] font-bold text-white whitespace-nowrap">
            {currentModel?.label ?? "Select Model"}
          </span>
        </div>

        {/* Aspect Ratio Pill */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2">
          <Camera className="h-3 w-3 text-zinc-400" />
          <span className="text-[11px] font-bold text-white">3:4</span>
        </div>

        {/* Count Pill */}
        <div className="flex-shrink-0 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-2">
          <span className="text-[11px] font-bold text-white">{imageCount}x</span>
        </div>

        {/* Settings */}
        <button className="flex-shrink-0 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
          <Settings2 className="h-4 w-4 text-zinc-400" />
        </button>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={submitting || !prompt.trim()}
          className={cn(
            "flex-shrink-0 flex items-center gap-2 px-8 h-12 rounded-full font-bold uppercase tracking-[0.15em] text-sm transition-all",
            "bg-[#ccff00] text-black hover:shadow-[0_0_20px_rgba(204,255,0,0.4)]",
            "disabled:opacity-40 disabled:cursor-not-allowed"
          )}
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              GENERATE
            </>
          )}
        </button>
      </div>
    </div>
  );

  /* ---- Footer ---- */
  const renderFooter = () => (
    <div className="fixed bottom-6 left-[272px] right-12 flex justify-between text-[9px] uppercase tracking-[0.3em] text-zinc-600 font-bold z-40 pointer-events-none">
      <span>© 2024 WZRD.STUDIO • THE NOIR FUTURIST</span>
      <span className="flex gap-8">
        <span>PRIVACY</span>
        <span>TERMS</span>
        <span>API</span>
      </span>
    </div>
  );

  /* ---- Render ---- */
  return (
    <div className="relative min-h-screen bg-black">
      {renderSidebar()}
      {renderMainContent()}
      {renderPromptBar()}
      {renderFooter()}
    </div>
  );
}
