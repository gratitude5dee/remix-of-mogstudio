import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import ModelSelector, { Model } from './ModelSelector';
import { 
  IMAGE_MODELS, 
  VIDEO_MODELS, 
  TEXT_MODELS, 
  getDefaultImageModel, 
  getDefaultVideoModel,
  type StudioModel 
} from '@/lib/studio-model-constants';

interface StudioSidePanelsProps {
  selectedBlockType: 'text' | 'image' | 'video' | null;
}

// Convert StudioModel to Model interface for ModelSelector
const toSelectorModels = (models: StudioModel[]): Model[] => models.map(m => ({
  id: m.id,
  name: m.name,
  credits: m.credits,
  time: m.time,
  description: m.description,
  category: m.uiGroup || 'generation',
}));

// Text models (for Lovable AI)
const TEXT_SELECTOR_MODELS: Model[] = toSelectorModels(TEXT_MODELS);

// Image models using centralized definitions
const IMAGE_SELECTOR_MODELS: Model[] = toSelectorModels(IMAGE_MODELS);

// Video models using centralized definitions
const VIDEO_SELECTOR_MODELS: Model[] = toSelectorModels(VIDEO_MODELS);

export const StudioRightPanel = ({ selectedBlockType }: StudioSidePanelsProps) => {
  // Model selector state - using full model IDs
  const [textModelId, setTextModelId] = useState('google/gemini-2.5-flash');
  const [imageModelId, setImageModelId] = useState(getDefaultImageModel());
  const [videoModelId, setVideoModelId] = useState(getDefaultVideoModel());
  
  // Model dropdown states
  const [showTextModelDropdown, setShowTextModelDropdown] = useState(false);
  const [showImageModelDropdown, setShowImageModelDropdown] = useState(false);
  const [showVideoModelDropdown, setShowVideoModelDropdown] = useState(false);
  
  // Image settings state
  const [quality, setQuality] = useState(100);
  const [seed, setSeed] = useState('339071969');
  const [size, setSize] = useState('1:1');
  
  // If no block is selected, return empty panel
  if (!selectedBlockType) {
    return <div className="w-64 h-full bg-black border-l border-zinc-800/50"></div>;
  }
  
  // Get models based on selected block type
  const getModels = () => {
    switch (selectedBlockType) {
      case 'text':
        return TEXT_SELECTOR_MODELS;
      case 'image':
        return IMAGE_SELECTOR_MODELS;
      case 'video':
        return VIDEO_SELECTOR_MODELS;
      default:
        return [];
    }
  };
  
  // Get selected model id based on block type
  const getSelectedModelId = () => {
    switch (selectedBlockType) {
      case 'text':
        return textModelId;
      case 'image':
        return imageModelId;
      case 'video':
        return videoModelId;
      default:
        return '';
    }
  };
  
  // Handle model selection based on block type
  const handleModelSelect = (modelId: string) => {
    switch (selectedBlockType) {
      case 'text':
        setTextModelId(modelId);
        break;
      case 'image':
        setImageModelId(modelId);
        break;
      case 'video':
        setVideoModelId(modelId);
        break;
    }
  };
  
  // Toggle model dropdown based on block type
  const toggleModelDropdown = () => {
    switch (selectedBlockType) {
      case 'text':
        setShowTextModelDropdown(!showTextModelDropdown);
        break;
      case 'image':
        setShowImageModelDropdown(!showImageModelDropdown);
        break;
      case 'video':
        setShowVideoModelDropdown(!showVideoModelDropdown);
        break;
    }
  };
  
  // Get dropdown state based on block type
  const getDropdownState = () => {
    switch (selectedBlockType) {
      case 'text':
        return showTextModelDropdown;
      case 'image':
        return showImageModelDropdown;
      case 'video':
        return showVideoModelDropdown;
      default:
        return false;
    }
  };
  
  return (
    <div className="w-64 h-full bg-zinc-900/75 border-l border-zinc-800/50">
      <div className="p-5 space-y-6">
        <div className="space-y-1">
          <label className="text-xs text-zinc-500 font-medium">MODEL</label>
          <ModelSelector
            models={getModels()}
            selectedModelId={getSelectedModelId()}
            onModelSelect={handleModelSelect}
            modelType={selectedBlockType}
            isOpen={getDropdownState()}
            toggleOpen={toggleModelDropdown}
          />
        </div>
        
        {(selectedBlockType === 'image' || selectedBlockType === 'video') && (
          <>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-xs text-zinc-500 font-medium">QUALITY</label>
                <span className="text-white">{quality}</span>
              </div>
              <Slider 
                value={[quality]}
                min={1} 
                max={100} 
                step={1}
                onValueChange={(value) => setQuality(value[0])}
                className="mt-2"
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">SIZE</label>
              <button className="w-full flex items-center justify-between p-2 bg-zinc-800/50 hover:bg-zinc-800 rounded-md">
                <span className="text-zinc-300">Square (1:1)</span>
                <ChevronDown className="h-4 w-4 text-zinc-500" />
              </button>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs text-zinc-500 font-medium">SEED</label>
              <Input 
                value={seed}
                onChange={(e) => setSeed(e.target.value)}
                className="bg-zinc-800/50 border-zinc-700 text-white"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
