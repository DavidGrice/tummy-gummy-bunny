"use client";

import { useEffect, useRef } from "react";
import { Loop } from "@/engine/core/Loop";
import { Renderer } from "@/engine/core/Renderer";
import { Camera } from "@/engine/core/Camera";
import { SceneManager } from "@/engine/core/SceneManager";
import { InputManager } from "@/engine/input/InputManager";
import { Raycaster } from "@/engine/interaction/Raycaster";

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const loopRef = useRef<Loop | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = canvas.getBoundingClientRect();

    const sceneManager = new SceneManager();
    const camera = new Camera(width, height);
    const renderer = new Renderer(canvas);
    const input = new InputManager(canvas);
    const raycaster = new Raycaster();
    const loop = new Loop();

    loopRef.current = loop;
    renderer.setSize(width, height);

    loop.add((delta) => {
      sceneManager.update(delta);
      renderer.render(sceneManager.instance, camera.instance);
    });

    input.onClick((pointer) => {
      const hit = raycaster.castFirst(
        pointer,
        camera.instance,
        sceneManager.instance.children
      );
      if (hit) {
        const target = hit.object.userData as { onInteract?: () => void };
        target.onInteract?.();
      }
    });

    const onResize = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      camera.resize(w, h);
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    loop.start();

    return () => {
      loop.stop();
      input.dispose();
      renderer.dispose();
      sceneManager.dispose();
      window.removeEventListener("resize", onResize);
    };
  }, [canvasRef]);
}
