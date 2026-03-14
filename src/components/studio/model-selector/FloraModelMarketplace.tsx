import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronRight, Dot, Info, Pin, Search } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import {
  getMarketplaceModelById,
  getMarketplaceProviders,
  getPinnedMarketplaceModels,
  type MarketplaceModel,
} from '@/lib/studio/modelMarketplace';
import type { StudioModelMediaType, StudioModelUiGroup } from '@/lib/studio-model-constants';

export interface FloraModelMarketplaceValue {
  auto: boolean;
  selectedModelIds: string[];
  useMultipleModels: boolean;
}

interface FloraModelMarketplaceProps {
  mediaType: StudioModelMediaType;
  value: FloraModelMarketplaceValue;
  onChange: (value: FloraModelMarketplaceValue) => void;
  uiGroup?: StudioModelUiGroup;
  className?: string;
  compact?: boolean;
  align?: 'start' | 'center' | 'end';
  triggerVariant?: 'toolbar' | 'dock';
  collisionBoundary?: HTMLElement | null;
  portalContainer?: HTMLElement | null;
  maxContentHeight?: number | string;
}

function getSummaryLabel(value: FloraModelMarketplaceValue): string {
  const primary = value.selectedModelIds[0];
  const primaryModel = primary ? getMarketplaceModelById(primary) : undefined;
  const primaryLabel = primaryModel?.name ?? primary ?? 'Select model';

  if (value.useMultipleModels && value.selectedModelIds.length > 1) {
    return `${primaryLabel} +${value.selectedModelIds.length - 1}`;
  }

  return primaryLabel;
}

function getSummaryModel(value: FloraModelMarketplaceValue) {
  const primary = value.selectedModelIds[0];
  return primary ? getMarketplaceModelById(primary) : undefined;
}

function filterModel(model: MarketplaceModel, query: string): boolean {
  if (!query) {
    return true;
  }

  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return true;
  }

  return [
    model.name,
    model.description,
    model.providerLabel,
    model.id,
  ].some((value) => value.toLowerCase().includes(normalized));
}

