import {
  getSupabaseAdminClient,
  verifyAndConsumeWalletProof,
  walletProofCorsHeaders,
  WalletProofPayload,
} from "../_shared/wallet-proof.ts";
import { logOpsEvent } from "../_shared/ops-log.ts";

const corsHeaders = {
  ...walletProofCorsHeaders,
  "Access-Control-Allow-Headers": `${walletProofCorsHeaders["Access-Control-Allow-Headers"]}, x-idempotency-key`,
};

type ActionType = "like" | "unlike" | "bookmark" | "unbookmark" | "comment" | "share" | "view" | "follow" | "unfollow";
type ContentType = "track" | "video" | "article" | "mog_post" | "mog_follow";

type InteractionPayload = {
  action_type?: ActionType;
  content_type?: ContentType;
  content_id?: string;
  comment?: string;
  user_name?: string;
  wallet_proof?: WalletProofPayload | null;
};

const PAYOUT_RATES: Record<string, number> = {
  view: 1,
  like: 5,
  comment: 10,
  share: 3,
  bookmark: 2,
};

const VALID_ACTIONS = new Set<ActionType>([
  "like",
  "unlike",
  "bookmark",
  "unbookmark",
  "comment",
  "share",
  "view",
  "follow",
  "unfollow",
]);
const VALID_CONTENT_TYPES = new Set<ContentType>(["track", "video", "article", "mog_post", "mog_follow"]);
const REWARD_ACTIONS = new Set(["view", "like", "comment", "share", "bookmark"]);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function proofAction(contentType: string, actionType: string, contentId: string) {
  return `content_interact:${contentType}:${actionType}:${contentId}`;
}

async function getCreatorWallet(
  supabase: ReturnType<typeof getSupabaseAdminClient>,
  contentType: ContentType,
  contentId: string,
) {
  if (contentType === "mog_follow") {
    return contentId.toLowerCase();
  }

  if (contentType === "mog_post") {
    const { data, error } = await supabase
      .from("mog_posts")
      .select("id, creator_wallet")
      .eq("id", contentId)
      .single();
    if (error || !data) return null;
    return String(data.creator_wallet || "").toLowerCase();
  }

  const table =
    contentType === "track"
      ? "music_tracks"
      : contentType === "video"
        ? "music_videos"
        : "articles";
  const walletField = contentType === "article" ? "author_wallet" : "artist_wallet";
  const { data, error } = await supabase
    .from(table)
    .select(`id, ${walletField}`)
    .eq("id", contentId)
    .single();
  if (error || !data) return null;
  return String((data as Record<string, unknown>)[walletField] || "").toLowerCase();
}

