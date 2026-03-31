import React, { useEffect } from 'react';
import {
  Settings,
  Type,
  Image as ImageIcon,
  Video,
  Music,
  Zap,
  Check,
  Loader2,
  ArrowLeft,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  useProjectSettingsStore,
  TEXT_MODELS,
  STORYLINE_TEXT_MODELS,
  IMAGE_MODELS,
  VIDEO_MODELS,
  AUDIO_MODELS,
} from '@/store/projectSettingsStore';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

interface SettingsPanelProps {
  projectId: string;
  onClose: () => void;
  onBack?: () => void;
}

interface ModelSelectorProps {
  label: string;
  icon: React.ElementType;
  models: Array<{ id: string; name: string; provider: string; speed?: string; badge?: string; category?: string; workflowType?: string }>;
  selectedId: string;
  onSelect: (id: string) => void;
  iconColor: string;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({
  label,
  icon: Icon,
  models,
  selectedId,
  onSelect,
  iconColor,
}) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className={cn('w-4 h-4', iconColor)} />
        <span className="text-sm font-medium text-white">{label}</span>
      </div>
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onSelect(model.id)}
            className={cn(
              'w-full flex items-center justify-between p-3 rounded-lg transition-all text-left',
              selectedId === model.id
                ? 'bg-accent-purple/20 border border-accent-purple/30'
                : 'bg-zinc-800/50 hover:bg-zinc-800 border border-transparent hover:border-zinc-700'
            )}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <p className="text-sm text-white truncate">{model.name}</p>
                {model.badge && (
                  <span className={cn(
                    'text-[9px] px-1.5 py-0.5 rounded-full font-medium shrink-0',
                    model.badge === 'Premium' ? 'bg-amber-500/20 text-amber-400' :
                    model.badge === 'Fast' ? 'bg-amber-500/20 text-amber-400' :
                    model.badge === 'Quality' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-zinc-700/50 text-zinc-400'
                  )}>
                    {model.badge}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-500">
                {model.provider}
                {model.speed && ` • ${model.speed}`}
              </p>
            </div>
            {selectedId === model.id && <Check className="w-4 h-4 text-accent-purple shrink-0" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ projectId, onClose, onBack }) => {
  const {
    settings,
    isLoading,
    fetchSettings,
    setBaseTextModel,
    setBaseImageModel,
    setBaseVideoModel,
    setStorylineTextModel,
    setStorylineTextSettings,
  } = useProjectSettingsStore();

  const [storylineSettingsText, setStorylineSettingsText] = React.useState('{}');
  const [storylineSettingsError, setStorylineSettingsError] = React.useState<string | null>(null);

  useEffect(() => {
    fetchSettings(projectId);
  }, [projectId, fetchSettings]);

  useEffect(() => {
    setStorylineSettingsText(JSON.stringify(settings?.storylineTextSettings || {}, null, 2));
    setStorylineSettingsError(null);
  }, [settings?.storylineTextSettings]);

  const handleTextModelChange = async (modelId: string) => {
    await setBaseTextModel(projectId, modelId);
    toast.success('Text model updated');
  };

  const handleImageModelChange = async (modelId: string) => {
    await setBaseImageModel(projectId, modelId);
    toast.success('Image model updated');
  };

  const handleVideoModelChange = async (modelId: string) => {
    await setBaseVideoModel(projectId, modelId);
    toast.success('Video model updated');
  };

  const handleStorylineModelChange = async (modelId: string) => {
    await setStorylineTextModel(projectId, modelId);
    toast.success('Storyline model updated');
  };

  const handleStorylineSettingsBlur = async () => {
    const trimmed = storylineSettingsText.trim();
    if (!trimmed) {
      setStorylineSettingsError(null);
      await setStorylineTextSettings(projectId, {});
      toast.success('Storyline settings cleared');
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setStorylineSettingsError('JSON override must be an object.');
        return;
      }

      setStorylineSettingsError(null);
      await setStorylineTextSettings(projectId, parsed);
      toast.success('Storyline settings updated');
    } catch {
      setStorylineSettingsError('Invalid JSON syntax.');
    }
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-zinc-900/95 backdrop-blur-xl border border-[rgba(249,115,22,0.15)] rounded-xl p-8 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.06)]">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
      </div>
    );
  }

  return (
    <div className="w-80 bg-zinc-900/95 backdrop-blur-xl border border-[rgba(249,115,22,0.15)] rounded-xl overflow-hidden shadow-[0_0_12px_rgba(249,115,22,0.06)]">
      <div className="px-4 py-3 border-b border-[rgba(249,115,22,0.12)] flex items-center justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <motion.button
              onClick={onBack}
              whileHover={{ x: -2 }}
              whileTap={{ scale: 0.95 }}
              className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </motion.button>
          )}
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">Project Settings</span>
          </div>
        </div>
        <motion.button
          onClick={onClose}
          whileHover={{ rotate: 90, scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          className="p-1.5 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </motion.button>
      </div>

      <div className="p-4 space-y-6 max-h-[500px] overflow-y-auto">
        <div className="flex items-start gap-3 p-3 bg-accent-purple/10 border border-accent-purple/20 rounded-lg">
          <Zap className="w-4 h-4 text-accent-purple mt-0.5" />
          <div>
            <p className="text-xs text-accent-purple font-medium">Base Models</p>
            <p className="text-[10px] text-zinc-400 mt-0.5">
              Set default models for new nodes. Individual nodes can override these settings.
            </p>
          </div>
        </div>

        <ModelSelector
          label="Text Model (LLM)"
          icon={Type}
          models={TEXT_MODELS}
          selectedId={settings?.baseTextModel || TEXT_MODELS[0]?.id || ''}
          onSelect={handleTextModelChange}
          iconColor="text-amber-400"
        />

        <ModelSelector
          label="Storyline Model"
          icon={Type}
          models={STORYLINE_TEXT_MODELS}
          selectedId={settings?.storylineTextModel || STORYLINE_TEXT_MODELS[0]?.id || ''}
          onSelect={handleStorylineModelChange}
          iconColor="text-orange-400"
        />

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-zinc-400" />
            <span className="text-sm font-medium text-white">Storyline JSON Override</span>
          </div>
          <Textarea
            value={storylineSettingsText}
            onChange={(event) => setStorylineSettingsText(event.target.value)}
            onBlur={handleStorylineSettingsBlur}
            placeholder='{"temperature":0.7,"maxTokens":2048}'
            className={cn(
              'min-h-[88px] bg-zinc-900/50 border-zinc-800/40 text-zinc-200 text-xs font-mono',
              storylineSettingsError ? 'border-red-500/60' : ''
            )}
          />
          {storylineSettingsError && (
            <p className="text-xs text-red-400">{storylineSettingsError}</p>
          )}
        </div>

        <ModelSelector
          label="Image Model"
          icon={ImageIcon}
          models={IMAGE_MODELS}
          selectedId={settings?.baseImageModel || IMAGE_MODELS[0]?.id || ''}
          onSelect={handleImageModelChange}
          iconColor="text-purple-400"
        />

        <ModelSelector
          label="Video Model"
          icon={Video}
          models={VIDEO_MODELS}
          selectedId={settings?.baseVideoModel || VIDEO_MODELS[0]?.id || ''}
          onSelect={handleVideoModelChange}
          iconColor="text-amber-400"
        />

        {AUDIO_MODELS.length > 0 && (
          <ModelSelector
            label="Audio Model"
            icon={Music}
            models={AUDIO_MODELS}
            selectedId={settings?.baseAudioModel || AUDIO_MODELS[0]?.id || ''}
            onSelect={async (id) => {
              await useProjectSettingsStore.getState().updateSettings(projectId, { baseAudioModel: id });
              toast.success('Audio model updated');
            }}
            iconColor="text-cyan-400"
          />
        )}
      </div>

      <div className="px-4 py-3 border-t border-[rgba(249,115,22,0.12)] bg-zinc-900/50">
        <p className="text-[10px] text-zinc-500 text-center">
          Models apply to new nodes created in this project
        </p>
      </div>
    </div>
  );
};
