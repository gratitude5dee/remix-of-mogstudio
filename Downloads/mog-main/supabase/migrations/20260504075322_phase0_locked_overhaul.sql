-- Phase 0 locked overhaul foundations:
-- - mocked $5DEE settlement statuses
-- - Edge Function-only writes for Mog interactions/uploads
-- - signed upload intents for mog-media

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'engagement_payouts_status_check'
      AND conrelid = 'public.engagement_payouts'::regclass
  ) THEN
    ALTER TABLE public.engagement_payouts DROP CONSTRAINT engagement_payouts_status_check;
  END IF;
END $$;

ALTER TABLE public.engagement_payouts
  ADD CONSTRAINT engagement_payouts_status_check
  CHECK (status IN ('pending', 'mock_settled', 'skipped', 'failed', 'reversed', 'confirmed'));

CREATE INDEX IF NOT EXISTS idx_engagement_payouts_payer_status_created
  ON public.engagement_payouts (payer_wallet, status, created_at DESC);

-- Keep legacy confirmed rows valid, but make mocked settlement update the same balances.
CREATE OR REPLACE FUNCTION public.update_creator_balance_on_payout()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('confirmed', 'mock_settled')
     AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('confirmed', 'mock_settled')) THEN
    INSERT INTO creator_balances (wallet_address, total_earned, pending_payout)
    VALUES (NEW.creator_wallet, NEW.amount, 0)
    ON CONFLICT (wallet_address) DO UPDATE SET
      total_earned = creator_balances.total_earned + NEW.amount,
      last_payout_at = now(),
      updated_at = now();

    CASE NEW.action_type
      WHEN 'view' THEN
        UPDATE creator_balances SET views_earned = views_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'like' THEN
        UPDATE creator_balances SET likes_earned = likes_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'comment' THEN
        UPDATE creator_balances SET comments_earned = comments_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'share' THEN
        UPDATE creator_balances SET shares_earned = shares_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'bookmark' THEN
        UPDATE creator_balances SET bookmarks_earned = bookmarks_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
    END CASE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

CREATE OR REPLACE FUNCTION public.update_user_karma_on_payout()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status IN ('confirmed', 'mock_settled')
     AND (TG_OP = 'INSERT' OR OLD.status NOT IN ('confirmed', 'mock_settled')) THEN
    INSERT INTO public.user_karma (wallet_address, karma, actions_received, total_earned)
    VALUES (NEW.creator_wallet, NEW.amount, 1, NEW.amount)
    ON CONFLICT (wallet_address) DO UPDATE SET
      karma = user_karma.karma + NEW.amount,
      actions_received = user_karma.actions_received + 1,
      total_earned = user_karma.total_earned + NEW.amount,
      last_action_at = now(),
      updated_at = now();

    CASE NEW.action_type
      WHEN 'view' THEN
        UPDATE public.user_karma SET views_earned = views_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'like' THEN
        UPDATE public.user_karma SET likes_earned = likes_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'comment' THEN
        UPDATE public.user_karma SET comments_earned = comments_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'share' THEN
        UPDATE public.user_karma SET shares_earned = shares_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      WHEN 'bookmark' THEN
        UPDATE public.user_karma SET bookmarks_earned = bookmarks_earned + NEW.amount WHERE wallet_address = NEW.creator_wallet;
      ELSE NULL;
    END CASE;

    INSERT INTO public.user_karma (wallet_address, actions_given, total_spent)
    VALUES (NEW.payer_wallet, 1, NEW.amount)
    ON CONFLICT (wallet_address) DO UPDATE SET
      actions_given = user_karma.actions_given + 1,
      total_spent = user_karma.total_spent + NEW.amount,
      last_action_at = now(),
      updated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY INVOKER SET search_path = public;

-- Move mutable Mog writes behind service-role Edge Functions.
DROP POLICY IF EXISTS "Anyone can create posts" ON public.mog_posts;
DROP POLICY IF EXISTS "Anyone can like posts" ON public.mog_likes;
DROP POLICY IF EXISTS "Anyone can comment" ON public.mog_comments;
DROP POLICY IF EXISTS "Anyone can bookmark" ON public.mog_bookmarks;
DROP POLICY IF EXISTS "Anyone can follow" ON public.mog_follows;
DROP POLICY IF EXISTS "Creators can update own posts" ON public.mog_posts;
DROP POLICY IF EXISTS "Users can delete own likes" ON public.mog_likes;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON public.mog_bookmarks;
DROP POLICY IF EXISTS "Users can unfollow" ON public.mog_follows;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.mog_comments;
DROP POLICY IF EXISTS "Update comment likes" ON public.mog_comments;

