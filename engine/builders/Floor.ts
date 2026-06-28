import * as THREE from "three";
import type { RoomManifest } from "@/engine/loaders/types";

export function createFloor(manifest: RoomManifest): THREE.Mesh {
  const { width, depth } = manifest.dimensions;
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(width, depth),
    new THREE.MeshLambertMaterial({ color: manifest.floorColor }),
  );
  mesh.rotation.x      = -Math.PI / 2;
  mesh.receiveShadow   = true;
  mesh.name            = "floor";
  mesh.userData.isFloor = true;
  return mesh;
}
