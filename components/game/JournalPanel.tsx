"use client";

import { useMemo, useState } from "react";
import { QUESTS } from "@/data/quests";
import {
  isObjectiveComplete,
  isQuestDone,
  type Quest,
  type QuestObjective,
} from "@/lib/journal";
import { useItems } from "@/hooks/useItems";
import { useViewport } from "@/hooks/useViewport";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PANEL_H } from "@/components/game/InventoryHUD";

// ─── Styled constants ─────────────────────────────────────────────────────────

const LINED_PAPER: React.CSSProperties = {
  background:      "#FFF9F0",
  backgroundImage: [
    "linear-gradient(to right, transparent 48px, #E8A0A0 48px, #E8A0A0 50px, transparent 50px)",
    "repeating-linear-gradient(transparent, transparent 31px, #C5D8E8 31px, #C5D8E8 32px)",
  ].join(", "),
  lineHeight: "32px",
};

const MOBILE_PAPER: React.CSSProperties = {
  background:      "#FFF9F0",
  backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #C5D8E8 31px, #C5D8E8 32px)",
  lineHeight: "32px",
};

const CAVEAT: React.CSSProperties = { fontFamily: "var(--font-caveat)" };

// ─── Objective row ────────────────────────────────────────────────────────────

function ObjectiveRow({
  obj,
  collectedItemIds,
}: {
  obj:              QuestObjective;
  collectedItemIds: Set<string>;
}) {
  const done = isObjectiveComplete(obj, collectedItemIds);
  return (
    <li className="flex items-center gap-2.5">
      <span
        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center text-[9px] font-black ${
          done
            ? "border-green-500 bg-green-500 text-white"
            : "border-amber-500/70 bg-transparent"
        }`}
      >
        {done ? "✓" : ""}
      </span>
      <span
        className={`text-lg leading-snug ${
          done ? "text-green-700/70 font-normal" : "text-amber-900 font-bold"
        }`}
        style={CAVEAT}
      >
        {obj.label}
      </span>
    </li>
  );
}

// ─── Left sidebar — desktop quest list ───────────────────────────────────────

function QuestList({
  quests,
  selectedId,
  collectedItemIds,
  onSelect,
}: {
  quests:           Quest[];
  selectedId:       string | null;
  collectedItemIds: Set<string>;
  onSelect:         (id: string) => void;
}) {
  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#F0E6D0", borderRight: "2px solid #D4C4A0" }}
    >
      <div className="px-5 py-4 border-b" style={{ borderColor: "#D4C4A0" }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/50">Quest Diary</p>
        <p className="text-base font-bold text-amber-900/70 mt-0.5" style={CAVEAT}>My Journal</p>
      </div>

      <div className="flex-1 overflow-y-auto py-2">
        {quests.map((q) => {
          const active = q.id === selectedId;
          const done   = isQuestDone(q, collectedItemIds);
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
                <span
                  className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center text-[9px] font-black ${
                    done ? "border-green-600 bg-green-500 text-white" : "border-amber-500/50"
                  }`}
                >
                  {done ? "✓" : ""}
                </span>
                <div className="min-w-0">
                  <p
                    className={`text-sm leading-snug font-bold ${
                      done ? "text-green-700" : active ? "text-amber-900" : "text-amber-800/80"
                    }`}
                    style={CAVEAT}
                  >
                    {done && <span className="mr-1">✓</span>}
                    {q.title}
                  </p>
                  <p className="text-[10px] text-amber-700/50 mt-0.5">{q.date}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="px-5 py-3 border-t" style={{ borderColor: "#D4C4A0" }}>
        <p className="text-[9px] text-amber-700/40 italic" style={CAVEAT}>More quests coming soon…</p>
      </div>
    </div>
  );
}

// ─── Mobile horizontal quest strip ───────────────────────────────────────────

