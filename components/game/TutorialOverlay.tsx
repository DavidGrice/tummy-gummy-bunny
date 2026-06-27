"use client";

import { useState, useEffect } from "react";

const STEPS = [
  {
    title: "Moving",
    icon:  "🐾",
    body:  "Click anywhere on the floor to walk Mr. Bunny to that spot.",
  },
  {
    title: "Interacting",
    icon:  "✨",
    body:  "Click a labelled object — Mr. Bunny will walk over and interact with it automatically.",
  },
  {
    title: "Patience",
    icon:  "⏳",
    body:  "Mr. Bunny must come to a complete stop before you can move him again.",
  },
] as const;

interface TutorialOverlayProps {
  onDismiss: (doNotShowAgain: boolean) => void;
}

export function TutorialOverlay({ onDismiss }: TutorialOverlayProps) {
  const [stepIndex,  setStepIndex]  = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [countdown,  setCountdown]  = useState(3);
  const [doNotShow,  setDoNotShow]  = useState(false);

  const step   = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  // 3-2-1 countdown, then unlock the button
  useEffect(() => {
    setCanAdvance(false);
    setCountdown(3);
    const t1 = setTimeout(() => setCountdown(2), 1000);
    const t2 = setTimeout(() => setCountdown(1), 2000);
    const t3 = setTimeout(() => setCanAdvance(true), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [stepIndex]);

  function advance() {
    if (isLast) {
      onDismiss(doNotShow);
    } else {
      setStepIndex((i) => i + 1);
    }
  }

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center">

      {/* Backdrop — darkens game, blocks all clicks while overlay is visible */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Hint card — glassmorphic style matching nav cards */}
      <div className="relative z-10 w-full max-w-sm mx-4 rounded-3xl bg-gray-900/70 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-8 py-10 flex flex-col items-center">

        {/* Step progress dots */}
        <div className="flex gap-1.5 mb-6">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === stepIndex ? "w-6 bg-summer-coral" : "w-2 bg-white/20"
              }`}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-5xl mb-4 select-none" aria-hidden>
          {step.icon}
        </div>

        {/* Title */}
        <h2 className="text-lg font-black uppercase tracking-widest text-summer-cream mb-3 text-center">
          {step.title}
        </h2>

        {/* Body */}
        <p className="text-summer-cream/70 text-sm leading-relaxed text-center mb-8">
          {step.body}
        </p>

        {/* "Do not show again" — only visible on the last step */}
        {isLast && (
          <label className="flex items-center gap-2 text-summer-cream/40 text-xs cursor-pointer select-none mb-4">
            <input
              type="checkbox"
              checked={doNotShow}
              onChange={(e) => setDoNotShow(e.target.checked)}
              className="rounded accent-summer-coral"
            />
            Do not show again
          </label>
        )}

        {/* Action button — shows countdown then unlocks */}
        <button
          onClick={advance}
          disabled={!canAdvance}
          className={`w-full py-3 rounded-2xl font-black uppercase tracking-widest text-sm transition-all duration-300 min-h-[44px] ${
            canAdvance
              ? "bg-summer-coral text-white hover:brightness-110 active:scale-95 shadow-summer-sm"
              : "bg-white/8 text-white/30 cursor-not-allowed"
          }`}
        >
          {canAdvance ? (
            isLast ? "Got it!" : "Next →"
          ) : (
            <span className="text-2xl leading-none tabular-nums">{countdown}</span>
          )}
        </button>

      </div>
    </div>
  );
}
