"use client";

import { useRef, useState, useEffect }  from "react";
import { useGame }                       from "@/hooks/useGame";
import { useInventory }                  from "@/hooks/useInventory";
import { useItems }                      from "@/hooks/useItems";
import { getUsername }                   from "@/lib/cookies";
import { getPlaystyle, type Playstyle }  from "@/lib/playstyle";
import { Tooltip }                       from "@/components/ui/Tooltip";
import { LoadingScreen }                 from "./LoadingScreen";
import { DialogBox }                     from "./DialogBox";
import { TutorialOverlay }               from "./TutorialOverlay";
import { InventoryPanel }                from "./InventoryPanel";
import { InventoryHUD }                  from "./InventoryHUD";
import { PlaystyleSelect }               from "./PlaystyleSelect";
import { JournalFAB }                    from "./JournalFAB";
import styles from "@/styles/game.module.css";

export function GameCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const playerName = getUsername() ?? "Bunny";

  const {
    isLoading, loadProgress,
    dialog, dismissDialog,
    inventorySource, dismissInventory,
    setEquipped: pushEquippedToGame,
  } = useGame(canvasRef, playerName);

  const { equipped, equip, unequip } = useInventory();
  const { items }                    = useItems();

  // Sync equipped clothing onto MrBunny whenever it changes
  useEffect(() => {
    pushEquippedToGame(equipped);
  }, [equipped, pushEquippedToGame]);

  // ── Playstyle ──────────────────────────────────────────────────────────────
  const [playstyle, setPlaystyleState] = useState<Playstyle | null>(
    () => getPlaystyle()
  );

  // ── Tutorial ───────────────────────────────────────────────────────────────
  const [tutorialDismissed, setTutorialDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("tgb_tutorial_seen") === "true";
  });

  function handleTutorialDismiss(doNotShowAgain: boolean) {
    if (doNotShowAgain) localStorage.setItem("tgb_tutorial_seen", "true");
    setTutorialDismissed(true);
  }

  function handleShowHelp() {
    setTutorialDismissed(false);
  }

  // ── Discovery flags (Explorer mode) ───────────────────────────────────────
  // wardrobeFound: unlocked when player first opens wardrobe or dresser
  const [wardrobeFound, setWardrobeFound] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("tgb_wardrobe_found") === "true";
  });

  useEffect(() => {
    if (inventorySource !== null && !wardrobeFound) {
      setWardrobeFound(true);
      localStorage.setItem("tgb_wardrobe_found", "true");
    }
  }, [inventorySource, wardrobeFound]);

  // journalFound: unlocked when player first clicks the in-room journal object (TODO: wire via useGame)
  const [journalFound, setJournalFound] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("tgb_journal_found") === "true";
  });

  function handleJournalFound() {
    if (!journalFound) {
      setJournalFound(true);
      localStorage.setItem("tgb_journal_found", "true");
    }
  }

  // Temporary window bridge until journal callback is wired into useGame
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__tgb_journalFound = handleJournalFound;
    return () => { delete (window as unknown as Record<string, unknown>).__tgb_journalFound; };
  });

  // ── Journal panel ──────────────────────────────────────────────────────────
  const [journalOpen, setJournalOpen] = useState(false);

  // ── Visibility rules ───────────────────────────────────────────────────────
  const showPlaystyleSelect = !isLoading && playstyle === null;
  const showTutorial        = !isLoading && !showPlaystyleSelect && !tutorialDismissed;
  const showInventory       = !isLoading && !showPlaystyleSelect && !showTutorial && inventorySource !== null;
  const showDialog          = !isLoading && !showPlaystyleSelect && !showTutorial && !showInventory && dialog !== null;
  const showHUD             = !isLoading && !showPlaystyleSelect && !showTutorial && !showInventory;

  // Story Bunny: FABs always visible. Explorer Bunny: unlocked after first discovery.
  const showInventoryHUD = showHUD && (playstyle === "story" || wardrobeFound);
  const showJournalFAB   = showHUD && (playstyle === "story" || journalFound);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {isLoading && <LoadingScreen progress={loadProgress} playerName={playerName} />}

      {showPlaystyleSelect && (
        <PlaystyleSelect onSelect={(ps) => setPlaystyleState(ps)} />
      )}

      {showTutorial && (
        <TutorialOverlay
          playerName={playerName}
          playstyle={playstyle ?? "story"}
          onDismiss={handleTutorialDismiss}
        />
      )}

      {showInventory && (
        <InventoryPanel
          source={inventorySource!}
          equipped={equipped}
          onEquip={equip}
          onUnequip={unequip}
          onClose={dismissInventory}
        />
      )}

      {showDialog && (
        <DialogBox message={dialog!} onDismiss={dismissDialog} />
      )}

      {showHUD && (
        <>
          {showInventoryHUD && <InventoryHUD equipped={equipped} items={items} />}

          {showJournalFAB && <JournalFAB onClick={() => setJournalOpen(true)} />}

          {/* Help — always visible */}
          <div className="absolute bottom-5 left-5 z-20">
            <Tooltip content="Show tutorial" position="top" align="start">
              <button
                onClick={handleShowHelp}
                aria-label="Show tutorial"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-gray-900/95 hover:border-white/30 transition-all active:scale-95"
              >
                <span className="text-2xl leading-none select-none" aria-hidden>❓</span>
              </button>
            </Tooltip>
          </div>
        </>
      )}

      {/* Journal panel — placeholder until JournalPanel is built */}
      {journalOpen && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) setJournalOpen(false); }}
        >
          <div className="relative z-10 w-full max-w-xl mx-4 rounded-3xl bg-gray-900/90 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.7)] px-8 py-10 flex flex-col items-center gap-4">
            <span className="text-5xl select-none" aria-hidden>📓</span>
            <h2 className="text-lg font-black uppercase tracking-widest text-summer-cream">Quest Journal</h2>
            <p className="text-summer-peach/60 text-sm text-center">Your quest diary is being prepared…</p>
            <button
              onClick={() => setJournalOpen(false)}
              className="mt-2 px-6 py-2.5 rounded-2xl bg-summer-coral text-white text-xs font-black uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
