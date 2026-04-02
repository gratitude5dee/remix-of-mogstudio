// ---------------------------------------------------------------------------
// Character Blueprint — Supabase CRUD Service
// ---------------------------------------------------------------------------

import { supabase } from '@/integrations/supabase/client';
import type { CharacterBlueprint, CharacterBlueprintImage } from '@/types/character-creation';
import { toSlug } from '@/lib/stores/character-creation-store';

// ---------------------------------------------------------------------------
// Row ↔ Domain mapping helpers
// ---------------------------------------------------------------------------

function rowToBlueprint(row: Record<string, unknown>): CharacterBlueprint {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    projectId: (row.project_id as string) ?? null,
    name: row.name as string,
    slug: row.slug as string,
    kind: (row.kind as CharacterBlueprint['kind']) ?? 'character',
    traits: (row.traits as CharacterBlueprint['traits']) ?? {},
    faceDetails: (row.face_details as CharacterBlueprint['faceDetails']) ?? {},
    bodyDetails: (row.body_details as CharacterBlueprint['bodyDetails']) ?? {},
    styleDetails: (row.style_details as CharacterBlueprint['styleDetails']) ?? {},
    promptFragment: (row.prompt_fragment as string) ?? '',
    imageUrl: (row.image_url as string) ?? null,
    thumbnailUrl: (row.thumbnail_url as string) ?? null,
    isFavorite: (row.is_favorite as boolean) ?? false,
    usageCount: (row.usage_count as number) ?? 0,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
    updatedAt: (row.updated_at as string) ?? new Date().toISOString(),
  };
}

