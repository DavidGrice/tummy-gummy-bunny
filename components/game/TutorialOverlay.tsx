"use client";

import { useState } from "react";

interface TutorialOverlayProps {
  onDismiss: (doNotShowAgain: boolean) => void;
}

interface HintProps {
  title:    string;
  body:     string;
  arrow?:   string; // Unicode arrow pointing toward the relevant area
  className?: string;
}

function Hint({ title, body, arrow, className = "" }: HintProps) {
  return (
    <div className={`pointer-events-auto ${className}`}>
      <div className="bg-gray-900/92 backdrop-blur-md rounded-2xl border border-white/10 p-4 max-w-[200px] shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <p className="text-summer-gold text-[10px] font-black uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className="text-summer-cream/80 text-xs leading-relaxed">{body}</p>
      </div>
      {arrow && (
        <p className="text-summer-cream/70 text-2xl text-center mt-1 select-none">{arrow}</p>
      )}
    </div>
  );
}

export function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const [doNotShow, setDoNotShow] = useState(false);

  return (
    <div className="absolute inset-0 z-50">

      {/* Darkened backdrop — also blocks game clicks while overlay is up */}
      <div className="absolute inset-0 bg-black/35" />

      {/* Hint: Move */}
      <Hint
        title="Move"
        body="Click anywhere on the floor to walk Mr. Bunny there"
        arrow="↓"
        className="absolute bottom-28 left-1/2 -translate-x-1/2 flex flex-col items-center"
      />

      {/* Hint: Interact */}
      <Hint
        title="Interact"
        body="Click a labelled object to walk up and interact with it"
        arrow="→"
        className="absolute top-1/3 left-4"
      />

      {/* Hint: Patience */}
      <Hint
        title="Patience"
        body="Mr. Bunny must stop walking before you can move him again"
        className="absolute top-4 right-4"
      />

      {/* Dismiss controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-auto">
        <button
          onClick={() => onDismiss(doNotShow)}
          className="px-8 py-3 rounded-2xl bg-summer-coral text-white font-black uppercase tracking-widest text-sm hover:brightness-110 active:scale-95 transition-all duration-150 min-h-[44px] shadow-summer-sm"
        >
          Got it!
        </button>

        <label className="flex items-center gap-2 text-summer-cream/50 text-xs cursor-pointer select-none">
          <input
            type="checkbox"
            checked={doNotShow}
            onChange={(e) => setDoNotShow(e.target.checked)}
            className="rounded accent-summer-coral"
          />
          Do not show again
        </label>
      </div>

    </div>
  );
}
