import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { ContentType } from "@/types/engagement";
import { PayoutActionType } from "@/lib/fiveDeeToken";
import { requestWalletProof } from "@/lib/walletProof";

interface UseEngagementPayoutOptions {
  contentType: ContentType;
  contentId: string;
}

export function useEngagementPayout({ contentType, contentId }: UseEngagementPayoutOptions) {
  const { address } = useWallet();

  const triggerPayout = useCallback(async (actionType: PayoutActionType) => {
    if (!address || !contentId) return null;

    try {
      const walletProof = await requestWalletProof(
        address.toLowerCase(),
        `content_interact:${contentType}:${actionType}:${contentId}`,
      );
      const response = await supabase.functions.invoke('content-interact', {
        body: {
          content_type: contentType,
          content_id: contentId,
          action_type: actionType,
          wallet_proof: walletProof,
        },
        headers: {
          "x-idempotency-key": `legacy-payout:${contentType}:${contentId}:${actionType}:${address.toLowerCase()}`,
        }
      });

      if (response.data?.success) {
        console.log(`[Mock $5DEE] ${actionType}: ${response.data.reward?.amount || 0} $5DEE`, {
          simulation: true,
          status: response.data.reward?.status
        });
        return response.data;
      } else if (response.data?.error) {
        console.log(`[Payout] ${actionType} skipped:`, response.data.error);
      }
      
      return null;
    } catch (error) {
      console.error(`[Payout] ${actionType} error:`, error);
      return null;
    }
  }, [address, contentType, contentId]);

  return { triggerPayout };
}
