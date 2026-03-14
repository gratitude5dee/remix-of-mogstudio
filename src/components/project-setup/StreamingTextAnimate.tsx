import { useEffect, useRef, useState, memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface StreamingTextAnimateProps {
  /** The full text to display so far (grows as streaming appends) */
  text: string;
  /** Whether streaming is still in progress (shows cursor when true) */
  isStreaming?: boolean;
  className?: string;
}

/**
 * A progressive typewriter / blur-in component for streamed text.
 *
 * Unlike TextAnimate which re-renders all segments whenever children change,
 * this component tracks which words have already been revealed and only
 * animates newly-arrived words.  Previously revealed words are rendered
 * instantly (no re-animation flicker).
 */
function StreamingTextAnimateBase({
  text,
  isStreaming = false,
  className,
}: StreamingTextAnimateProps) {
  // Split by whitespace while preserving the whitespace tokens
  const words = text.split(/(\s+)/);

  // Track how many words have already been revealed so they don't re-animate
  const revealedCountRef = useRef(0);
  const [revealedCount, setRevealedCount] = useState(0);

  useEffect(() => {
    // When text grows, mark new words for animation
    if (words.length > revealedCountRef.current) {
      // Schedule the reveal update so the current render sees the old count
      const timer = requestAnimationFrame(() => {
        revealedCountRef.current = words.length;
        setRevealedCount(words.length);
      });
      return () => cancelAnimationFrame(timer);
    }
  }, [words.length]);

  return (
    <p className={cn('whitespace-pre-wrap leading-relaxed', className)}>
      {words.map((word, i) => {
        const alreadyRevealed = i < revealedCount;

        if (alreadyRevealed) {
          // Already visible — render instantly, no animation
          return (
            <span key={`w-${i}`} className="inline whitespace-pre-wrap">
              {word}
            </span>
          );
        }

        // New word — animate in with blur + fade
        return (
          <motion.span
            key={`w-${i}`}
            className="inline whitespace-pre-wrap"
            initial={{ opacity: 0, filter: 'blur(8px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{
              duration: 0.35,
              delay: (i - revealedCount) * 0.04, // stagger new words
              ease: 'easeOut',
            }}
          >
            {word}
          </motion.span>
        );
      })}

      {/* Blinking cursor while streaming */}
      {isStreaming && (
        <motion.span
          className="inline-block w-0.5 h-5 bg-primary ml-1 align-middle"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </p>
  );
}

export const StreamingTextAnimate = memo(StreamingTextAnimateBase);
