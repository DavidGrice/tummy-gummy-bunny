import * as THREE from "three";
import type { RoomManifest, FurnitureObjectDef } from "@/engine/loaders/types";

function makeWall(
  w: number, h: number, d: number,
  x: number, z: number,
  color: number,
  name: string,
): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color }),
  );
  mesh.name          = name;
  mesh.position.set(x, h / 2, z);
  mesh.receiveShadow = true;
  mesh.castShadow    = true;
  return mesh;
}

/** Named handles for every wall panel — always prefer these over array indices. */
export interface WallSet {
  /** Back wall — north face */
  north:       THREE.Mesh;
  /** Left wall — west face (wardrobe side) */
  west:        THREE.Mesh;
  /** Right wall — east face (bed / lamp side) */
  east:        THREE.Mesh;
  /** Front-left panel beside the door */
  southLeft:   THREE.Mesh;
  /** Front-right panel beside the door */
  southRight:  THREE.Mesh;
  /** Horizontal lintel above the door */
  southLintel: THREE.Mesh;
  /** All panels in one flat array for scene.add / dispose iteration */
  all:         readonly THREE.Mesh[];
}

export function createWalls(manifest: RoomManifest): WallSet {
  const { width, depth: D, wallHeight: H, wallThick: T } = manifest.dimensions;
  const half  = width / 2;
  const color = manifest.wallColor;

  const north = makeWall(width + T * 2, H, T,  0,    -half, color, "wall-north");
  const west  = makeWall(T, H, width,          -half,  0,    color, "wall-west");
  const east  = makeWall(T, H, width,           half,  0,    color, "wall-east");

  // South wall — three panels forming a door frame.
  // Panels sit one wallThick behind the door to avoid z-fighting.
  const doorDef = manifest.doorId
    ? manifest.objects.find(
        (o): o is FurnitureObjectDef => o.id === manifest.doorId && o.type === "furniture",
      )
    : undefined;

  // Fallback door geometry if no doorId is specified (solid south wall)
  const doorX = doorDef?.position[0] ?? 0;
  const doorZ = doorDef?.position[2] ?? half;
  const doorW = doorDef?.size[0]     ?? 0;
  const doorH = doorDef?.size[1]     ?? H;

  const halfDoorW = doorW / 2;
  const panelW    = half - halfDoorW;
  const lintelH   = H - doorH;
  const wallZ     = doorZ - T;

  const semiMat = (name: string) =>
    new THREE.MeshLambertMaterial({ color, transparent: true, opacity: 0.7 });

  function makeSouthPanel(w: number, h: number, x: number, y: number, name: string): THREE.Mesh {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, T), semiMat(name));
    mesh.name          = name;
    mesh.position.set(x, y, wallZ);
    mesh.receiveShadow = true;
    return mesh;
  }

  const southLeft   = makeSouthPanel(panelW,        H,       -(halfDoorW + panelW / 2), H / 2,               "wall-south-left");
  const southRight  = makeSouthPanel(panelW,        H,        (halfDoorW + panelW / 2), H / 2,               "wall-south-right");
  const southLintel = makeSouthPanel(doorW + T * 2, lintelH,  doorX,                    doorH + lintelH / 2, "wall-south-lintel");

  const all = [north, west, east, southLeft, southRight, southLintel] as const;
  return { north, west, east, southLeft, southRight, southLintel, all };
}
