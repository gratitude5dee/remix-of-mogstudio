import { useState } from 'react';
import {
  Paintbrush,
  Wand2,
  Eraser,
  ZoomIn,
  Plus,
  Library,
  Wrench,
  Layers,
  Clock,
  Box,
  Sparkles,
  Star,
  AlertTriangle,
  HelpCircle,
  LogOut,
} from 'lucide-react';

type SidebarTab = 'library' | 'tools' | 'layers' | 'history' | 'assets';
type CanvasTool = 'brush' | 'wand' | 'eraser' | 'zoom';

const SIDEBAR_TABS: { id: SidebarTab; label: string; icon: typeof Library }[] = [
  { id: 'library', label: 'Library', icon: Library },
  { id: 'tools', label: 'Tools', icon: Wrench },
  { id: 'layers', label: 'Layers', icon: Layers },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'assets', label: 'Assets', icon: Box },
];

const CANVAS_TOOLS: { id: CanvasTool; icon: typeof Paintbrush }[] = [
  { id: 'brush', icon: Paintbrush },
  { id: 'wand', icon: Wand2 },
  { id: 'eraser', icon: Eraser },
  { id: 'zoom', icon: ZoomIn },
];

const RECENT_IMAGES = [
  'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
  'linear-gradient(135deg, #2d1b69 0%, #11001c 100%)',
  'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2a2a2a 100%)',
  'linear-gradient(135deg, #1b2838 0%, #0d1117 100%)',
];

const PROPERTIES = [
  { label: 'Resolution', value: '4096 × 3072' },
  { label: 'Format', value: 'PNG-24' },
  { label: 'Material', value: 'Textile / Foil' },
  { label: 'Color Space', value: 'sRGB' },
  { label: 'Bit Depth', value: '24-bit' },
];

