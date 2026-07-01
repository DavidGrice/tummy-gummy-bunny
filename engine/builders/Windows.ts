import * as THREE from "three";
import { loadFittedGLB } from "@/models/loaders/loadFittedGLB";
import type { RoomManifest } from "@/engine/loaders/types";

// Procedural window target dimensions — used for GLB auto-scale reference
const WINDOW_W = 1.3;
const WINDOW_H = 1.0;

async function createWindowGroup(
  wx: number,
  wy: number,
  wall: "north" | "west" | "east",
  manifest: RoomManifest,
): Promise<THREE.Group> {
  const { width, depth, wallThick } = manifest.dimensions;

  // World position and Y-rotation for each wall
  let px: number, py: number, pz: number, ry: number;
  if (wall === "west") {
    // wx is Z along the wall, wy is height
    px = -(width / 2) + wallThick / 2;
    py = wy;
    pz = wx;
    ry = Math.PI / 2; // face east
  } else if (wall === "east") {
    px = (width / 2) - wallThick / 2;
    py = wy;
    pz = wx;
    ry = -Math.PI / 2; // face west
  } else {
    // north (default)
    px = wx;
    py = wy;
    pz = -(depth / 2) + wallThick / 2;
    ry = 0;
  }

  if (manifest.windowModelPath) {
    const rot: [number, number, number] = manifest.windowModelRotation
      ? [manifest.windowModelRotation[0], manifest.windowModelRotation[1] + ry, manifest.windowModelRotation[2]]
      : [0, ry, 0];
    const model = await loadFittedGLB({
      id:        "window",
      modelPath: manifest.windowModelPath,
      position:  [px, py, pz],
      fitSize:   [WINDOW_W, WINDOW_H, 0],
      fitPlane:  "xy",
      rotation:  rot,
      scale:     manifest.windowModelScale,
    });
    if (model) {
      const group = new THREE.Group();
      group.add(model);
      return group;
    }
  }

  // ── Procedural fallback ───────────────────────────────────────────────────
  const group = new THREE.Group();
  group.position.set(px, py, pz);
  group.rotation.y = ry;

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

/** Returns window groups positioned on the specified wall (defaults to north). */
export async function createWindows(manifest: RoomManifest): Promise<THREE.Group[]> {
  return Promise.all(
    manifest.windows.map(({ x, y, wall }) =>
      createWindowGroup(x, y, wall ?? "north", manifest),
    ),
  );
}
