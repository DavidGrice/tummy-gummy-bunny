import * as THREE from "three";
import { sharedModelLoader } from "@/models/loaders/ModelLoader";
import type { RoomManifest } from "@/engine/loaders/types";

// Procedural window target dimensions — used for GLB auto-scale reference
const WINDOW_W = 1.3;
const WINDOW_H = 1.0;

// Prevent repeated console logs for the same model path across multiple windows/rooms
const _loggedPaths = new Set<string>();

async function createWindowGroup(
  x: number,
  y: number,
  wallFaceZ: number,
  manifest: RoomManifest,
): Promise<THREE.Group> {
  if (manifest.windowModelPath) {
    try {
      const gltf  = await sharedModelLoader.load(manifest.windowModelPath);
      const model = gltf.scene.clone(true);

      if (manifest.windowModelScale !== undefined) {
        if (Array.isArray(manifest.windowModelScale)) model.scale.set(...manifest.windowModelScale);
        else model.scale.setScalar(manifest.windowModelScale);
      } else {
        // Measure natural size (before applying position/rotation)
        const naturalBox = new THREE.Box3().setFromObject(model);
        const ns         = new THREE.Vector3();
        naturalBox.getSize(ns);
        // Windows are vertical — scale by width (X) and height (Y)
        if (ns.x > 0 && ns.y > 0) {
          const scale = Math.min(WINDOW_W / ns.x, WINDOW_H / ns.y);
          model.scale.setScalar(scale);
          if (!_loggedPaths.has(manifest.windowModelPath)) {
            _loggedPaths.add(manifest.windowModelPath);
            console.log(
              `[Windows] "${manifest.windowModelPath}" natural ${ns.x.toFixed(3)}×${ns.y.toFixed(3)}×${ns.z.toFixed(3)}, ` +
              `auto-scale → ${scale.toFixed(4)} (set windowModelScale to override)`,
            );
          }
        }
      }

      model.position.set(x, y, wallFaceZ);
      if (manifest.windowModelRotation) model.rotation.set(...manifest.windowModelRotation);
      model.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow    = true;
          child.receiveShadow = true;
        }
      });

      const group = new THREE.Group();
      group.add(model);
      return group;
    } catch (err) {
      console.warn(`[Windows] Failed to load "${manifest.windowModelPath}":`, err);
      // Fall through to procedural
    }
  }

  // ── Procedural fallback ───────────────────────────────────────────────────
  const group = new THREE.Group();
  group.position.set(x, y, wallFaceZ);

  const frameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(WINDOW_W, WINDOW_H, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x5C3D1E }),
  );
  frameMesh.receiveShadow = true;
  group.add(frameMesh);

  const glassMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.72),
    new THREE.MeshLambertMaterial({
      color:       0x87CEEB,
      transparent: true,
      opacity:     0.68,
      depthWrite:  false,
    }),
  );
  glassMesh.position.z = 0.07;
  group.add(glassMesh);

  return group;
}

/** Returns window groups positioned on the north (back) wall inner face. */
export async function createWindows(manifest: RoomManifest): Promise<THREE.Group[]> {
  const { depth, wallThick } = manifest.dimensions;
  const wallFaceZ = -(depth / 2) + wallThick / 2;
  return Promise.all(
    manifest.windows.map(({ x, y }) => createWindowGroup(x, y, wallFaceZ, manifest)),
  );
}