async function writeMockFiveDeeReward({
  supabase,
  contentType,
  contentId,
  actionType,
  actorWallet,
  creatorWallet,
}: {
  supabase: ReturnType<typeof getSupabaseAdminClient>;
  contentType: ContentType;
  contentId: string;
  actionType: ActionType;
  actorWallet: string;
  creatorWallet: string | null;
}) {
  if (!REWARD_ACTIONS.has(actionType)) {
    return null;
  }

  if (!creatorWallet) {
    return { status: "skipped", asset: "$5DEE", amount: 0, reason: "creator_wallet_missing" };
  }

  const existing = await supabase
    .from("engagement_payouts")
    .select("id, amount, status")
    .eq("content_type", contentType)
    .eq("content_id", contentId)
    .eq("action_type", actionType)
    .eq("payer_wallet", actorWallet)
    .maybeSingle();

  if (existing.data) {
    return {
      status: "skipped",
      asset: "$5DEE",
      amount: Number(existing.data.amount || 0),
      reason: "already_rewarded",
      payout_id: existing.data.id,
    };
  }

  const { data: configData } = await supabase
    .from("token_config")
    .select("payout_amount, is_enabled, daily_cap_per_user")
    .eq("action_type", actionType)
    .maybeSingle();

  const payoutAmount = Number(configData?.payout_amount ?? PAYOUT_RATES[actionType] ?? 0);
  const isEnabled = configData?.is_enabled ?? true;
  const dailyCap = Number(configData?.daily_cap_per_user ?? 100);

  let status = "mock_settled";
  let amount = payoutAmount;
  let reason: string | null = null;

  if (!isEnabled) {
    status = "skipped";
    amount = 0;
    reason = "payout_disabled";
  } else if (creatorWallet === actorWallet) {
    status = "skipped";
    amount = 0;
    reason = "self_engagement_blocked";
  } else {
    const dayStart = new Date();
    dayStart.setUTCHours(0, 0, 0, 0);
    const { count } = await supabase
      .from("engagement_payouts")
      .select("id", { count: "exact", head: true })
      .eq("payer_wallet", actorWallet)
      .eq("status", "mock_settled")
      .gte("created_at", dayStart.toISOString());

    if ((count ?? 0) >= dailyCap) {
      status = "skipped";
      amount = 0;
      reason = "daily_cap_reached";
    }
  }

  const { data: payout, error } = await supabase
    .from("engagement_payouts")
    .insert({
      content_type: contentType,
      content_id: contentId,
      action_type: actionType,
      payer_wallet: actorWallet,
      creator_wallet: creatorWallet,
      amount,
      tx_hash: null,
      status,
      confirmed_at: status === "mock_settled" ? new Date().toISOString() : null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[content-interact] reward insert failed", error);
    return { status: "failed", asset: "$5DEE", amount: 0, reason: "reward_insert_failed" };
  }

  return {
    status,
    asset: "$5DEE",
    amount,
    reason,
    payout_id: payout?.id,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ success: false, error: "method_not_allowed" }, 405);
  }

  const startedAt = Date.now();
  const supabase = getSupabaseAdminClient();

  try {
    const body = (await req.json()) as InteractionPayload;
    const actionType = body.action_type as ActionType;
    const contentType = body.content_type as ContentType;
    const contentId = String(body.content_id || "");
    const comment = typeof body.comment === "string" ? body.comment.trim() : "";

    if (!actionType || !contentType || !contentId) {
      return jsonResponse({ success: false, error: "missing_required_fields" }, 400);
    }

    if (!VALID_ACTIONS.has(actionType)) {
      return jsonResponse({ success: false, error: "invalid_action_type" }, 400);
    }

    if (!VALID_CONTENT_TYPES.has(contentType)) {
      return jsonResponse({ success: false, error: "invalid_content_type" }, 400);
    }

    if (actionType === "comment" && !comment) {
      return jsonResponse({ success: false, error: "comment_required" }, 400);
    }

    const idempotencyKey = req.headers.get("x-idempotency-key")?.trim() || null;
    const requestedActor = String(body.wallet_proof?.address || "").toLowerCase();
    if (idempotencyKey && /^0x[a-f0-9]{40}$/i.test(requestedActor)) {
      const { data: existing } = await supabase
        .from("api_idempotency_keys")
        .select("response_status, response_body, expires_at")
        .eq("endpoint", "content-interact")
        .eq("idempotency_key", idempotencyKey)
        .eq("actor", requestedActor)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (existing?.response_body) {
        return jsonResponse(existing.response_body, existing.response_status || 200);
      }
    }

    const proofResult = await verifyAndConsumeWalletProof(supabase, body.wallet_proof || null);
    if (!proofResult.ok) {
      return jsonResponse({ success: false, error: proofResult.error }, proofResult.status);
    }

    if (proofResult.action !== proofAction(contentType, actionType, contentId)) {
      return jsonResponse({ success: false, error: "invalid_wallet_proof_action" }, 403);
    }

    const actorWallet = proofResult.address;
    if (idempotencyKey) {
      const { data: existing } = await supabase
        .from("api_idempotency_keys")
        .select("response_status, response_body, expires_at")
        .eq("endpoint", "content-interact")
        .eq("idempotency_key", idempotencyKey)
        .eq("actor", actorWallet)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (existing?.response_body) {
        return jsonResponse(existing.response_body, existing.response_status || 200);
      }
    }

    const isMogPost = contentType === "mog_post";
    const creatorWallet = await getCreatorWallet(supabase, contentType, contentId);
    let message = "ok";
    let metricChanged = false;
    let rewardOverride: Record<string, unknown> | null = null;

    if (!creatorWallet && contentType !== "mog_follow") {
      return jsonResponse({ success: false, error: "content_not_found" }, 404);
    }

    if (actionType === "like") {
      const table = isMogPost ? "mog_likes" : "content_likes";
      const insertPayload = isMogPost
        ? { post_id: contentId, user_wallet: actorWallet }
        : { content_id: contentId, content_type: contentType, user_wallet: actorWallet };
      const { error } = await supabase.from(table).insert(insertPayload);
      if (error?.code === "23505") {
        message = "already_liked";
      } else if (error) {
        throw error;
      } else {
        metricChanged = true;
        const rpc = isMogPost ? "adjust_mog_post_metric" : "adjust_content_metric";
        const args = isMogPost
          ? { p_post_id: contentId, p_metric: "likes_count", p_delta: 1 }
          : { p_content_type: contentType, p_content_id: contentId, p_metric: "likes_count", p_delta: 1 };
        await supabase.rpc(rpc, args);
        message = "liked";
      }
    }

    if (actionType === "unlike") {
      if (isMogPost) {
        const { data, error } = await supabase
          .from("mog_likes")
          .delete()
          .eq("post_id", contentId)
          .eq("user_wallet", actorWallet)
          .select("id");
        if (error) throw error;
        if (data && data.length > 0) {
          await supabase.rpc("adjust_mog_post_metric", { p_post_id: contentId, p_metric: "likes_count", p_delta: -1 });
        }
      } else {
        const { data, error } = await supabase
          .from("content_likes")
          .delete()
          .eq("content_id", contentId)
          .eq("content_type", contentType)
          .eq("user_wallet", actorWallet)
          .select("id");
        if (error) throw error;
        if (data && data.length > 0) {
          await supabase.rpc("adjust_content_metric", { p_content_type: contentType, p_content_id: contentId, p_metric: "likes_count", p_delta: -1 });
        }
      }
      message = "unliked";
    }

    if (actionType === "bookmark") {
      const table = isMogPost ? "mog_bookmarks" : "content_bookmarks";
      const insertPayload = isMogPost
        ? { post_id: contentId, user_wallet: actorWallet }
        : { content_id: contentId, content_type: contentType, user_wallet: actorWallet };
      const { error } = await supabase.from(table).insert(insertPayload);
      if (error?.code === "23505") {
        message = "already_bookmarked";
      } else if (error) {
        throw error;
      } else {
        metricChanged = true;
        message = "bookmarked";
      }
    }

    if (actionType === "unbookmark") {
      if (isMogPost) {
        const { error } = await supabase
          .from("mog_bookmarks")
          .delete()
          .eq("post_id", contentId)
          .eq("user_wallet", actorWallet);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("content_bookmarks")
          .delete()
          .eq("content_id", contentId)
          .eq("content_type", contentType)
          .eq("user_wallet", actorWallet);
        if (error) throw error;
      }
      message = "unbookmarked";
    }

    if (actionType === "comment") {
      const userName = typeof body.user_name === "string" && body.user_name.trim()
        ? body.user_name.trim().slice(0, 80)
        : `${actorWallet.slice(0, 6)}...${actorWallet.slice(-4)}`;
      if (isMogPost) {
        const { error } = await supabase.from("mog_comments").insert({
          post_id: contentId,
          user_wallet: actorWallet,
          user_name: userName,
          content: comment.slice(0, 1000),
          user_type: "human",
        });
        if (error) throw error;
        await supabase.rpc("adjust_mog_post_metric", { p_post_id: contentId, p_metric: "comments_count", p_delta: 1 });
      } else {
        const { error } = await supabase.from("content_comments").insert({
          content_id: contentId,
          content_type: contentType,
          user_wallet: actorWallet,
          user_name: userName,
          content: comment.slice(0, 1000),
        });
        if (error) throw error;
        await supabase.rpc("adjust_content_metric", { p_content_type: contentType, p_content_id: contentId, p_metric: "comments_count", p_delta: 1 });
      }
      metricChanged = true;
      message = "comment_added";
    }

    if (actionType === "share" || actionType === "view") {
      const { data: existingPayout } = await supabase
        .from("engagement_payouts")
        .select("id, amount")
        .eq("content_type", contentType)
        .eq("content_id", contentId)
        .eq("action_type", actionType)
        .eq("payer_wallet", actorWallet)
        .maybeSingle();

      if (existingPayout) {
        message = actionType === "share" ? "share_already_recorded" : "view_already_recorded";
        rewardOverride = {
          status: "skipped",
          asset: "$5DEE",
          amount: Number(existingPayout.amount || 0),
          reason: "already_rewarded",
          payout_id: existingPayout.id,
        };
      } else {
        const metric = actionType === "share" ? "shares_count" : "views_count";
        if (isMogPost) {
          await supabase.rpc("adjust_mog_post_metric", { p_post_id: contentId, p_metric: metric, p_delta: 1 });
        } else {
          await supabase.rpc("adjust_content_metric", { p_content_type: contentType, p_content_id: contentId, p_metric: metric, p_delta: 1 });
        }
        metricChanged = true;
        message = actionType === "share" ? "shared" : "view_recorded";
      }
    }

    if (actionType === "follow") {
      const followingWallet = contentId.toLowerCase();
      const { error } = await supabase.from("mog_follows").insert({
        follower_wallet: actorWallet,
        following_wallet: followingWallet,
      });
      if (error?.code === "23505") {
        message = "already_following";
      } else if (error) {
        throw error;
      } else {
        message = "following";
      }
    }

    if (actionType === "unfollow") {
      const { error } = await supabase
        .from("mog_follows")
        .delete()
        .eq("follower_wallet", actorWallet)
        .eq("following_wallet", contentId.toLowerCase());
      if (error) throw error;
      message = "unfollowed";
    }

    const reward = rewardOverride || (metricChanged
      ? await writeMockFiveDeeReward({ supabase, contentType, contentId, actionType, actorWallet, creatorWallet })
      : null);

    const responseBody = {
      success: true,
      action_type: actionType,
      content_type: contentType,
      content_id: contentId,
      message,
      reward,
    };

    if (idempotencyKey) {
      await supabase.from("api_idempotency_keys").upsert(
        {
          endpoint: "content-interact",
          idempotency_key: idempotencyKey,
          actor: actorWallet,
          response_status: 200,
          response_body: responseBody,
        },
        { onConflict: "endpoint,idempotency_key,actor" },
      );
    }

    await logOpsEvent(supabase, {
      component: "content-interact",
      event_name: "content_interact_success",
      level: "info",
      mode_used: "mock_5dee",
      outcome: "success",
      metadata: {
        content_type: contentType,
        content_id: contentId,
        action_type: actionType,
        actor_wallet: actorWallet,
        reward,
        latency_ms: Date.now() - startedAt,
      },
    });

    return jsonResponse(responseBody);
  } catch (error) {
    console.error("[content-interact]", error);
    await logOpsEvent(supabase, {
      component: "content-interact",
      event_name: "content_interact_failed",
      level: "error",
      mode_used: "mock_5dee",
      outcome: "error",
      metadata: {
        error: error instanceof Error ? error.message : "unknown",
        latency_ms: Date.now() - startedAt,
      },
    });
    return jsonResponse({ success: false, error: "internal_server_error" }, 500);
  }
});
