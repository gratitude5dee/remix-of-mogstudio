import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  FileText,
  HelpCircle,
  Archive,
  Loader2,
  Mic2,
  Play,
  Smile,
  Sparkles,
  Upload,
  Wand2,
  Zap,
  Eye,
  Music,
  User,
  Globe,
  Film,
} from "lucide-react";
import type { KanvasAsset, KanvasAssetType, KanvasJob, KanvasModel } from "@/features/kanvas/types";
import { getJobPrimaryUrl, isJobActive } from "@/features/kanvas/helpers";
import { cn } from "@/lib/utils";

/* ─── Types ──────────────────────────────────────────── */

type WizardStep = "script" | "voice" | "avatar" | "environment" | "render";
type ActiveView = "dashboard" | "templates" | "audio";

interface LipsyncStudioProps {
  prompt: string;
  onPromptChange: (v: string) => void;
  lipsyncMode: "talking-head" | "lip-sync";
  onLipsyncModeChange: (mode: "talking-head" | "lip-sync") => void;
  imageId: string | null;
  videoId: string | null;
  audioId: string | null;
  onImageChange: (id: string | null) => void;
  onVideoChange: (id: string | null) => void;
  onAudioChange: (id: string | null) => void;
  currentModel: KanvasModel | null;
  models: KanvasModel[];
  onModelChange: (id: string) => void;
  submitting: boolean;
  onGenerate: () => void;
  jobs: KanvasJob[];
  selectedJob: KanvasJob | null;
  assets: KanvasAsset[];
  uploadingImage: boolean;
  uploadingVideo: boolean;
  uploadingAudio: boolean;
  onUpload: (file: File, type: KanvasAssetType) => Promise<void>;
}

