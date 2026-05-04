import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { ContentType } from "@/types/engagement";
import { requestWalletProof } from "@/lib/walletProof";

const VIEW_THRESHOLD_MS = 5000; // 5 seconds minimum view time

export function useViewPayout(contentType: ContentType, contentId: string) {
  const { address } = useWallet();
  const hasTrackedRef = useRef(false);
  const contentRef = useRef({ contentType, contentId });

  // Update ref when content changes
  useEffect(() => {
    contentRef.current = { contentType, contentId };
    hasTrackedRef.current = false;
  }, [contentType, contentId]);

  useEffect(() => {
    if (!address || !contentId || hasTrackedRef.current) return;

    const timer = setTimeout(async () => {
      // Double-check we haven't already tracked
      if (hasTrackedRef.current) return;
      hasTrackedRef.current = true;

      try {
        const proofAction = `content_interact:${contentRef.current.contentType}:view:${contentRef.current.contentId}`;
        const walletProof = await requestWalletProof(address.toLowerCase(), proofAction);
        await supabase.functions.invoke('content-interact', {
          body: {
            action_type: 'view',
            content_type: contentRef.current.contentType,
            content_id: contentRef.current.contentId,
            wallet_proof: walletProof,
          },
          headers: {
            'x-idempotency-key': `view:${contentRef.current.contentType}:${contentRef.current.contentId}:${address.toLowerCase()}`,
          }
        });
      } catch (error) {
        console.error('[View Payout] Error:', error);
        // Non-blocking - don't disrupt user experience
      }
    }, VIEW_THRESHOLD_MS);

    return () => clearTimeout(timer);
  }, [address, contentId]);
}
