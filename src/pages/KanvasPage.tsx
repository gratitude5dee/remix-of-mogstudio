import { startTransition, useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";

function safeTimeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 'Unknown';
  return formatDistanceToNow(d, { addSuffix: true });
}
import {
  ArrowLeft,
  AudioLines,
  CheckCircle2,
  Clapperboard,
  Film,
  Globe2,
  Home,
  Image as ImageIcon,
  Loader2,
  Mic2,
  Pencil,
  Sparkles,
  Upload,
  Video,
  Wand2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  buildCinemaRequest,
  buildImageRequest,
  buildLipSyncRequest,
  buildVideoRequest,
  createDefaultCinemaSettings,
  getJobPrimaryUrl,
  isJobActive,
  KANVAS_APERTURES,
  KANVAS_CAMERAS,
  KANVAS_FOCAL_LENGTHS,
  KANVAS_LENSES,
  KANVAS_STUDIO_META,
  KANVAS_STUDIO_ORDER,
  normalizeStudioParam,
  pickLatestStudioJob,
} from "@/features/kanvas/helpers";
import {
  fetchKanvasModels,
  InsufficientCreditsError,
  listKanvasAssets,
  listKanvasJobs,
  refreshKanvasJobStatus,
  submitKanvasJob,
  uploadKanvasAsset,
} from "@/features/kanvas/service";
import type {
  KanvasAsset,
  KanvasAssetType,
  KanvasControlDefinition,
  KanvasGenerationRequest,
  KanvasJob,
  KanvasModel,
  KanvasStudio,
} from "@/features/kanvas/types";
import { WorldviewSection } from "@/components/worldview";
import { CharacterCreationSection } from "@/components/character-creation";
import { VideoStudioSection } from "@/components/kanvas/VideoStudioSection";
import ImageStudioSection from "@/components/kanvas/ImageStudioSection";
import EditStudioSection from "@/components/kanvas/EditStudioSection";
import LipsyncStudioSection from "@/components/kanvas/LipsyncStudioSection";
import CinemaStudioSection from "@/components/kanvas/CinemaStudioSection";
import { MentionDropdown } from "@/components/character-creation/MentionDropdown";
import { useCharacterMention } from "@/hooks/useCharacterMention";
import { appRoutes } from "@/lib/routes";
import { cn } from "@/lib/utils";

const ACCEPTED_TYPES: Record<KanvasAssetType, string> = {
  image: "image/*",
  video: "video/*",
  audio: "audio/*",
};

const STUDIO_ICONS: Record<KanvasStudio, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  edit: Pencil,
  cinema: Clapperboard,
  lipsync: Mic2,
  worldview: Globe2,
  "character-creation": Sparkles,
};

function mergeAssets(current: KanvasAsset[], incoming: KanvasAsset[]): KanvasAsset[] {
  const map = new Map(current.map((asset) => [asset.id, asset]));
  for (const asset of incoming) {
    map.set(asset.id, asset);
  }
  return Array.from(map.values()).sort((left, right) =>
    (right.created_at ?? '').localeCompare(left.created_at ?? '')
  );
}

function mergeJobs(current: KanvasJob[], incoming: KanvasJob[]): KanvasJob[] {
  const map = new Map(current.map((job) => [job.id, job]));
  for (const job of incoming) {
    map.set(job.id, job);
  }
  return Array.from(map.values()).sort((left, right) =>
    (right.createdAt ?? '').localeCompare(left.createdAt ?? '')
  );
}

function resolveAssetPreview(asset: KanvasAsset): string | null {
  return asset.thumbnail_url ?? asset.preview_url ?? asset.cdn_url;
}

function getAssetTitle(asset: KanvasAsset): string {
  return asset.original_file_name || asset.file_name;
}

function getPromptPlaceholder(studio: KanvasStudio, usesReferenceAsset: boolean): string {
  if (studio === "image") {
    return usesReferenceAsset
      ? "Describe the transformation you want to apply"
      : "Describe the image you want to create";
  }
  if (studio === "video") {
    return usesReferenceAsset
      ? "Describe the motion or camera move"
      : "Describe the video you want to create";
  }
  if (studio === "cinema") {
    return "Describe your scene with a director’s eye";
  }
  return "Optional: describe tone, performance, or motion";
}

function getAssetRequirementLabel(
  studio: KanvasStudio,
  assetType: KanvasAssetType,
  modeLabel: string
): string {
  if (studio === "lipsync" && assetType === "image" && modeLabel === "talking-head") {
    return "Portrait";
  }
  if (studio === "lipsync" && assetType === "video") {
    return "Source Video";
  }
  if (assetType === "audio") {
    return "Audio";
  }
  if (assetType === "image") {
    return studio === "video" ? "Reference Frame" : "Reference Images";
  }
  return "Video";
}

