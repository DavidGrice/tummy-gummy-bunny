"use client";

import * as THREE from "three";
import { useCallback, useEffect, useRef, useState } from "react";
import { Loop } from "@/engine/core/Loop";
import { Renderer } from "@/engine/core/Renderer";
import { Camera } from "@/engine/core/Camera";
import { SceneManager } from "@/engine/core/SceneManager";
import { SceneRouter } from "@/engine/core/SceneRouter";
import { InputManager } from "@/engine/input/InputManager";
import { Raycaster } from "@/engine/interaction/Raycaster";
import { RoomScene } from "@/scenes/RoomScene";
import { TUTORIAL_ROOM } from "@/scenes/tutorial/data/room";
import type { InventorySource } from "@/engine/loaders/types";
import type { EquippedClothing } from "@/lib/inventory";

// ── Room registry — add new rooms here as manifests are created ───────────────
const router = new SceneRouter();
router
  .register("tutorial", TUTORIAL_ROOM);
  // .register("hallway", HALLWAY_ROOM)  ← uncomment when Phase 3 is ready

// ─────────────────────────────────────────────────────────────────────────────

export type { InventorySource };

export interface UseGameResult {
  isLoading:           boolean;
  loadProgress:        number;
  dialog:              string | null;
  dismissDialog:       () => void;
  inventorySource:     InventorySource | null;
  dismissInventory:    () => void;
  pickedUpItemId:      string | null;
  clearPickedUp:       () => void;
  journalTriggered:    boolean;
  clearJournalTrigger: () => void;
  setEquipped:         (equipped: EquippedClothing) => void;
  /** Current active room id */
  currentRoomId:       string;
  /** Imperatively switch rooms without tearing down the engine */
  switchRoom:          (id: string) => void;
}

export function useGame(
  canvasRef:  React.RefObject<HTMLCanvasElement | null>,
  playerName: string,
): UseGameResult {
  const [isLoading,        setIsLoading]        = useState(true);
  const [loadProgress,     setLoadProgress]     = useState(0);
  const [dialog,           setDialog]           = useState<string | null>(null);
  const [inventorySource,  setInventorySource]  = useState<InventorySource | null>(null);
  const [pickedUpItemId,   setPickedUpItemId]   = useState<string | null>(null);
  const [journalTriggered, setJournalTriggered] = useState(false);
  const [currentRoomId,    setCurrentRoomId]    = useState("tutorial");

  const sceneRef        = useRef<RoomScene | null>(null);
  const sceneManagerRef = useRef<SceneManager | null>(null);
  const cameraRef       = useRef<Camera | null>(null);

  const dismissDialog        = useCallback(() => setDialog(null),            []);
  const dismissInventory     = useCallback(() => setInventorySource(null),   []);
  const clearPickedUp        = useCallback(() => setPickedUpItemId(null),    []);
  const clearJournalTrigger  = useCallback(() => setJournalTriggered(false), []);

  const setEquipped = useCallback((equipped: EquippedClothing) => {
    sceneRef.current?.setCharacterEquipped(equipped);
  }, []);

  /** Load a room by id — safe to call at any time after engine init */
  const switchRoom = useCallback((id: string) => {
    const sm     = sceneManagerRef.current;
    const cam    = cameraRef.current;
    if (!sm || !cam) return;

    const manifest = router.get(id);
    const newScene = new RoomScene(manifest);
    newScene.setPlayerName(playerName);
    newScene.onDialog((msg) => setDialog(msg));
    newScene.onInventory((src) => setInventorySource(src));
    newScene.onPickup((itemId) => setPickedUpItemId(itemId));
    newScene.onJournal(() => setJournalTriggered(true));
    newScene.onSceneChange((targetId) => switchRoom(targetId));

    sceneRef.current = newScene;
    setCurrentRoomId(id);
    setIsLoading(true);
    setLoadProgress(0);

    newScene.onProgress((p) => setLoadProgress(p));

    sm.load(newScene).then(() => {
      newScene.setupCamera?.(cam.instance);
      setIsLoading(false);
    }).catch((err) => {
      console.error(`[useGame] Failed to load room "${id}":`, err);
    });
  }, [playerName]);

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

    sceneManagerRef.current = sceneManager;
    cameraRef.current       = camera;

    renderer.setSize(width, height);

    // Build initial scene
    const scene = new RoomScene(TUTORIAL_ROOM);
    sceneRef.current = scene;

    scene.setPlayerName(playerName);
    scene.onProgress((p)    => { if (mounted) setLoadProgress(p); });
    scene.onDialog((msg)    => { if (mounted) setDialog(msg); });
    scene.onInventory((src) => { if (mounted) setInventorySource(src); });
    scene.onPickup((id)     => { if (mounted) setPickedUpItemId(id); });
    scene.onJournal(()      => { if (mounted) setJournalTriggered(true); });
    scene.onSceneChange((id) => { if (mounted) switchRoom(id); });

    (async () => {
      try {
        await sceneManager.load(scene);
        scene.setupCamera?.(camera.instance);
        renderer.setup(sceneManager.instance, camera.instance, width, height);

        await new Promise<void>((r) => setTimeout(r, 700));
        if (!mounted) return;

        input.onHover((pointer) => {
          const hoverTargets = sceneRef.current?.getCastTargets().filter(
            (o) => !o.userData.isFloor,
          ) ?? [];
          const hit = raycaster.castFirst(pointer, camera.instance, hoverTargets);
          if (hit) {
            let obj: THREE.Object3D | null = hit.object;
            while (obj && !obj.userData.interactable) obj = obj.parent;
            renderer.setHoveredObjects(obj ? [obj] : []);
            sceneRef.current?.onHoverChange?.(obj);
            canvas.style.cursor = obj ? "pointer" : "default";
          } else {
            renderer.setHoveredObjects([]);
            sceneRef.current?.onHoverChange?.(null);
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
      const scene   = sceneRef.current;
      if (!scene) return;
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
      sceneRef.current        = null;
      sceneManagerRef.current = null;
      cameraRef.current       = null;
      canvas.style.cursor = "default";
      loop.stop();
      input.dispose();
      renderer.dispose();
      sceneManager.dispose();
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef, playerName]); // switchRoom intentionally excluded — it's stable via refs

  return {
    isLoading, loadProgress,
    dialog, dismissDialog,
    inventorySource, dismissInventory,
    pickedUpItemId, clearPickedUp,
    journalTriggered, clearJournalTrigger,
    setEquipped,
    currentRoomId,
    switchRoom,
  };
}
