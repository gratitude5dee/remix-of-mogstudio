

# Fix: Restore missing `.env` file with Supabase environment variables

## Problem
The `.env` file was deleted (likely during a GitHub rebuild), so the app can't connect to Supabase — all API calls and auth will fail.

## Fix
Recreate `.env` with the three required Supabase variables plus `VITE_SUPABASE_ANON_KEY` (used directly by several components for API authorization headers):

```
VITE_SUPABASE_PROJECT_ID="ixkkrousepsiorwlaycp"
VITE_SUPABASE_URL="https://ixkkrousepsiorwlaycp.supabase.co"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4a2tyb3VzZXBzaW9yd2xheWNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAzMzI1MjcsImV4cCI6MjA1NTkwODUyN30.eX_P7bJam2IZ20GEghfjfr-pNwMynsdVb3Rrfipgls4"
```

Single file change, no code modifications needed.

