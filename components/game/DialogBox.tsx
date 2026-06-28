interface DialogBoxProps {
  message:   string;
  onDismiss: () => void;
}

export function DialogBox({ message, onDismiss }: DialogBoxProps) {
  return (
    <div className="absolute inset-0 z-40 flex items-end sm:items-center justify-center p-4 sm:p-6" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 0px))" }}>
      <div className="max-w-lg w-full bg-gray-900/92 backdrop-blur-md rounded-2xl border border-white/10 p-4 sm:p-5 flex items-center gap-3 sm:gap-4 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">

        <span className="text-2xl sm:text-3xl shrink-0 select-none" aria-hidden>🐰</span>

        <p className="flex-1 text-summer-cream text-xs sm:text-sm leading-relaxed">
          {message}
        </p>

        <button
          onClick={onDismiss}
          className="shrink-0 px-4 sm:px-5 py-2 rounded-xl bg-summer-coral text-white text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all duration-150 min-h-[44px]"
        >
          OK
        </button>

      </div>
    </div>
  );
}
