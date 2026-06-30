import * as THREE from "three";
import { loadFittedGLB } from "@/models/loaders/loadFittedGLB";
import type { RoomManifest } from "@/engine/loaders/types";

// Procedural window target dimensions — used for GLB auto-scale reference
const WINDOW_W = 1.3;
const WINDOW_H = 1.0;

async function createWindowGroup(
  x: number,
  y: number,
  wallFaceZ: number,
  manifest: RoomManifest,
): Promise<THREE.Group> {
  if (manifest.windowModelPath) {
    const model = await loadFittedGLB({
      id:        "window",
      modelPath: manifest.windowModelPath,
      position:  [x, y, wallFaceZ],
      fitSize:   [WINDOW_W, WINDOW_H, 0],
      fitPlane:  "xy",
      rotation:  manifest.windowModelRotation,
      scale:     manifest.windowModelScale,
    });
    if (model) {
      const group = new THREE.Group();
      group.add(model);
      return group;
    }
    // Fall through to procedural on load failure
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
