import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, FileText } from 'lucide-react';
import { FormatSelector } from './FormatSelector';
import { DynamicConceptForm } from './DynamicConceptForm';
import { type ProjectData, ProjectFormat } from './types';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { getModelsByTypeAndGroup } from '@/lib/studio-model-constants';
import { formatModelLabel, STORYLINE_MODEL_OPTIONS, formatStorylineModelLabel } from '@/lib/constants/credits';

interface ConceptTabProps {
  projectData: ProjectData;
  updateProjectData: (data: Partial<ProjectData>) => void;
}

const ConceptTab = ({ projectData, updateProjectData }: ConceptTabProps) => {
  const imageGenerationModels = useMemo(
    () => getModelsByTypeAndGroup('image', 'generation'),
    []
  );
  const videoGenerationModels = useMemo(
    () => getModelsByTypeAndGroup('video', 'generation'),
    []
  );
  const storylineModelOptions = STORYLINE_MODEL_OPTIONS;
  const [storylineSettingsText, setStorylineSettingsText] = useState(
    JSON.stringify(projectData.storylineTextSettings || {}, null, 2)
  );
  const [storylineSettingsError, setStorylineSettingsError] = useState<string | null>(null);

  useEffect(() => {
    setStorylineSettingsText(JSON.stringify(projectData.storylineTextSettings || {}, null, 2));
  }, [projectData.storylineTextSettings]);

  const handleFormatChange = (format: ProjectFormat) => {
    updateProjectData({ format });
  };

  const handleConceptOptionChange = (option: 'ai' | 'manual') => {
    updateProjectData({ conceptOption: option });
  };

  const handleStorylineSettingsBlur = () => {
    const trimmed = storylineSettingsText.trim();
    if (!trimmed) {
      setStorylineSettingsError(null);
      updateProjectData({ storylineTextSettings: {} });
      return;
    }

    try {
      const parsed = JSON.parse(trimmed);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        setStorylineSettingsError('JSON override must be an object.');
        return;
      }
      setStorylineSettingsError(null);
      updateProjectData({ storylineTextSettings: parsed });
    } catch {
      setStorylineSettingsError('Invalid JSON syntax.');
    }
  };

  return (
    <div className="min-h-full p-6 max-w-5xl mx-auto">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">What are you creating?</h2>
        <FormatSelector
          selectedFormat={projectData.format}
          onFormatChange={handleFormatChange}
        />
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">How do you want to build it?</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <motion.div
            className={`p-6 rounded-xl cursor-pointer flex items-start gap-3 relative overflow-hidden transition-all duration-300 backdrop-blur-sm border ${
              projectData.conceptOption === 'ai'
                ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                : 'bg-card/60 border-border/40 hover:border-border/60'
            }`}
            onClick={() => handleConceptOptionChange('ai')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {projectData.conceptOption === 'ai' && (
              <motion.div
                className="absolute inset-0 bg-primary/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                projectData.conceptOption === 'ai'
                  ? 'text-primary bg-primary/20'
                  : 'text-muted-foreground bg-muted/50'
              }`}
            >
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h3
                className={`text-lg font-medium transition-colors duration-300 ${
                  projectData.conceptOption === 'ai' ? 'text-primary' : 'text-foreground'
                }`}
              >
                Develop concept with AI
              </h3>
              <p className="text-sm text-muted-foreground">
                AI involvement in script editing and writing
              </p>
            </div>
          </motion.div>

          <motion.div
            className={`p-6 rounded-xl cursor-pointer flex items-start gap-3 relative overflow-hidden transition-all duration-300 backdrop-blur-sm border ${
              projectData.conceptOption === 'manual'
                ? 'bg-primary/10 border-primary/40 shadow-lg shadow-primary/10'
                : 'bg-card/60 border-border/40 hover:border-border/60'
            }`}
            onClick={() => handleConceptOptionChange('manual')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.2 }}
          >
            {projectData.conceptOption === 'manual' && (
              <motion.div
                className="absolute inset-0 bg-primary/5"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
            <div
              className={`p-2 rounded-lg transition-colors duration-300 ${
                projectData.conceptOption === 'manual'
                  ? 'text-primary bg-primary/20'
                  : 'text-muted-foreground bg-muted/50'
              }`}
            >
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3
                className={`text-lg font-medium transition-colors duration-300 ${
                  projectData.conceptOption === 'manual' ? 'text-primary' : 'text-foreground'
                }`}
              >
                Stick to the script
              </h3>
              <p className="text-sm text-muted-foreground">
                Visualize your idea or script as written
              </p>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <AnimatePresence mode="wait">
        <motion.section
          key={projectData.format}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <DynamicConceptForm
            format={projectData.format}
            projectData={projectData}
            updateProjectData={updateProjectData}
          />
        </motion.section>
      </AnimatePresence>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"
      >
        <h3 className="text-lg font-semibold text-white">Generation Models</h3>
        <p className="mt-1 text-sm text-zinc-400">
          Configure project defaults for storyline text generation and setup media generation.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="space-y-2">
            <span className="text-xs uppercase tracking-wide text-zinc-400">Storyline model (Groq)</span>
            <select
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              value={projectData.storylineTextModel || 'llama-3.3-70b-versatile'}
              onChange={(event) => updateProjectData({ storylineTextModel: event.target.value })}
            >
              {storylineModelOptions.map((model) => (
                <option key={model.id} value={model.id}>
                  {formatStorylineModelLabel(model)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2">
            <span className="text-xs uppercase tracking-wide text-zinc-400">Default image model</span>
            <select
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              value={projectData.baseImageModel || imageGenerationModels[0]?.id || 'fal-ai/nano-banana-2'}
              onChange={(event) => updateProjectData({ baseImageModel: event.target.value })}
            >
              {imageGenerationModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {formatModelLabel(model)}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-2 md:col-span-2">
            <span className="text-xs uppercase tracking-wide text-zinc-400">Default video model</span>
            <select
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100"
              value={projectData.baseVideoModel || videoGenerationModels[0]?.id || 'fal-ai/kling-video/o3/standard/text-to-video'}
              onChange={(event) => updateProjectData({ baseVideoModel: event.target.value })}
            >
              {videoGenerationModels.map((model) => (
                <option key={model.id} value={model.id}>
                  {formatModelLabel(model)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 space-y-2">
          <span className="text-xs uppercase tracking-wide text-zinc-400">Storyline JSON override</span>
          <Textarea
            value={storylineSettingsText}
            onChange={(event) => setStorylineSettingsText(event.target.value)}
            onBlur={handleStorylineSettingsBlur}
            placeholder='{"temperature":0.7,"maxTokens":2048}'
            className={cn(
              'min-h-[88px] border-zinc-700 bg-zinc-900 text-xs text-zinc-200 font-mono',
              storylineSettingsError ? 'border-red-500/70' : ''
            )}
          />
          {storylineSettingsError && (
            <p className="text-xs text-red-400">{storylineSettingsError}</p>
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default ConceptTab;
