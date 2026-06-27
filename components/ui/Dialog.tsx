"use client";

interface DialogProps {
  speaker: string;
  text: string;
  onClose: () => void;
}

export function Dialog({ speaker, text, onClose }: DialogProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 p-6 bg-black/80 border-t border-white/10">
      <p className="text-xs uppercase tracking-widest text-purple-400 mb-1">
        {speaker}
      </p>
      <p className="text-white text-sm leading-relaxed">{text}</p>
      <button
        onClick={onClose}
        className="mt-3 text-xs text-white/50 hover:text-white transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}