function coerceControlValue(
  definition: KanvasControlDefinition,
  rawValue: string
): string | number | boolean {
  if (definition.type === "boolean") {
    return rawValue === "true";
  }
  if (definition.type === "number") {
    const parsed = Number(rawValue);
    return Number.isFinite(parsed) ? parsed : definition.defaultValue ?? 0;
  }
  return rawValue;
}

function hasSettings(values: Record<string, unknown>): boolean {
  return Object.keys(values).length > 0;
}

function StudioNavButton({
  studio,
  active,
  onClick,
  compact = false,
}: {
  studio: KanvasStudio;
  active: boolean;
  onClick: (studio: KanvasStudio) => void;
  compact?: boolean;
}) {
  const Icon = STUDIO_ICONS[studio];
  const label = KANVAS_STUDIO_META[studio].label;

  return (
    <button
      type="button"
      onClick={() => onClick(studio)}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all",
        active
          ? "border-lime-300/40 bg-lime-300/10 text-white shadow-[0_0_40px_rgba(190,242,100,0.08)]"
          : "border-white/10 bg-white/[0.03] text-zinc-400 hover:border-white/20 hover:bg-white/[0.06] hover:text-white",
        compact && "justify-center px-0"
      )}
      aria-pressed={active}
    >
      <Icon className={cn("h-4 w-4", active ? "text-lime-300" : "text-zinc-500")} />
      {!compact && <span>{label}</span>}
    </button>
  );
}

function ModelControls({
  model,
  settings,
  onChange,
}: {
  model: KanvasModel | null;
  settings: Record<string, unknown>;
  onChange: (key: string, value: string | number | boolean) => void;
}) {
  if (!model || model.controls.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {model.controls.map((control) => {
        const currentValue = settings[control.key] ?? control.defaultValue;
        if (control.type === "boolean") {
          const enabled = currentValue === true;
          return (
            <div
              key={control.key}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-white">{control.label}</p>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-white/10 bg-white/[0.03] text-xs",
                    enabled ? "text-lime-300" : "text-zinc-400"
                  )}
                >
                  {enabled ? "On" : "Off"}
                </Badge>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "w-full justify-between border-white/10 bg-white/[0.03]",
                  enabled && "border-lime-300/40 bg-lime-300/10 text-white"
                )}
                onClick={() => onChange(control.key, !enabled)}
              >
                Toggle
                <Sparkles className="h-4 w-4" />
              </Button>
            </div>
          );
        }

        if (control.type === "select" && control.options?.length) {
          return (
            <div
              key={control.key}
              className="rounded-2xl border border-white/10 bg-black/30 p-4"
            >
              <p className="mb-3 text-sm font-semibold text-white">{control.label}</p>
              <Select
                value={String(currentValue ?? control.options[0].value)}
                onValueChange={(value) => onChange(control.key, coerceControlValue(control, value))}
              >
                <SelectTrigger className="border-white/10 bg-black/50 text-white">
                  <SelectValue placeholder={control.label} />
                </SelectTrigger>
                <SelectContent>
                  {control.options.map((option) => (
                    <SelectItem key={`${control.key}-${option.value}`} value={String(option.value)}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          );
        }

        return (
          <div
            key={control.key}
            className="rounded-2xl border border-white/10 bg-black/30 p-4"
          >
            <p className="mb-3 text-sm font-semibold text-white">{control.label}</p>
            <Input
              type="number"
              min={control.min}
              max={control.max}
              step={control.step}
              value={typeof currentValue === "number" ? currentValue : Number(control.defaultValue ?? 0)}
              onChange={(event) =>
                onChange(control.key, Number(event.currentTarget.value || control.defaultValue || 0))
              }
              className="border-white/10 bg-black/50 text-white"
            />
          </div>
        );
      })}
    </div>
  );
}

