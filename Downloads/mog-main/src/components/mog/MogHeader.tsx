import { Search, Plus } from "lucide-react";
import { FeedType } from "@/types/mog";
import { cn } from "@/lib/utils";

interface MogHeaderProps {
  feedType: FeedType;
  onFeedTypeChange: (type: FeedType) => void;
  onSearch: () => void;
  onUpload: () => void;
}

export function MogHeader({ feedType, onFeedTypeChange, onSearch, onUpload }: MogHeaderProps) {
  const filters: Array<{ type: FeedType; label: string }> = [
    { type: "all", label: "All" },
    { type: "watch", label: "Watch" },
    { type: "listen", label: "Listen" },
    { type: "read", label: "Read" },
    { type: "agents", label: "Agents" },
    { type: "following", label: "Following" },
  ];

  return (
    <div className="fixed top-0 left-0 right-0 z-50 pointer-events-none">
      <div className="bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-safe-top pb-8">
        <div className="flex items-center gap-3 px-4 pt-4 pointer-events-auto">
          <button
            onClick={onSearch}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            aria-label="Search Mog"
          >
            <Search className="h-5 w-5" />
          </button>

          <div className="flex flex-1 items-center gap-2 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Mog feed filters">
            {filters.map((filter) => (
              <button
                key={filter.type}
                onClick={() => onFeedTypeChange(filter.type)}
                className={cn(
                  "h-9 shrink-0 rounded-full px-3 text-sm font-semibold transition-colors",
                  feedType === filter.type
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white",
                )}
                role="tab"
                aria-selected={feedType === filter.type}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <button
            onClick={onUpload}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform active:scale-95"
            aria-label="Create Mog"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
