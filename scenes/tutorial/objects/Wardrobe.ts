import * as THREE from "three";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { OBJECTS } from "../data/layout";

export function createWardrobe(onInteract: () => void): InteractableObject {
  const { position, size, color } = OBJECTS.wardrobe;
  const [w, h, d] = size;

  const geo  = new THREE.BoxGeometry(w, h, d);
  const mat  = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(position[0], h / 2, position[2]);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;

  return new InteractableObject({
    name:         OBJECTS.wardrobe.name,
    mesh,
    labelYOffset: h / 2 + 0.35,
    onInteract,
  });
}
