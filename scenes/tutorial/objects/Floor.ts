import * as THREE from "three";
import { ROOM, FLOOR_COLOR } from "../data/layout";

export function createFloor(): THREE.Mesh {
  const geo  = new THREE.PlaneGeometry(ROOM.width, ROOM.depth);
  const mat  = new THREE.MeshLambertMaterial({ color: FLOOR_COLOR });
  const mesh = new THREE.Mesh(geo, mat);

  mesh.rotation.x     = -Math.PI / 2;
  mesh.receiveShadow  = true;
  mesh.name           = "floor";
  mesh.userData.isFloor = true;

  return mesh;
}
