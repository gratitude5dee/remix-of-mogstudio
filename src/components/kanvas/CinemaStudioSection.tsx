import { useState } from "react";
import {
  Sparkles,
  FolderOpen,
  Film,
  Mic2,
  Layers,
  Settings,
  Info,
  Plus,
  ArrowRight,
  Clapperboard,
  Check,
} from "lucide-react";

type NavItem = "master-files" | "scene-generator" | "voice-synth" | "vfx-stack";
type FilterItem = "genre" | "budget" | "era" | "archetype" | "identity" | "star-power";

const NAV_ITEMS: { id: NavItem; label: string; icon: React.ElementType }[] = [
  { id: "master-files", label: "Master Files", icon: FolderOpen },
  { id: "scene-generator", label: "Scene Generator", icon: Film },
  { id: "voice-synth", label: "Voice Synth", icon: Mic2 },
  { id: "vfx-stack", label: "VFX Stack", icon: Layers },
];

const FILTER_PILLS: { id: FilterItem; label: string }[] = [
  { id: "genre", label: "Genre" },
  { id: "budget", label: "Budget" },
  { id: "era", label: "Era" },
  { id: "archetype", label: "Archetype" },
  { id: "identity", label: "Identity" },
  { id: "star-power", label: "Star Power" },
];

const GENRE_CARDS = [
  {
    title: "ADVENTURE",
    overline: "EPIC JOURNEYS",
    overlineColor: "#ff68a8",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=640&q=80&auto=format",
  },
  {
    title: "SCI-FI",
    overline: "FUTURISM",
    overlineColor: "#00d4ec",
    image: "https://images.unsplash.com/photo-1534996858221-380b92700493?w=640&q=80&auto=format",
  },
  {
    title: "NOIR",
    overline: "MYSTERY",
    overlineColor: "#71717a",
    image: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?w=640&q=80&auto=format",
  },
];

export default function CinemaStudioSection() {
  const [activeNav, setActiveNav] = useState<NavItem>("master-files");
  const [activeFilter, setActiveFilter] = useState<FilterItem>("genre");

  return (
    <div className="fixed inset-0 z-40 flex bg-[#090909] overflow-hidden">
      {/* ── Left Sidebar ── */}
      <aside className="flex w-[280px] flex-shrink-0 flex-col bg-[#0e0e0e] border-r border-white/5">
        {/* Header */}
        <div className="flex items-center gap-3 px-8 pt-8 pb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ccff00]">
            <Sparkles size={18} className="text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-white font-['Space_Grotesk']">Project Alpha</p>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ccff00]">
              IN PRODUCTION
            </p>
          </div>
        </div>

        {/* New Sequence Button */}
        <div className="px-4 mb-6">
          <button className="w-full rounded-full bg-[#ccff00] py-3 text-xs font-bold uppercase tracking-[0.15em] text-black transition-colors hover:bg-[#b8e600] flex items-center justify-center gap-2">
            <Plus size={14} />
            NEW SEQUENCE
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={
                  isActive
                    ? "flex items-center gap-4 rounded-r-full bg-[#ccff00] py-4 pl-8 pr-6 text-xs font-bold uppercase tracking-[0.15em] text-black shadow-[0_0_20px_rgba(204,255,0,0.2)] w-[90%] transition-all"
                    : "flex items-center gap-4 py-4 pl-8 pr-6 text-xs font-medium uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors w-[90%]"
                }
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="border-t border-white/5 py-4">
          <button className="flex w-full items-center gap-4 py-3 pl-8 text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors">
            <Settings size={14} />
            Preferences
          </button>
          <button className="flex w-full items-center gap-4 py-3 pl-8 text-[10px] uppercase tracking-[0.15em] text-zinc-500 hover:text-white transition-colors">
            <Info size={14} />
            System Info
          </button>
        </div>
      </aside>

      {/* ── Main Canvas ── */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden relative" style={{ scrollbarWidth: "none" }}>
        {/* Watermark */}
        <span className="absolute -top-20 left-10 text-[200px] font-black text-white/[0.02] pointer-events-none select-none font-['Space_Grotesk'] uppercase leading-none">
          CRAFT
        </span>

        <div className="pt-32 pb-12 flex flex-col items-center relative z-10">
          {/* Hero Typography */}
          <div className="relative text-center mb-4">
            <h1 className="text-7xl md:text-8xl font-black font-['Space_Grotesk'] tracking-tighter uppercase leading-[0.9]">
              <span className="text-white">CRAFT YOUR </span>
              <span className="text-[#ccff00]">DREAM</span>
              <br />
              <span className="text-white">MOVIE CAST</span>
            </h1>

            {/* Floating avatar */}
            <div className="absolute -right-20 top-10 w-32 h-32 rounded-full border border-white/10 shadow-[0_0_40px_rgba(255,51,153,0.15)] overflow-hidden hidden xl:block">
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&q=80&auto=format"
                alt="Cast avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <p className="text-zinc-500 text-sm max-w-lg text-center mb-8 font-['Space_Grotesk']">
            Select a genre, define your archetype, and let the AI cast your next masterpiece.
          </p>

          {/* Filter Pills */}
          <div className="flex flex-wrap justify-center gap-3 mt-4 mb-16 max-w-3xl relative z-20">
            {FILTER_PILLS.map((pill) => {
              const isActive = activeFilter === pill.id;
              return (
                <button
                  key={pill.id}
                  onClick={() => setActiveFilter(pill.id)}
                  className={
                    isActive
                      ? "bg-[#ccff00] text-black px-8 py-3 rounded-full font-bold uppercase text-[11px] tracking-[0.15em] transition-all"
                      : "bg-transparent border border-white/10 text-white hover:bg-white/5 px-8 py-3 rounded-full font-medium uppercase text-[11px] tracking-[0.15em] transition-all"
                  }
                >
                  {pill.label}
                </button>
              );
            })}
          </div>

          {/* Genre Poster Carousel */}
          <div className="flex gap-6 overflow-x-auto w-full max-w-[1400px] px-12 snap-x pb-20" style={{ scrollbarWidth: "none" }}>
            {GENRE_CARDS.map((card) => (
              <div
                key={card.title}
                className="flex-none w-[320px] h-[480px] rounded-[2rem] bg-[#131313] relative overflow-hidden group cursor-pointer snap-center"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover opacity-70 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-8 left-8 right-8">
                  <p
                    className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1"
                    style={{ color: card.overlineColor }}
                  >
                    {card.overline}
                  </p>
                  <p className="text-4xl text-white font-['Space_Grotesk'] font-bold uppercase tracking-tighter">
                    {card.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Floating FAB */}
      <button className="fixed bottom-12 right-12 w-20 h-20 bg-[#ccff00] rounded-full flex items-center justify-center text-black shadow-[0_0_40px_rgba(204,255,0,0.3)] hover:scale-110 active:scale-95 transition-all z-50 cursor-pointer">
        <Clapperboard size={28} />
      </button>
    </div>
  );
}
