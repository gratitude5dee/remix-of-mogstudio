import { useState } from "react";
import {
  Wand2,
  Paintbrush,
  Move,
  Sun,
  ArrowUp,
  Clock,
  Plus,
  MousePointer,
  Hand,
  Undo2,
  Redo2,
  Download,
  Star,
  Heart,
  ShoppingCart,
  AlertTriangle,
} from "lucide-react";

type EditTool = "inpaint" | "placement" | "relight" | "upscale" | "history";
type CanvasTool = "brush" | "selection" | "pan";

const TOOLS: { id: EditTool; label: string; icon: typeof Paintbrush }[] = [
  { id: "inpaint", label: "Inpaint", icon: Paintbrush },
  { id: "placement", label: "Placement", icon: Move },
  { id: "relight", label: "Relight", icon: Sun },
  { id: "upscale", label: "Upscale", icon: ArrowUp },
  { id: "history", label: "History", icon: Clock },
];

const PLACEHOLDER_ASSETS = [
  { id: 1, gradient: "from-zinc-800 to-zinc-900" },
  { id: 2, gradient: "from-zinc-700 via-zinc-800 to-zinc-900" },
  { id: 3, gradient: "from-stone-800 to-stone-900" },
  { id: 4, gradient: "from-neutral-800 to-neutral-900" },
  { id: 5, gradient: "from-zinc-800 via-stone-800 to-zinc-900" },
  { id: 6, gradient: "from-stone-700 to-neutral-900" },
];

