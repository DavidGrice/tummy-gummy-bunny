interface LoadingScreenProps {
  progress: number; // 0–100
}

export function LoadingScreen({ progress }: LoadingScreenProps) {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-summer-char select-none">

      <div className="text-7xl mb-6 animate-bounce" aria-hidden>🐰</div>

      <p className="text-summer-cream font-black uppercase tracking-widest text-sm mb-8">
        Loading Mr. Bunny&apos;s Room…
      </p>

      {/* Progress bar */}
      <div className="w-48 h-1.5 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full rounded-full bg-summer-coral transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="mt-3 text-xs text-summer-peach/40 tabular-nums">
        {Math.round(progress)}%
      </p>

    </div>
  );
}