DROP POLICY IF EXISTS mog_posts_service_role_write ON public.mog_posts;
CREATE POLICY mog_posts_service_role_write
  ON public.mog_posts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS mog_likes_service_role_write ON public.mog_likes;
CREATE POLICY mog_likes_service_role_write
  ON public.mog_likes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS mog_comments_service_role_write ON public.mog_comments;
CREATE POLICY mog_comments_service_role_write
  ON public.mog_comments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS mog_bookmarks_service_role_write ON public.mog_bookmarks;
CREATE POLICY mog_bookmarks_service_role_write
  ON public.mog_bookmarks
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS mog_follows_service_role_write ON public.mog_follows;
CREATE POLICY mog_follows_service_role_write
  ON public.mog_follows
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anyone can upload mog media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can update mog media" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can delete mog media" ON storage.objects;

DROP POLICY IF EXISTS mog_media_service_role_write ON storage.objects;
CREATE POLICY mog_media_service_role_write
  ON storage.objects
  FOR ALL
  USING (bucket_id = 'mog-media' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'mog-media' AND auth.role() = 'service_role');

-- Agent and Moltbook writes must go through server-verified flows.
DROP POLICY IF EXISTS "Anyone can upsert moltbook profiles" ON public.moltbook_profiles;
DROP POLICY IF EXISTS "Anyone can update moltbook profiles" ON public.moltbook_profiles;

DROP POLICY IF EXISTS moltbook_profiles_service_role_write ON public.moltbook_profiles;
CREATE POLICY moltbook_profiles_service_role_write
  ON public.moltbook_profiles
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Anyone can insert agent content likes" ON public.agent_content_likes;
DROP POLICY IF EXISTS "Anyone can insert agent content bookmarks" ON public.agent_content_bookmarks;
DROP POLICY IF EXISTS "Anyone can insert agent content comments" ON public.agent_content_comments;
DROP POLICY IF EXISTS "Anyone can insert agent mog likes" ON public.agent_mog_likes;
DROP POLICY IF EXISTS "Anyone can insert agent mog bookmarks" ON public.agent_mog_bookmarks;
DROP POLICY IF EXISTS "Anyone can insert agent mog comments" ON public.agent_mog_comments;
DROP POLICY IF EXISTS "Anyone can insert agent follows" ON public.agent_follows;
DROP POLICY IF EXISTS "Anyone can insert agent reports" ON public.agent_reports;

DROP POLICY IF EXISTS agent_content_likes_service_role_write ON public.agent_content_likes;
CREATE POLICY agent_content_likes_service_role_write
  ON public.agent_content_likes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS agent_content_bookmarks_service_role_write ON public.agent_content_bookmarks;
CREATE POLICY agent_content_bookmarks_service_role_write
  ON public.agent_content_bookmarks
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS agent_content_comments_service_role_write ON public.agent_content_comments;
CREATE POLICY agent_content_comments_service_role_write
  ON public.agent_content_comments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS agent_mog_likes_service_role_write ON public.agent_mog_likes;
CREATE POLICY agent_mog_likes_service_role_write
  ON public.agent_mog_likes
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS agent_mog_bookmarks_service_role_write ON public.agent_mog_bookmarks;
CREATE POLICY agent_mog_bookmarks_service_role_write
  ON public.agent_mog_bookmarks
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS agent_mog_comments_service_role_write ON public.agent_mog_comments;
CREATE POLICY agent_mog_comments_service_role_write
  ON public.agent_mog_comments
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS agent_follows_service_role_write ON public.agent_follows;
CREATE POLICY agent_follows_service_role_write
  ON public.agent_follows
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS agent_reports_service_role_write ON public.agent_reports;
CREATE POLICY agent_reports_service_role_write
  ON public.agent_reports
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_mog_posts_content_type_created
  ON public.mog_posts (content_type, created_at DESC, id DESC)
  WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_mog_posts_creator_type_created
  ON public.mog_posts (creator_type, created_at DESC, id DESC)
  WHERE is_published = true;
