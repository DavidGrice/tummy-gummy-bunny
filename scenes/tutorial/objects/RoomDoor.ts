import * as THREE from "three";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { OBJECTS } from "../data/layout";

export function createRoomDoor(onInteract: () => void): InteractableObject {
  const { position, size, color } = OBJECTS.door;
  const [w, h, d] = size;

  // Root mesh — the raycaster hits this; children are purely decorative
  const frameGeo = new THREE.BoxGeometry(w + 0.18, h + 0.1, d);
  const frameMat = new THREE.MeshLambertMaterial({ color: 0x3A2510 });
  const frame    = new THREE.Mesh(frameGeo, frameMat);
  frame.position.set(position[0], (h + 0.1) / 2, position[2]);
  frame.castShadow    = true;
  frame.receiveShadow = true;

  // Door panel — child of frame, decorative only
  const panelGeo = new THREE.BoxGeometry(w - 0.06, h - 0.06, d * 0.6);
  const panelMat = new THREE.MeshLambertMaterial({ color });
  const panel    = new THREE.Mesh(panelGeo, panelMat);
  panel.position.set(0, 0, 0);
  frame.add(panel);

  // Gold knob — child of panel
  const knobGeo = new THREE.SphereGeometry(0.06, 8, 8);
  const knobMat = new THREE.MeshLambertMaterial({ color: 0xD4AF37 });
  const knob    = new THREE.Mesh(knobGeo, knobMat);
  knob.position.set(w * 0.32, 0, d * 0.4);
  panel.add(knob);

  return new InteractableObject({
    name:         OBJECTS.door.name,
    mesh:         frame,
    labelYOffset: (h + 0.1) / 2 + 0.4,
    onInteract,
  });
}
