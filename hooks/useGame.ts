"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loop } from "@/engine/core/Loop";
import { Renderer } from "@/engine/core/Renderer";
import { Camera } from "@/engine/core/Camera";
import { SceneManager } from "@/engine/core/SceneManager";
import { InputManager } from "@/engine/input/InputManager";
import { Raycaster } from "@/engine/interaction/Raycaster";
import { TutorialScene } from "@/scenes/tutorial/TutorialScene";

export interface UseGameResult {
  isLoading:     boolean;
  loadProgress:  number;
  dialog:        string | null;
  dismissDialog: () => void;
}

export function useGame(
  canvasRef: React.RefObject<HTMLCanvasElement | null>
): UseGameResult {
  const [isLoading,    setIsLoading]    = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [dialog,       setDialog]       = useState<string | null>(null);

  const dismissDialog = useCallback(() => setDialog(null), []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mounted = true;

    const { width, height } = canvas.getBoundingClientRect();

    const sceneManager = new SceneManager();
    const camera       = new Camera(width, height);
    const renderer     = new Renderer(canvas);
    const input        = new InputManager(canvas);
    const raycaster    = new Raycaster();
    const loop         = new Loop();

    renderer.setSize(width, height);

    const scene = new TutorialScene();

    // Wire scene callbacks — guard with `mounted` to avoid state updates after unmount
    scene.onProgress((p) => { if (mounted) setLoadProgress(p); });
    scene.onDialog((msg)  => { if (mounted) setDialog(msg); });

    // Load scene async, then start the loop
    (async () => {
      await sceneManager.load(scene);
      scene.setupCamera?.(camera.instance);

      // Minimum display time so loading screen is actually visible
      await new Promise<void>((r) => setTimeout(r, 700));

      if (mounted) {
        setIsLoading(false);
        loop.start();
      }
    })();

    // Game loop — only runs after loading completes (loop.start() called above)
    loop.add((delta) => {
      sceneManager.update(delta);
      renderer.render(sceneManager.instance, camera.instance);
    });

    // Click handler — delegates all logic to the active scene
    input.onClick((pointer) => {
      const targets = scene.getCastTargets();
      const hit     = raycaster.castFirst(pointer, camera.instance, targets);
      if (hit) scene.handleClick(hit);
    });

    const onResize = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      camera.resize(w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    return () => {
      mounted = false;
      loop.stop();
      input.dispose();
      renderer.dispose();
      sceneManager.dispose();
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef]);

  return { isLoading, loadProgress, dialog, dismissDialog };
}
