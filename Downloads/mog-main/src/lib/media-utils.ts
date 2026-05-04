import { buildPublicStorageUrl } from "@/lib/supabaseConfig";

export function getCoverUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('demo/')) return null;
  return buildPublicStorageUrl("covers", path);
}

export function getThumbnailUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return path; // Public folder paths
  if (path.startsWith('demo/')) return null;
  return buildPublicStorageUrl("covers", path);
}
