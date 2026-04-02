import { useRef, useState } from "react";
import {
  Film,
  ImagePlus,
  Lightbulb,
  Loader2,
  Play,
  Plus,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Video,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { KanvasAsset, KanvasAssetType, KanvasJob, KanvasModel } from "@/features/kanvas/types";
import { getJobPrimaryUrl, isJobActive } from "@/features/kanvas/helpers";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface VideoStudioSectionProps {
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
/*  Subcomponents                                                      */
/* ------------------------------------------------------------------ */

function Dropzone({
  label,
  hint,
  icon: Icon,
  uploading,
  onUpload,
  previewUrl,
}: {
  label: string;
  hint: string;
  icon: typeof ImagePlus;
  uploading: boolean;
  onUpload: (file: File) => void;
  previewUrl?: string | null;
}) {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
        {label}
      </p>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className={cn(
          "group relative flex aspect-square w-full flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          previewUrl
            ? "border-[#ccff00]/30 bg-black/40"
            : "border-zinc-800 bg-black/30 hover:border-[#ccff00]/50"
        )}
      >
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={label}
            className="absolute inset-0 h-full w-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
            loading="lazy"
            decoding="async"
          />
        ) : uploading ? (
          <Loader2 className="h-6 w-6 animate-spin text-[#ccff00]" />
        ) : (
          <>
            <Icon className="mb-2 h-6 w-6 text-zinc-600 transition-colors group-hover:text-[#ccff00]" />
            <span className="text-[10px] uppercase tracking-widest text-zinc-600 transition-colors group-hover:text-zinc-400">
              {hint}
            </span>
          </>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.currentTarget.value = "";
          if (file) onUpload(file);
        }}
      />
    </div>
  );
}

function DurationPill({
  value,
  active,
  onClick,
}: {
  value: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all",
        active
          ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.2)]"
          : "bg-zinc-800/80 text-zinc-500 hover:bg-zinc-700/80 hover:text-zinc-300"
      )}
    >
      {value}
    </button>
  );
}

