import * as THREE from "three";
import { ROOM, WALL_COLOR } from "../data/layout";

function makeWall(w: number, h: number, d: number, x: number, z: number): THREE.Mesh {
  const geo  = new THREE.BoxGeometry(w, h, d);
  const mat  = new THREE.MeshLambertMaterial({ color: WALL_COLOR });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, h / 2, z);
  mesh.receiveShadow = true;
  mesh.castShadow    = true;
  return mesh;
}

export function createWalls(): THREE.Mesh[] {
  const { width, depth, wallHeight: H, wallThick: T } = ROOM;
  const half = width / 2;

  return [
    makeWall(width + T * 2, H, T, 0,     -half), // back  (north)
    makeWall(T,  H, depth, -half, 0),              // left  (west)
    makeWall(T,  H, depth,  half, 0),              // right (east)
    // front wall intentionally omitted — camera looks in from this side
  ];
}
