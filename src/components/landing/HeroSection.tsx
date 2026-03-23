import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, ArrowDown, Film, Music, Type, Sparkles, Layers, SkipBack, SkipForward, Volume2, Search, Plus, Send } from 'lucide-react';
import ScrollingPartners from '@/components/landing/ScrollingPartners';

interface HeroSectionProps {
  headline?: string;
  subheadline?: string;
}

export function HeroSection({ 
  headline = "Create at the speed\nof thought.", 
  subheadline = "Go from raw ideas to polished, publish-ready content in minutes. AI-powered tools that enhance your creative flow." 
}: HeroSectionProps) {
  const scrollToContent = () => {
    window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient accents */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,107,74,0.15), transparent 70%),
            radial-gradient(ellipse 40% 30% at 80% 20%, rgba(249,115,22,0.06), transparent 60%),
            radial-gradient(ellipse 40% 30% at 20% 80%, rgba(139,92,246,0.04), transparent 60%)
          `,
        }}
      />

      <div className="relative z-10 container mx-auto px-4 py-32 lg:py-40">
        <div className="max-w-5xl mx-auto text-center">
          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold tracking-tight leading-[0.95] mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 whitespace-pre-line"
          >
            {headline}
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg sm:text-xl lg:text-2xl text-white/50 max-w-2xl mx-auto leading-relaxed font-light mb-10"
          >
            {subheadline}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Link
              to="/login?mode=signup"
              className="group inline-flex items-center gap-2.5 px-8 py-4 bg-white text-black font-semibold rounded-xl hover:bg-white/90 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(255,255,255,0.15)] transition-all duration-200 text-base"
            >
              Get Started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>

            <Link
              to="/demo"
              className="inline-flex items-center gap-2.5 px-8 py-4 border border-white/10 text-white/80 font-medium rounded-xl hover:bg-white/[0.05] hover:border-white/20 transition-all duration-200 text-base"
            >
              <Play className="w-4 h-4" />
              Watch Demo
            </Link>
          </motion.div>

          {/* Mock Editor Panel */}
          <motion.div
            className="relative -mb-20 z-20 mx-auto max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.6 }}
          >
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-1 backdrop-blur-sm shadow-2xl shadow-black/50">
              <div className="rounded-xl overflow-hidden">
                {/* Editor Header */}
                <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  </div>
                  <span className="text-[11px] text-white/30 ml-2 font-mono">WZRD Studio — Project Timeline</span>
                </div>

                {/* Editor Content */}
                <div className="flex min-h-[280px]">
                  {/* Preview + Timeline */}
                  <div className="flex-1 p-4">
                    {/* Mini Preview */}
                    <div className="bg-gradient-to-br from-white/[0.04] to-white/[0.01] rounded-lg h-32 mb-4 flex items-center justify-center border border-white/[0.05]">
                      <div className="text-center">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-2">
                          <Play className="w-4 h-4 text-white/40 ml-0.5" />
                        </div>
                        <span className="text-[10px] text-white/20 font-mono">00:00:00 / 00:02:34</span>
                      </div>
                    </div>

                    {/* Timeline Tracks */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/30 w-12 text-right font-mono shrink-0">B-Roll</span>
                        <div className="flex-1 h-6 bg-white/[0.02] rounded relative overflow-hidden">
                          <div className="absolute left-[5%] top-1 bottom-1 w-[25%] rounded bg-purple-500/30 border border-purple-400/20" />
                          <div className="absolute left-[55%] top-1 bottom-1 w-[20%] rounded bg-purple-500/20 border border-purple-400/15" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/30 w-12 text-right font-mono shrink-0">Main</span>
                        <div className="flex-1 h-6 bg-white/[0.02] rounded relative overflow-hidden">
                          <div className="absolute left-[2%] top-1 bottom-1 w-[45%] rounded bg-orange-500/30 border border-orange-400/20" />
                          <div className="absolute left-[50%] top-1 bottom-1 w-[35%] rounded bg-orange-500/25 border border-orange-400/15" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-white/30 w-12 text-right font-mono shrink-0">Music</span>
                        <div className="flex-1 h-6 bg-white/[0.02] rounded relative overflow-hidden">
                          <div className="absolute left-0 top-1 bottom-1 w-[90%] rounded bg-emerald-500/20 border border-emerald-400/15" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Director Pane */}
                  <div className="w-48 border-l border-white/[0.06] p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
                      <span className="text-[10px] text-white/40 font-semibold tracking-wide uppercase">AI Director</span>
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="bg-white/[0.04] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                        <p className="text-[10px] text-white/40 leading-relaxed">"Tighten the cut at 1:24 — remove the 2s pause."</p>
                      </div>
                      <div className="bg-orange-500/[0.08] rounded-lg px-2.5 py-2 border border-orange-500/[0.12]">
                        <p className="text-[10px] text-orange-400/60 leading-relaxed">"Add cinematic color grade to B-roll clips."</p>
                      </div>
                    </div>
                    <div className="mt-2 bg-white/[0.03] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                      <span className="text-[10px] text-white/20">Ask AI anything...</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

          {/* Built With Partners */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="mt-8"
          >
            <ScrollingPartners />
          </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 cursor-pointer"
          onClick={scrollToContent}
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-xs text-white/20 uppercase tracking-widest">Scroll</span>
            <ArrowDown className="w-4 h-4 text-white/20 animate-bounce" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default HeroSection;
