import React from 'react';
import { ArrowLeft, Copy, Heart, Sparkles, Trash2, User2 } from 'lucide-react';
import { toast } from 'sonner';

import { cn } from '@/lib/utils';
import { useCharacterCreationStore } from '@/lib/stores/character-creation-store';
import { deleteBlueprint, updateBlueprintRecord } from '@/services/characterBlueprintService';

// ---------------------------------------------------------------------------
// CharacterDetail — Full view of a saved character blueprint
// ---------------------------------------------------------------------------

export function CharacterDetail() {
  const { blueprints, selectedBlueprintId, setMode, selectBlueprint, removeBlueprint, toggleFavorite } =
    useCharacterCreationStore();

  const blueprint = blueprints.find((b) => b.id === selectedBlueprintId);

  if (!blueprint) {
    return (
      <div className="py-16 text-center text-sm text-zinc-400">
        Character not found.
        <button
          type="button"
          onClick={() => setMode('gallery')}
          className="ml-2 text-lime-300 hover:underline"
        >
          Back to library
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteBlueprint(blueprint.id);
      removeBlueprint(blueprint.id);
      toast.success(`"${blueprint.name}" deleted.`);
      setMode('gallery');
    } catch {
      toast.error('Failed to delete character.');
    }
  };

  const handleToggleFavorite = async () => {
    toggleFavorite(blueprint.id);
    try {
      await updateBlueprintRecord(blueprint.id, { isFavorite: !blueprint.isFavorite });
    } catch {
      toggleFavorite(blueprint.id); // revert
    }
  };

  const handleCopyMention = () => {
    navigator.clipboard.writeText(`@${blueprint.slug}`);
    toast.success(`Copied @${blueprint.slug} to clipboard`);
  };

  return (
    <div className="space-y-6">
      {/* Back */}
      <button
        type="button"
        onClick={() => selectBlueprint(null)}
        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Library
      </button>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* Image */}
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
          {blueprint.imageUrl ? (
            <img
              src={blueprint.imageUrl}
              alt={blueprint.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <User2 className="h-24 w-24 text-zinc-700" />
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="space-y-5">
          <div>
            <h2 className="text-2xl font-bold text-white">{blueprint.name}</h2>
            <p className="mt-1 text-sm text-zinc-400">
              <span className="text-lime-300/70">@{blueprint.slug}</span>
              <span className="mx-2 text-zinc-600">·</span>
              {blueprint.kind}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleCopyMention}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.06]"
            >
              <Copy className="h-3 w-3" />
              Copy @mention
            </button>
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 text-xs',
                blueprint.isFavorite
                  ? 'border-lime-300/40 bg-lime-300/10 text-lime-300'
                  : 'border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/[0.06]',
              )}
            >
              <Heart className={cn('h-3 w-3', blueprint.isFavorite && 'fill-current')} />
              {blueprint.isFavorite ? 'Favorited' : 'Favorite'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          </div>

          {/* Prompt fragment */}
          {blueprint.promptFragment && (
            <div className="rounded-2xl border border-lime-300/20 bg-lime-300/5 p-4">
              <p className="mb-1 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-lime-300/70">
                <Sparkles className="h-3 w-3" />
                Prompt Fragment
              </p>
              <p className="text-sm leading-relaxed text-white">{blueprint.promptFragment}</p>
            </div>
          )}

          {/* Trait summary */}
          <div className="grid gap-3 sm:grid-cols-2">
            <TraitBlock label="Type" value={blueprint.traits.characterType} />
            <TraitBlock label="Gender" value={blueprint.traits.gender} />
            <TraitBlock label="Ethnicity" value={blueprint.traits.ethnicity} />
            <TraitBlock label="Skin" value={blueprint.traits.skinColor} />
            <TraitBlock label="Condition" value={blueprint.traits.skinCondition} />
            <TraitBlock label="Age" value={blueprint.traits.age} />
            <TraitBlock label="Eyes" value={blueprint.faceDetails.eyeType} />
            <TraitBlock label="Eye Detail" value={blueprint.faceDetails.eyeDetail} />
            <TraitBlock label="Build" value={blueprint.bodyDetails.build} />
            <TraitBlock label="Art Style" value={blueprint.styleDetails.artStyle} />
          </div>

          {/* Usage */}
          <p className="text-xs text-zinc-500">
            Used {blueprint.usageCount} time{blueprint.usageCount !== 1 ? 's' : ''} across prompts
          </p>
        </div>
      </div>
    </div>
  );
}

function TraitBlock({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.02] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="text-xs text-zinc-200">{value}</p>
    </div>
  );
}
