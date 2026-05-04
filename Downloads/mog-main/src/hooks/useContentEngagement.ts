import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useWallet } from "@/contexts/WalletContext";
import { toast } from "sonner";
import { ContentType } from "@/types/engagement";
import { useContentInteraction } from "@/hooks/useContentInteraction";
interface UseContentEngagementOptions {
  contentType: ContentType;
  contentId: string;
  initialLikes?: number;
  initialComments?: number;
  initialShares?: number;
  initialViews?: number;
  creatorWallet?: string | null;
}

export function useContentEngagement({
  contentType,
  contentId,
  initialLikes = 0,
  initialComments = 0,
  initialShares = 0,
  initialViews = 0,
}: UseContentEngagementOptions) {
  const { address } = useWallet();
  const { performInteraction } = useContentInteraction({ contentType, contentId });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [commentsCount] = useState(initialComments);
  const [sharesCount, setSharesCount] = useState(initialShares);
  const [viewsCount] = useState(initialViews);
  const isLoading = false;

  // Check user's interaction status
  useEffect(() => {
    if (address && contentId) {
      checkUserInteractions();
    } else {
      setIsLiked(false);
      setIsBookmarked(false);
    }
  }, [address, contentId, contentType]);

  const checkUserInteractions = async () => {
    if (!address) return;
    
    try {
      const [likeResult, bookmarkResult] = await Promise.all([
        supabase
          .from('content_likes')
          .select('id')
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_wallet', address.toLowerCase())
          .maybeSingle(),
        supabase
          .from('content_bookmarks')
          .select('id')
          .eq('content_type', contentType)
          .eq('content_id', contentId)
          .eq('user_wallet', address.toLowerCase())
          .maybeSingle()
      ]);

      setIsLiked(!!likeResult.data);
      setIsBookmarked(!!bookmarkResult.data);
    } catch (error) {
      console.error('Error checking interactions:', error);
    }
  };

  const handleLike = useCallback(async () => {
    if (!address) {
      toast.error('Connect wallet to like');
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    setLikesCount(prev => newLikedState ? prev + 1 : prev - 1);

    try {
      if (newLikedState) {
        await performInteraction('like');
      } else {
        await performInteraction('unlike');
      }

    } catch (error) {
      // Revert on error
      setIsLiked(!newLikedState);
      setLikesCount(prev => newLikedState ? prev - 1 : prev + 1);
      console.error('Error toggling like:', error);
    }
  }, [address, contentType, contentId, isLiked, performInteraction]);

  const handleBookmark = useCallback(async () => {
    if (!address) {
      toast.error('Connect wallet to bookmark');
      return;
    }

    const newBookmarkedState = !isBookmarked;
    setIsBookmarked(newBookmarkedState);

    try {
      if (newBookmarkedState) {
        await performInteraction('bookmark');
        toast.success('Saved to bookmarks');
      } else {
        await performInteraction('unbookmark');
        toast.success('Removed from bookmarks');
      }
    } catch (error) {
      setIsBookmarked(!newBookmarkedState);
      console.error('Error toggling bookmark:', error);
    }
  }, [address, isBookmarked, performInteraction]);

  const handleShare = useCallback(async () => {
    const url = `${window.location.origin}/${contentType}/${contentId}`;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Check this out on Mog',
          url
        });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied to clipboard');
      }
      
      setSharesCount(prev => prev + 1);

      if (address) {
        await performInteraction('share');
      }
        
    } catch {
      // User cancelled share or fallback worked
    }
  }, [address, contentType, contentId, performInteraction]);

  return {
    isLiked,
    isBookmarked,
    likesCount,
    commentsCount,
    sharesCount,
    viewsCount,
    isLoading,
    handleLike,
    handleBookmark,
    handleShare,
  };
}
