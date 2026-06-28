"use client";

import { useRef, useState, useEffect }  from "react";
import { useGame }                       from "@/hooks/useGame";
import { useInventory }                  from "@/hooks/useInventory";
import { useItems }                      from "@/hooks/useItems";
import { useDiscoveredClothing }         from "@/hooks/useDiscoveredClothing";
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
import { JournalPanel }                  from "./JournalPanel";
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

  const { equipped, equip, unequip }           = useInventory();
  const { items }                              = useItems();
  const { discoveredIds, discoverSource }      = useDiscoveredClothing();

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
    if (inventorySource === null) return;
    // Reveal those clothing items in the inventory grid
    discoverSource(inventorySource);
    // Unlock the inventory FAB for Explorer Bunny mode
    if (!wardrobeFound) {
      setWardrobeFound(true);
      localStorage.setItem("tgb_wardrobe_found", "true");
    }
  }, [inventorySource, wardrobeFound, discoverSource]);

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
          {showInventoryHUD && (
            <InventoryHUD
              equipped={equipped}
              items={items}
              discoveredIds={discoveredIds}
            />
          )}

          {showJournalFAB && <JournalFAB onClick={() => setJournalOpen(true)} />}

          {/* Help — always visible, tooltip to the right so it doesn't clip off-screen */}
          <div className="absolute bottom-5 left-5 z-20">
            <Tooltip content="Show tutorial" position="right">
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

      {journalOpen && (
        <JournalPanel onClose={() => setJournalOpen(false)} />
      )}
    </div>
  );
}