export default function EditStudioSection() {
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('library');
  const [activeCanvasTool, setActiveCanvasTool] = useState<CanvasTool>('brush');
  const [inpaintPrompt, setInpaintPrompt] = useState('');

  return (
    <div className="fixed inset-0 top-[80px] bg-[#000000] z-20 overflow-hidden flex" style={{ scrollbarWidth: 'none' }}>
      <style>{`::-webkit-scrollbar { display: none; }`}</style>

      {/* ── Left Sidebar ── */}
      <aside className="w-[260px] flex-none h-full bg-[#090909] border-r border-white/5 flex flex-col overflow-hidden">
        <div className="px-6 pt-8 pb-4">
          <div className="flex items-baseline gap-3">
            <span className="text-white font-bold text-sm" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>STUDIO</span>
            <span className="text-zinc-600 text-[8px] font-medium">V1.0.4-NOIR</span>
          </div>
        </div>

        <div className="px-6 mb-4">
          <button className="w-full bg-[#1a1919] text-[#ccff00] border border-white/5 rounded-full py-3 text-[10px] font-bold uppercase tracking-widest flex justify-center items-center gap-2 hover:bg-[#222] transition-colors">
            <Plus className="h-3 w-3" />
            New Asset
          </button>
        </div>

        <nav className="flex flex-col">
          {SIDEBAR_TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeSidebarTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveSidebarTab(tab.id)}
                className={`flex items-center gap-4 px-6 py-4 text-[10px] uppercase tracking-widest transition-colors ${
                  active
                    ? 'bg-[#1a1919]/50 border-r-2 border-[#ccff00] text-[#ccff00] font-bold'
                    : 'text-zinc-500 hover:text-white font-medium'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-6">
          <p className="px-6 mb-4 text-[9px] uppercase tracking-widest text-zinc-600 font-bold">Recent Library</p>
          <div className="px-6 grid grid-cols-2 gap-2">
            {RECENT_IMAGES.map((bg, i) => (
              <div
                key={i}
                className="aspect-square rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                style={{ background: bg }}
              />
            ))}
          </div>
        </div>

        <div className="mt-auto p-6 flex flex-col gap-3">
          <button className="flex items-center gap-3 text-zinc-600 hover:text-zinc-400 text-[10px] uppercase tracking-widest transition-colors">
            <HelpCircle className="h-3.5 w-3.5" />
            Support
          </button>
          <button className="flex items-center gap-3 text-zinc-600 hover:text-zinc-400 text-[10px] uppercase tracking-widest transition-colors">
            <LogOut className="h-3.5 w-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Center Canvas ── */}
      <main className="flex-1 h-full bg-[#0e0e0e] relative flex items-center justify-center overflow-hidden">
        <div className="aspect-[4/3] w-full max-w-4xl relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg, #1a1a2e 0%, #0a0a14 40%, #16213e 70%, #0f3460 100%)' }} />

          <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-[#090909]/80 backdrop-blur-xl border border-white/10 rounded-full flex flex-col p-2 gap-2 z-10">
            {CANVAS_TOOLS.map((tool) => {
              const Icon = tool.icon;
              const active = activeCanvasTool === tool.id;
              return (
                <button
                  key={tool.id}
                  onClick={() => setActiveCanvasTool(tool.id)}
                  className={`rounded-full p-3 transition-colors ${
                    active ? 'bg-[#ccff00] text-black' : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>

          <div className="absolute top-[20%] left-[30%] w-64 h-80 border-[1.5px] border-[#ccff00] pointer-events-none z-10">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ccff00] text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-tighter whitespace-nowrap">
              Active Mask
            </div>
          </div>

          <div className="absolute bottom-8 left-8 z-10">
            <p className="text-[9px] uppercase tracking-widest text-[#ccff00] font-bold mb-1">Current Layer</p>
            <p className="text-2xl font-black text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              MAIN_COVER_01
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30">
          <div className="bg-[#131313]/90 backdrop-blur-2xl border border-white/5 rounded-full p-2 flex items-center gap-4 shadow-2xl">
            <div className="flex-none w-10 h-10 rounded-full bg-[#1a1919] flex items-center justify-center ml-1">
              <Sparkles className="h-4 w-4 text-[#ccff00]" />
            </div>
            <input
              type="text"
              value={inpaintPrompt}
              onChange={(e) => setInpaintPrompt(e.target.value)}
              placeholder="Change the book cover to a futuristic metal plate"
              className="flex-1 bg-transparent border-none text-white placeholder-zinc-500 text-sm focus:outline-none focus:ring-0"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            />
            <button className="flex-none bg-[#ccff00] text-black font-bold uppercase tracking-widest text-[11px] px-6 py-3 rounded-full flex items-center gap-2 hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] transition-all">
              <Sparkles className="h-3.5 w-3.5" />
              Generate
            </button>
          </div>
        </div>
      </main>

      {/* ── Right Sidebar ── */}
      <aside className="w-[340px] flex-none h-full bg-[#090909] border-l border-white/5 p-8 flex flex-col overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mb-4">Asset Detail</p>

        <div className="w-full aspect-[21/9] rounded-2xl overflow-hidden mb-6" style={{ background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)' }} />

        <div className="flex items-start justify-between mb-1">
          <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Ancient Ledger</h2>
          <div className="bg-[#1a1919] px-2 py-1 rounded flex items-center gap-1 flex-none">
            <Star className="h-3 w-3 text-[#ccff00] fill-[#ccff00]" />
            <span className="text-white text-xs font-bold">4.8</span>
          </div>
        </div>
        <p className="text-xs text-zinc-500 mb-8">Ref: #STUDIO-9921</p>

        <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-4">Properties</p>
        <div className="flex flex-col gap-3 mb-8">
          {PROPERTIES.map((prop) => (
            <div key={prop.label} className="flex items-center justify-between">
              <span className="text-zinc-500 text-xs">{prop.label}</span>
              <span className="text-white font-mono text-xs">{prop.value}</span>
            </div>
          ))}
        </div>

        <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold mb-3">Editor Notes</p>
        <p className="text-xs text-zinc-400 leading-relaxed mb-8">
          Active masking focused on the primary cover quadrant. The textile grain has been isolated for AI-driven surface replacement. Recommended: use high-contrast prompts for optimal inpainting fidelity.
        </p>

        <div className="mt-auto bg-[#ff3399]/5 border border-[#ff3399]/30 rounded-[2rem] p-6 relative">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-[#ff3399]" />
            <span className="text-[10px] text-[#ff3399] uppercase tracking-widest font-bold">Low Credits</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            Your credits are running low. <span className="text-white underline cursor-pointer">Top up now</span> for uninterrupted generation.
          </p>
        </div>

        <button className="w-full mt-4 py-4 bg-[#1a1919] text-white text-[10px] uppercase font-bold tracking-widest rounded-full hover:bg-white/10 transition-colors">
          Manage Workflow
        </button>
      </aside>
    </div>
  );
}
