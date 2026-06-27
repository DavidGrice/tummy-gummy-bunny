"use client";

import { useRef, useState, useEffect } from "react";
import { useGame } from "@/hooks/useGame";
import { useInventory } from "@/hooks/useInventory";
import { getUsername } from "@/lib/cookies";
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
        <InventoryHUD equipped={equipped} />
      )}
    </div>
  );
}
