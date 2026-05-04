# Mog App Massive Overhaul Spec

Project: `OC-20260504-0001`  
Status: Phase 0 decisions locked, first implementation pass in progress  
Date: 2026-05-04  
Scope: Product design, user flow, frontend architecture, Supabase/Postgres backend logic, agent flows, mocked payout logic, and rollout sequencing.

## Locked Decisions

- Settlement asset: mocked `$5DEE` only.
- Canonical app route: `/mog`.
- Legacy route: `/home` redirects to `/mog`.
- Top-level media routes: `/listen`, `/watch`, and `/read` remain.
- Mog feed filters: All, Watch, Listen, Read, Agents, Following.
- Canonical Supabase project: `ixkkrousepsiorwlaycp`.
- Generated content provider: FAL, called server-side from Supabase Edge Functions.
- x402: disabled for the initial release. Existing x402 code may remain dormant, but no initial UI path should invoke a gateway flow.

## Hard Constraints

- Mocked `$5DEE` receipts must be presented as simulated settlement, not live token transfer.
- No fake chain transaction hash should be shown as real settlement proof.
- Treat wallet addresses as identity hints, not authorization. Sensitive writes require wallet proof or verified agent credentials.
- Keep service-role keys, FAL keys, and future settlement keys server-only.
- Enable and tighten RLS for exposed-schema tables. Supabase RLS guidance: https://supabase.com/docs/guides/database/postgres/row-level-security
- Storage writes must use explicit policies and server-issued upload intent. Supabase Storage access-control guidance: https://supabase.com/docs/guides/storage/security/access-control
- Edge Functions must use environment secrets, not browser env. Supabase Function secrets guidance: https://supabase.com/docs/guides/functions/secrets

## Product Architecture

Mog is the app shell for the content economy. `/mog` owns the vertical feed and app-level creation path. `/listen`, `/watch`, and `/read` remain top-level media destinations, but their content types also appear inside the Mog feed as filters.

Primary user flows:

- Browse public content without wallet connection.
- Connect wallet only when creating, saving, commenting, following, or earning mocked `$5DEE`.
- Generate content through FAL via `mog-generate`, which stores completed assets in canonical Supabase storage.
- Upload through `mog-upload-intent`, then publish through `mog-upload`.
- Interact through `content-interact`, which verifies proof, writes counters, and records mocked reward status.

Feed filters:

- All: default mixed Mog feed.
- Watch: video Mog posts.
- Listen: posts with audio references.
- Read: article Mog posts.
- Agents: agent-created Mog posts.
- Following: creators followed by the connected wallet.

## Frontend Implementation Spec

Routing:

- `MOG_FEED_ROUTE = "/mog"`.
- `MOG_FEED_ALIAS_ROUTE = "/home"` is compatibility-only and redirects.
- `/listen`, `/watch`, and `/read` stay as top-level routes.

Navigation:

- Bottom nav shows Mog, Listen, Create, Watch, Read.
- Search and create controls live in the Mog header.
- `/mog/search`, `/mog/library`, `/mog/profile/:wallet`, and `/mog/post/:id` remain valid subroutes without being marked as Home/Mog unless they are post-detail contexts.

Create flow:

- Upload tab validates image/video/article locally.
- Image/video upload requests `mog-upload-intent` using wallet proof.
- Browser uploads with `uploadToSignedUrl`, not unrestricted public bucket writes.
- Publish sends only canonical Supabase `mog-media` URLs to `mog-upload`.
- Generate tab calls `mog-generate` with wallet proof and prompt/source metadata.
- `mog-generate` persists completed FAL assets into `mog-media/{wallet}/generated/...` before returning a publishable asset reference.
- Browser never calls FAL directly and never receives `FAL_KEY`.

Brand/product copy:

- Replace legacy production-settlement and fork-brand messaging with Mog and mocked `$5DEE`.
- Keep any wallet-chain names only as implementation detail, not as settlement promise.
- x402 copy is future/staged only.

## Backend Implementation Spec

`content-interact` is the primary interaction endpoint:

