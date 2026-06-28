import * as THREE from "three";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { OBJECTS } from "../data/layout";

/**
 * A small leather journal sitting on top of the dresser.
 * Clicking it opens the quest journal panel and (for Explorer Bunny) unlocks the 📓 FAB.
 *
 * Shape: dark brown cover + cream page-edge strip + thin spine strip.
 * Child meshes (pages, spine) have no interactable flag — handleClick walks up
 * to the cover mesh which does.
 */
export function createJournal(onInteract: () => void): InteractableObject {
  const { position, size, color } = OBJECTS.journal;
  const [w, h, d] = size;

  // Cover (root interactable mesh)
  const cover = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color }),
  );
  cover.castShadow    = true;
  cover.receiveShadow = true;

  // Spine strip — slightly darker, on the left edge
  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, h + 0.002, d),
    new THREE.MeshLambertMaterial({ color: 0x3A1A08 }),
  );
  spine.position.set(-w / 2 + 0.009, 0, 0);
  cover.add(spine);

  // Page-edge block — cream, inset from the cover so it peeks out on three sides
  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.022, h - 0.004, d - 0.008),
    new THREE.MeshLambertMaterial({ color: 0xF5EFE0 }),
  );
  pages.position.set(0.005, 0, 0);
  cover.add(pages);

  // Sit flat on top of the dresser — position[1] is already the world-Y centre
  cover.position.set(position[0], position[1], position[2]);

  return new InteractableObject({
    name:         OBJECTS.journal.name,
    mesh:         cover,
    labelYOffset: h / 2 + 0.35,
    onInteract,
  });
}
