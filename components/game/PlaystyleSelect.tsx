"use client";

import { setPlaystyle, type Playstyle } from "@/lib/playstyle";

interface PlaystyleSelectProps {
  onSelect: (ps: Playstyle) => void;
}

const OPTIONS: { ps: Playstyle; icon: string; name: string; desc: string }[] = [
  {
    ps:   "story",
    icon: "🌸",
    name: "Story Bunny",
    desc: "Journal & inventory are always at your side",
  },
  {
    ps:   "explorer",
    icon: "🔍",
    name: "Explorer Bunny",
    desc: "Find hints and tools by exploring the room",
  },
];

export function PlaystyleSelect({ onSelect }: PlaystyleSelectProps) {
  function choose(ps: Playstyle) {
    setPlaystyle(ps);
    onSelect(ps);
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-3xl bg-gray-900/85 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)] px-5 py-8 sm:px-8 sm:py-10">

        <div className="text-4xl text-center mb-4 select-none" aria-hidden>🐰</div>
        <h2 className="text-xl font-black uppercase tracking-widest text-summer-cream text-center">
          How do you like to play?
        </h2>
        <p className="mt-2 text-xs text-summer-peach/60 text-center tracking-wide leading-relaxed">
          You can change this any time in Settings
        </p>

        <div className="grid grid-cols-2 gap-4 mt-8">
          {OPTIONS.map(({ ps, icon, name, desc }) => (
            <button
              key={ps}
              onClick={() => choose(ps)}
              className="flex flex-col items-center gap-2 sm:gap-3 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-summer-coral/50 active:scale-95 transition-all duration-200 text-center focus:outline-none focus:ring-2 focus:ring-summer-coral/50"
            >
              <span className="text-4xl leading-none select-none" aria-hidden>{icon}</span>
              <span className="text-sm font-black text-summer-cream tracking-wide">{name}</span>
              <span className="text-xs text-summer-peach/60 leading-snug">{desc}</span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
}
