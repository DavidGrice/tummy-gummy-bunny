import * as THREE from "three";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { OBJECTS } from "../data/layout";

export function createDresser(onInteract: () => void): InteractableObject {
  const { position, size, color } = OBJECTS.dresser;
  const [w, h, d] = size;

  const geo  = new THREE.BoxGeometry(w, h, d);
  const mat  = new THREE.MeshLambertMaterial({ color });
  const mesh = new THREE.Mesh(geo, mat);

  mesh.position.set(position[0], h / 2, position[2]);
  mesh.castShadow    = true;
  mesh.receiveShadow = true;

  // Mirror on top of dresser (flat box)
  const mirrorGeo = new THREE.BoxGeometry(w * 0.7, 0.08, d * 0.6);
  const mirrorMat = new THREE.MeshLambertMaterial({ color: 0x9ECFE8 }); // pale blue
  const mirror    = new THREE.Mesh(mirrorGeo, mirrorMat);
  mirror.position.set(0, h / 2 + 0.04, 0); // local: sit on top of dresser
  mesh.add(mirror);

  return new InteractableObject({
    name:         OBJECTS.dresser.name,
    mesh,
    labelYOffset: h / 2 + 0.35,
    onInteract,
  });
}
