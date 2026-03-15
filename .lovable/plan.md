

# Fix: Commit `.env` to GitHub

## Problem
The `.env` file is listed in `.gitignore` (line 14: `.env`), so every time the project syncs from GitHub the file is missing, causing the `supabaseUrl is required` crash.

## Fix
Remove `.env` from `.gitignore` so it gets committed to the repo and persists across GitHub syncs.

**File: `.gitignore`** — remove lines 14-15 (`.env` and `.env.*`):

```text
# Before (lines 13-15):
*.local
.env
.env.*

# After (lines 13):
*.local
```

Since this `.env` only contains the public Supabase URL and anon key (which are already visible in the client bundle), there is no security risk in committing it.

No other changes needed — the `.env` file already exists with the correct values.

