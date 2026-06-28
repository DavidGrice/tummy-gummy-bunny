import * as THREE from "three";
import type { RoomManifest } from "@/engine/loaders/types";

function createWindowGroup(
  x: number,
  y: number,
  wallFaceZ: number,
): THREE.Group {
  const group = new THREE.Group();
  group.position.set(x, y, wallFaceZ);

  // Outer wood frame
  const frameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.0, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x5C3D1E }),
  );
  frameMesh.receiveShadow = true;
  group.add(frameMesh);

  // Glass pane — sky blue, transparent
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
export function createWindows(manifest: RoomManifest): THREE.Group[] {
  const { depth, wallThick } = manifest.dimensions;
  const wallFaceZ = -(depth / 2) + wallThick / 2;
  return manifest.windows.map(({ x, y }) => createWindowGroup(x, y, wallFaceZ));
}