export function FloraModelMarketplace({
  mediaType,
  value,
  onChange,
  uiGroup = 'generation',
  className,
  compact = false,
  align = 'start',
  triggerVariant = 'dock',
  collisionBoundary,
  portalContainer,
  maxContentHeight,
}: FloraModelMarketplaceProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [activeProviderKey, setActiveProviderKey] = useState<string | null>(null);

  const pinnedModels = useMemo(
    () => getPinnedMarketplaceModels(mediaType, uiGroup).filter((model) => filterModel(model, search)),
    [mediaType, search, uiGroup]
  );
  const providers = useMemo(
    () =>
      getMarketplaceProviders(mediaType, uiGroup)
        .map((provider) => ({
          ...provider,
          models: provider.models.filter((model) => filterModel(model, search)),
        }))
        .filter((provider) => provider.models.length > 0),
    [mediaType, search, uiGroup]
  );
  const featuredModels = useMemo(() => {
    const allModels = providers.flatMap((provider) => provider.models);
    const pinned = pinnedModels.slice(0, 3);
    if (pinned.length > 0) {
      return pinned;
    }
    return allModels.slice(0, 4);
  }, [pinnedModels, providers]);

  useEffect(() => {
    if (providers.length === 0) {
      setActiveProviderKey(null);
      return;
    }

    const selectedProviderKey = value.selectedModelIds
      .map((modelId) => getMarketplaceModelById(modelId)?.providerKey)
      .find(Boolean);

    const nextProviderKey =
      selectedProviderKey && providers.some((provider) => provider.key === selectedProviderKey)
        ? selectedProviderKey
        : activeProviderKey && providers.some((provider) => provider.key === activeProviderKey)
          ? activeProviderKey
          : providers[0]?.key ?? null;

    if (nextProviderKey !== activeProviderKey) {
      setActiveProviderKey(nextProviderKey);
    }
  }, [activeProviderKey, providers, value.selectedModelIds]);

  const updateSelection = (next: Partial<FloraModelMarketplaceValue>) => {
    const merged: FloraModelMarketplaceValue = {
      auto: value.auto,
      selectedModelIds: value.selectedModelIds,
      useMultipleModels: value.useMultipleModels,
      ...next,
    };

    const uniqueIds = Array.from(new Set(merged.selectedModelIds.filter(Boolean)));
    const normalizedIds =
      merged.useMultipleModels || uniqueIds.length <= 1 ? uniqueIds : uniqueIds.slice(0, 1);
    onChange({
      ...merged,
      selectedModelIds: normalizedIds,
      useMultipleModels: merged.useMultipleModels,
    });
  };

  const toggleModel = (modelId: string) => {
    if (!value.useMultipleModels) {
      updateSelection({
        selectedModelIds: [modelId],
      });
      setOpen(false);
      return;
    }

    const nextIds = value.selectedModelIds.includes(modelId)
      ? value.selectedModelIds.filter((id) => id !== modelId)
      : [...value.selectedModelIds, modelId];

    updateSelection({
      selectedModelIds: nextIds.length > 0 ? nextIds : [modelId],
      useMultipleModels: nextIds.length > 1,
    });
  };

  const summaryModel = getSummaryModel(value);
  const isToolbarVariant = triggerVariant === 'toolbar';
  const resolvedMaxHeight = maxContentHeight ?? (isToolbarVariant ? 'min(432px, calc(100vh - 168px))' : 'min(560px, calc(100vh - 144px))');
  const providerListMaxHeight = isToolbarVariant ? 'min(248px, calc(100vh - 336px))' : 'min(360px, calc(100vh - 300px))';
  const rightPaneMaxHeight = isToolbarVariant ? 'min(352px, calc(100vh - 240px))' : 'min(452px, calc(100vh - 220px))';
  const resolvedWidth = isToolbarVariant ? 'min(760px, calc(100vw - 48px))' : 'min(860px, calc(100vw - 64px))';
  const activeProvider = providers.find((provider) => provider.key === activeProviderKey) ?? providers[0] ?? null;

  const renderModelRow = (model: MarketplaceModel, compactRow = false) => {
    const isSelected = value.selectedModelIds.includes(model.id);

    return (
      <button
        key={model.id}
        type="button"
        onClick={() => toggleModel(model.id)}
        className={cn(
          'flex w-full items-start gap-3 border text-left transition-colors',
          compactRow
            ? 'rounded-[16px] px-3 py-2.5'
            : isToolbarVariant
              ? 'rounded-[18px] px-3.5 py-3'
              : 'rounded-[20px] px-4 py-3.5',
          isSelected
            ? 'border-[#fb923c]/35 bg-[#1a1510]'
            : 'border-white/5 bg-[#121212] hover:border-white/10 hover:bg-[#191919]'
        )}
      >
        <div className="mt-0.5 flex h-10 w-10 flex-none items-center justify-center rounded-2xl border border-white/8 bg-[#1D1D1D] text-xs font-semibold text-zinc-300">
          {model.providerLabel.slice(0, 1)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-sm font-medium text-white">{model.name}</span>
            {model.isNew ? (
              <Badge className="h-5 rounded-full border border-[#fb923c]/30 bg-[#251c0e] px-2 text-[10px] text-[#fdba74]">
                New
              </Badge>
            ) : null}
          </div>
          <div className={cn('text-xs leading-5 text-zinc-400', compactRow ? 'mt-0.5 line-clamp-1' : 'mt-1')}>
            {model.description}
          </div>
          <div className={cn('flex flex-wrap items-center gap-1.5', compactRow ? 'mt-1.5' : 'mt-2')}>
            <Badge className="h-5 rounded-full border border-white/8 bg-[#1E1E1E] px-2 text-[10px] text-zinc-300">
              ⊕{model.credits}
            </Badge>
            <Badge className="h-5 rounded-full border border-white/8 bg-[#1E1E1E] px-2 text-[10px] text-zinc-300">
              {model.time}
            </Badge>
            {model.capabilities.map((capability) => (
              <Badge
                key={`${model.id}-${capability}`}
                className="h-5 rounded-full border border-white/8 bg-[#1E1E1E] px-2 text-[10px] text-zinc-400"
              >
                {capability}
              </Badge>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          {model.isPinned ? <Pin className="h-3.5 w-3.5 text-zinc-500" /> : <span className="h-3.5 w-3.5" />}
          {isSelected ? (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#fb923c] text-black">
              <Check className="h-3.5 w-3.5" />
            </div>
          ) : (
            <div className="h-5 w-5 rounded-full border border-white/10 bg-[#101010]" />
          )}
        </div>
      </button>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            'justify-between gap-2 border border-white/10 text-left text-xs font-medium text-zinc-200 hover:bg-[#1D1D1D]',
            isToolbarVariant
              ? 'h-9 min-w-[164px] rounded-[13px] bg-[#121212] px-2.5 shadow-[0_10px_24px_rgba(0,0,0,0.2)]'
              : 'h-12 min-w-[220px] rounded-[18px] bg-[#181818] px-3 shadow-[0_10px_24px_rgba(0,0,0,0.25)]',
            compact ? 'min-w-[156px]' : null,
            className
          )}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'flex flex-none items-center justify-center border border-white/10 bg-[#232323] text-[10px] font-semibold text-zinc-200',
                isToolbarVariant ? 'h-5 w-5 rounded-full' : 'h-6 w-6 rounded-full'
              )}
            >
              {(summaryModel?.providerLabel ?? 'M').slice(0, 1)}
            </span>
            <span className="truncate">{getSummaryLabel(value)}</span>
          </span>
          <ChevronDown className="h-3.5 w-3.5 flex-none text-zinc-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align={align}
        side="bottom"
        alignOffset={isToolbarVariant ? 0 : 2}
        collisionBoundary={collisionBoundary ?? undefined}
        container={portalContainer ?? undefined}
        collisionPadding={{ top: 12, left: 16, right: 16, bottom: 16 }}
        sideOffset={isToolbarVariant ? 8 : 10}
        className={cn(
          'border border-white/10 bg-[#0f0f0f]/98 p-0 text-white shadow-[0_28px_90px_rgba(0,0,0,0.58)] backdrop-blur-2xl',
          isToolbarVariant ? 'rounded-[22px]' : 'rounded-[28px]'
        )}
        style={{ maxHeight: resolvedMaxHeight, width: resolvedWidth }}
      >
        <div className={cn('flex max-h-full flex-col gap-4 overflow-hidden', isToolbarVariant ? 'p-3.5' : 'p-4')}>
          <div className="flex items-center gap-2 rounded-[20px] border border-white/8 bg-[#171717] px-3">
            <Search className="h-4 w-4 text-zinc-500" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search"
              className={cn(
                'border-0 bg-transparent px-0 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-0',
                isToolbarVariant ? 'h-10' : 'h-11'
              )}
            />
          </div>

          <div
            className="grid min-h-0 gap-3"
            style={{
              gridTemplateColumns: isToolbarVariant ? '320px minmax(0, 1fr)' : '340px minmax(0, 1fr)',
            }}
          >
            <div className="min-h-0 space-y-3">
              <div className={cn('grid gap-3 rounded-[24px] border border-white/6 bg-[#141414]', isToolbarVariant ? 'p-3.5' : 'p-4')}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-zinc-200">
                    <span>Auto</span>
                    <Info className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <Switch
                    checked={value.auto}
                    onCheckedChange={(checked) => updateSelection({ auto: checked })}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-zinc-200">
                    <span>Use multiple models</span>
                    <Info className="h-3.5 w-3.5 text-zinc-500" />
                  </div>
                  <Switch
                    checked={value.useMultipleModels}
                    onCheckedChange={(checked) =>
                      updateSelection({
                        useMultipleModels: checked,
                        selectedModelIds: checked ? value.selectedModelIds : value.selectedModelIds.slice(0, 1),
                      })
                    }
                  />
                </div>
              </div>

              <section className="space-y-2">
                <div className="px-1 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Pinned Models
                </div>
                {pinnedModels.length > 0 ? (
                  <div className="space-y-2">{pinnedModels.map((model) => renderModelRow(model, true))}</div>
                ) : (
                  <div className="rounded-[18px] border border-white/6 bg-[#141414] px-3 py-3 text-xs leading-5 text-zinc-500">
                    Models you favorite will appear here.
                  </div>
                )}
              </section>

              {featuredModels.length > 0 ? (
                <section className="space-y-2">
                  <div className="px-1 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                    Featured Models
                  </div>
                  <div className="space-y-2">{featuredModels.map((model) => renderModelRow(model, true))}</div>
                </section>
              ) : null}

              <section className="space-y-2">
                <div className="px-1 text-[11px] uppercase tracking-[0.22em] text-zinc-500">
                  Providers
                </div>
                <ScrollArea className={cn('pr-2', !isToolbarVariant && 'pr-3')} style={{ maxHeight: providerListMaxHeight }}>
                  <div className="space-y-2">
                    {providers.map((provider) => {
                      const isActive = provider.key === activeProvider?.key;
                      return (
                        <button
                          key={provider.key}
                          type="button"
                          onClick={() => setActiveProviderKey(provider.key)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-[18px] border px-3.5 py-3 text-left transition-colors',
                            isActive
                              ? 'border-white/12 bg-[#1B1B1B]'
                              : 'border-white/6 bg-[#141414] hover:border-white/10 hover:bg-[#181818]'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-[#1D1D1D] text-xs font-semibold text-zinc-300">
                              {provider.label.slice(0, 1)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">{provider.label}</div>
                              <div className="text-xs text-zinc-500">
                                {provider.models.length} model{provider.models.length === 1 ? '' : 's'}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-zinc-500" />
                        </button>
                      );
                    })}
                  </div>
                </ScrollArea>
              </section>
            </div>

            <div className="min-h-0 overflow-hidden rounded-[24px] border border-white/6 bg-[#141414]">
              {activeProvider ? (
                <>
                  <div className="flex items-center justify-between border-b border-white/6 px-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">{activeProvider.label}</div>
                      <div className="text-xs text-zinc-500">
                        {activeProvider.models.length} model{activeProvider.models.length === 1 ? '' : 's'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-white/8 bg-[#181818] px-2 py-1 text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                      <Dot className="h-3.5 w-3.5" />
                      Models
                    </div>
                  </div>
                  <ScrollArea className="pr-3" style={{ maxHeight: rightPaneMaxHeight }}>
                    <div className="space-y-2 p-3">
                      {activeProvider.models.map((model) => renderModelRow(model))}
                    </div>
                  </ScrollArea>
                </>
              ) : (
                <div className="flex h-full min-h-[260px] items-center justify-center px-6 text-sm text-zinc-500">
                  No models match this search.
                </div>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default FloraModelMarketplace;
