"use client";

import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loop } from "@/engine/core/Loop";
import { Renderer } from "@/engine/core/Renderer";
import { Camera } from "@/engine/core/Camera";
import { SceneManager } from "@/engine/core/SceneManager";
import { InputManager } from "@/engine/input/InputManager";
import { Raycaster } from "@/engine/interaction/Raycaster";
import { TutorialScene } from "@/scenes/tutorial/TutorialScene";
import type { EquippedClothing } from "@/lib/inventory";

export type InventorySource = "wardrobe" | "dresser";

export interface UseGameResult {
  isLoading:        boolean;
  loadProgress:     number;
  dialog:           string | null;
  dismissDialog:    () => void;
  inventorySource:  InventorySource | null;
  dismissInventory: () => void;
  /** Fired when the player picks up a world item. Contains the item's ID. */
  pickedUpItemId:    string | null;
  clearPickedUp:     () => void;
  /** Fired when the player clicks the in-room journal object. */
  journalTriggered:  boolean;
  clearJournalTrigger: () => void;
  /** Imperatively updates MrBunny's clothing without triggering a re-render. */
  setEquipped:       (equipped: EquippedClothing) => void;
}

export function useGame(
  canvasRef:  React.RefObject<HTMLCanvasElement | null>,
  playerName: string,
): UseGameResult {
  const [isLoading,       setIsLoading]       = useState(true);
  const [loadProgress,    setLoadProgress]    = useState(0);
  const [dialog,          setDialog]          = useState<string | null>(null);
  const [inventorySource, setInventorySource] = useState<InventorySource | null>(null);
  const [pickedUpItemId,  setPickedUpItemId]  = useState<string | null>(null);
  const [journalTriggered, setJournalTriggered] = useState(false);

  // Stable ref so the callback below never goes stale
  const sceneRef = useRef<TutorialScene | null>(null);

  const dismissDialog        = useCallback(() => setDialog(null),            []);
  const dismissInventory     = useCallback(() => setInventorySource(null),   []);
  const clearPickedUp        = useCallback(() => setPickedUpItemId(null),    []);
  const clearJournalTrigger  = useCallback(() => setJournalTriggered(false), []);

  /** Stable callback — safe to put in a useEffect dependency array. */
  const setEquipped = useCallback((equipped: EquippedClothing) => {
    sceneRef.current?.setCharacterEquipped(equipped);
  }, []);

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
    sceneRef.current = scene;

    scene.setPlayerName(playerName);
    scene.onProgress((p)    => { if (mounted) setLoadProgress(p); });
    scene.onDialog((msg)    => { if (mounted) setDialog(msg); });
    scene.onInventory((src) => { if (mounted) setInventorySource(src); });
    scene.onPickup((id)     => { if (mounted) setPickedUpItemId(id); });
    scene.onJournal(()      => { if (mounted) setJournalTriggered(true); });

    (async () => {
      try {
        await sceneManager.load(scene);
        scene.setupCamera?.(camera.instance);
        renderer.setup(sceneManager.instance, camera.instance, width, height);

        await new Promise<void>((r) => setTimeout(r, 700));

        if (!mounted) return;

        input.onHover((pointer) => {
          const hoverTargets = scene.getCastTargets().filter(
            (o) => !o.userData.isFloor
          );
          const hit = raycaster.castFirst(pointer, camera.instance, hoverTargets);
          if (hit) {
            let obj: THREE.Object3D | null = hit.object;
            while (obj && !obj.userData.interactable) obj = obj.parent;
            renderer.setHoveredObjects(obj ? [obj] : []);
            scene.onHoverChange?.(obj);
            canvas.style.cursor = obj ? "pointer" : "default";
          } else {
            renderer.setHoveredObjects([]);
            scene.onHoverChange?.(null);
            canvas.style.cursor = "default";
          }
        });

        setIsLoading(false);
        loop.start();
      } catch (err) {
        console.error("[TGB] Scene failed to load:", err);
      }
    })();

    loop.add((delta) => {
      sceneManager.update(delta);
      renderer.render(sceneManager.instance, camera.instance);
    });

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
      sceneRef.current = null;
      canvas.style.cursor = "default";
      loop.stop();
      input.dispose();
      renderer.dispose();
      sceneManager.dispose();
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef, playerName]);

  return {
    isLoading, loadProgress,
    dialog, dismissDialog,
    inventorySource, dismissInventory,
    pickedUpItemId, clearPickedUp,
    journalTriggered, clearJournalTrigger,
    setEquipped,
  };
}
