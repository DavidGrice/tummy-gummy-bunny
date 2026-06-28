"use client";

import { useRef, useState, useEffect, useMemo } from "react";
import { useGame }                               from "@/hooks/useGame";
import { useInventory }                          from "@/hooks/useInventory";
import { useItems }                              from "@/hooks/useItems";
import { useDiscoveredClothing }                 from "@/hooks/useDiscoveredClothing";
import { useRoomState }                          from "@/hooks/useRoomState";
import { useQuestNotifications }                 from "@/hooks/useQuestNotifications";
import { GAME_ITEMS }                            from "@/lib/items";
import { getUsername }                           from "@/lib/cookies";
import { getPlaystyle, type Playstyle }          from "@/lib/playstyle";
import { Tooltip }                               from "@/components/ui/Tooltip";
import { LoadingScreen }                         from "./LoadingScreen";
import { DialogBox }                             from "./DialogBox";
import { TutorialOverlay }                       from "./TutorialOverlay";
import { InventoryPanel }                        from "./InventoryPanel";
import { InventoryHUD }                          from "./InventoryHUD";
import { PlaystyleSelect }                       from "./PlaystyleSelect";
import { JournalFAB }                            from "./JournalFAB";
import { JournalPanel }                          from "./JournalPanel";
import styles from "@/styles/game.module.css";

export function GameCanvas() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const playerName = getUsername() ?? "Bunny";

  const {
    isLoading, loadProgress,
    dialog, dismissDialog,
    inventorySource, dismissInventory,
    pickedUpItemId, clearPickedUp,
    journalTriggered, clearJournalTrigger,
    setEquipped: pushEquippedToGame,
  } = useGame(canvasRef, playerName);

  const { equipped, equip, unequip }      = useInventory();
  const { items, addItem }                = useItems();
  const { discoveredIds, discoverSource } = useDiscoveredClothing();
  const { markCollected }                 = useRoomState("tutorial");

  // Stable set of collected item IDs — used by notification hook
  const collectedItemIds = useMemo(
    () => new Set(items.map((c) => c.item.id)),
    [items],
  );

  // Incremented whenever a localStorage flag is written so the notification
  // hook re-checks flag-based objectives (e.g. wardrobe/dresser visited).
  const [flagTick, setFlagTick] = useState(0);

  const { hasUnseen, markAllSeen } = useQuestNotifications(collectedItemIds, flagTick);

  // Sync equipped clothing onto MrBunny whenever it changes
  useEffect(() => {
    pushEquippedToGame(equipped);
  }, [equipped, pushEquippedToGame]);

  // When the scene fires a pickup, persist room state + add to React inventory
  useEffect(() => {
    if (!pickedUpItemId) return;
    markCollected(pickedUpItemId);
    const item = GAME_ITEMS.find((i) => i.id === pickedUpItemId);
    if (item) addItem(item);
    clearPickedUp();
  }, [pickedUpItemId, markCollected, addItem, clearPickedUp]);

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
  const [wardrobeFound, setWardrobeFound] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("tgb_wardrobe_found") === "true";
  });

  useEffect(() => {
    if (inventorySource === null) return;
    discoverSource(inventorySource);
    // Per-source flags checked by flag-based quest objectives
    localStorage.setItem(`tgb_${inventorySource}_visited`, "true");
    setFlagTick((t) => t + 1); // re-check flag-based objectives
    // Unlock inventory FAB for Explorer mode (either source counts)
    if (!wardrobeFound) {
      setWardrobeFound(true);
      localStorage.setItem("tgb_wardrobe_found", "true");
    }
  }, [inventorySource, wardrobeFound, discoverSource]);

  // ── Journal panel ──────────────────────────────────────────────────────────
  const [journalFound, setJournalFound] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("tgb_journal_found") === "true";
  });

  const [journalOpen, setJournalOpen] = useState(false);

  function handleJournalOpen() {
    setJournalOpen(true);
    markAllSeen(); // clears the notification dot
  }

  // When scene fires journal interaction: unlock FAB + open panel
  useEffect(() => {
    if (!journalTriggered) return;
    if (!journalFound) {
      setJournalFound(true);
      localStorage.setItem("tgb_journal_found", "true");
    }
    handleJournalOpen();
    clearJournalTrigger();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalTriggered, journalFound, clearJournalTrigger]);

  // ── Visibility rules ───────────────────────────────────────────────────────
  const showPlaystyleSelect = !isLoading && playstyle === null;
  const showTutorial        = !isLoading && !showPlaystyleSelect && !tutorialDismissed;
  const showInventory       = !isLoading && !showPlaystyleSelect && !showTutorial && inventorySource !== null;
  const showDialog          = !isLoading && !showPlaystyleSelect && !showTutorial && !showInventory && dialog !== null;
  const showHUD             = !isLoading && !showPlaystyleSelect && !showTutorial && !showInventory;

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

          {showJournalFAB && (
            <JournalFAB
              onClick={handleJournalOpen}
              hasNotification={hasUnseen}
            />
          )}

          <div
            className="absolute left-5 z-20"
            style={{ bottom: "max(5rem, calc(env(safe-area-inset-bottom, 0px) + 4.5rem))" }}
          >
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
