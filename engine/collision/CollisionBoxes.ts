import * as THREE from "three";
import type { RoomManifest } from "@/engine/loaders/types";

export interface CollisionBox {
  minX: number; maxX: number;
  minZ: number; maxZ: number;
}

// Half the bunny's body width + a small comfort gap so the bunny never looks like it's touching
const BUNNY_PADDING = 0.38;
// Floor lamp pole radius
const LAMP_RADIUS   = 0.28;

/**
 * Derives 2D AABB collision boxes from a room manifest.
 * Excluded: doors (scene-change targets), pickup items, books on elevated surfaces,
 * and objects thinner than 15 cm in both axes (light switches, picture frames on walls).
 */
export function buildCollisionBoxes(manifest: RoomManifest): CollisionBox[] {
  const boxes: CollisionBox[] = [];

  for (const obj of manifest.objects) {
    if (obj.type === "furniture") {
      // Doors must remain walkable so the bunny can reach them
      if (obj.interaction.kind === "scene-change") continue;
      const [w, , d] = obj.size;
      // Skip genuinely tiny objects — light switches, thin wall-mounted frames etc.
      if (w < 0.15 && d < 0.15) continue;
      const [x, , z] = obj.position;
      boxes.push({
        minX: x - w / 2 - BUNNY_PADDING,
        maxX: x + w / 2 + BUNNY_PADDING,
        minZ: z - d / 2 - BUNNY_PADDING,
        maxZ: z + d / 2 + BUNNY_PADDING,
      });
    } else if (obj.type === "lamp") {
      const [x, , z] = obj.position;
      const r = LAMP_RADIUS + BUNNY_PADDING;
      boxes.push({ minX: x - r, maxX: x + r, minZ: z - r, maxZ: z + r });
    }
    // pickup, book: no floor collision needed (books sit on elevated surfaces)
  }

  return boxes;
}

/**
 * Resolves `point` so it does not overlap any collision box.
 * When inside a box the point is pushed to the nearest box face.
 * Multiple passes handle clusters of adjacent boxes.
 */
export function resolveDestination(
  point:  THREE.Vector3,
  boxes:  CollisionBox[],
): THREE.Vector3 {
  const p = point.clone();

  for (let pass = 0; pass < 4; pass++) {
    let clean = true;
    for (const box of boxes) {
      if (p.x > box.minX && p.x < box.maxX && p.z > box.minZ && p.z < box.maxZ) {
        const dLeft  = p.x - box.minX;
        const dRight = box.maxX - p.x;
        const dFront = p.z - box.minZ;
        const dBack  = box.maxZ  - p.z;
        const minD   = Math.min(dLeft, dRight, dFront, dBack);
        if      (minD === dLeft)  p.x = box.minX;
        else if (minD === dRight) p.x = box.maxX;
        else if (minD === dFront) p.z = box.minZ;
        else                      p.z = box.maxZ;
        clean = false;
      }
    }
    if (clean) break;
  }

  return p;
}

/**
 * Computes a stand position in front of an interactable mesh, on the side
 * closest to the bunny's current position.
 *
 * Uses the mesh's actual bounding box so the distance automatically accounts
 * for object size — large objects (like the bed) get a proportionally further
 * stand point than small ones (like the dresser).
 */
export function computeStandPos(
  mesh:         THREE.Object3D,
  bunnyPos:     THREE.Vector3,
  collisionBoxes: CollisionBox[],
): THREE.Vector3 {
  const objXZ  = new THREE.Vector3(mesh.position.x, 0, mesh.position.z);
  const bunXZ  = new THREE.Vector3(bunnyPos.x,       0, bunnyPos.z);

  // Direction from object center toward bunny (the side to stand on)
  const fromObj = bunXZ.clone().sub(objXZ);
  if (fromObj.length() < 0.001) fromObj.set(0, 0, 1);
  fromObj.normalize();

  // True mesh bounds so large objects get proportionally further stand points
  const box3  = new THREE.Box3().setFromObject(mesh);
  const halfW = (box3.max.x - box3.min.x) / 2;
  const halfD = (box3.max.z - box3.min.z) / 2;

  // Extent of the mesh surface in the approach direction
  const halfExtent = Math.abs(fromObj.x) * halfW + Math.abs(fromObj.z) * halfD;

  // Stand outside the mesh surface by a small approach offset
  const standDist = Math.max(halfExtent + BUNNY_PADDING + 0.1, 0.55);

  const standPos = objXZ.clone().addScaledVector(fromObj, standDist);
  standPos.y = bunnyPos.y;

  // Push out of any other collision box the ideal stand point might overlap
  return resolveDestination(standPos, collisionBoxes);
}
