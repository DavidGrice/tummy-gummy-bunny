import * as THREE from "three";
import { ROOM, WINDOWS } from "../data/layout";

// Each window: a dark wood frame box + a sky-blue transparent glass pane.
// Groups are placed on the inner face of the north wall.
function createWindowGroup(x: number, y: number): THREE.Group {
  const group    = new THREE.Group();
  const wallFace = -(ROOM.depth / 2) + ROOM.wallThick / 2; // z ≈ -3.9

  group.position.set(x, y, wallFace);

  // Outer wood frame — slightly larger than the glass area
  const frameMesh = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 1.0, 0.12),
    new THREE.MeshLambertMaterial({ color: 0x5C3D1E })
  );
  frameMesh.receiveShadow = true;
  group.add(frameMesh);

  // Glass pane — sky blue, transparent, sits in front of frame face
  // PlaneGeometry default normal is +z (faces into room / toward camera) ✓
  const glassMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(0.95, 0.72),
    new THREE.MeshLambertMaterial({
      color:       0x87CEEB,
      transparent: true,
      opacity:     0.68,
      depthWrite:  false,
    })
  );
  glassMesh.position.z = 0.07; // local: in front of frame front face
  group.add(glassMesh);

  return group;
}

/** Returns window groups — add to scene but NOT to raycaster targets */
export function createWindows(): THREE.Group[] {
  return WINDOWS.map(({ x, y }) => createWindowGroup(x, y));
}
