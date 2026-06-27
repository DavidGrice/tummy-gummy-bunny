"use client";

import { useRef, useState } from "react";
import { useGame } from "@/hooks/useGame";
import { LoadingScreen } from "./LoadingScreen";
import { DialogBox } from "./DialogBox";
import { TutorialOverlay } from "./TutorialOverlay";
import styles from "@/styles/game.module.css";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isLoading, loadProgress, dialog, dismissDialog } = useGame(canvasRef);

  // Tutorial overlay — check localStorage on first render (client-only)
  const [tutorialDismissed, setTutorialDismissed] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("tgb_tutorial_seen") === "true";
  });

  function handleTutorialDismiss(doNotShowAgain: boolean) {
    if (doNotShowAgain) localStorage.setItem("tgb_tutorial_seen", "true");
    setTutorialDismissed(true);
  }

  const showTutorial = !isLoading && !tutorialDismissed;

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />

      {isLoading && <LoadingScreen progress={loadProgress} />}

      {showTutorial && (
        <TutorialOverlay onDismiss={handleTutorialDismiss} />
      )}

      {dialog && !showTutorial && (
        <DialogBox message={dialog} onDismiss={dismissDialog} />
      )}
    </div>
  );
}