function FeatureCard({
  title,
  description,
  icon: Icon,
  accent = "lime",
}: {
  title: string;
  description: string;
  icon: typeof ImagePlus;
  accent?: "lime" | "pink" | "white";
}) {
  const accentColor =
    accent === "lime"
      ? "text-[#ccff00]"
      : accent === "pink"
        ? "text-[#ff3399]"
        : "text-white";

  const accentBg =
    accent === "lime"
      ? "bg-[#ccff00]/10 border-[#ccff00]/20"
      : accent === "pink"
        ? "bg-[#ff3399]/10 border-[#ff3399]/20"
        : "bg-white/10 border-white/20";

  return (
    <div className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-[#1a1919] p-6 transition-all hover:bg-[#222]">
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      <div className="relative space-y-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border",
            accentBg
          )}
        >
          <Icon className={cn("h-5 w-5", accentColor)} />
        </div>
        <div>
          <p className={cn("text-sm font-bold uppercase tracking-widest", accentColor)}>
            {title}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{description}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export function VideoStudioSection({
  prompt,
  onPromptChange,
  referenceId,
  currentModel,
  models,
  onModelChange,
  settings,
  onSettingsChange,
  submitting,
  onGenerate,
  jobs,
  selectedJob,
  assets,
  uploading,
  onUpload,
}: VideoStudioSectionProps) {
  const [activeTab, setActiveTab] = useState<"create" | "edit" | "motion">("create");
  const [multiShot, setMultiShot] = useState(false);

  const selectedDuration = String(settings.duration ?? "5");
  const selectedAspect = String(settings.aspect_ratio ?? "16:9");
  const selectedQuality = String(settings.quality ?? "720p");

  const startFrameAsset = referenceId
    ? assets.find((a) => a.id === referenceId)
    : null;
  const startFramePreview = startFrameAsset
    ? startFrameAsset.thumbnail_url ?? startFrameAsset.preview_url ?? startFrameAsset.cdn_url
    : null;

  const completedJobs = jobs.filter((j) => j.status === "completed");
  const recentResults = completedJobs.slice(0, 4);

  const previewUrl = selectedJob ? getJobPrimaryUrl(selectedJob) : null;

  return (
    <div className="flex gap-8">
      {/* ── Left Sidebar Control Panel ── */}
      <div className="w-[320px] shrink-0 space-y-6">
        {/* Tabs */}
        <div className="flex gap-2">
          {(["create", "edit", "motion"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-full px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all",
                activeTab === tab
                  ? "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.2)]"
                  : "bg-[#1a1919] text-zinc-500 hover:text-zinc-300"
              )}
            >
              {tab === "create" ? "Create Video" : tab === "edit" ? "Edit Video" : "Motion Control"}
            </button>
          ))}
        </div>

        {/* Dropzones */}
        <div className="grid grid-cols-2 gap-4">
          <Dropzone
            label="Start Frame"
            hint="Add image"
            icon={ImagePlus}
            uploading={uploading}
            onUpload={(file) => void onUpload(file, "image")}
            previewUrl={startFramePreview}
          />
          <Dropzone
            label="End Frame"
            hint="Optional"
            icon={ImagePlus}
            uploading={false}
            onUpload={(file) => void onUpload(file, "image")}
          />
        </div>

        {/* Multi-shot toggle */}
        <div className="flex items-center justify-between rounded-2xl bg-[#1a1919] px-4 py-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Multi-shot
          </span>
          <Switch
            checked={multiShot}
            onCheckedChange={setMultiShot}
            className="data-[state=checked]:bg-[#ccff00]"
          />
        </div>

        {/* Creative Prompt */}
        <div className="space-y-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Creative Prompt
          </p>
          <Textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.currentTarget.value)}
            placeholder="Describe the motion, camera movement, or scene transformation..."
            className="min-h-[120px] resize-none rounded-2xl border-white/10 bg-[#262626] px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-[#ccff00]/30"
          />
        </div>

        {/* Model & Settings */}
        <div className="space-y-4 rounded-2xl bg-[#131313] p-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Model
            </span>
            <span className="text-xs font-bold text-[#ccff00]">
              {currentModel?.name ?? "Loading…"}
            </span>
          </div>

          {/* Model selector */}
          {models.length > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {models.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => onModelChange(m.id)}
                  className={cn(
                    "rounded-full px-3 py-1 text-[9px] font-bold uppercase tracking-widest transition-all",
                    m.id === currentModel?.id
                      ? "bg-[#ccff00]/20 text-[#ccff00] border border-[#ccff00]/30"
                      : "bg-zinc-800/60 text-zinc-500 hover:text-zinc-300"
                  )}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {/* Duration */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Duration
            </span>
            <div className="flex gap-2">
              {["5", "10", "15"].map((d) => (
                <DurationPill
                  key={d}
                  value={`${d}S`}
                  active={selectedDuration === d}
                  onClick={() => onSettingsChange("duration", Number(d))}
                />
              ))}
            </div>
          </div>

          {/* Aspect Ratio */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Aspect Ratio
            </span>
            <div className="flex gap-2">
              {["16:9", "9:16", "1:1"].map((ar) => (
                <DurationPill
                  key={ar}
                  value={ar}
                  active={selectedAspect === ar}
                  onClick={() => onSettingsChange("aspect_ratio", ar)}
                />
              ))}
            </div>
          </div>

          {/* Quality */}
          <div className="space-y-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500">
              Quality
            </span>
            <div className="flex gap-2">
              {["720p", "1080p"].map((q) => (
                <DurationPill
                  key={q}
                  value={q}
                  active={selectedQuality === q}
                  onClick={() => onSettingsChange("quality", q)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          type="button"
          onClick={onGenerate}
          disabled={submitting}
          className="w-full rounded-full bg-[#ccff00] py-5 text-sm font-extrabold uppercase tracking-widest text-black shadow-[0_0_30px_rgba(204,255,0,0.3)] transition-all hover:bg-[#d4ff33] hover:shadow-[0_0_40px_rgba(204,255,0,0.4)] disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Zap className="mr-2 h-4 w-4" />
          )}
          {submitting ? "Generating…" : "Generate Video"}
        </Button>

        {/* Credits badge */}
        {currentModel && (
          <p className="text-center text-[10px] uppercase tracking-widest text-zinc-600">
            {currentModel.credits} credits per generation
          </p>
        )}
      </div>

      {/* ── Main Content Area ── */}
      <div className="min-w-0 flex-1 space-y-12">
        {/* Hero Headline */}
        <div>
          <h1
            className="text-5xl font-bold tracking-tighter text-white lg:text-6xl"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            MAKE VIDEOS IN{" "}
            <em className="not-italic text-[#ccff00]">ONE CLICK</em>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-zinc-400">
            250+ presets for camera control, motion paths, and cinematic transitions.
            Upload a frame, choose a style, and let WZRD handle the rest.
          </p>
        </div>

        {/* Preview Stage (if a job is selected) */}
        {selectedJob && (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/40">
            {previewUrl && selectedJob.resultPayload?.mediaType === "video" ? (
              <video
                src={previewUrl}
                controls
                autoPlay
                loop
                muted
                playsInline
                className="aspect-video w-full bg-black object-cover"
              />
            ) : previewUrl && selectedJob.resultPayload?.mediaType === "image" ? (
              <img
                src={previewUrl}
                alt="Video output"
                className="aspect-video w-full object-cover"
                decoding="async"
              />
            ) : isJobActive(selectedJob) ? (
              <div className="flex aspect-video flex-col items-center justify-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-[#ccff00]" />
                <p className="text-sm font-semibold text-white">Generating…</p>
                <p className="text-xs text-zinc-500">
                  {selectedJob.progress ?? 0}% complete
                </p>
              </div>
            ) : selectedJob.status === "failed" ? (
              <div className="flex aspect-video flex-col items-center justify-center gap-3">
                <p className="text-lg font-semibold text-rose-300">Generation Failed</p>
                <p className="max-w-md text-center text-sm text-zinc-500">
                  {selectedJob.errorMessage ?? "An unexpected error occurred."}
                </p>
              </div>
            ) : null}
          </div>
        )}

        {/* Feature Bento Grid */}
        <div className="space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                How it works
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                Start by exploring features
              </p>
              <div className="mt-2 h-1 w-24 bg-[#ccff00]" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FeatureCard
              title="Add Image"
              description="Upload a start frame or reference to guide the generation"
              icon={ImagePlus}
              accent="lime"
            />
            <FeatureCard
              title="Choose Preset"
              description="Pick from 250+ motion presets, camera paths, and styles"
              icon={SlidersHorizontal}
              accent="white"
            />
            <FeatureCard
              title="Get Video"
              description="AI generates a cinematic video from your inputs in seconds"
              icon={Film}
              accent="pink"
            />
          </div>
        </div>

        {/* Recent Creations */}
        {recentResults.length > 0 && (
          <div className="space-y-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-zinc-500">
                  Gallery
                </p>
                <p className="mt-1 text-lg font-semibold text-white">Recent Creations</p>
              </div>
              <button
                type="button"
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-[#ccff00]"
              >
                View All →
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {recentResults.map((job) => {
                const url = getJobPrimaryUrl(job);
                if (!url) return null;
                return (
                  <div
                    key={job.id}
                    className="group relative aspect-[9/16] overflow-hidden rounded-xl bg-[#1a1919]"
                  >
                    {job.resultPayload?.mediaType === "video" ? (
                      <video
                        src={url}
                        muted
                        className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                      />
                    ) : (
                      <img
                        src={url}
                        alt="Creation"
                        className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute right-2 top-2">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm">
                        <Play className="h-3 w-3 text-[#ccff00]" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Floating ready pill */}
        <div className="flex justify-end">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 backdrop-blur-md">
            <div className="h-2 w-2 animate-pulse rounded-full bg-[#ccff00]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
              Ready to animate
            </span>
          </div>
        </div>

        {/* WZRD Tip */}
        <div className="rounded-xl border-l-2 border-l-[#ccff00] bg-[#1a1919] p-5">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-[#ccff00]" />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#ccff00]">
                WZRD Tip
              </p>
              <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                For best results, use a high-quality start frame with clear subject
                details. The AI works best with well-lit, sharp reference images that
                show visible face and body composition.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
