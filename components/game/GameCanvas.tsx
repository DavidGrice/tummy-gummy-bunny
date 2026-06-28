"use client";

import { useRef, useState, useEffect } from "react";
import { useGame } from "@/hooks/useGame";
import { useInventory } from "@/hooks/useInventory";
import { getUsername } from "@/lib/cookies";
import { Tooltip } from "@/components/ui/Tooltip";
import { LoadingScreen } from "./LoadingScreen";
import { DialogBox } from "./DialogBox";
import { TutorialOverlay } from "./TutorialOverlay";
import { InventoryPanel } from "./InventoryPanel";
import { InventoryHUD } from "./InventoryHUD";
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

  // Mirror equipped state onto MrBunny in the game scene whenever it changes
  useEffect(() => {
    pushEquippedToGame(equipped);
  }, [equipped, pushEquippedToGame]);

  // Tutorial overlay — check localStorage on first render (client-only)
  const [tutorialDismissed, setTutorialDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("tgb_tutorial_seen") === "true";
  });

  function handleTutorialDismiss(doNotShowAgain: boolean) {
    if (doNotShowAgain) localStorage.setItem("tgb_tutorial_seen", "true");
    setTutorialDismissed(true);
  }

  // ❓ button re-shows tutorial for this session (does not clear the localStorage flag)
  function handleShowHelp() {
    setTutorialDismissed(false);
  }

  const showTutorial  = !isLoading && !tutorialDismissed;
  const showInventory = !isLoading && !showTutorial && inventorySource !== null;
  const showDialog    = !isLoading && !showTutorial && !showInventory && dialog !== null;
  const showHUD       = !isLoading && !showTutorial && !showInventory;

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {isLoading && <LoadingScreen progress={loadProgress} playerName={playerName} />}

      {showTutorial && (
        <TutorialOverlay playerName={playerName} onDismiss={handleTutorialDismiss} />
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
          <InventoryHUD equipped={equipped} />

          {/* Help button — bottom-left, mirrors inventory FAB position */}
          <div className="absolute bottom-5 left-5 z-20">
            <Tooltip content="Show tutorial" position="top" align="start">
              <button
                onClick={handleShowHelp}
                aria-label="Show tutorial"
                className="flex items-center justify-center w-14 h-14 rounded-full bg-gray-900/80 backdrop-blur-md border border-white/15 shadow-[0_4px_20px_rgba(0,0,0,0.5)] hover:bg-gray-900/95 hover:border-white/30 transition-all active:scale-95"
              >
                <span className="text-2xl leading-none">❓</span>
              </button>
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
}