function rowToImage(row: Record<string, unknown>): CharacterBlueprintImage {
  return {
    id: row.id as string,
    blueprintId: row.blueprint_id as string,
    imageUrl: row.image_url as string,
    label: (row.label as string) ?? null,
    isPrimary: (row.is_primary as boolean) ?? false,
    sortOrder: (row.sort_order as number) ?? 0,
    createdAt: (row.created_at as string) ?? new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// List all blueprints for the current user
// ---------------------------------------------------------------------------

export async function listBlueprints(): Promise<CharacterBlueprint[]> {
  const { data, error } = await supabase
    .from('character_blueprints' as any)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map(rowToBlueprint);
}

// ---------------------------------------------------------------------------
// Get a single blueprint by ID
// ---------------------------------------------------------------------------

export async function getBlueprint(id: string): Promise<CharacterBlueprint | null> {
  const { data, error } = await supabase
    .from('character_blueprints' as any)
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? rowToBlueprint(data as Record<string, unknown>) : null;
}

// ---------------------------------------------------------------------------
// Create a new blueprint
// ---------------------------------------------------------------------------

export async function createBlueprint(input: {
  name: string;
  kind: CharacterBlueprint['kind'];
  traits: CharacterBlueprint['traits'];
  faceDetails: CharacterBlueprint['faceDetails'];
  bodyDetails: CharacterBlueprint['bodyDetails'];
  styleDetails: CharacterBlueprint['styleDetails'];
  promptFragment: string;
  imageUrl?: string | null;
  thumbnailUrl?: string | null;
  projectId?: string | null;
}): Promise<CharacterBlueprint> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error('Not authenticated');

  const slug = toSlug(input.name);

  const { data, error } = await supabase
    .from('character_blueprints' as any)
    .insert({
      user_id: user.id,
      project_id: input.projectId ?? null,
      name: input.name,
      slug,
      kind: input.kind,
      traits: input.traits,
      face_details: input.faceDetails,
      body_details: input.bodyDetails,
      style_details: input.styleDetails,
      prompt_fragment: input.promptFragment,
      image_url: input.imageUrl ?? null,
      thumbnail_url: input.thumbnailUrl ?? null,
    } as any)
    .select('*')
    .single();

  if (error) throw error;
  return rowToBlueprint(data as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Update an existing blueprint
// ---------------------------------------------------------------------------

export async function updateBlueprintRecord(
  id: string,
  updates: Partial<{
    name: string;
    kind: CharacterBlueprint['kind'];
    traits: CharacterBlueprint['traits'];
    faceDetails: CharacterBlueprint['faceDetails'];
    bodyDetails: CharacterBlueprint['bodyDetails'];
    styleDetails: CharacterBlueprint['styleDetails'];
    promptFragment: string;
    imageUrl: string | null;
    thumbnailUrl: string | null;
    isFavorite: boolean;
  }>,
): Promise<CharacterBlueprint> {
  const payload: Record<string, unknown> = {};

  if (updates.name !== undefined) {
    payload.name = updates.name;
    payload.slug = toSlug(updates.name);
  }
  if (updates.kind !== undefined) payload.kind = updates.kind;
  if (updates.traits !== undefined) payload.traits = updates.traits;
  if (updates.faceDetails !== undefined) payload.face_details = updates.faceDetails;
  if (updates.bodyDetails !== undefined) payload.body_details = updates.bodyDetails;
  if (updates.styleDetails !== undefined) payload.style_details = updates.styleDetails;
  if (updates.promptFragment !== undefined) payload.prompt_fragment = updates.promptFragment;
  if (updates.imageUrl !== undefined) payload.image_url = updates.imageUrl;
  if (updates.thumbnailUrl !== undefined) payload.thumbnail_url = updates.thumbnailUrl;
  if (updates.isFavorite !== undefined) payload.is_favorite = updates.isFavorite;

  const { data, error } = await supabase
    .from('character_blueprints' as any)
    .update(payload as any)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return rowToBlueprint(data as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// Delete a blueprint
// ---------------------------------------------------------------------------

export async function deleteBlueprint(id: string): Promise<void> {
  const { error } = await supabase
    .from('character_blueprints' as any)
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Increment usage count (fire-and-forget)
// ---------------------------------------------------------------------------

export async function incrementBlueprintUsage(id: string): Promise<void> {
  // Use rpc or manual increment
  const { data: current } = await supabase
    .from('character_blueprints' as any)
    .select('usage_count')
    .eq('id', id)
    .single();

  if (current) {
    await supabase
      .from('character_blueprints' as any)
      .update({ usage_count: ((current as any).usage_count ?? 0) + 1 } as any)
      .eq('id', id);
  }
}

// ---------------------------------------------------------------------------
// Blueprint Images
// ---------------------------------------------------------------------------

export async function listBlueprintImages(blueprintId: string): Promise<CharacterBlueprintImage[]> {
  const { data, error } = await supabase
    .from('character_blueprint_images' as any)
    .select('*')
    .eq('blueprint_id', blueprintId)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map(rowToImage);
}

export async function addBlueprintImage(input: {
  blueprintId: string;
  imageUrl: string;
  label?: string;
  isPrimary?: boolean;
}): Promise<CharacterBlueprintImage> {
  const { data, error } = await supabase
    .from('character_blueprint_images' as any)
    .insert({
      blueprint_id: input.blueprintId,
      image_url: input.imageUrl,
      label: input.label ?? null,
      is_primary: input.isPrimary ?? false,
    } as any)
    .select('*')
    .single();

  if (error) throw error;
  return rowToImage(data as Record<string, unknown>);
}

// ---------------------------------------------------------------------------
// @Mention search — prefix match on slug
// ---------------------------------------------------------------------------

export async function searchBlueprintsBySlug(
  query: string,
  limit = 10,
): Promise<CharacterBlueprint[]> {
  const normalised = query.toLowerCase().replace(/^@/, '').trim();
  if (!normalised) return [];

  const { data, error } = await supabase
    .from('character_blueprints' as any)
    .select('*')
    .ilike('slug', `${normalised}%`)
    .order('usage_count', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return ((data as Record<string, unknown>[]) ?? []).map(rowToBlueprint);
}
