"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/ui/nav/PageShell";
import { useOptions } from "@/hooks/useOptions";
import { clearUsername } from "@/lib/cookies";
import { themeConfig } from "@/config/theme.config";

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label:        string;
  description?: string;
  enabled:      boolean;
  onChange:     (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-white/10 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-summer-cream tracking-wide">{label}</p>
        {description && (
          <p className="text-xs text-summer-peach/60 mt-0.5">{description}</p>
        )}
      </div>
      <button
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={`relative w-12 h-6 rounded-full shrink-0 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-summer-coral/50 ${
          enabled ? "bg-summer-coral" : "bg-white/10"
        }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-summer-cream shadow transition-all duration-300 ${
            enabled ? "left-7" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default function OptionsPage() {
  const router = useRouter();
  const { options, setOption, loaded } = useOptions();

  function handleChangeName() {
    clearUsername();
    router.push("/auth");
  }

  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">

        <div className="w-full max-w-md rounded-3xl bg-gray-900/60 backdrop-blur-md border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-8 py-10 flex flex-col items-center">

          <div className="text-5xl mb-5" aria-hidden>⚙️</div>

          <h1 className="text-2xl font-black uppercase tracking-widest text-summer-cream text-center">
            Options
          </h1>
          <p className="mt-2 text-xs tracking-widest uppercase text-summer-peach/60 text-center">
            Customize your experience
          </p>

          <div className="mt-8 mb-6 w-full border-t border-white/10" />

          <div className="w-full space-y-6">

            {/* ── Audio ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-summer-peach/50 mb-2">
                Audio
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5">
                {loaded ? (
                  <>
                    <ToggleRow
                      label="Sound Effects"
                      description="In-game interaction sounds"
                      enabled={options.soundEnabled}
                      onChange={(v) => setOption("soundEnabled", v)}
                    />
                    <ToggleRow
                      label="Music"
                      description="Background ambient music"
                      enabled={options.musicEnabled}
                      onChange={(v) => setOption("musicEnabled", v)}
                    />
                  </>
                ) : (
                  <div className="py-6 text-center text-summer-peach/40 text-sm">Loading…</div>
                )}
              </div>
            </div>

            {/* ── Gameplay ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-summer-peach/50 mb-2">
                Gameplay
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5">
                {loaded && (
                  <ToggleRow
                    label="Tutorial Hints"
                    description="Show contextual tips while playing"
                    enabled={options.showTutorialHints}
                    onChange={(v) => setOption("showTutorialHints", v)}
                  />
                )}
              </div>
            </div>

            {/* ── Theme ── */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-summer-peach/50 mb-2">
                Theme
              </p>
              <div className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-summer-cream">Summer Evening</p>
                    <p className="text-xs text-summer-peach/60 mt-0.5">Current theme</p>
                  </div>
                  <div className="flex gap-1.5">
                    {Object.values(themeConfig.colors).slice(0, 5).map((hex) => (
                      <span
                        key={hex}
                        className="w-4 h-4 rounded-full border border-white/20"
                        style={{ background: hex }}
                        aria-hidden
                      />
                    ))}
                  </div>
                </div>
                <p className="mt-3 text-xs text-summer-peach/40">
                  Additional themes — coming soon
                </p>
              </div>
            </div>

            {/* ── Account ── */}
            <button
              onClick={handleChangeName}
              className="w-full text-center text-xs text-summer-peach/40 hover:text-summer-peach/80 transition-colors duration-200 tracking-widest uppercase py-1"
            >
              Change Player Name
            </button>

          </div>

          <div className="mt-6 pt-5 border-t border-white/10 w-full">
            <Link
              href="/welcome"
              className="group flex items-center justify-center gap-2 min-h-[44px] text-xs font-semibold tracking-widest uppercase text-summer-cream/50 hover:text-summer-cream transition-colors duration-200"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
              Main Menu
            </Link>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