function QuestStrip({
  quests,
  selectedId,
  collectedItemIds,
  onSelect,
}: {
  quests:           Quest[];
  selectedId:       string | null;
  collectedItemIds: Set<string>;
  onSelect:         (id: string) => void;
}) {
  return (
    <div
      className="shrink-0 overflow-x-auto flex gap-2 px-4 py-3 border-b"
      style={{ background: "#F0E6D0", borderColor: "#D4C4A0", scrollbarWidth: "none" }}
    >
      {quests.map((q) => {
        const active = q.id === selectedId;
        const done   = isQuestDone(q, collectedItemIds);
        return (
          <button
            key={q.id}
            onClick={() => onSelect(q.id)}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
              active
                ? "bg-amber-700 text-white shadow-sm"
                : done
                  ? "bg-green-200/80 text-green-700 hover:bg-green-200"
                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
            }`}
            style={CAVEAT}
          >
            {done && <span className="text-[11px]">✓</span>}
            {q.title}
          </button>
        );
      })}
    </div>
  );
}

// ─── Quest content page (shared desktop + mobile) ─────────────────────────────

function QuestPage({
  quest,
  collectedItemIds,
  compact = false,
}: {
  quest:            Quest | null;
  collectedItemIds: Set<string>;
  compact?:         boolean;
}) {
  const paperStyle = compact ? MOBILE_PAPER : LINED_PAPER;
  const padLeft    = compact ? "pl-4" : "pl-16";

  if (!quest) {
    return (
      <div className="flex-1 flex items-center justify-center" style={paperStyle}>
        <p className={`text-amber-400/40 text-lg ${compact ? "px-6" : "pl-16"}`} style={CAVEAT}>
          Select a quest above…
        </p>
      </div>
    );
  }

  const done       = isQuestDone(quest, collectedItemIds);
  const paragraphs = quest.body.split("\n\n");

  return (
    <div className="flex-1 overflow-y-auto" style={paperStyle}>
      <div className={`${padLeft} pr-6 pt-5 pb-10`}>

        <p className="text-sm text-amber-600/60 mb-1" style={CAVEAT}>{quest.date}</p>

        <h1
          className={`font-bold mb-3 leading-tight ${
            compact ? "text-3xl" : "text-4xl"
          } ${done ? "text-green-700" : "text-amber-900"}`}
          style={CAVEAT}
        >
          {done && <span className="mr-2">✓</span>}
          {quest.heading}
        </h1>

        {done && (
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5 border border-green-400/40"
            style={{ background: "rgba(134,239,172,0.15)" }}
          >
            <span className="text-green-600 text-[10px] font-black uppercase tracking-widest">
              ✓ Quest Complete
            </span>
          </div>
        )}

        {paragraphs.map((para, i) => (
          <p
            key={i}
            className={`${compact ? "text-lg" : "text-xl"} text-amber-900/80 mb-8`}
            style={{ ...CAVEAT, lineHeight: "32px" }}
          >
            {para}
          </p>
        ))}

        {quest.objectives.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-amber-700/50 mb-3">
              Objectives
            </p>
            <ul className="space-y-2.5">
              {quest.objectives.map((obj) => (
                <ObjectiveRow key={obj.id} obj={obj} collectedItemIds={collectedItemIds} />
              ))}
            </ul>
          </div>
        )}

        {quest.hints.length > 0 && (
          <div
            className="mt-4 mx-2 rounded-lg border border-amber-400/30 px-4 py-3"
            style={{ background: "rgba(255,220,130,0.15)" }}
          >
            <p className="text-xs font-black uppercase tracking-widest text-amber-700/50 mb-2">Hints</p>
            <ul className="space-y-1">
              {quest.hints.map((hint, i) => (
                <li key={i} className="text-base text-amber-800/70 flex gap-2" style={CAVEAT}>
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

// ─── Desktop journal panel ────────────────────────────────────────────────────

function DesktopJournalPanel({
  selectedId,
  collectedItemIds,
  onSelect,
  onClose,
}: {
  selectedId:       string | null;
  collectedItemIds: Set<string>;
  onSelect:         (id: string) => void;
  onClose:          () => void;
}) {
  const selected = QUESTS.find((q) => q.id === selectedId) ?? null;
  return (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`relative z-10 w-full max-w-2xl flex flex-col overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.6)] ${PANEL_H}`}
        style={{ borderRadius: "16px", background: "#8B6240", padding: "6px" }}
      >
        <div
          className="flex-1 flex overflow-hidden"
          style={{ borderRadius: "12px", minHeight: 0 }}
        >
          <div className="w-[35%] shrink-0 overflow-hidden flex flex-col">
            <QuestList
              quests={QUESTS}
              selectedId={selectedId}
              collectedItemIds={collectedItemIds}
              onSelect={onSelect}
            />
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <QuestPage quest={selected} collectedItemIds={collectedItemIds} />
          </div>
        </div>

        <button
          onClick={onClose}
          aria-label="Close journal"
          className="absolute top-3 right-3 z-50 w-7 h-7 rounded-full bg-amber-900/60 hover:bg-amber-900/90 flex items-center justify-center text-amber-100/70 hover:text-amber-100 text-sm font-bold transition-all leading-none"
        >✕</button>
      </div>
    </div>
  );
}

// ─── Mobile journal bottom sheet ──────────────────────────────────────────────

function MobileJournalSheet({
  selectedId,
  collectedItemIds,
  onSelect,
  onClose,
}: {
  selectedId:       string | null;
  collectedItemIds: Set<string>;
  onSelect:         (id: string) => void;
  onClose:          () => void;
}) {
  const selected = QUESTS.find((q) => q.id === selectedId) ?? null;
  return (
    <BottomSheet onClose={onClose} heightCls="h-[92vh]">
      <div
        className="flex flex-col h-full"
        style={{ background: "#8B6240", padding: "6px" }}
      >
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ borderRadius: "12px", minHeight: 0 }}
        >
          {/* Header bar */}
          <div
            className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b"
            style={{ background: "#F0E6D0", borderColor: "#D4C4A0" }}
          >
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-amber-900/50">Quest Diary</p>
              <p className="text-base font-bold text-amber-900/70 leading-none" style={CAVEAT}>My Journal</p>
            </div>
            <button
              onClick={onClose}
              aria-label="Close journal"
              className="w-8 h-8 rounded-full bg-amber-200/60 hover:bg-amber-200 flex items-center justify-center text-amber-900/60 hover:text-amber-900 text-sm font-bold transition-all leading-none"
            >✕</button>
          </div>

          {/* Horizontal quest strip */}
          <QuestStrip
            quests={QUESTS}
            selectedId={selectedId}
            collectedItemIds={collectedItemIds}
            onSelect={onSelect}
          />

          {/* Quest page content */}
          <QuestPage quest={selected} collectedItemIds={collectedItemIds} compact />
        </div>
      </div>
    </BottomSheet>
  );
}

// ─── Main panel — picks layout based on viewport ──────────────────────────────

interface JournalPanelProps {
  onClose: () => void;
}

export function JournalPanel({ onClose }: JournalPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(QUESTS[0]?.id ?? null);
  const { isMobile } = useViewport();

  const { items } = useItems();
  const collectedItemIds = useMemo(
    () => new Set(items.map((c) => c.item.id)),
    [items],
  );

  const sharedProps = {
    selectedId,
    collectedItemIds,
    onSelect: setSelectedId,
    onClose,
  };

  return isMobile
    ? <MobileJournalSheet {...sharedProps} />
    : <DesktopJournalPanel {...sharedProps} />;
}
