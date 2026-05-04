import { useEffect, useRef } from "react";
import { useWallet } from "@/contexts/WalletContext";
import { useContentInteraction } from "@/hooks/useContentInteraction";

const VIEW_THRESHOLD_MS = 5000; // 5 seconds to count as a view

interface UseMogViewPayoutProps {
  postId: string;
  creatorWallet: string;
  isActive: boolean;
}

export function useMogViewPayout({ postId, creatorWallet, isActive }: UseMogViewPayoutProps) {
  const { address } = useWallet();
  const { performInteraction } = useContentInteraction({ contentType: "mog_post", contentId: postId });
  const viewTimerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    // Reset on post change
    hasTriggeredRef.current = false;
  }, [postId]);

  useEffect(() => {
    // Only track if post is active and user has wallet
    if (!isActive || !address || !creatorWallet) {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
      return;
    }

    // Don't track own content
    if (address.toLowerCase() === creatorWallet.toLowerCase()) {
      return;
    }

    // Don't track twice
    if (hasTriggeredRef.current) {
      return;
    }

    // Start timer
    viewTimerRef.current = setTimeout(async () => {
      if (hasTriggeredRef.current) return;
      hasTriggeredRef.current = true;

      try {
        await performInteraction("view", {
          idempotencyKey: `mog-view:${postId}:${address.toLowerCase()}`,
        });
      } catch (err) {
        console.error('View payout failed:', err);
      }
    }, VIEW_THRESHOLD_MS);

    return () => {
      if (viewTimerRef.current) {
        clearTimeout(viewTimerRef.current);
        viewTimerRef.current = null;
      }
    };
  }, [isActive, address, postId, creatorWallet, performInteraction]);

  return { hasTriggered: hasTriggeredRef.current };
}