/* ─── Film Grain SVG ─────────────────────────────────── */

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`;

/* ─── Wizard Steps ───────────────────────────────────── */

const WIZARD_STEPS: { key: WizardStep; label: string; icon: typeof FileText }[] = [
  { key: "script", label: "Script", icon: FileText },
  { key: "voice", label: "Voice", icon: Mic2 },
  { key: "avatar", label: "Avatar", icon: User },
  { key: "environment", label: "Environment", icon: Globe },
  { key: "render", label: "Render", icon: Film },
];

/* ─── Templates Data ─────────────────────────────────── */

const TEMPLATES = [
  { id: "general", label: "PRODUCTION TYPE", title: "General", gradient: "from-violet-900/80 to-black" },
  { id: "selfie", label: "CAMERA STYLE", title: "Selfie", gradient: "from-amber-900/80 to-black" },
  { id: "selling", label: "CONTENT TYPE", title: "Selling", gradient: "from-emerald-900/80 to-black" },
];

/* ─── Voice Types ────────────────────────────────────── */

const VOICE_TYPES = ["Whispers", "Rough", "Deep", "Youthful"];

/* ─── Emotions ───────────────────────────────────────── */

const EMOTIONS = [
  { id: "happy", label: "Happy", icon: Smile },
  { id: "serious", label: "Serious", icon: User },
  { id: "excited", label: "Excited", icon: Zap },
  { id: "calm", label: "Calm", icon: Music },
  { id: "sad", label: "Sad", icon: Globe },
  { id: "angry", label: "Angry", icon: Film },
];

/* ─── Wizard Sidebar ─────────────────────────────────── */

function WizardSidebar({
  activeStep,
  onStepChange,
}: {
  activeStep: WizardStep;
  onStepChange: (step: WizardStep) => void;
}) {
  return (
    <div className="fixed left-0 top-[68px] bottom-0 w-[260px] bg-[#090909] z-40 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-6 pt-8 pb-6">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#ccff00] font-['Space_Grotesk']">
          UGC FACTORY
        </p>
        <p className="mt-1 text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Production Wizard
        </p>
      </div>

      {/* Steps */}
      <nav className="flex-1 px-4 space-y-2">
        {WIZARD_STEPS.map((step, i) => {
          const active = activeStep === step.key;
          const StepIcon = step.icon;
          return (
            <button
              key={step.key}
              type="button"
              onClick={() => onStepChange(step.key)}
              className={cn(
                "w-full flex items-center gap-4 rounded-full px-4 py-3 text-xs uppercase tracking-[0.15em] font-['Space_Grotesk'] font-bold transition-all",
                active
                  ? "bg-[#ccff00] text-black"
                  : "text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              <span className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-black",
                active ? "bg-black/20" : "bg-white/5"
              )}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <StepIcon className="h-4 w-4" />
              <span>{step.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 pb-8 space-y-3">
        <button className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors w-full">
          <HelpCircle className="h-3.5 w-3.5" />
          Support
        </button>
        <button className="flex items-center gap-3 px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-zinc-600 hover:text-white transition-colors w-full">
          <Archive className="h-3.5 w-3.5" />
          Archive
        </button>
        <button className="w-full flex items-center justify-center gap-2 rounded-full border border-white/10 bg-transparent px-4 py-3 text-[10px] uppercase tracking-[0.2em] text-zinc-400 hover:bg-white/5 hover:text-white transition-all font-['Space_Grotesk'] font-bold">
          <Download className="h-3.5 w-3.5" />
          Export Project
        </button>
      </div>
    </div>
  );
}

/* ─── Lipsync Dashboard ──────────────────────────────── */

function LipsyncDashboard({
  prompt,
  onPromptChange,
  submitting,
  onGenerate,
  onUpload,
  uploadingImage,
  uploadingAudio,
  jobs,
  selectedJob,
}: {
  prompt: string;
  onPromptChange: (v: string) => void;
  submitting: boolean;
  onGenerate: () => void;
  onUpload: (file: File, type: KanvasAssetType) => Promise<void>;
  uploadingImage: boolean;
  uploadingAudio: boolean;
  jobs: KanvasJob[];
  selectedJob: KanvasJob | null;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [audioMode, setAudioMode] = useState<"text" | "generate">("text");
  const latestCompleted = jobs.find((j) => j.status === "completed");
  const latestUrl = latestCompleted ? getJobPrimaryUrl(latestCompleted) : null;

  const workflowSteps = [
    { num: "01", title: "Upload", desc: "Upload your portrait or video asset" },
    { num: "02", title: "Generate", desc: "AI processes your lipsync request" },
    { num: "03", title: "Select", desc: "Choose the best output render" },
  ];

  const activeWorkflowStep = !selectedJob ? 0 : selectedJob.status === "completed" ? 2 : 1;

  return (
    <div className="space-y-12 pb-24">
      {/* Hero */}
      <div className="pt-4">
        <h1 className="text-6xl md:text-8xl font-black font-['Space_Grotesk'] tracking-tighter leading-[0.9]">
          <span className="text-white">LIPSYNC MODELS,</span>
          <br />
          <span className="text-[#ccff00]">ONE CLICK AWAY</span>
        </h1>
        <p className="mt-6 max-w-lg text-sm text-zinc-500 leading-relaxed">
          Upload a portrait, paste your script, and let AI bring it to life with natural lip movements and expressions.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column — Input */}
        <div className="space-y-6">
          {/* Upload Card */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full aspect-[16/9] rounded-2xl border border-white/5 bg-[#131313] flex flex-col items-center justify-center gap-3 hover:border-[#ccff00]/20 transition-all group cursor-pointer"
          >
            {uploadingImage ? (
              <Loader2 className="h-8 w-8 animate-spin text-[#ccff00]" />
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#ccff00]/10 group-hover:bg-[#ccff00]/20 transition-colors">
                <Upload className="h-6 w-6 text-[#ccff00]" />
              </div>
            )}
            <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">
              Upload Asset
            </p>
            <p className="text-[10px] text-zinc-600">PNG, JPG, MP4 — Max 50MB</p>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.currentTarget.value = "";
              if (file) {
                const type: KanvasAssetType = file.type.startsWith("video") ? "video" : "image";
                void onUpload(file, type);
              }
            }}
          />

          {/* Audio Toggle */}
          <div className="flex items-center gap-1 rounded-full bg-[#131313] p-1 w-fit">
            <button
              type="button"
              onClick={() => setAudioMode("text")}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-bold transition-all font-['Space_Grotesk']",
                audioMode === "text"
                  ? "bg-[#ccff00] text-black"
                  : "text-zinc-500 hover:text-white"
              )}
            >
              Audio Text
            </button>
            <button
              type="button"
              onClick={() => setAudioMode("generate")}
              className={cn(
                "px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-bold transition-all font-['Space_Grotesk']",
                audioMode === "generate"
                  ? "bg-[#ccff00] text-black"
                  : "text-zinc-500 hover:text-white"
              )}
            >
              Generate Audio
            </button>
          </div>

          {/* Script Input */}
          <div className="relative rounded-2xl bg-[#131313] p-6">
            <textarea
              value={prompt}
              onChange={(e) => onPromptChange(e.target.value)}
              placeholder="Write your script here... The AI will generate lip-synced video from this text."
              className="w-full min-h-[150px] bg-transparent text-white text-sm placeholder:text-zinc-600 resize-none focus:outline-none font-['Space_Grotesk']"
              maxLength={2000}
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-3">
              <span className="text-[10px] text-zinc-600 font-mono">
                {prompt.length} / 2000
              </span>
              <Wand2 className="h-4 w-4 text-zinc-600 hover:text-[#ccff00] cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Generate Button */}
          <button
            type="button"
            onClick={onGenerate}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 bg-[#ccff00] text-black font-bold uppercase tracking-[0.15em] py-4 rounded-full hover:shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all font-['Space_Grotesk'] disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Processing
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                Generate Lipsync
              </>
            )}
          </button>
        </div>

        {/* Right Column — Workflow & Output */}
        <div className="space-y-6">
          {/* Workflow Steps */}
          {workflowSteps.map((step, i) => (
            <div
              key={step.num}
              className={cn(
                "rounded-2xl bg-[#1a1919]/60 p-6 flex items-center gap-6 transition-all",
                i === activeWorkflowStep && "border-l-4 border-[#ccff00]"
              )}
            >
              <span className={cn(
                "text-4xl font-black font-['Space_Grotesk'] tracking-tighter",
                i === activeWorkflowStep ? "text-[#ccff00]" : "text-zinc-700"
              )}>
                {step.num}
              </span>
              <div>
                <p className={cn(
                  "text-sm font-bold uppercase tracking-[0.15em] font-['Space_Grotesk']",
                  i === activeWorkflowStep ? "text-white" : "text-zinc-500"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-zinc-600 mt-1">{step.desc}</p>
              </div>
              {i < activeWorkflowStep && (
                <Check className="ml-auto h-5 w-5 text-[#ccff00]" />
              )}
            </div>
          ))}

          {/* Latest Render */}
          {latestCompleted && (
            <div className="rounded-2xl bg-[#131313] p-6 flex gap-6">
              <div className="h-24 w-24 rounded-xl overflow-hidden bg-white/5 shrink-0">
                {latestUrl ? (
                  latestCompleted.resultPayload?.mediaType === "video" ? (
                    <video src={latestUrl} muted className="h-full w-full object-cover" />
                  ) : (
                    <img src={latestUrl} alt="Latest render" className="h-full w-full object-cover" />
                  )
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Film className="h-6 w-6 text-zinc-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">Latest Render</p>
                <p className="text-sm font-semibold text-white mt-1 truncate">
                  {latestCompleted.modelId ?? "Lipsync Output"}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button className="px-4 py-1.5 rounded-full bg-white/10 text-white text-[10px] uppercase tracking-[0.15em] font-bold hover:bg-white/15 transition-colors flex items-center gap-1.5">
                    <Eye className="h-3 w-3" />
                    Preview
                  </button>
                  <button className="px-4 py-1.5 rounded-full bg-[#ff3399]/10 text-[#ff3399] text-[10px] uppercase tracking-[0.15em] font-bold hover:bg-[#ff3399]/20 transition-colors">
                    Upscale
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── UGC Templates ──────────────────────────────────── */

function UGCTemplates({
  selectedTemplate,
  onSelect,
  onNext,
}: {
  selectedTemplate: string | null;
  onSelect: (id: string) => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-10 pb-24 relative">
      {/* Hero */}
      <div className="pt-4">
        <h1 className="text-6xl md:text-8xl font-black font-['Space_Grotesk'] tracking-tighter leading-[0.9]">
          <span className="text-white">Choose your </span>
          <span className="text-[#ccff00]">Template</span>
        </h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {TEMPLATES.map((tpl) => {
          const selected = selectedTemplate === tpl.id;
          return (
            <button
              key={tpl.id}
              type="button"
              onClick={() => onSelect(tpl.id)}
              className={cn(
                "relative rounded-[2rem] h-[400px] overflow-hidden group cursor-pointer transition-all",
                selected
                  ? "border-2 border-[#ccff00] shadow-[0_0_30px_rgba(204,255,0,0.15)]"
                  : "border border-white/5 hover:border-white/10"
              )}
            >
              {/* Background gradient placeholder */}
              <div className={cn(
                "absolute inset-0 bg-gradient-to-t",
                tpl.gradient
              )} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

              {/* Selected check */}
              {selected && (
                <div className="absolute top-4 right-4 z-10 h-8 w-8 rounded-full bg-[#ccff00] flex items-center justify-center">
                  <Check className="h-4 w-4 text-black" />
                </div>
              )}

              {/* Text */}
              <div className="absolute bottom-6 left-6 z-10">
                <p className={cn(
                  "text-[10px] uppercase tracking-[0.3em] font-bold mb-2",
                  selected ? "text-[#ccff00]" : "text-zinc-500"
                )}>
                  {tpl.label}
                </p>
                <p className="text-3xl font-black text-white font-['Space_Grotesk'] tracking-tight">
                  {tpl.title}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Floating FAB */}
      <button
        type="button"
        onClick={onNext}
        className="fixed bottom-8 right-8 z-50 w-20 h-20 rounded-full bg-[#ccff00] text-black flex items-center justify-center shadow-[0_0_40px_rgba(204,255,0,0.3)] hover:shadow-[0_0_60px_rgba(204,255,0,0.5)] transition-all"
      >
        <ArrowRight className="h-8 w-8" />
      </button>
    </div>
  );
}

/* ─── UGC Audio Settings ─────────────────────────────── */

function UGCAudioSettings({
  onNext,
}: {
  onNext: () => void;
}) {
  const [voiceType, setVoiceType] = useState("Whispers");
  const [emotion, setEmotion] = useState("happy");
  const [language, setLanguage] = useState("english");
  const [accent, setAccent] = useState("neutral");

  return (
    <div className="space-y-10 pb-24">
      {/* Hero */}
      <div className="pt-4">
        <h1 className="text-6xl md:text-8xl font-black font-['Space_Grotesk'] tracking-tighter leading-[0.9]">
          <span className="text-white">AUDIO </span>
          <span className="text-[#ccff00]">SETTINGS</span>
        </h1>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-3">Select Language</p>
          <div className="relative">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full appearance-none bg-[#131313] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-['Space_Grotesk'] focus:outline-none focus:border-[#ccff00]/30 transition-colors"
            >
              <option value="english">English</option>
              <option value="spanish">Spanish</option>
              <option value="french">French</option>
              <option value="german">German</option>
              <option value="japanese">Japanese</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
        <div className="relative">
          <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-3">Select Accent</p>
          <div className="relative">
            <select
              value={accent}
              onChange={(e) => setAccent(e.target.value)}
              className="w-full appearance-none bg-[#131313] border border-white/5 rounded-2xl px-5 py-4 text-white text-sm font-['Space_Grotesk'] focus:outline-none focus:border-[#ccff00]/30 transition-colors"
            >
              <option value="neutral">Neutral</option>
              <option value="british">British</option>
              <option value="australian">Australian</option>
              <option value="southern">Southern</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Voice Type Row */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Voice Type</p>
        <div className="flex flex-wrap gap-3">
          {VOICE_TYPES.map((vt) => (
            <button
              key={vt}
              type="button"
              onClick={() => setVoiceType(vt)}
              className={cn(
                "px-6 py-3 rounded-full text-xs uppercase tracking-[0.15em] font-bold transition-all font-['Space_Grotesk']",
                voiceType === vt
                  ? "bg-[#ccff00] text-black"
                  : "bg-[#131313] text-zinc-500 hover:text-white hover:bg-white/5"
              )}
            >
              {vt}
            </button>
          ))}
        </div>
      </div>

      {/* Emotional Delivery Grid */}
      <div>
        <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-bold mb-4">Emotional Delivery</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {EMOTIONS.map((em) => {
            const active = emotion === em.id;
            const EmIcon = em.icon;
            return (
              <button
                key={em.id}
                type="button"
                onClick={() => setEmotion(em.id)}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 rounded-2xl p-6 transition-all aspect-square",
                  active
                    ? "border-2 border-[#ccff00] bg-[#ccff00]/5"
                    : "border border-white/5 bg-[#131313] hover:border-white/10"
                )}
              >
                <EmIcon className={cn(
                  "h-6 w-6",
                  active ? "text-[#ccff00]" : "text-zinc-600"
                )} />
                <span className={cn(
                  "text-[10px] uppercase tracking-[0.2em] font-bold",
                  active ? "text-[#ccff00]" : "text-zinc-500"
                )}>
                  {em.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Voice Preview Player */}
      <div className="rounded-[2rem] bg-[#131313] p-6 flex items-center gap-6">
        <button
          type="button"
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#ccff00] text-black hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all"
        >
          <Play className="h-6 w-6 ml-1" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white font-['Space_Grotesk']">
            Voice Preview: Neutral {voiceType}
          </p>
          <p className="text-xs text-zinc-500 italic mt-1 truncate">
            "Hello, this is a sample of the selected voice..."
          </p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <div className="h-full w-1/3 rounded-full bg-[#ccff00]" />
            </div>
            <span className="text-[10px] text-zinc-600 font-mono whitespace-nowrap">0:04 / 0:12</span>
          </div>
        </div>
      </div>

      {/* Next Step */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="flex items-center gap-2 bg-[#ccff00] text-black font-bold uppercase tracking-[0.15em] px-8 py-3 rounded-full hover:shadow-[0_0_20px_rgba(204,255,0,0.3)] transition-all text-xs font-['Space_Grotesk']"
        >
          Next Step
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

/* ─── Placeholder Panel ──────────────────────────────── */

function PlaceholderPanel({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl border border-white/5 bg-[#131313]">
          <Sparkles className="h-8 w-8 text-zinc-600" />
        </div>
        <p className="text-2xl font-black font-['Space_Grotesk'] text-white tracking-tight">{title}</p>
        <p className="mt-2 text-sm text-zinc-600">Coming soon — this step is under development.</p>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */

export default function LipsyncStudioSection(props: LipsyncStudioProps) {
  const [activeStep, setActiveStep] = useState<WizardStep>("script");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const viewForStep: Record<WizardStep, ActiveView | "placeholder"> = {
    script: "dashboard",
    voice: "audio",
    avatar: "templates",
    environment: "placeholder",
    render: "placeholder",
  };

  const activeView = viewForStep[activeStep];

  function handleNextStep() {
    const currentIdx = WIZARD_STEPS.findIndex((s) => s.key === activeStep);
    if (currentIdx < WIZARD_STEPS.length - 1) {
      setActiveStep(WIZARD_STEPS[currentIdx + 1].key);
    }
  }

  return (
    <div className="fixed inset-0 top-[68px] z-30 bg-[#000000] overflow-hidden">
      {/* Film Grain */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] mix-blend-overlay opacity-[0.15]"
        style={{ backgroundImage: NOISE_SVG, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }}
      />

      {/* Sidebar */}
      <WizardSidebar activeStep={activeStep} onStepChange={setActiveStep} />

      {/* Main Content */}
      <div className="absolute inset-0 left-[260px] top-0 overflow-y-auto z-[2]" style={{ scrollbarWidth: "none" }}>
        <div className="px-10 py-8 max-w-[1200px]">
          {activeView === "dashboard" && (
            <LipsyncDashboard
              prompt={props.prompt}
              onPromptChange={props.onPromptChange}
              submitting={props.submitting}
              onGenerate={props.onGenerate}
              onUpload={props.onUpload}
              uploadingImage={props.uploadingImage}
              uploadingAudio={props.uploadingAudio}
              jobs={props.jobs}
              selectedJob={props.selectedJob}
            />
          )}
          {activeView === "templates" && (
            <UGCTemplates
              selectedTemplate={selectedTemplate}
              onSelect={setSelectedTemplate}
              onNext={handleNextStep}
            />
          )}
          {activeView === "audio" && (
            <UGCAudioSettings onNext={handleNextStep} />
          )}
          {activeView === "placeholder" && (
            <PlaceholderPanel title={WIZARD_STEPS.find((s) => s.key === activeStep)?.label ?? "Coming Soon"} />
          )}
        </div>
      </div>
    </div>
  );
}
