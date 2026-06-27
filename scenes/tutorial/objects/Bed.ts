import * as THREE from "three";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { OBJECTS } from "../data/layout";

export function createBed(onInteract: () => void): InteractableObject {
  const { position, size, color } = OBJECTS.bed;
  const [w, h, d] = size;

  // Frame — root interactable (raycaster target)
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color })
  );
  frame.position.set(position[0], h / 2, position[2]);
  frame.castShadow    = true;
  frame.receiveShadow = true;

  // Mattress — cream padded top
  const mattress = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.1, 0.18, d - 0.08),
    new THREE.MeshLambertMaterial({ color: 0xF5EFE0 })
  );
  mattress.position.set(0, h / 2 + 0.09, 0); // local: sits on top of frame
  mattress.castShadow    = true;
  mattress.receiveShadow = true;
  frame.add(mattress);

  // Pillow — at the head end (toward north wall, local -z)
  const pillow = new THREE.Mesh(
    new THREE.BoxGeometry(w * 0.5, 0.1, 0.32),
    new THREE.MeshLambertMaterial({ color: 0xFFFAF0 })
  );
  // local: on mattress top, toward head of bed
  pillow.position.set(0, h / 2 + 0.09 + 0.14, -(d / 2 - 0.28));
  pillow.castShadow    = true;
  pillow.receiveShadow = true;
  frame.add(pillow);

  return new InteractableObject({
    name:         OBJECTS.bed.name,
    mesh:         frame,
    labelYOffset: h / 2 + 0.35,
    onInteract,
  });
}
