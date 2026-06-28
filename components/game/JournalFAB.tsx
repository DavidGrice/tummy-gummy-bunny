"use client";

import { Tooltip } from "@/components/ui/Tooltip";

interface JournalFABProps {
  onClick:         () => void;
  hasNotification: boolean;
}

export function JournalFAB({ onClick, hasNotification }: JournalFABProps) {
  return (
    <div
      className="absolute right-5 z-20"
      style={{ bottom: "max(6rem, calc(env(safe-area-inset-bottom, 0px) + 5.5rem))" }}
    >
      <Tooltip content="Quest Journal" position="left">
        <button
          onClick={onClick}
          aria-label="Open quest journal"
          className="relative flex items-center justify-center w-14 h-14 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-gray-900/95 hover:border-white/30 transition-all active:scale-95"
        >
          <span className="text-2xl leading-none select-none" aria-hidden>📓</span>

          {hasNotification && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4" aria-hidden>
              {/* Pulsing ring */}
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-60" />
              {/* Solid dot */}
              <span className="relative inline-flex h-4 w-4 rounded-full bg-yellow-400 border-2 border-gray-900" />
            </span>
          )}
        </button>
      </Tooltip>
    </div>
  );
}
