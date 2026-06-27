"use client";

import { useRef } from "react";
import { useGame } from "@/hooks/useGame";
import styles from "@/styles/game.module.css";

export function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useGame(canvasRef);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
