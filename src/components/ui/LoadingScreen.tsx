import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

interface LoadingScreenProps {
  isLoading: boolean;
  message?: string;
}

const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2 + 1,
  duration: Math.random() * 3 + 3,
  delay: Math.random() * 2,
}));

export function LoadingScreen({ isLoading, message = 'Loading...' }: LoadingScreenProps) {
  const particles = useMemo(() => PARTICLES, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black overflow-hidden"
        >
          {/* Radial glow with hue rotation — responsive sizing */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(800px,200vw)] h-[min(800px,200vh)] rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(14, 100%, 64%, 0.15) 0%, hsla(30, 100%, 55%, 0.05) 40%, transparent 70%)',
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{
              scale: [0.6, 1.2, 1],
              opacity: [0, 0.8, 0.6],
              filter: ['hue-rotate(0deg)', 'hue-rotate(15deg)', 'hue-rotate(-10deg)', 'hue-rotate(0deg)'],
            }}
            transition={{
              scale: { duration: 1.4, ease: 'easeOut' },
              opacity: { duration: 1.4, ease: 'easeOut' },
              filter: { duration: 4, repeat: Infinity, ease: 'easeInOut' },
            }}
          />

          {/* Pulsing aura behind logo — responsive */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsla(14, 100%, 64%, 0.2) 0%, transparent 70%)',
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ delay: 0.8, duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />

          {/* Concentric ring 1 — repeating, contained by overflow-hidden */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-orange-500/20"
            initial={{ width: 60, height: 60, opacity: 0 }}
            animate={{ width: [60, 500], height: [60, 500], opacity: [0, 0.4, 0] }}
            transition={{ delay: 0.5, duration: 2.5, ease: 'easeOut', repeat: Infinity, repeatDelay: 1 }}
          />

          {/* Concentric ring 2 — repeating staggered */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/15"
            initial={{ width: 60, height: 60, opacity: 0 }}
            animate={{ width: [60, 650], height: [60, 650], opacity: [0, 0.3, 0] }}
            transition={{ delay: 1.2, duration: 2.8, ease: 'easeOut', repeat: Infinity, repeatDelay: 0.8 }}
          />

          {/* Particle field */}
          {particles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full bg-orange-500/30"
              style={{
                width: p.size,
                height: p.size,
                left: `${p.x}%`,
                top: `${p.y}%`,
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: [0, 0.6, 0],
                y: [0, -20, 0],
              }}
              transition={{
                duration: p.duration,
                delay: p.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          ))}

          {/* Logo + effects container — responsive gap & sizing */}
          <div className="relative z-10 flex flex-col items-center gap-6 sm:gap-8 px-4">
            <motion.div
              className="relative"
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
            >
              {/* Rotating energy ring (WebGL-style) — responsive */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-44 sm:w-64 sm:h-64 rounded-full"
                style={{
                  background: 'conic-gradient(from 0deg, transparent 0%, #f97316 25%, #f59e0b 50%, transparent 75%)',
                  filter: 'blur(8px)',
                  opacity: 0.4,
                }}
                initial={{ rotate: 0, opacity: 0 }}
                animate={{ rotate: 360, opacity: 0.4 }}
                transition={{
                  rotate: { duration: 4, repeat: Infinity, ease: 'linear' },
                  opacity: { delay: 0.6, duration: 0.8 },
                }}
              />

              {/* Logo: cinematic 3-keyframe entry — responsive */}
              <motion.img
                src="/lovable-uploads/wzrdtechlogo.png"
                alt="WZRD Logo"
                className="w-40 h-40 sm:w-60 sm:h-60 object-contain relative z-10"
                initial={{ scale: 0.7, opacity: 0, filter: 'blur(20px) brightness(0.5)' }}
                animate={{
                  scale: [0.7, 1.02, 1],
                  opacity: [0, 1, 1],
                  filter: [
                    'blur(20px) brightness(0.5)',
                    'blur(0px) brightness(1.6)',
                    'blur(0px) brightness(1)',
                  ],
                }}
                transition={{ delay: 0.3, duration: 1, ease: [0.22, 1, 0.36, 1] }}
              />

              {/* Horizontal lens flare sweep */}
              <motion.div
                className="absolute inset-0 overflow-hidden pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 1.2, duration: 0.8, ease: 'easeInOut' }}
              >
                <motion.div
                  className="absolute top-0 h-full w-24"
                  style={{
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
                  }}
                  initial={{ left: '-6rem' }}
                  animate={{ left: 'calc(100% + 6rem)' }}
                  transition={{ delay: 1.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.div>

              {/* Vertical lens flare sweep */}
              <motion.div
                className="absolute inset-0 overflow-hidden pointer-events-none z-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.7, 0] }}
                transition={{ delay: 1.5, duration: 0.8, ease: 'easeInOut' }}
              >
                <motion.div
                  className="absolute left-0 w-full h-24"
                  style={{
                    background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.35), transparent)',
                  }}
                  initial={{ top: '-6rem' }}
                  animate={{ top: 'calc(100% + 6rem)' }}
                  transition={{ delay: 1.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              </motion.div>
            </motion.div>

            {/* Loading message */}
            <motion.p
              className="text-xs sm:text-sm text-white/40 tracking-[0.2em] uppercase font-light"
              initial={{ opacity: 0, letterSpacing: '0.4em' }}
              animate={{ opacity: 1, letterSpacing: '0.2em' }}
              transition={{ delay: 1.4, duration: 0.6, ease: 'easeOut' }}
            >
              {message}
            </motion.p>
          </div>

          {/* Bottom progress bar — slightly thicker for visibility */}
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
            <motion.div
              className="h-full rounded-r-full"
              style={{
                background: 'linear-gradient(90deg, #f97316, #f59e0b)',
              }}
              initial={{ scaleX: 0, transformOrigin: 'left' }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default LoadingScreen;