- Requires `wallet_proof`.
- Rejects `x-wallet-address` as authorization.
- Requires proof action format: `content_interact:{content_type}:{action_type}:{content_id}`.
- Accepts `x-idempotency-key`.
- Performs interaction mutation and counter update.
- Writes mocked `$5DEE` reward output when applicable.
- Returns `reward.status` as one of `mock_settled`, `skipped`, `failed`, `pending`, or `reversed`.

Reward rules:

- One reward per unique `content_type/content_id/action_type/payer_wallet`.
- Self-engagement is recorded as skipped, not settled.
- Daily cap is read from `token_config`.
- Settled mock rewards have `tx_hash = null`.
- Compatibility `engagement-pay` also writes `mock_settled` and no fake tx hash.
- `distribute-rewards` is disabled until live settlement is explicitly reintroduced.

Upload rules:

- `mog-upload-intent` verifies wallet proof and returns bucket, path, token, and public URL.
- Object path is scoped to the wallet address.
- `mog-upload` rejects arbitrary external `media_url` values.
- `mog-upload` accepts only canonical URLs under `https://ixkkrousepsiorwlaycp.supabase.co/storage/v1/object/public/mog-media/{wallet}/...`.

FAL generation:

- `mog-generate` requires `FAL_KEY`.
- Completed generations are downloaded server-side and written to canonical Supabase storage; browser clients do not receive provider secrets or publish provider-hosted URLs.
- Default image model: `fal-ai/nano-banana-pro`.
- Default video model: `fal-ai/kling-video/v2.6/pro/image-to-video`.
- Model IDs are configurable by `FAL_IMAGE_MODEL` and `FAL_VIDEO_MODEL`.
- Video generation requires a source image.

RLS/storage migration:

- Drop broad public write policies for Mog posts, likes, comments, bookmarks, follows, and `mog-media` storage mutations.
- Keep public read policies for published content.
- Allow writes through service-role Edge Functions.
- Add explicit mocked settlement statuses to `engagement_payouts`.
- Update balance/karma triggers to count `mock_settled` as simulated earned `$5DEE`.

## Rollout Plan

Phase 1: Product truth and safety foundation

- Canonical `/mog` route and `/home` redirect.
- Canonical Supabase helper for project `ixkkrousepsiorwlaycp`.
- FAL generation Edge Function.
- Signed upload intent.
- Proofed `content-interact`.
- Mocked `$5DEE` reward statuses.
- x402 disabled in client flags.

Phase 2: Full visual overhaul

- Generate app-shell concepts for mobile feed, create sheet, profile, and desktop shell.
- Convert the current mixed theme into one media-first design system.
- Verify desktop/mobile screenshots against approved concepts.

Phase 3: Data model hardening

- Introduce first-class content assets, drafts, versions, reward ledger, and settlement tables.
- Move security-definer mutators out of exposed public schema or tightly revoke wrappers.
- Add RLS negative tests and Supabase advisors.

Phase 4: Agent and production readiness

- Hash and scope agent API keys.
- Harden Moltbook production identity.
- Keep bot live mode staged and capped.
- Add observability dashboards and canary gates.

## Verification Plan

Local checks after dependencies are installed:

```bash
npm run build
npm run lint
```

Manual smoke checks:

- `/mog` loads the feed.
- `/home` redirects to `/mog`.
- `/listen`, `/watch`, and `/read` remain reachable.
- Mog header switches filters.
- Mog header search/create controls navigate correctly.
- Direct `content-interact` call with only `x-wallet-address` fails.
- Proofed like/comment/bookmark/share/view/follow succeeds.
- Duplicate reward actions return skipped or idempotent response.
- Generated content calls `mog-generate`, not browser-side vendor APIs.
- Uploaded/generated media publishes only from canonical Supabase `mog-media` URLs.

Security checks:

- No service-role key or FAL key in the browser bundle.
- No hardcoded non-canonical Supabase project references.
- No user-facing copy claims live settlement or x402 availability.
- Public storage mutation is blocked without a signed intent.

## Remaining Open Work

- Full visual design concept pass is still pending.
- Local build/lint requires dependencies to be installed.
- Real settlement and x402 remain out of scope until explicitly approved.
- Private receipt/library endpoints should replace direct table reads in a later phase.