function EditToolBar({
  activeTool,
  onToolChange,
}: {
  activeTool: EditTool;
  onToolChange: (tool: EditTool) => void;
}) {
  return (
    <div className="w-[80px] min-w-[80px] bg-[#0e0e0e] border-r border-white/5 flex flex-col items-center py-6 h-full">
      {/* Header */}
      <div className="flex flex-col items-center gap-1 mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#ccff00]/10 flex items-center justify-center">
          <Wand2 size={14} className="text-[#ccff00]" />
        </div>
        <span className="text-[8px] text-[#ccff00] uppercase tracking-[0.2em] font-bold mt-1">
          Tools
        </span>
        <span className="text-[8px] text-zinc-600 font-mono">V2.0.4</span>
      </div>

      {/* Tool Nav */}
      <div className="flex flex-col w-full flex-1">
        {TOOLS.map((tool) => {
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`w-full py-4 flex flex-col items-center gap-1 transition-colors ${
                active
                  ? "bg-[#262626]/50 border-r-2 border-r-[#ccff00] text-[#ccff00]"
                  : "text-zinc-600 hover:text-[#ccff00] hover:bg-[#131313]"
              }`}
            >
              <tool.icon size={16} />
              <span className="text-[8px] uppercase tracking-widest font-bold">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom FAB */}
      <button className="flex flex-col items-center gap-1 mt-auto pt-6 opacity-80 hover:opacity-100 transition-opacity">
        <div className="w-8 h-8 rounded-full bg-[#262626] flex items-center justify-center hover:bg-[#ccff00] hover:text-black text-[#ccff00] transition-colors">
          <Plus size={14} />
        </div>
        <span className="text-[8px] text-[#ccff00] uppercase tracking-widest font-bold">
          New Asset
        </span>
      </button>
    </div>
  );
}

function AssetLibrary({
  selectedIndex,
  onSelect,
}: {
  selectedIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="w-[320px] min-w-[320px] bg-[#131313] border-r border-white/5 p-6 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3
          className="text-lg font-bold text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Library
        </h3>
        <button className="w-8 h-8 rounded-full bg-[#262626] hover:bg-[#ccff00] hover:text-black text-zinc-400 flex items-center justify-center transition-colors">
          <Plus size={14} />
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3 overflow-y-auto flex-1" style={{ scrollbarWidth: "none" }}>
        {PLACEHOLDER_ASSETS.map((asset, i) => (
          <button
            key={asset.id}
            onClick={() => onSelect(i)}
            className={`aspect-square bg-gradient-to-br ${asset.gradient} rounded-xl overflow-hidden relative group cursor-pointer transition-all ${
              selectedIndex === i
                ? "border-2 border-[#ccff00]"
                : "border border-white/5 hover:border-white/10"
            }`}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>
    </div>
  );
}

function EditWorkspace() {
  return (
    <div
      className="flex-1 flex items-center justify-center relative overflow-hidden h-full"
      style={{
        backgroundColor: "#000000",
        backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }}
    >
      {/* Floating Label */}
      <div className="absolute top-6 left-8 flex items-center gap-2 z-10">
        <div className="w-2 h-2 rounded-full bg-[#ccff00]" />
        <span
          className="text-[10px] text-[#ccff00] uppercase tracking-[0.2em] font-bold"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Selected: Asset_026
        </span>
      </div>

      {/* Main Image Container */}
      <div className="relative shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]">
        {/* Placeholder image */}
        <div className="w-[480px] h-[320px] bg-gradient-to-br from-zinc-800 via-zinc-900 to-black rounded-lg overflow-hidden relative">
          {/* Corner Selection Brackets */}
          <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-[#ccff00]" />
          <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-[#ccff00]" />
          <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-[#ccff00]" />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-[#ccff00]" />

          {/* Inpaint Mask Glow */}
          <div className="w-32 h-48 bg-[#ccff00]/40 blur-xl rounded-full mix-blend-color-dodge absolute top-1/4 left-1/3 transform -rotate-12 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

function AssetDetailSidebar() {
  return (
    <div className="w-[380px] min-w-[380px] bg-[#131313] border-l border-white/5 p-8 flex flex-col gap-8 h-full overflow-y-auto" style={{ scrollbarWidth: "none" }}>
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-[#ff3399]">
          Asset Detail
        </span>
        <h2
          className="text-3xl font-bold text-white mt-2 leading-tight"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Volume 8 : WZRD.tech
        </h2>
        <p className="text-sm text-zinc-500 mt-2">
          High-resolution cinematic still from the WZRD archive.
        </p>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3">
        <Star size={14} className="text-[#ccff00] fill-[#ccff00]" />
        <span className="text-[#ccff00] font-bold text-sm">4.8</span>
        <span className="text-zinc-500 text-xs">Based on 124 curated views</span>
      </div>

      {/* Metadata */}
      <div>
        <span className="text-xs uppercase text-zinc-500 tracking-[0.2em] font-bold">
          Metadata
        </span>
        <div className="grid grid-cols-2 gap-3 mt-4">
          {[
            { label: "Resolution", value: "4096 × 2160" },
            { label: "Format", value: "PNG (Alpha)" },
            { label: "Color Space", value: "sRGB" },
            { label: "File Size", value: "18.4 MB" },
          ].map((item) => (
            <div key={item.label} className="bg-[#262626] rounded-xl p-4">
              <span className="text-zinc-500 text-[10px] uppercase tracking-widest font-bold block">
                {item.label}
              </span>
              <span className="text-white font-mono text-xs mt-1 block">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* CTAs */}
      <div className="mt-auto space-y-3">
        <button className="w-full py-4 bg-white text-black rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:bg-zinc-200 transition-colors">
          <ShoppingCart size={14} />
          Add to Cart
        </button>
        <button className="w-full py-4 border border-white/20 text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 hover:border-white/40 transition-colors">
          <Heart size={14} />
          Wishlist
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-3 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
        <AlertTriangle size={14} className="text-amber-400 mt-0.5 shrink-0" />
        <div>
          <span className="text-amber-400 text-[10px] uppercase tracking-widest font-bold block">
            Credits Running Low
          </span>
          <span className="text-zinc-500 text-xs mt-1 block">
            You have 12 credits remaining. Upgrade your plan for unlimited access.
          </span>
        </div>
      </div>
    </div>
  );
}

function EditBottomBar({ activeTool, onToolChange }: { activeTool: CanvasTool; onToolChange: (t: CanvasTool) => void }) {
  const tools: { id: CanvasTool; label: string; icon: typeof Paintbrush }[] = [
    { id: "brush", label: "Brush", icon: Paintbrush },
    { id: "selection", label: "Selection", icon: MousePointer },
    { id: "pan", label: "Pan", icon: Hand },
  ];

  return (
    <div className="absolute bottom-8 left-[400px] right-[380px] flex justify-center z-50 pointer-events-none">
      <div className="bg-[#131313]/90 backdrop-blur-xl rounded-full px-2 py-2 flex items-center gap-1 shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-auto border border-white/5">
        {tools.map((tool) => {
          const active = activeTool === tool.id;
          return (
            <button
              key={tool.id}
              onClick={() => onToolChange(tool.id)}
              className={`px-4 py-2 rounded-full text-[11px] font-semibold flex items-center gap-2 transition-colors ${
                active
                  ? "bg-[#ccff00] text-black"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <tool.icon size={13} />
              {tool.label}
            </button>
          );
        })}

        <div className="w-px h-4 bg-white/20 mx-2" />

        {[Undo2, Redo2, Download].map((Icon, i) => (
          <button
            key={i}
            className="text-zinc-400 hover:text-white px-3 py-2 transition-colors"
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EditStudioSection() {
  const [activeTool, setActiveTool] = useState<EditTool>("inpaint");
  const [selectedAssetIndex, setSelectedAssetIndex] = useState(0);
  const [canvasTool, setCanvasTool] = useState<CanvasTool>("brush");

  return (
    <div className="fixed inset-0 top-[80px] bg-[#050506] z-20 overflow-hidden">
      <div className="flex h-full relative">
        <EditToolBar activeTool={activeTool} onToolChange={setActiveTool} />
        <AssetLibrary selectedIndex={selectedAssetIndex} onSelect={setSelectedAssetIndex} />
        <EditWorkspace />
        <AssetDetailSidebar />
        <EditBottomBar activeTool={canvasTool} onToolChange={setCanvasTool} />
      </div>
    </div>
  );
}