function AssetSelector({
  title,
  assetType,
  assets,
  selectedIds,
  multi = false,
  uploading,
  optional = false,
  onToggle,
  onUpload,
}: {
  title: string;
  assetType: KanvasAssetType;
  assets: KanvasAsset[];
  selectedIds: string[];
  multi?: boolean;
  uploading: boolean;
  optional?: boolean;
  onToggle: (assetId: string) => void;
  onUpload: (file: File, assetType: KanvasAssetType) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recentAssets = assets.filter((asset) => asset.asset_type === assetType).slice(0, 6);

  return (
    <Card className="rounded-[28px] border-white/10 bg-[#0c0c0f]/80 p-4 text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="text-xs text-zinc-500">
            {optional ? "Optional for some models" : multi ? "Choose one or more references" : "Choose one asset"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedIds.length > 0 && (
            <Badge variant="outline" className="border-lime-300/30 bg-lime-300/10 text-lime-200">
              {selectedIds.length} selected
            </Badge>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES[assetType]}
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.currentTarget.value = "";
              if (file) {
                void onUpload(file, assetType);
              }
            }}
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="border-white/10 bg-black/40 text-white"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload
          </Button>
        </div>
      </div>

      {recentAssets.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-5 text-sm text-zinc-500">
          No {assetType} assets yet.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {recentAssets.map((asset) => {
            const selected = selectedIds.includes(asset.id);
            const previewUrl = resolveAssetPreview(asset);
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => onToggle(asset.id)}
                className={cn(
                  "overflow-hidden rounded-2xl border text-left transition-all",
                  selected
                    ? "border-lime-300/40 bg-lime-300/10 shadow-[0_0_30px_rgba(190,242,100,0.08)]"
                    : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex gap-3 p-3">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04]">
                    {asset.asset_type === "image" && previewUrl ? (
                      <img
                        src={previewUrl}
                        alt={getAssetTitle(asset)}
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : asset.asset_type === "video" && previewUrl ? (
                      <video
                        src={previewUrl}
                        muted
                        className="h-full w-full object-cover"
                      />
                    ) : asset.asset_type === "audio" ? (
                      <AudioLines className="h-6 w-6 text-lime-300" />
                    ) : (
                      <Film className="h-6 w-6 text-zinc-500" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-white">
                        {getAssetTitle(asset)}
                      </p>
                      {selected && <CheckCircle2 className="h-4 w-4 shrink-0 text-lime-300" />}
                    </div>
                    <p className="truncate text-xs text-zinc-500">{asset.asset_type.toUpperCase()}</p>
                    <p className="mt-2 truncate text-xs text-zinc-600">
                      {safeTimeAgo(asset.created_at)}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}

function HistoryRail({
  jobs,
  selectedJobId,
  onSelect,
}: {
  jobs: KanvasJob[];
  selectedJobId: string | null;
  onSelect: (jobId: string) => void;
}) {
  return (
    <Card className="rounded-[28px] border-white/10 bg-[#09090b]/90 p-0 text-white shadow-[0_20px_80px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-white">Recent Jobs</p>
          <p className="text-xs text-zinc-500">Server-backed generation history</p>
        </div>
        <Badge variant="outline" className="border-white/10 bg-white/[0.03] text-zinc-300">
          {jobs.length}
        </Badge>
      </div>
      <Separator className="bg-white/10" />
      <ScrollArea className="h-[420px]">
        <div className="space-y-3 p-4">
          {jobs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/10 bg-black/30 p-5 text-sm text-zinc-500">
              No generations yet.
            </div>
          ) : (
            jobs.map((job) => {
              const previewUrl = getJobPrimaryUrl(job);
              const selected = selectedJobId === job.id;
              const Icon = STUDIO_ICONS[job.studio];
              return (
                <button
                  key={job.id}
                  type="button"
                  onClick={() => onSelect(job.id)}
                  className={cn(
                    "w-full overflow-hidden rounded-2xl border text-left transition-all",
                    selected
                      ? "border-lime-300/40 bg-lime-300/10"
                      : "border-white/10 bg-black/30 hover:border-white/20 hover:bg-white/[0.04]"
                  )}
                >
                  <div className="flex gap-3 p-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/[0.04]">
                      {job.resultPayload?.mediaType === "image" && previewUrl ? (
                        <img
                          src={previewUrl}
                          alt={`${job.studio} result`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : job.resultPayload?.mediaType === "video" && previewUrl ? (
                        <video src={previewUrl} muted className="h-full w-full object-cover" />
                      ) : isJobActive(job) ? (
                        <Loader2 className="h-5 w-5 animate-spin text-lime-300" />
                      ) : (
                        <Icon className="h-5 w-5 text-zinc-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-semibold text-white">
                          {KANVAS_STUDIO_META[job.studio].label}
                        </p>
                        <Badge
                          variant="outline"
                          className={cn(
                            "border-white/10 text-[10px] uppercase tracking-[0.18em]",
                            job.status === "completed" && "text-lime-300",
                            job.status === "failed" && "text-rose-300",
                            isJobActive(job) && "text-amber-200"
                          )}
                        >
                          {job.status}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-zinc-500">{job.modelId ?? "Unknown model"}</p>
                      <p className="mt-2 text-xs text-zinc-600">
                        {safeTimeAgo(job.createdAt)}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </Card>
  );
}

function getJobProgressLabel(job: KanvasJob): string {
  if (job.status === 'queued') return 'Queued — waiting for a slot…';
  if (job.status === 'processing') {
    const pct = job.progress ?? 0;
    if (pct < 30) return 'Processing — warming up model…';
    if (pct < 70) return 'Processing — generating output…';
    return 'Processing — finalizing…';
  }
  return job.status;
}

function PreviewStage({
  studio,
  selectedJob,
  currentModel,
  onRetry,
}: {
  studio: KanvasStudio;
  selectedJob: KanvasJob | null;
  currentModel: KanvasModel | null;
  onRetry?: () => void;
}) {
  const previewUrl = getJobPrimaryUrl(selectedJob);
  const meta = KANVAS_STUDIO_META[studio];
  const Icon = STUDIO_ICONS[studio];

  return (
    <Card className="relative overflow-hidden rounded-[36px] border-white/10 bg-[radial-gradient(circle_at_top,#1f2917,transparent_35%),linear-gradient(180deg,#0f1014,#08080a)] p-6 text-white shadow-[0_30px_120px_rgba(0,0,0,0.45)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(190,242,100,0.15),transparent_35%)]" />
      <div className="relative space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-zinc-500">
              {meta.label}
            </p>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-5xl">
              {meta.headline}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-zinc-400">{meta.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {currentModel && (
              <Badge className="bg-lime-300 text-black hover:bg-lime-300">
                {currentModel.credits} credits
              </Badge>
            )}
            {selectedJob && (
              <Badge
                variant="outline"
                className={cn(
                  "border-white/10 bg-white/[0.03]",
                  selectedJob.status === "completed" && "text-lime-300",
                  selectedJob.status === "failed" && "text-rose-300",
                  isJobActive(selectedJob) && "text-amber-200"
                )}
              >
                {selectedJob.status}
              </Badge>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-black/40">
          {previewUrl && selectedJob?.resultPayload?.mediaType === "image" ? (
            <img
              src={previewUrl}
              alt={`${studio} output`}
              className="aspect-[16/9] w-full object-cover"
              decoding="async"
            />
          ) : previewUrl && selectedJob?.resultPayload?.mediaType === "video" ? (
            <video
              src={previewUrl}
              controls
              autoPlay
              loop
              muted
              playsInline
              className="aspect-[16/9] w-full bg-black object-cover"
            />
          ) : selectedJob?.status === "failed" ? (
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-rose-500/30 bg-rose-500/10">
                <Icon className="h-10 w-10 text-rose-400" />
              </div>
              <div>
                <p className="text-xl font-semibold text-rose-300">Generation Failed</p>
                <p className="mt-2 max-w-md text-sm text-zinc-500">
                  {selectedJob.errorMessage ?? 'An unexpected error occurred.'}
                </p>
              </div>
              {onRetry && (
                <Button
                  type="button"
                  variant="outline"
                  className="border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20"
                  onClick={onRetry}
                >
                  <Wand2 className="mr-2 h-4 w-4" />
                  Retry Generation
                </Button>
              )}
            </div>
          ) : (
            <div className="flex aspect-[16/9] flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[28px] border border-lime-300/30 bg-lime-300/10">
                {selectedJob && isJobActive(selectedJob) ? (
                  <Loader2 className="h-10 w-10 animate-spin text-lime-300" />
                ) : (
                  <Icon className="h-10 w-10 text-lime-300" />
                )}
              </div>
              <div>
                <p className="text-xl font-semibold text-white">
                  {selectedJob && isJobActive(selectedJob)
                    ? "Generation in progress"
                    : "Ready to generate"}
                </p>
                <p className="mt-2 text-sm text-zinc-500">
                  {selectedJob && isJobActive(selectedJob)
                    ? getJobProgressLabel(selectedJob)
                    : currentModel
                      ? `${currentModel.name} is selected for this studio.`
                      : "Load a model and start generating."}
                </p>
              </div>
              {selectedJob && isJobActive(selectedJob) && (
                <div className="w-full max-w-md space-y-2">
                  <Progress value={selectedJob.progress ?? 12} className="bg-white/10" />
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {selectedJob.progress ?? 12}% complete
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedJob && (
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Model</p>
              <p className="mt-2 truncate text-sm font-semibold text-white">
                {selectedJob.modelId ?? "Unknown model"}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Queued</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {safeTimeAgo(selectedJob.createdAt)}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">Output</p>
              <p className="mt-2 text-sm font-semibold text-white">
                {selectedJob.resultPayload?.mediaType === "video" ? "Video" : "Image"}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function KanvasPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const studio = normalizeStudioParam(searchParams.get("studio"));

  const [modelsByStudio, setModelsByStudio] = useState<Partial<Record<KanvasStudio, KanvasModel[]>>>({});
  const [assets, setAssets] = useState<KanvasAsset[]>([]);
  const [jobs, setJobs] = useState<KanvasJob[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [creditsDialogOpen, setCreditsDialogOpen] = useState(false);
  const [creditsInfo, setCreditsInfo] = useState<{ required: number; available: number } | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [uploadingByType, setUploadingByType] = useState<Record<KanvasAssetType, boolean>>({
    image: false,
    video: false,
    audio: false,
  });

  // @mention character references
  const {
    suggestions: mentionSuggestions,
    showSuggestions: showMentionDropdown,
    onPromptChange: onMentionChange,
    onSelectSuggestion,
    resolvePrompt: resolveMentions,
    closeSuggestions: closeMentionDropdown,
  } = useCharacterMention();

  const [imagePrompt, setImagePrompt] = useState("");
  const [imageReferenceIds, setImageReferenceIds] = useState<string[]>([]);
  const [imageModelId, setImageModelId] = useState("");
  const [imageSettings, setImageSettings] = useState<Record<string, unknown>>({});

  const [videoPrompt, setVideoPrompt] = useState("");
  const [videoReferenceId, setVideoReferenceId] = useState<string | null>(null);
  const [videoModelId, setVideoModelId] = useState("");
  const [videoSettings, setVideoSettings] = useState<Record<string, unknown>>({});

  const [cinemaPrompt, setCinemaPrompt] = useState("");
  const [cinemaModelId, setCinemaModelId] = useState("");
  const [cinemaSettings, setCinemaSettings] = useState<Record<string, unknown>>({});
  const [cinemaCameraSettings, setCinemaCameraSettings] = useState(createDefaultCinemaSettings());

  const [lipsyncMode, setLipsyncMode] = useState<"talking-head" | "lip-sync">("talking-head");
  const [lipsyncPrompt, setLipsyncPrompt] = useState("");
  const [lipsyncImageId, setLipsyncImageId] = useState<string | null>(null);
  const [lipsyncVideoId, setLipsyncVideoId] = useState<string | null>(null);
  const [lipsyncAudioId, setLipsyncAudioId] = useState<string | null>(null);
  const [lipsyncModelId, setLipsyncModelId] = useState("");
  const [lipsyncSettings, setLipsyncSettings] = useState<Record<string, unknown>>({});

  const studioModels = modelsByStudio[studio] ?? [];
  const imageMode = imageReferenceIds.length > 0 ? "image-to-image" : "text-to-image";
  const videoMode = videoReferenceId ? "image-to-video" : "text-to-video";

  const currentImageModels = useMemo(
    () => (modelsByStudio.image ?? []).filter((model) => model.mode === imageMode),
    [imageMode, modelsByStudio.image]
  );
  const currentVideoModels = useMemo(
    () => (modelsByStudio.video ?? []).filter((model) => model.mode === videoMode),
    [modelsByStudio.video, videoMode]
  );
  const currentCinemaModels = useMemo(
    () => (modelsByStudio.cinema ?? []).filter((model) => model.mode === "cinematic-image"),
    [modelsByStudio.cinema]
  );
  const currentLipsyncModels = useMemo(
    () => (modelsByStudio.lipsync ?? []).filter((model) => model.mode === lipsyncMode),
    [lipsyncMode, modelsByStudio.lipsync]
  );

  const currentImageModel =
    currentImageModels.find((model) => model.id === imageModelId) ?? currentImageModels[0] ?? null;
  const currentVideoModel =
    currentVideoModels.find((model) => model.id === videoModelId) ?? currentVideoModels[0] ?? null;
  const currentCinemaModel =
    currentCinemaModels.find((model) => model.id === cinemaModelId) ?? currentCinemaModels[0] ?? null;
  const currentLipsyncModel =
    currentLipsyncModels.find((model) => model.id === lipsyncModelId) ?? currentLipsyncModels[0] ?? null;

  const currentModel =
    studio === "image"
      ? currentImageModel
      : studio === "video"
        ? currentVideoModel
        : studio === "cinema"
          ? currentCinemaModel
          : currentLipsyncModel;

  const currentStudioJobs = useMemo(
    () => jobs.filter((job) => job.studio === studio),
    [jobs, studio]
  );
  const selectedJob =
    currentStudioJobs.find((job) => job.id === selectedJobId) ??
    pickLatestStudioJob(currentStudioJobs, studio);

  useEffect(() => {
    let cancelled = false;

    async function loadInitialState() {
      setPageLoading(true);
      try {
        const studioKeys = KANVAS_STUDIO_ORDER.filter((s) => s !== "worldview" && s !== "character-creation");
        const [assetsResult, jobsResult, ...modelResults] = await Promise.allSettled([
          listKanvasAssets(),
          listKanvasJobs(),
          ...studioKeys.map((entry) => fetchKanvasModels(entry)),
        ]);

        if (cancelled) {
          return;
        }

        const loadedAssets = assetsResult.status === "fulfilled" ? assetsResult.value : [];
        const loadedJobs = jobsResult.status === "fulfilled" ? jobsResult.value : [];

        if (assetsResult.status === "rejected") console.warn("Failed to load assets:", assetsResult.reason);
        if (jobsResult.status === "rejected") console.warn("Failed to load jobs:", jobsResult.reason);

        const modelGroups = modelResults.map((r, i) => {
          if (r.status === "fulfilled") return r.value;
          console.warn(`Failed to load models for ${studioKeys[i]}:`, r.reason);
          return [] as KanvasModel[];
        });

        setAssets(loadedAssets);
        setJobs(loadedJobs);
        setModelsByStudio({
          image: modelGroups[0],
          video: modelGroups[1],
          lipsync: modelGroups[2],
          cinema: modelGroups[3],
        });
      } catch (error) {
        if (!cancelled) {
          toast.error(
            error instanceof Error ? error.message : "Failed to load the Kanvas shell"
          );
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    }

    void loadInitialState();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!currentImageModel) {
      return;
    }

    if (currentImageModel.id !== imageModelId) {
      setImageModelId(currentImageModel.id);
      setImageSettings({ ...currentImageModel.defaults });
      return;
    }

    if (!hasSettings(imageSettings) && hasSettings(currentImageModel.defaults)) {
      setImageSettings({ ...currentImageModel.defaults });
    }
  }, [currentImageModel, imageModelId, imageSettings]);

  useEffect(() => {
    if (!currentVideoModel) {
      return;
    }

    if (currentVideoModel.id !== videoModelId) {
      setVideoModelId(currentVideoModel.id);
      setVideoSettings({ ...currentVideoModel.defaults });
      return;
    }

    if (!hasSettings(videoSettings) && hasSettings(currentVideoModel.defaults)) {
      setVideoSettings({ ...currentVideoModel.defaults });
    }
  }, [currentVideoModel, videoModelId, videoSettings]);

  useEffect(() => {
    if (!currentCinemaModel) {
      return;
    }

    if (currentCinemaModel.id !== cinemaModelId) {
      setCinemaModelId(currentCinemaModel.id);
      setCinemaSettings({ ...currentCinemaModel.defaults });
      return;
    }

    if (!hasSettings(cinemaSettings) && hasSettings(currentCinemaModel.defaults)) {
      setCinemaSettings({ ...currentCinemaModel.defaults });
    }
  }, [cinemaModelId, cinemaSettings, currentCinemaModel]);

  useEffect(() => {
    if (!currentLipsyncModel) {
      return;
    }

    if (currentLipsyncModel.id !== lipsyncModelId) {
      setLipsyncModelId(currentLipsyncModel.id);
      setLipsyncSettings({ ...currentLipsyncModel.defaults });
      return;
    }

    if (!hasSettings(lipsyncSettings) && hasSettings(currentLipsyncModel.defaults)) {
      setLipsyncSettings({ ...currentLipsyncModel.defaults });
    }
  }, [currentLipsyncModel, lipsyncModelId, lipsyncSettings]);

  useEffect(() => {
    const latestStudioJob = currentStudioJobs[0];
    if (!latestStudioJob) {
      setSelectedJobId(null);
      return;
    }

    if (!selectedJobId || !currentStudioJobs.some((job) => job.id === selectedJobId)) {
      setSelectedJobId(latestStudioJob.id);
    }
  }, [currentStudioJobs, selectedJobId]);

  useEffect(() => {
    const activeJobs = jobs.filter(isJobActive);
    if (activeJobs.length === 0) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void Promise.allSettled(activeJobs.slice(0, 5).map((job) => refreshKanvasJobStatus(job.id)))
        .then((results) => {
          const updatedJobs = results
            .filter((r): r is PromiseFulfilledResult<KanvasJob> => r.status === "fulfilled")
            .map((r) => r.value);
          if (updatedJobs.length > 0) {
            setJobs((current) => mergeJobs(current, updatedJobs));
          }
          results.forEach((r, i) => {
            if (r.status === "rejected") {
              console.warn(`Failed to refresh job ${activeJobs[i]?.id}:`, r.reason);
            }
          });
        });
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [jobs]);

  function setStudio(nextStudio: KanvasStudio) {
    startTransition(() => {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("studio", nextStudio);
      setSearchParams(nextParams, { replace: true });
    });
  }

  async function handleAssetUpload(file: File, assetType: KanvasAssetType) {
    setUploadingByType((current) => ({ ...current, [assetType]: true }));
    try {
      const asset = await uploadKanvasAsset(file, { assetType });
      setAssets((current) => mergeAssets(current, [asset]));

      if (studio === "image" && assetType === "image") {
        setImageReferenceIds((current) => Array.from(new Set([asset.id, ...current])));
      } else if (studio === "video" && assetType === "image") {
        setVideoReferenceId(asset.id);
      } else if (studio === "lipsync" && assetType === "image") {
        setLipsyncImageId(asset.id);
      } else if (studio === "lipsync" && assetType === "video") {
        setLipsyncVideoId(asset.id);
      } else if (studio === "lipsync" && assetType === "audio") {
        setLipsyncAudioId(asset.id);
      }

      toast.success(`${file.name} uploaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploadingByType((current) => ({ ...current, [assetType]: false }));
    }
  }

  function handleImageReferenceToggle(assetId: string) {
    setImageReferenceIds((current) =>
      current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId]
    );
  }

  /** Expand @mentions in a prompt string before sending to generation. */
  function expandMentions(rawPrompt: string): string {
    const { expandedPrompt } = resolveMentions(rawPrompt);
    return expandedPrompt;
  }

  function buildCurrentRequest(): KanvasGenerationRequest {
    if (studio === "image") {
      if (imageReferenceIds.length === 0 && imagePrompt.trim().length === 0) {
        throw new Error("Add a prompt or select one or more reference images.");
      }
      if (!currentImageModel) {
        throw new Error("No image model is available.");
      }

      return buildImageRequest({
        modelId: currentImageModel.id,
        prompt: expandMentions(imagePrompt.trim()),
        settings: imageSettings,
        imageIds: imageReferenceIds,
      });
    }

    if (studio === "video") {
      if (!videoReferenceId && videoPrompt.trim().length === 0) {
        throw new Error("Add a video prompt or select a reference frame.");
      }
      if (!currentVideoModel) {
        throw new Error("No video model is available.");
      }

      return buildVideoRequest({
        modelId: currentVideoModel.id,
        prompt: expandMentions(videoPrompt.trim()),
        settings: videoSettings,
        imageId: videoReferenceId,
      });
    }

    if (studio === "cinema") {
      if (cinemaPrompt.trim().length === 0) {
        throw new Error("Describe the scene you want to shoot.");
      }
      if (!currentCinemaModel) {
        throw new Error("No cinema model is available.");
      }

      return buildCinemaRequest({
        modelId: currentCinemaModel.id,
        prompt: expandMentions(cinemaPrompt.trim()),
        settings: cinemaSettings,
        cinema: cinemaCameraSettings,
      });
    }

    if (!currentLipsyncModel) {
      throw new Error("No lip sync model is available.");
    }
    if (!lipsyncAudioId) {
      throw new Error("Select an audio asset first.");
    }
    if (lipsyncMode === "talking-head") {
      const requiresImage = currentLipsyncModel.requiresAssets.includes("image");
      if (requiresImage && !lipsyncImageId) {
        throw new Error("The selected talking-head model requires a portrait image.");
      }

      return buildLipSyncRequest({
        mode: "talking-head",
        modelId: currentLipsyncModel.id,
        prompt: expandMentions(lipsyncPrompt.trim()),
        settings: lipsyncSettings,
        imageId: lipsyncImageId,
        audioId: lipsyncAudioId,
      });
    }

    if (!lipsyncVideoId) {
      throw new Error("Select a source video for lip-sync mode.");
    }

    return buildLipSyncRequest({
      mode: "lip-sync",
      modelId: currentLipsyncModel.id,
      prompt: lipsyncPrompt.trim(),
      settings: lipsyncSettings,
      videoId: lipsyncVideoId,
      audioId: lipsyncAudioId,
    });
  }

  async function handleGenerate() {
    try {
      const request = buildCurrentRequest();
      setSubmitting(true);
      const job = await submitKanvasJob(request);
      setJobs((current) => mergeJobs(current, [job]));
      setSelectedJobId(job.id);
      toast.info(`Generation started — ${currentModel?.name ?? 'Unknown model'}`, {
        description: `Studio: ${KANVAS_STUDIO_META[studio].label}`,
      });
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        setCreditsInfo({
          required: error.payload.required,
          available: error.payload.available,
        });
        setCreditsDialogOpen(true);
      } else {
        toast.error(error instanceof Error ? error.message : "Generation failed");
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetryLastFailed() {
    const lastFailed = currentStudioJobs.find((j) => j.status === 'failed');
    if (lastFailed) {
      void handleGenerate();
    }
  }

  const imageAssets = assets.filter((asset) => asset.asset_type === "image");
  const videoAssets = assets.filter((asset) => asset.asset_type === "video");
  const audioAssets = assets.filter((asset) => asset.asset_type === "audio");

  return (
    <div className="min-h-screen bg-[#050506] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(190,242,100,0.08),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.08),transparent_24%)]" />
      <div className="relative">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/70 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 md:px-6">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                className="border-white/10 bg-white/[0.03] text-white"
                onClick={() => navigate(appRoutes.home)}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
              <div className="hidden rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-2 md:block">
                <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-zinc-500">
                  WZRD Studio
                </p>
                <p className="text-sm font-semibold text-white">Kanvas Multi-Studio</p>
              </div>
            </div>

            <div className="hidden items-center gap-2 lg:flex">
              {KANVAS_STUDIO_ORDER.map((entry) => (
                <StudioNavButton
                  key={entry}
                  studio={entry}
                  active={studio === entry}
                  onClick={setStudio}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-white"
                onClick={() => navigate(appRoutes.home)}
                aria-label="Home"
              >
                <Home className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="border-t border-white/5 px-4 py-3 lg:hidden">
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-2 pb-1">
                {KANVAS_STUDIO_ORDER.map((entry) => (
                  <StudioNavButton
                    key={entry}
                    studio={entry}
                    active={studio === entry}
                    onClick={setStudio}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        </header>

        <div className="mx-auto flex max-w-[1600px] gap-6 px-4 py-6 md:px-6">
          <aside className="hidden w-24 flex-col gap-3 xl:flex">
            {KANVAS_STUDIO_ORDER.map((entry) => (
              <StudioNavButton
                key={entry}
                studio={entry}
                active={studio === entry}
                onClick={setStudio}
                compact
              />
            ))}
          </aside>

          <div className="min-w-0 flex-1">
            {studio === "image" ? (
              <ImageStudioSection
                prompt={imagePrompt}
                onPromptChange={setImagePrompt}
                referenceId={imageReferenceIds[0] ?? null}
                onReferenceChange={(id) => setImageReferenceIds(id ? [id] : [])}
                currentModel={currentImageModel}
                models={currentImageModels}
                onModelChange={(id) => {
                  setImageModelId(id);
                  setImageSettings({});
                }}
                settings={imageSettings}
                onSettingsChange={(k, v) => setImageSettings((c) => ({ ...c, [k]: v }))}
                submitting={submitting}
                onGenerate={handleGenerate}
                jobs={currentStudioJobs}
                selectedJob={selectedJob}
                assets={imageAssets}
                uploading={uploadingByType.image}
                onUpload={handleAssetUpload}
                pageLoading={pageLoading}
              />
            ) : studio === "video" ? (
              <VideoStudioSection
                prompt={videoPrompt}
                onPromptChange={setVideoPrompt}
                referenceId={videoReferenceId}
                onReferenceChange={setVideoReferenceId}
                currentModel={currentVideoModel}
                models={currentVideoModels}
                onModelChange={(id) => {
                  setVideoModelId(id);
                  setVideoSettings({});
                }}
                settings={videoSettings}
                onSettingsChange={(k, v) => setVideoSettings((c) => ({ ...c, [k]: v }))}
                submitting={submitting}
                onGenerate={handleGenerate}
                jobs={currentStudioJobs}
                selectedJob={selectedJob}
                assets={imageAssets}
                uploading={uploadingByType.image}
                onUpload={handleAssetUpload}
                pageLoading={pageLoading}
              />
            ) : studio === "edit" ? (
              <EditStudioSection
                assets={imageAssets}
                jobs={currentStudioJobs}
                selectedJob={selectedJob}
                uploading={uploadingByType.image}
                onUpload={handleAssetUpload}
              />
            ) : studio === "worldview" ? (
              <WorldviewSection />
            ) : studio === "character-creation" ? (
              <CharacterCreationSection />
            ) : studio === "lipsync" ? (
              <LipsyncStudioSection
                prompt={lipsyncPrompt}
                onPromptChange={setLipsyncPrompt}
                lipsyncMode={lipsyncMode}
                onLipsyncModeChange={setLipsyncMode}
                imageId={lipsyncImageId}
                videoId={lipsyncVideoId}
                audioId={lipsyncAudioId}
                onImageChange={setLipsyncImageId}
                onVideoChange={setLipsyncVideoId}
                onAudioChange={setLipsyncAudioId}
                currentModel={currentLipsyncModel}
                models={currentLipsyncModels}
                onModelChange={(id) => {
                  setLipsyncModelId(id);
                  setLipsyncSettings({});
                }}
                submitting={submitting}
                onGenerate={() => void handleGenerate()}
                jobs={currentStudioJobs}
                selectedJob={selectedJob ?? null}
                assets={assets}
                uploadingImage={uploadingByType.image}
                uploadingVideo={uploadingByType.video}
                uploadingAudio={uploadingByType.audio}
                onUpload={handleAssetUpload}
              />
            ) : studio === "cinema" ? (
              <CinemaStudioSection
                prompt={cinemaPrompt}
                onPromptChange={setCinemaPrompt}
                cinemaSettings={cinemaSettings}
                onCinemaSettingsChange={setCinemaSettings}
                cinemaCameraSettings={cinemaCameraSettings}
                onCinemaCameraSettingsChange={setCinemaCameraSettings}
                currentModel={currentCinemaModel}
                models={currentCinemaModels}
                onModelChange={(id) => { setCinemaModelId(id); setCinemaSettings({}); }}
                submitting={submitting}
                onGenerate={() => void handleGenerate()}
                jobs={currentStudioJobs}
                selectedJob={selectedJob ?? null}
                assets={assets}
                onUpload={handleAssetUpload}
                uploading={uploadingByType.image}
              />
            ) : null}
          </div>
        </div>


        {pageLoading && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
            <div className="rounded-[32px] border border-white/10 bg-[#09090b]/90 px-8 py-6 text-center text-white shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
              <Loader2 className="mx-auto mb-3 h-6 w-6 animate-spin text-lime-300" />
              <p className="text-sm font-semibold text-white">Loading Kanvas shell</p>
              <p className="mt-1 text-xs text-zinc-500">Fetching models, assets, and history.</p>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={creditsDialogOpen} onOpenChange={setCreditsDialogOpen}>
        <AlertDialogContent className="border-white/10 bg-[#0c0c0f] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Insufficient Credits</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              This generation requires <span className="font-semibold text-white">{creditsInfo?.required ?? 0}</span> credits
              but you only have <span className="font-semibold text-white">{creditsInfo?.available ?? 0}</span> available.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.08]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-lime-400 text-black hover:bg-lime-300"
              onClick={() => navigate(appRoutes.settings.billing)}
            >
              Get More Credits
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
