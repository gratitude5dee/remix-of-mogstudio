export const SUPABASE_PROJECT_REF = "ixkkrousepsiorwlaycp";
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_REF}.supabase.co`;
export const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4";

export const SUPABASE_PUBLIC_STORAGE_URL = `${SUPABASE_URL}/storage/v1/object/public`;

export function buildPublicStorageUrl(bucket: string, path: string): string {
  const normalizedPath = path.replace(/^\/+/, "");
  return `${SUPABASE_PUBLIC_STORAGE_URL}/${bucket}/${normalizedPath}`;
}

export function isCanonicalSupabaseUrl(url: string, bucket?: string): boolean {
  try {
    const parsed = new URL(url);
    const expected = new URL(SUPABASE_URL);
    if (parsed.origin !== expected.origin) return false;
    if (!parsed.pathname.startsWith("/storage/v1/object/public/")) return false;
    return bucket ? parsed.pathname.startsWith(`/storage/v1/object/public/${bucket}/`) : true;
  } catch {
    return false;
  }
}
