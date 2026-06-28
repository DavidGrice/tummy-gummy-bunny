import * as THREE from "three";
import { ROOM, OBJECTS, WALL_COLOR } from "../data/layout";

function makeWall(w: number, h: number, d: number, x: number, z: number, name: string): THREE.Mesh {
  const geo  = new THREE.BoxGeometry(w, h, d);
  const mat  = new THREE.MeshLambertMaterial({ color: WALL_COLOR });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name           = name;
  mesh.position.set(x, h / 2, z);
  mesh.receiveShadow  = true;
  mesh.castShadow     = true;
  return mesh;
}

/** Named handles for every wall panel — prefer these over array indices. */
export interface WallSet {
  /** Back wall, north face (z = −half) */
  north:       THREE.Mesh;
  /** Left wall, west face (x = −half) — wardrobe side */
  west:        THREE.Mesh;
  /** Right wall, east face (x = +half) — bed / lamp side */
  east:        THREE.Mesh;
  /** Front-left panel beside the door */
  southLeft:   THREE.Mesh;
  /** Front-right panel beside the door — faces camera, set visible=false to open view */
  southRight:  THREE.Mesh;
  /** Horizontal lintel above the door */
  southLintel: THREE.Mesh;
  /** All panels in one flat array for scene.add / dispose iteration */
  all:         readonly THREE.Mesh[];
}

export function createWalls(): WallSet {
  const { width, wallHeight: H, wallThick: T } = ROOM;
  const half = width / 2;

  const north = makeWall(width + T * 2, H, T,  0,    -half, "wall-north");
  const west  = makeWall(T, H, width,          -half,  0,    "wall-west");
  const east  = makeWall(T, H, width,           half,  0,    "wall-east");

  // South wall — three BoxGeometry panels forming a door frame.
  // All panels sit one wallThick behind the door so they never
  // z-fight with the door geometry and always render cleanly behind it.
  const [doorX, , doorZ] = OBJECTS.door.position;
  const [doorW, doorH]   = OBJECTS.door.size;
  const halfDoorW        = doorW / 2;
  const panelW           = half - halfDoorW;
  const lintelH          = H - doorH;
  const wallZ            = doorZ - T;

  function makeSouthPanel(w: number, h: number, x: number, y: number, name: string): THREE.Mesh {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, T),
      new THREE.MeshLambertMaterial({ color: WALL_COLOR, transparent: true, opacity: 0.7 }),
    );
    mesh.name           = name;
    mesh.position.set(x, y, wallZ);
    mesh.receiveShadow  = true;
    return mesh;
  }

  const southLeft   = makeSouthPanel(panelW,        H,       -(halfDoorW + panelW / 2), H / 2,           "wall-south-left");
  const southRight  = makeSouthPanel(panelW,        H,        (halfDoorW + panelW / 2), H / 2,           "wall-south-right");
  const southLintel = makeSouthPanel(doorW + T * 2, lintelH,  doorX,                    doorH + lintelH / 2, "wall-south-lintel");

  const all = [north, west, east, southLeft, southRight, southLintel] as const;
  return { north, west, east, southLeft, southRight, southLintel, all };
}
