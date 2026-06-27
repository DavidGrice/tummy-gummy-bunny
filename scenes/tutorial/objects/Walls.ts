import * as THREE from "three";
import { ROOM, OBJECTS, WALL_COLOR } from "../data/layout";

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

  // South wall — three BoxGeometry panels forming a door frame.
  // All panels sit one wallThick behind the door (doorZ - T) so they never
  // z-fight with the door geometry and always render cleanly behind it.
  const [doorX, , doorZ] = OBJECTS.door.position;
  const [doorW, doorH]   = OBJECTS.door.size;
  const halfDoorW        = doorW / 2;
  const panelW           = half - halfDoorW; // 4 - 0.45 = 3.55
  const lintelH          = H - doorH;        // 3 - 2.2 = 0.8
  const wallZ            = doorZ - T;        // 3.5 - 0.2 = 3.3 (clearly behind door)

  function makeSouthPanel(w: number, h: number, x: number, y: number): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, T),
      new THREE.MeshLambertMaterial({ color: WALL_COLOR, transparent: true, opacity: 0.7 })
    );
    mesh.position.set(x, y, wallZ);
    mesh.receiveShadow = true;
    return mesh;
  }

  const southLeft   = makeSouthPanel(panelW,        H,       -(halfDoorW + panelW / 2), H / 2);
  const southRight  = makeSouthPanel(panelW,        H,        (halfDoorW + panelW / 2), H / 2);
  const southLintel = makeSouthPanel(doorW + T * 2, lintelH,  doorX,                    doorH + lintelH / 2);

  return [
    makeWall(width + T * 2, H, T, 0,    -half), // back  (north)
    makeWall(T, H, width,         -half,  0),    // left  (west)
    makeWall(T, H, width,          half,  0),    // right (east)
    southLeft, southRight, southLintel,          // south door frame
  ];
}
