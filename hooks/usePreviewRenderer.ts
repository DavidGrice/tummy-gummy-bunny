"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { PreviewBunny } from "@/engine/characters/PreviewBunny";
import type { EquippedItems } from "@/hooks/useInventory";

export function usePreviewRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  equipped:  EquippedItems,
) {
  const bunnyRef = useRef<PreviewBunny | null>(null);
  const frameRef = useRef<number>(0);

  // Mount once: build renderer, scene, camera, bunny, start loop
  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;
    const el = canvas; // non-null alias for use inside closures

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha:     true,  // transparent background so panel bg shows through
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 50);
    camera.position.set(0, 1.1, 2.8);
    camera.lookAt(0, 0.55, 0);

    // Lighting — warm, matches the room
    scene.add(new THREE.AmbientLight(0xFFF5E6, 1.0));
    const sun = new THREE.DirectionalLight(0xFFD080, 1.6);
    sun.position.set(2, 5, 3);
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0xADD8E6, 0.4);
    fill.position.set(-2, 2, -1);
    scene.add(fill);

    const bunny = new PreviewBunny();
    bunny.addToScene(scene);
    bunny.setEquipped(equipped);
    bunnyRef.current = bunny;

    // Fit renderer to canvas layout size and handle resizes
    function resize() {
      const { width, height } = el.getBoundingClientRect();
      if (width === 0 || height === 0) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(el);

    // rAF loop
    let last = performance.now();
    function tick() {
      frameRef.current = requestAnimationFrame(tick);
      const now = performance.now();
      bunny.update(Math.min((now - last) / 1000, 0.1));
      last = now;
      renderer.render(scene, camera);
    }
    tick();

    return () => {
      cancelAnimationFrame(frameRef.current);
      observer.disconnect();
      bunny.dispose();
      renderer.dispose();
      bunnyRef.current = null;
    };
  // canvasRef identity is stable; equipped is handled by the second effect
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef]);

  // Live update when equipped items change (no remount needed)
  useEffect(() => {
    bunnyRef.current?.setEquipped(equipped);
  }, [equipped]);
}
