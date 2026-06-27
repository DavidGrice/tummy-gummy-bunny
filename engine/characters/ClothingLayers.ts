import * as THREE from "three";
import type { EquippedClothing, InventoryItem } from "@/lib/inventory";

export interface ClothingLayers {
  outerwear: THREE.Mesh;
  top:       THREE.Mesh;
  bottom:    THREE.Mesh;
}

function makeLayer(w: number, h: number, d: number, y: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({
      color:               0xffffff,
      polygonOffset:       true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits:  -4,
    }),
  );
  mesh.position.y = y;
  mesh.visible    = false;
  mesh.castShadow = true;
  return mesh;
}

/**
 * Builds three clothing mesh children and attaches them to body.
 * Positions are in body-local space where y=0 is the capsule centre,
 * y=-0.5 is the feet end, y=+0.5 is the head end.
 */
export function buildClothingLayers(body: THREE.Mesh): ClothingLayers {
  const outerwear = makeLayer(0.58, 0.92, 0.58, -0.02); // wraps entire torso
  const top       = makeLayer(0.56, 0.40, 0.56,  0.08); // upper body only
  const bottom    = makeLayer(0.52, 0.38, 0.52, -0.24); // lower body / legs
  body.add(outerwear, top, bottom);
  return { outerwear, top, bottom };
}

/** Updates clothing mesh visibility and colour to match the current equipped state. */
export function applyEquipped(layers: ClothingLayers, equipped: EquippedClothing): void {
  applyLayer(layers.outerwear, equipped.outerwear);
  applyLayer(layers.top,       equipped.top);
  applyLayer(layers.bottom,    equipped.bottom);
}

function applyLayer(mesh: THREE.Mesh, item: InventoryItem | null): void {
  if (item) {
    (mesh.material as THREE.MeshLambertMaterial).color.setHex(item.colorHex);
    mesh.visible = true;
  } else {
    mesh.visible = false;
  }
}
