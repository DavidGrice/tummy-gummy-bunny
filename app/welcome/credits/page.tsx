"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { PageShell } from "@/components/ui/nav/PageShell";
import { CREDITS_CONFIG } from "@/config/credits.config";
import { themeGradients } from "@/config/theme.config";

export default function CreditsPage() {
  const [paused, setPaused] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  return (
    <PageShell backHref="/welcome" backLabel="Main Menu">
      <div className="min-h-screen overflow-hidden relative flex flex-col">

        {/* Top fade */}
        <div
          className="pointer-events-none fixed top-0 left-0 right-0 h-32 z-10"
          style={{ background: `linear-gradient(to bottom, ${useGradientTop()}, transparent)` }}
          aria-hidden
        />

        {/* Bottom fade */}
        <div
          className="pointer-events-none fixed bottom-0 left-0 right-0 h-32 z-10"
          style={{ background: `linear-gradient(to top, ${useGradientTop()}, transparent)` }}
          aria-hidden
        />

        {/* Scrolling credits */}
        <div
          ref={scrollRef}
          className="flex-1 flex items-start justify-center px-8"
          style={{
            animation: `credits-roll 38s linear forwards`,
            animationPlayState: paused ? "paused" : "running",
          }}
          onClick={() => setPaused((p) => !p)}
          title={paused ? "Click to resume" : "Click to pause"}
        >
          <div className="w-full max-w-sm py-[100vh] text-center space-y-12 cursor-pointer select-none">

            {/* Title */}
            <section>
              <p
                className="text-4xl font-black uppercase tracking-tight text-summer-cream mb-2"
                style={{ textShadow: "0 2px 20px rgba(0,0,0,0.6)" }}
              >
                {CREDITS_CONFIG.game.title}
              </p>
              <p className="text-sm tracking-widest uppercase text-summer-peach/70">
                {CREDITS_CONFIG.game.subtitle}
              </p>
            </section>

            {/* Developer */}
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-summer-coral mb-3">
                Developed by
              </p>
              <p className="text-2xl font-black text-summer-cream">{CREDITS_CONFIG.developer.name}</p>
              <p className="text-sm text-summer-peach/70 mt-1">{CREDITS_CONFIG.developer.role}</p>
            </section>

            {/* Tech */}
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-summer-coral mb-3">
                Built With
              </p>
              <div className="space-y-2">
                {CREDITS_CONFIG.tech.map((item) => (
                  <div key={item.name}>
                    <span className="text-summer-cream font-bold">{item.name}</span>
                    <span className="text-summer-peach/50"> — {item.role}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Special thanks */}
            <section>
              <p className="text-xs font-bold uppercase tracking-widest text-summer-coral mb-3">
                Special Thanks
              </p>
              <div className="space-y-1">
                {CREDITS_CONFIG.specialThanks.map((name) => (
                  <p key={name} className="text-summer-cream/80">{name}</p>
                ))}
              </div>
            </section>

            {/* Closing */}
            <section className="pt-4">
              <p className="text-2xl text-summer-gold font-bold">{CREDITS_CONFIG.closingLine}</p>
              <p className="text-xs text-summer-peach/50 mt-3 uppercase tracking-widest">
                &copy; {CREDITS_CONFIG.year} {CREDITS_CONFIG.developer.name}
              </p>
            </section>

            {/* Return prompt */}
            <div className="pt-8">
              <Link
                href="/welcome"
                className="text-xs uppercase tracking-widest text-summer-cream/40 hover:text-summer-cream/80 transition-colors"
              >
                ← Return to menu
              </Link>
            </div>

          </div>
        </div>

        {/* Pause hint */}
        {paused && (
          <div className="fixed inset-0 flex items-center justify-center z-20 pointer-events-none">
            <span className="text-xs uppercase tracking-widest text-summer-cream/50 bg-summer-char/60 px-4 py-2 rounded-full backdrop-blur-sm">
              Paused — click to resume
            </span>
          </div>
        )}

      </div>
    </PageShell>
  );
}

// Helper to pull the page gradient top color for fade edges
function useGradientTop() {
  return themeGradients.sky.match(/#[0-9a-fA-F]{6}/)?.[0] ?? "#180A00";
}
