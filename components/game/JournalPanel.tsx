"use client";

import { useState } from "react";
import { QUESTS, type Quest } from "@/lib/journal";

// ─── Styled constants ─────────────────────────────────────────────────────────

// Cream paper with blue ruled lines, 32px line-height
const LINED_PAPER: React.CSSProperties = {
  background:      "#FFF9F0",
  backgroundImage: [
    // Red left margin line
    "linear-gradient(to right, transparent 48px, #E8A0A0 48px, #E8A0A0 50px, transparent 50px)",
    // Blue horizontal rules every 32px
    "repeating-linear-gradient(transparent, transparent 31px, #C5D8E8 31px, #C5D8E8 32px)",
  ].join(", "),
  lineHeight: "32px",
};

const CAVEAT: React.CSSProperties = { fontFamily: "var(--font-caveat)" };

// ─── Left sidebar — quest list ────────────────────────────────────────────────

function QuestList({
  quests,
  selectedId,
  onSelect,
}: {
  quests:     Quest[];
  selectedId: string | null;
  onSelect:   (id: string) => void;
}) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#F0E6D0", borderRight: "2px solid #D4C4A0" }}
    >
      {/* Notebook tab header */}
      <div
        className="px-5 py-4 border-b"
        style={{ borderColor: "#D4C4A0" }}
      >
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/50">
          Quest Diary
        </p>
        <p className="text-base font-bold text-amber-900/70 mt-0.5" style={CAVEAT}>
          My Journal
        </p>
      </div>

      {/* Quest entries */}
      <div className="flex-1 overflow-y-auto py-2">
        {quests.map((q) => {
          const active = q.id === selectedId;
          return (
            <button
              key={q.id}
              onClick={() => onSelect(q.id)}
              className={`w-full text-left px-5 py-3 transition-all duration-150 border-l-4 ${
                active
                  ? "border-amber-700 bg-amber-100/60"
                  : "border-transparent hover:bg-amber-100/30 hover:border-amber-400/40"
              }`}
            >
              <div className="flex items-start gap-2">
                {/* Completion circle */}
                <span
                  className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center text-[9px] font-black ${
                    q.completed
                      ? "border-green-600 bg-green-500 text-white"
                      : "border-amber-500/50"
                  }`}
                >
                  {q.completed ? "✓" : ""}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-sm leading-snug ${
                      active ? "text-amber-900 font-bold" : "text-amber-800/80"
                    } ${q.completed ? "line-through opacity-60" : ""}`}
                    style={CAVEAT}
                  >
                    {q.title}
                  </p>
                  <p className="text-[10px] text-amber-700/50 mt-0.5">{q.date}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 border-t" style={{ borderColor: "#D4C4A0" }}>
        <p className="text-[9px] text-amber-700/40 italic" style={CAVEAT}>
          More quests coming soon…
        </p>
      </div>
    </div>
  );
}

// ─── Right page — quest content ───────────────────────────────────────────────

function QuestPage({ quest }: { quest: Quest | null }) {
  if (!quest) {
    return (
      <div
        className="flex-1 flex items-center justify-center"
        style={LINED_PAPER}
      >
        <p className="text-amber-400/40 text-lg pl-16" style={CAVEAT}>
          Select a quest from the left…
        </p>
      </div>
    );
  }

  const paragraphs = quest.body.split("\n\n");

  return (
    <div className="flex-1 overflow-y-auto" style={LINED_PAPER}>
      <div className="pl-16 pr-8 pt-6 pb-10">

        {/* Date stamp */}
        <p
          className="text-sm text-amber-600/60 mb-1"
          style={CAVEAT}
        >
          {quest.date}
        </p>

        {/* Quest heading */}
        <h1
          className="text-4xl font-bold text-amber-900 mb-6 leading-tight"
          style={CAVEAT}
        >
          {quest.heading}
        </h1>

        {/* Body paragraphs — each sits on the ruled lines */}
        {paragraphs.map((para, i) => (
          <p
            key={i}
            className="text-xl text-amber-900/80 mb-8"
            style={{ ...CAVEAT, lineHeight: "32px" }}
          >
            {para}
          </p>
        ))}

        {/* Hints — folded note style */}
        {quest.hints.length > 0 && (
          <div
            className="mt-4 mx-2 rounded-lg border border-amber-400/30 px-4 py-3"
            style={{ background: "rgba(255,220,130,0.15)" }}
          >
            <p
              className="text-xs font-black uppercase tracking-widest text-amber-700/50 mb-2"
            >
              Hints
            </p>
            <ul className="space-y-1">
              {quest.hints.map((hint, i) => (
                <li
                  key={i}
                  className="text-base text-amber-800/70 flex gap-2"
                  style={CAVEAT}
                >
                  <span className="text-amber-500/60 shrink-0">→</span>
                  {hint}
                </li>
              ))}
            </ul>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────

interface JournalPanelProps {
  onClose: () => void;
}

export function JournalPanel({ onClose }: JournalPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(QUESTS[0]?.id ?? null);

  const selected = QUESTS.find((q) => q.id === selectedId) ?? null;

  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Journal book container */}
      <div
        className="relative z-10 w-full max-w-2xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        style={{
          maxHeight:    "80vh",
          borderRadius: "16px",
          // Leather-look outer cover
          background:   "#8B6240",
          padding:      "6px",
        }}
      >
        {/* Inner pages */}
        <div
          className="flex-1 flex overflow-hidden"
          style={{ borderRadius: "12px", minHeight: 0 }}
        >
          {/* Left sidebar — 35% */}
          <div className="w-[35%] shrink-0 overflow-hidden flex flex-col">
            <QuestList
              quests={QUESTS}
              selectedId={selectedId}
              onSelect={setSelectedId}
            />
          </div>

          {/* Right content page — 65% */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <QuestPage quest={selected} />
          </div>
        </div>

        {/* Close button — sits in the leather cover corner */}
        <button
          onClick={onClose}
          aria-label="Close journal"
          className="absolute top-3 right-3 z-50 w-7 h-7 rounded-full bg-amber-900/60 hover:bg-amber-900/90 flex items-center justify-center text-amber-100/70 hover:text-amber-100 text-sm font-bold transition-all leading-none"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
