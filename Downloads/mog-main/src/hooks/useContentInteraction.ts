import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { ContentType } from "@/types/engagement";
import { requestWalletProof } from "@/lib/walletProof";

export type ContentInteractionAction =
  | "like"
  | "unlike"
  | "bookmark"
  | "unbookmark"
  | "comment"
  | "share"
  | "view"
  | "follow"
  | "unfollow";

type InteractionOptions = {
  comment?: string;
  userName?: string;
  idempotencyKey?: string;
};

export type ContentInteractionResponse = {
  success: boolean;
  action_type: ContentInteractionAction;
  message?: string;
  reward?: {
    status: "pending" | "mock_settled" | "skipped" | "failed" | "reversed";
    amount?: number;
    asset?: "$5DEE";
    reason?: string;
    payout_id?: string;
  } | null;
  error?: string;
};

function makeIdempotencyKey(contentType: string, contentId: string, actionType: string): string {
  if (globalThis.crypto?.randomUUID) {
    return `${contentType}:${contentId}:${actionType}:${globalThis.crypto.randomUUID()}`;
  }
  return `${contentType}:${contentId}:${actionType}:${Date.now()}:${Math.random().toString(36).slice(2)}`;
}

export function useContentInteraction({
  contentType,
  contentId,
}: {
  contentType: ContentType | "mog_follow";
  contentId: string;
}) {
  const { address } = useWallet();

  const performInteraction = useCallback(
    async (
      actionType: ContentInteractionAction,
      options: InteractionOptions = {},
    ): Promise<ContentInteractionResponse> => {
      if (!address) {
        throw new Error("Connect wallet to continue");
      }

      const walletAddress = address.toLowerCase();
      const proofAction = `content_interact:${contentType}:${actionType}:${contentId}`;
      const walletProof = await requestWalletProof(walletAddress, proofAction);
      const idempotencyKey =
        options.idempotencyKey || makeIdempotencyKey(contentType, contentId, actionType);

      const { data, error } = await supabase.functions.invoke("content-interact", {
        body: {
          action_type: actionType,
          content_type: contentType,
          content_id: contentId,
          comment: options.comment,
          user_name: options.userName,
          wallet_proof: walletProof,
        },
        headers: {
          "x-idempotency-key": idempotencyKey,
        },
      });

      if (error) {
        throw new Error(error.message || "Interaction failed");
      }

      if (!data?.success) {
        throw new Error(data?.error || "Interaction failed");
      }

      return data as ContentInteractionResponse;
    },
    [address, contentId, contentType],
  );

  return { performInteraction };
}
