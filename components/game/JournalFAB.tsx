"use client";

import { Tooltip } from "@/components/ui/Tooltip";

interface JournalFABProps {
  onClick: () => void;
}

export function JournalFAB({ onClick }: JournalFABProps) {
  return (
    <div className="absolute bottom-24 right-5 z-20">
      <Tooltip content="Quest Journal" position="left">
        <button
          onClick={onClick}
          aria-label="Open quest journal"
          className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-gray-900/95 hover:border-white/30 transition-all active:scale-95"
        >
          <span className="text-2xl leading-none select-none" aria-hidden>📓</span>
        </button>
      </Tooltip>
    </div>
  );
}
