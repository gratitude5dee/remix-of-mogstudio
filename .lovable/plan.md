

# Fix: Restore missing `.env` file (again)

## Root Cause
The `.env` file has been deleted (again). The Supabase client requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` to initialize. Without them, the app crashes on boot with a blank screen.

## Fix
Recreate `.env` with the known project credentials:

```
VITE_SUPABASE_PROJECT_ID="<your-supabase-project-id>"
VITE_SUPABASE_PUBLISHABLE_KEY="<your-supabase-anon-key>"
VITE_SUPABASE_URL="https://<your-project-id>.supabase.co"
```

Single file restore — immediate fix.

