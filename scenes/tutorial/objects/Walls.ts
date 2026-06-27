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
  const { width, wallHeight: H, wallThick: T } = ROOM;
  const half = width / 2;

  // Transparent south wall — sits just behind the door so the doorway feels complete.
  // PlaneGeometry faces +z by default (toward camera at z=8).
  // depthWrite: false so it doesn't occlude room contents visible through its surface.
  const southGeo = new THREE.PlaneGeometry(width, H);
  const southMat = new THREE.MeshLambertMaterial({
    color:       WALL_COLOR,
    transparent: true,
    opacity:     0.45,
    depthWrite:  false,
  });
  const south = new THREE.Mesh(southGeo, southMat);
  south.position.set(0, H / 2, half - 0.75); // z ≈ 3.25 — behind the door at z 3.5

  return [
    makeWall(width + T * 2, H, T, 0,    -half), // back  (north)
    makeWall(T, H, width, -half, 0),             // left  (west)
    makeWall(T, H, width,  half, 0),             // right (east)
    south,                                       // front (south) — transparent
  ];
}
