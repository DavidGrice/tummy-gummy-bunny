"use client";

import { useMemo, useState } from "react";
import { QUESTS } from "@/data/quests";
import {
  isObjectiveComplete,
  isQuestDone,
  isQuestUnlocked,
  type Quest,
  type QuestObjective,
} from "@/lib/journal";
import { useItems } from "@/hooks/useItems";
import { useViewport } from "@/hooks/useViewport";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { PANEL_H } from "@/components/game/InventoryHUD";
import { WorldMapPanel } from "@/components/game/WorldMapPanel";
import { WORLD_ROOMS } from "@/lib/worldGrid";

// id → human-readable label lookup for the sidebar room list
const WORLD_ROOMS_MAP: Record<string, string> = Object.fromEntries(
  WORLD_ROOMS.map((r) => [r.id, r.label]),
);

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
          Select a quest…
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

// ─── Shared types ─────────────────────────────────────────────────────────────

type QuestTab    = "active" | "completed";
type JournalSection = "quests" | "map";

// ─── Desktop sidebar quest list ───────────────────────────────────────────────

function DesktopQuestList({
  quests,
  selectedId,
  collectedItemIds,
  onSelect,
}: {
  quests:           Quest[];
  selectedId:       string | null;
  collectedItemIds: Set<string>;
  onSelect:         (id: string | null) => void;
}) {
  const [questTab, setQuestTab] = useState<QuestTab>("active");

  const activeQuests    = quests.filter((q) => !isQuestDone(q, collectedItemIds) && isQuestUnlocked(q, quests, collectedItemIds));
  const lockedQuests    = quests.filter((q) => !isQuestUnlocked(q, quests, collectedItemIds));
  const completedQuests = quests.filter((q) =>  isQuestDone(q, collectedItemIds));

  function switchTab(tab: QuestTab) {
    setQuestTab(tab);
    const list = tab === "active" ? activeQuests : completedQuests;
    onSelect(list[0]?.id ?? null);
  }

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: "#F0E6D0", borderRight: "2px solid #D4C4A0" }}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b shrink-0" style={{ borderColor: "#D4C4A0" }}>
        <p className="text-[10px] font-black uppercase tracking-widest text-amber-900/50">Quest Diary</p>
        <p className="text-base font-bold text-amber-900/70 mt-0.5" style={CAVEAT}>My Journal</p>
      </div>

      {/* Active / Completed tabs */}
      <div
        className="flex shrink-0 border-b"
        style={{ borderColor: "#D4C4A0" }}
      >
        {(["active", "completed"] as QuestTab[]).map((tab) => {
          const count    = tab === "active" ? activeQuests.length : completedQuests.length;
          const isActive = questTab === tab;
          return (
            <button
              key={tab}
              onClick={() => switchTab(tab)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-black uppercase tracking-wide border-b-2 transition-all duration-150 ${
                isActive
                  ? "border-amber-700 text-amber-800 bg-amber-50/60"
                  : "border-transparent text-amber-700/45 hover:text-amber-700/70 hover:bg-amber-100/30"
              }`}
            >
              {tab === "active" ? "Active" : "Done"}
              <span
                className={`text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none ${
                  isActive
                    ? "bg-amber-700 text-white"
                    : "bg-amber-300/50 text-amber-800/50"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quest list */}
      <div className="flex-1 overflow-y-auto py-2">
        {questTab === "active" && activeQuests.length === 0 && lockedQuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-5">
            <span className="text-3xl opacity-25 select-none" aria-hidden>🎉</span>
            <p className="text-[11px] text-amber-700/40 italic text-center leading-snug" style={CAVEAT}>
              All quests complete!
            </p>
          </div>
        ) : questTab === "completed" && completedQuests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 px-5">
            <span className="text-3xl opacity-25 select-none" aria-hidden>📓</span>
            <p className="text-[11px] text-amber-700/40 italic text-center leading-snug" style={CAVEAT}>
              Nothing finished yet…
            </p>
          </div>
        ) : (
          <>
            {/* Active quests */}
            {questTab === "active" && activeQuests.map((q) => {
              const isSelected = q.id === selectedId;
              return (
                <button
                  key={q.id}
                  onClick={() => onSelect(q.id)}
                  className={`w-full text-left px-5 py-3 transition-all duration-150 border-l-4 ${
                    isSelected
                      ? "border-amber-700 bg-amber-100/60"
                      : "border-transparent hover:bg-amber-100/30 hover:border-amber-400/40"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 border-amber-500/50" />
                    <div className="min-w-0">
                      <p className={`text-sm leading-snug font-bold ${isSelected ? "text-amber-900" : "text-amber-800/80"}`} style={CAVEAT}>
                        {q.title}
                      </p>
                      <p className="text-[10px] text-amber-700/50 mt-0.5">{q.date}</p>
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Locked quests — shown greyed out in active tab only */}
            {questTab === "active" && lockedQuests.map((q) => (
              <div
                key={q.id}
                className="w-full text-left px-5 py-3 border-l-4 border-transparent opacity-40 cursor-default"
              >
                <div className="flex items-start gap-2">
                  <span className="mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 border-amber-400/40 flex items-center justify-center text-[8px] text-amber-600/50">
                    🔒
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm leading-snug font-bold text-amber-800/60" style={CAVEAT}>
                      {q.title}
                    </p>
                    <p className="text-[10px] text-amber-600/40 mt-0.5">Locked</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Completed quests */}
            {questTab === "completed" && completedQuests.map((q) => {
              const isSelected = q.id === selectedId;
              return (
                <button
                  key={q.id}
                  onClick={() => onSelect(q.id)}
                  className={`w-full text-left px-5 py-3 transition-all duration-150 border-l-4 ${
                    isSelected
                      ? "border-amber-700 bg-amber-100/60"
                      : "border-transparent hover:bg-amber-100/30 hover:border-amber-400/40"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className="mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center text-[9px] font-black border-green-600 bg-green-500 text-white">
                      ✓
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm leading-snug font-bold text-green-700" style={CAVEAT}>
                        ✓ {q.title}
                      </p>
                      <p className="text-[10px] text-amber-700/50 mt-0.5">{q.date}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      <div className="px-5 py-3 border-t shrink-0" style={{ borderColor: "#D4C4A0" }}>
        <p className="text-[9px] text-amber-700/40 italic" style={CAVEAT}>Day 1 of many adventures…</p>
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
  mapUnlocked,
  discoveredIds,
  currentRoomId,
}: {
  selectedId:       string | null;
  collectedItemIds: Set<string>;
  onSelect:         (id: string | null) => void;
  onClose:          () => void;
  mapUnlocked:      boolean;
  discoveredIds:    Set<string>;
  currentRoomId:    string;
}) {
  const [section, setSection] = useState<JournalSection>("quests");
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
          {/* ── Left sidebar ─────────────────────────────────────────────── */}
          <div className="w-[35%] shrink-0 overflow-hidden flex flex-col">
            {/* Section tabs — only shown when map is unlocked */}
            {mapUnlocked && (
              <div
                className="shrink-0 flex border-b"
                style={{ background: "#F0E6D0", borderColor: "#D4C4A0" }}
              >
                {(["quests", "map"] as JournalSection[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSection(s)}
                    className={`flex-1 py-2 text-[11px] font-black uppercase tracking-wide border-b-2 transition-all duration-150 ${
                      section === s
                        ? "border-amber-700 text-amber-800 bg-amber-50/60"
                        : "border-transparent text-amber-700/45 hover:text-amber-700/70"
                    }`}
                  >
                    {s === "quests" ? "Quests" : "Map"}
                  </button>
                ))}
              </div>
            )}

            {section === "quests" && (
              <DesktopQuestList
                quests={QUESTS}
                selectedId={selectedId}
                collectedItemIds={collectedItemIds}
                onSelect={onSelect}
              />
            )}

            {section === "map" && (
              <div
                className="flex-1 flex flex-col justify-center px-5 gap-3"
                style={{ background: "#F0E6D0" }}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/50">
                  Discovered
                </p>
                {[...discoveredIds].map((id) => (
                  <p key={id} className="text-base font-bold text-amber-800/70" style={CAVEAT}>
                    {id === currentRoomId ? "★ " : "· "}
                    {WORLD_ROOMS_MAP[id] ?? id}
                  </p>
                ))}
              </div>
            )}
          </div>

          {/* ── Right content ─────────────────────────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {section === "quests" ? (
              <QuestPage quest={selected} collectedItemIds={collectedItemIds} />
            ) : (
              <WorldMapPanel
                discoveredIds={discoveredIds}
                currentRoomId={currentRoomId}
              />
            )}
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

// ─── Mobile quest list row ────────────────────────────────────────────────────

function MobileQuestRow({
  quest,
  collectedItemIds,
  onTap,
}: {
  quest:            Quest;
  collectedItemIds: Set<string>;
  onTap:            () => void;
}) {
  const done = isQuestDone(quest, collectedItemIds);
  return (
    <button
      onClick={onTap}
      className="w-full flex items-center gap-3 px-5 py-4 border-b active:bg-amber-100/60 transition-colors text-left"
      style={{ borderColor: "#D4C4A0" }}
    >
      <span
        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center text-[10px] font-black ${
          done ? "border-green-600 bg-green-500 text-white" : "border-amber-500/60"
        }`}
      >
        {done ? "✓" : ""}
      </span>

      <div className="flex-1 min-w-0">
        <p
          className={`text-lg font-bold leading-snug truncate ${
            done ? "text-green-700" : "text-amber-900"
          }`}
          style={CAVEAT}
        >
          {quest.title}
        </p>
        <p className="text-xs text-amber-600/50 mt-0.5">{quest.date}</p>
      </div>

      <span className="text-amber-400/50 text-xl shrink-0 leading-none">›</span>
    </button>
  );
}

// ─── Mobile journal bottom sheet — drill-down ─────────────────────────────────

type MobileView = "list" | "detail";

function MobileJournalSheet({
  collectedItemIds,
  onClose,
  mapUnlocked,
  discoveredIds,
  currentRoomId,
}: {
  collectedItemIds: Set<string>;
  onClose:          () => void;
  mapUnlocked:      boolean;
  discoveredIds:    Set<string>;
  currentRoomId:    string;
}) {
  const [section,    setSection]    = useState<JournalSection>("quests");
  const [view,       setView]       = useState<MobileView>("list");
  const [questTab,   setQuestTab]   = useState<QuestTab>("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const activeQuests    = QUESTS.filter((q) => !isQuestDone(q, collectedItemIds) && isQuestUnlocked(q, QUESTS, collectedItemIds));
  const lockedQuests    = QUESTS.filter((q) => !isQuestUnlocked(q, QUESTS, collectedItemIds));
  const completedQuests = QUESTS.filter((q) =>  isQuestDone(q, collectedItemIds));
  const visibleQuests   = questTab === "active" ? activeQuests : completedQuests;
  const selectedQuest   = QUESTS.find((q) => q.id === selectedId) ?? null;

  function openQuest(id: string) {
    setSelectedId(id);
    setView("detail");
  }

  function goBack() {
    setView("list");
    setSelectedId(null);
  }

  function switchSection(s: JournalSection) {
    setSection(s);
    if (view === "detail") goBack();
  }

  return (
    <BottomSheet onClose={onClose} heightCls="h-[92vh]">
      <div
        className="flex flex-col h-full"
        style={{ background: "#8B6240", padding: "6px" }}
      >
        <div
          className="flex-1 flex flex-col overflow-hidden"
          style={{ borderRadius: "12px", minHeight: 0, background: "#F0E6D0" }}
        >
          {/* Header */}
          <div
            className="shrink-0 flex items-center justify-between px-5 py-3 border-b"
            style={{ borderColor: "#D4C4A0" }}
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

          {/* Top-level section tabs — Quests | Map (Map only shown when unlocked) */}
          <div
            className="shrink-0 flex border-b"
            style={{ borderColor: "#D4C4A0" }}
          >
            <button
              onClick={() => switchSection("quests")}
              className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wide border-b-2 transition-all ${
                section === "quests"
                  ? "border-amber-700 text-amber-800 bg-amber-50/60"
                  : "border-transparent text-amber-700/50 hover:text-amber-700/80"
              }`}
              style={CAVEAT}
            >
              Quests
            </button>

            {mapUnlocked && (
              <button
                onClick={() => switchSection("map")}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wide border-b-2 transition-all ${
                  section === "map"
                    ? "border-amber-700 text-amber-800 bg-amber-50/60"
                    : "border-transparent text-amber-700/50 hover:text-amber-700/80"
                }`}
                style={CAVEAT}
              >
                Map
              </button>
            )}
          </div>

          {/* ── Map section ─────────────────────────────────────────────────── */}
          {section === "map" && (
            <WorldMapPanel discoveredIds={discoveredIds} currentRoomId={currentRoomId} />
          )}

          {/* ── Quests section ───────────────────────────────────────────────── */}
          {section === "quests" && (
            <>
              {/* Active / Completed sub-tabs */}
              <div
                className="shrink-0 flex border-b"
                style={{ borderColor: "#D4C4A0" }}
              >
                {(["active", "completed"] as QuestTab[]).map((tab) => {
                  const count    = tab === "active" ? activeQuests.length : completedQuests.length;
                  const isActive = questTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => { setQuestTab(tab); if (view === "detail") goBack(); }}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-black uppercase tracking-wide border-b-2 transition-all ${
                        isActive
                          ? "border-amber-700 text-amber-800 bg-amber-50/60"
                          : "border-transparent text-amber-700/50 hover:text-amber-700/80"
                      }`}
                      style={CAVEAT}
                    >
                      {tab === "active" ? "Active" : "Completed"}
                      <span
                        className={`text-[10px] font-black px-1.5 py-0.5 rounded-full min-w-[20px] text-center leading-none ${
                          isActive
                            ? "bg-amber-700 text-white"
                            : "bg-amber-300/50 text-amber-800/60"
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Sliding two-panel content area */}
              <div className="relative flex-1 min-h-0 overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 flex transition-transform duration-300 ease-out"
                  style={{
                    width:     "200%",
                    transform: view === "detail" ? "translateX(-50%)" : "translateX(0%)",
                  }}
                >
                  {/* Panel 1 — quest list */}
                  <div className="h-full overflow-y-auto" style={{ width: "50%" }}>
                    {visibleQuests.length === 0 && (questTab !== "active" || lockedQuests.length === 0) ? (
                      <div className="flex flex-col items-center justify-center h-full gap-3 px-8">
                        <span className="text-4xl opacity-30 select-none" aria-hidden>
                          {questTab === "active" ? "🎉" : "📓"}
                        </span>
                        <p className="text-amber-700/40 text-base text-center leading-snug" style={CAVEAT}>
                          {questTab === "active"
                            ? "All quests complete!"
                            : "Nothing finished yet — get exploring!"}
                        </p>
                      </div>
                    ) : (
                      <>
                        {visibleQuests.map((q) => (
                          <MobileQuestRow
                            key={q.id}
                            quest={q}
                            collectedItemIds={collectedItemIds}
                            onTap={() => openQuest(q.id)}
                          />
                        ))}
                        {questTab === "active" && lockedQuests.map((q) => (
                          <div
                            key={q.id}
                            className="w-full flex items-center gap-3 px-5 py-4 border-b opacity-35"
                            style={{ borderColor: "#D4C4A0" }}
                          >
                            <span className="w-5 h-5 rounded-full border-2 shrink-0 border-amber-400/40 flex items-center justify-center text-[10px]">
                              🔒
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-lg font-bold leading-snug truncate text-amber-900/60" style={CAVEAT}>
                                {q.title}
                              </p>
                              <p className="text-xs text-amber-600/40 mt-0.5">Locked</p>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>

                  {/* Panel 2 — quest detail */}
                  <div
                    className="h-full flex flex-col overflow-hidden"
                    style={{ width: "50%" }}
                    aria-hidden={view !== "detail"}
                  >
                    <QuestPage quest={selectedQuest} collectedItemIds={collectedItemIds} compact />
                  </div>
                </div>
              </div>

              {/* Back button */}
              <div
                className={`shrink-0 flex justify-center py-3 border-t transition-all duration-200 ${
                  view === "detail" ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                style={{ borderColor: "#D4C4A0" }}
              >
                <button
                  onClick={goBack}
                  aria-label="Back to quest list"
                  className="flex items-center gap-2 px-8 py-2.5 rounded-full bg-amber-700 hover:bg-amber-800 active:scale-95 text-white text-sm font-black tracking-wide transition-all shadow-sm"
                  style={CAVEAT}
                >
                  ← Back
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </BottomSheet>
  );
}

// ─── Main panel — picks layout based on viewport ──────────────────────────────

interface JournalPanelProps {
  onClose:       () => void;
  mapUnlocked:   boolean;
  discoveredIds: Set<string>;
  currentRoomId: string;
}

export function JournalPanel({
  onClose, mapUnlocked, discoveredIds, currentRoomId,
}: JournalPanelProps) {
  const [selectedId, setSelectedId] = useState<string | null>(QUESTS[0]?.id ?? null);
  const { isMobile } = useViewport();

  const { items } = useItems();
  const collectedItemIds = useMemo(
    () => new Set(items.map((c) => c.item.id)),
    [items],
  );

  if (isMobile) {
    return (
      <MobileJournalSheet
        collectedItemIds={collectedItemIds}
        onClose={onClose}
        mapUnlocked={mapUnlocked}
        discoveredIds={discoveredIds}
        currentRoomId={currentRoomId}
      />
    );
  }

  return (
    <DesktopJournalPanel
      selectedId={selectedId}
      collectedItemIds={collectedItemIds}
      onSelect={setSelectedId}
      onClose={onClose}
      mapUnlocked={mapUnlocked}
      discoveredIds={discoveredIds}
      currentRoomId={currentRoomId}
    />
  );
}
