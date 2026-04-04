import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clapperboard,
  Globe2,
  Home,
  Image as ImageIcon,
  Mic2,
  Pencil,
  Sparkles,
  Video,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { appRoutes } from '@/lib/routes';
import type { KanvasStudio } from '@/features/kanvas/types';
import { KANVAS_STUDIO_ORDER, KANVAS_STUDIO_META } from '@/features/kanvas/helpers';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const STUDIO_ICONS: Record<KanvasStudio, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  edit: Pencil,
  cinema: Clapperboard,
  lipsync: Mic2,
  worldview: Globe2,
  'character-creation': Sparkles,
};

interface KanvasSidebarProps {
  activeStudio: KanvasStudio;
  onStudioChange: (studio: KanvasStudio) => void;
}

export function KanvasSidebar({ activeStudio, onStudioChange }: KanvasSidebarProps) {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    setIsVisible(e.clientX <= 80);
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <TooltipProvider delayDuration={200}>
      {/* Invisible hover trigger zone */}
      <div className="fixed left-0 top-0 h-screen w-[80px] z-[49]" />

      <aside
        className={cn(
          'fixed left-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center py-3 rounded-2xl',
          'bg-[#0A0A0A]/90 backdrop-blur-xl border border-white/[0.06]',
          'shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)]',
          'transition-all duration-300 ease-out overflow-hidden',
          isVisible ? 'w-14 opacity-100 translate-x-0' : 'w-3 opacity-0 -translate-x-2 pointer-events-none',
        )}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {/* Home button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => navigate(appRoutes.home)}
              aria-label="Home"
              className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-500 transition-all duration-200 hover:bg-white/[0.04] hover:text-zinc-300"
            >
              <Home className="h-[18px] w-[18px]" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Home</TooltipContent>
        </Tooltip>

        {/* Divider */}
        <div className="mx-auto my-3 h-px w-6 bg-white/[0.06]" />

        {/* Studio icons */}
        <nav className="flex flex-1 flex-col items-center gap-1">
          {KANVAS_STUDIO_ORDER.map((studio) => {
            const Icon = STUDIO_ICONS[studio];
            const label = KANVAS_STUDIO_META[studio].label;
            const isActive = activeStudio === studio;

            return (
              <Tooltip key={studio}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={() => onStudioChange(studio)}
                    aria-label={label}
                    className={cn(
                      'relative flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-white/10 text-[#BEFF00]'
                        : 'text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300',
                    )}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r-full bg-[#BEFF00] shadow-[0_0_6px_rgba(190,255,0,0.4)]" />
                    )}
                    <Icon className="h-[18px] w-[18px]" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>

        {/* Bottom WZRD mark */}
        <div className="mt-auto pt-3">
          <div className="flex h-12 w-12 items-center justify-center">
            <img src="/lovable-uploads/wzrdtechlogo.png" alt="WZRD" className="h-10 w-10 object-contain" />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
