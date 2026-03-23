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
            <div className="bg-[#0c0c0c] border border-white/[0.08] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
              {/* Top Bar */}
              <div className="flex items-center justify-between px-4 py-2 bg-white/[0.04] border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-orange-400 to-red-500" />
                  <span className="text-[11px] text-white/70 font-mono font-bold tracking-wider uppercase">WZRD</span>
                </div>
                <span className="text-[10px] text-white/30 font-mono tracking-wide">Project Timeline</span>
                <div className="flex items-center gap-3">
                  <button className="text-[10px] text-white/50 font-mono bg-white/[0.06] hover:bg-white/[0.1] px-3 py-1 rounded-md transition-colors">Export</button>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
                    <span className="text-[10px] text-emerald-400/70 font-mono">Ready</span>
                  </div>
                </div>
              </div>

              <div className="flex" style={{ minHeight: '380px' }}>
                {/* Left Icon Bar */}
                <div className="w-9 border-r border-white/[0.06] bg-white/[0.02] flex flex-col items-center py-3 gap-1">
                  {[
                    { icon: Film, active: true },
                    { icon: Music, active: false },
                    { icon: Type, active: false },
                    { icon: Sparkles, active: false },
                    { icon: Layers, active: false },
                  ].map(({ icon: Icon, active }, i) => (
                    <div
                      key={i}
                      className={`w-7 h-7 rounded-md flex items-center justify-center transition-all cursor-pointer ${
                        active
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'text-white/25 hover:text-white/50 hover:bg-white/[0.04]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  ))}

                  {/* Media Library below icons */}
                  <div className="mt-auto w-full px-1">
                    <div className="border-t border-white/[0.06] pt-2">
                      <span className="text-[7px] text-white/30 font-mono uppercase tracking-wider block text-center mb-1.5">Media</span>
                      <div className="flex items-center bg-white/[0.03] rounded px-1 py-0.5 mb-1.5">
                        <Search className="w-2.5 h-2.5 text-white/20" />
                      </div>
                      <div className="grid grid-cols-2 gap-0.5">
                        {[0,1,2,3].map(i => (
                          <div key={i} className="aspect-square rounded-sm bg-white/[0.04] border border-white/[0.05]" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col">
                  {/* Preview Window */}
                  <div className="flex-1 p-3">
                    <div className="bg-gradient-to-br from-white/[0.03] to-transparent rounded-lg h-full flex items-center justify-center border border-white/[0.05] relative overflow-hidden min-h-[160px]">
                      {/* Subtle film grain overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
                      <div className="relative text-center">
                        <div className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/15 flex items-center justify-center mx-auto mb-2 transition-all cursor-pointer hover:scale-105 hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                          <Play className="w-5 h-5 text-white/50 ml-0.5" />
                        </div>
                        <span className="text-[10px] text-white/20 font-mono">1920 × 1080 • 24fps</span>
                      </div>
                    </div>
                  </div>

                  {/* Transport Controls */}
                  <div className="flex items-center justify-between px-4 py-2 border-t border-white/[0.05]">
                    <div className="flex items-center gap-3">
                      <SkipBack className="w-3.5 h-3.5 text-white/25 hover:text-white/50 cursor-pointer transition-colors" />
                      <div className="w-7 h-7 rounded-full bg-white/[0.08] hover:bg-white/[0.12] flex items-center justify-center cursor-pointer transition-all">
                        <Play className="w-3 h-3 text-white/60 ml-0.5" />
                      </div>
                      <SkipForward className="w-3.5 h-3.5 text-white/25 hover:text-white/50 cursor-pointer transition-colors" />
                      <span className="text-[10px] text-white/25 font-mono ml-2">00:00:42 / 01:02:34</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] text-white/25 font-mono">100%</span>
                      <Volume2 className="w-3.5 h-3.5 text-white/25 hover:text-white/50 cursor-pointer transition-colors" />
                    </div>
                  </div>

                  {/* Timeline */}
                  <div className="border-t border-white/[0.06]">
                    {/* Time Ruler */}
                    <div className="flex items-end px-4 pt-2 pb-1 ml-14">
                      {['00:00', '00:15', '00:30', '00:45', '01:00'].map((t, i) => (
                        <div key={i} className="flex-1 relative">
                          <div className="absolute left-0 bottom-0 w-px h-2 bg-white/10" />
                          <span className="text-[8px] text-white/20 font-mono absolute left-0 -top-0.5">{t}</span>
                        </div>
                      ))}
                    </div>

                    {/* Tracks */}
                    <div className="relative pb-3">
                      {/* Playhead */}
                      <div className="absolute top-0 bottom-0 left-[calc(14%+3.5rem)] z-10 w-px bg-orange-400/70 shadow-[0_0_6px_rgba(251,146,60,0.3)]">
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-orange-400" />
                      </div>

                      {/* B-Roll Track */}
                      <div className="flex items-center gap-3 px-4 py-1">
                        <span className="text-[9px] text-white/25 w-12 text-right font-mono shrink-0 uppercase tracking-wide">B-Roll</span>
                        <div className="flex-1 h-7 bg-white/[0.015] rounded relative overflow-hidden">
                          <div className="absolute left-[5%] top-1 bottom-1 w-[22%] rounded-sm bg-purple-500/25 border border-purple-400/15 hover:bg-purple-500/35 hover:shadow-[0_0_8px_rgba(168,85,247,0.2)] transition-all cursor-pointer" />
                          <div className="absolute left-[32%] top-1 bottom-1 w-[12%] rounded-sm bg-purple-500/15 border border-purple-400/10 hover:bg-purple-500/25 transition-all cursor-pointer" />
                          <div className="absolute left-[58%] top-1 bottom-1 w-[18%] rounded-sm bg-purple-500/20 border border-purple-400/12 hover:bg-purple-500/30 hover:shadow-[0_0_8px_rgba(168,85,247,0.15)] transition-all cursor-pointer" />
                        </div>
                      </div>

                      {/* Main Track */}
                      <div className="flex items-center gap-3 px-4 py-1">
                        <span className="text-[9px] text-white/25 w-12 text-right font-mono shrink-0 uppercase tracking-wide">Main</span>
                        <div className="flex-1 h-7 bg-white/[0.015] rounded relative overflow-hidden">
                          <div className="absolute left-[2%] top-1 bottom-1 w-[40%] rounded-sm bg-gradient-to-r from-orange-500/30 to-orange-500/20 border border-orange-400/20 hover:from-orange-500/40 hover:to-orange-500/30 hover:shadow-[0_0_10px_rgba(251,146,60,0.2)] transition-all cursor-pointer">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex gap-px">
                                {[...Array(8)].map((_, i) => (
                                  <div key={i} className="w-1 bg-orange-300/20 rounded-full" style={{ height: `${8 + Math.sin(i) * 6}px` }} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="absolute left-[45%] top-1 bottom-1 w-[28%] rounded-sm bg-gradient-to-r from-orange-500/25 to-orange-500/15 border border-orange-400/15 hover:from-orange-500/35 hover:to-orange-500/25 transition-all cursor-pointer" />
                          <div className="absolute left-[76%] top-1 bottom-1 w-[18%] rounded-sm bg-orange-500/20 border border-orange-400/12 hover:bg-orange-500/30 transition-all cursor-pointer" />
                        </div>
                      </div>

                      {/* Music Track */}
                      <div className="flex items-center gap-3 px-4 py-1">
                        <span className="text-[9px] text-white/25 w-12 text-right font-mono shrink-0 uppercase tracking-wide">Music</span>
                        <div className="flex-1 h-7 bg-white/[0.015] rounded relative overflow-hidden">
                          <div className="absolute left-0 top-1 bottom-1 w-[88%] rounded-sm bg-emerald-500/15 border border-emerald-400/12 hover:bg-emerald-500/25 hover:shadow-[0_0_8px_rgba(52,211,153,0.15)] transition-all cursor-pointer">
                            {/* Waveform visualization */}
                            <div className="absolute inset-0 flex items-center px-1 gap-px overflow-hidden">
                              {[...Array(40)].map((_, i) => (
                                <div
                                  key={i}
                                  className="w-0.5 bg-emerald-400/20 rounded-full shrink-0"
                                  style={{ height: `${3 + Math.abs(Math.sin(i * 0.7)) * 12}px` }}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Director Panel */}
                <div className="w-44 border-l border-white/[0.06] bg-white/[0.02] flex flex-col">
                  <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/[0.06]">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.4)]" />
                    <span className="text-[10px] text-white/50 font-mono font-semibold tracking-wider uppercase">Director</span>
                  </div>

                  <div className="flex-1 p-2.5 space-y-2 overflow-hidden">
                    {/* AI chat bubbles */}
                    <div className="bg-white/[0.04] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                      <p className="text-[9px] text-white/35 leading-relaxed">Analyzing footage pacing…</p>
                    </div>
                    <div className="bg-white/[0.04] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                      <p className="text-[9px] text-white/35 leading-relaxed">"Cut at 1:24 is 2s too long. Tightening."</p>
                    </div>
                    <div className="bg-orange-500/[0.08] rounded-lg px-2.5 py-2 border border-orange-500/[0.12]">
                      <p className="text-[9px] text-orange-400/50 leading-relaxed">"Adding cinematic LUT to B-roll clips…"</p>
                    </div>
                    <div className="bg-white/[0.03] rounded-lg px-2.5 py-1.5 border border-white/[0.04]">
                      <p className="text-[9px] text-white/20 leading-relaxed italic">Planning the next cut…</p>
                    </div>
                  </div>

                  {/* Director Input */}
                  <div className="p-2.5 border-t border-white/[0.06]">
                    <div className="flex items-center gap-1.5 bg-white/[0.03] rounded-lg px-2.5 py-2 border border-white/[0.05]">
                      <span className="text-[9px] text-white/20 flex-1 truncate">What story do you want to tell?</span>
                      <Send className="w-3 h-3 text-white/20 hover:text-orange-400/60 cursor-pointer transition-colors shrink-0" />
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
