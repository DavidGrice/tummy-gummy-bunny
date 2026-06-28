import * as THREE from "three";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { PickupItem } from "@/engine/objects/PickupItem";
import type { RoomManifest, ObjectDef, RoomCallbacks, InteractionDef } from "./types";

// ─── Mesh builders ────────────────────────────────────────────────────────────
// Each builder returns a raw, unpositioned mesh/group.
// Position and rotation are applied by the loader from manifest data.

function buildFurnitureMesh(size: [number, number, number], color: number): THREE.Mesh {
  const mesh = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshLambertMaterial({ color }),
  );
  mesh.castShadow    = true;
  mesh.receiveShadow = true;
  return mesh;
}

function buildBookMesh(size: [number, number, number], color: number): THREE.Mesh {
  const [w, h, d] = size;

  const cover = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, d),
    new THREE.MeshLambertMaterial({ color }),
  );
  cover.castShadow    = true;
  cover.receiveShadow = true;

  // Darker spine strip on the left edge
  const spine = new THREE.Mesh(
    new THREE.BoxGeometry(0.018, h + 0.002, d),
    new THREE.MeshLambertMaterial({ color: 0x3A1A08 }),
  );
  spine.position.set(-w / 2 + 0.009, 0, 0);
  cover.add(spine);

  // Cream page-edge block peeking out on three sides
  const pages = new THREE.Mesh(
    new THREE.BoxGeometry(w - 0.022, h - 0.004, d - 0.008),
    new THREE.MeshLambertMaterial({ color: 0xF5EFE0 }),
  );
  pages.position.set(0.005, 0, 0);
  cover.add(pages);

  return cover;
}

function buildKeyMesh(): THREE.Group {
  const mat = new THREE.MeshStandardMaterial({
    color:             0xFFD700,
    metalness:         0.85,
    roughness:         0.15,
    emissive:          new THREE.Color(0xFFD700),
    emissiveIntensity: 0.3,
  });

  const bow   = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.016, 8, 14), mat);
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.016, 0.016), mat);
  shaft.position.set(0.10, 0, 0);

  const toothGeo = new THREE.BoxGeometry(0.025, 0.038, 0.016);
  const tooth1   = new THREE.Mesh(toothGeo, mat);
  tooth1.position.set(0.14, -0.027, 0);
  const tooth2   = new THREE.Mesh(toothGeo, mat);
  tooth2.position.set(0.175, -0.027, 0);

  const group = new THREE.Group();
  group.add(bow, shaft, tooth1, tooth2);
  return group;
}

/**
 * Registry of pickup model builders.
 * Add entries here as new collectable shapes are needed —
 * no scene or factory code changes required.
 */
const PICKUP_MESH_BUILDERS: Record<string, () => THREE.Object3D> = {
  key: buildKeyMesh,
};

// ─── Interaction resolver ─────────────────────────────────────────────────────

function resolveInteraction(def: InteractionDef, cb: RoomCallbacks): () => void {
  switch (def.kind) {
    case "inventory":
      return () => cb.onInventory(def.source);
    case "journal":
      return () => cb.onJournal();
    case "dialog":
      return () => cb.onDialog(def.message);
    case "dialog-template":
      return () => cb.onDialog(def.template.replace("{playerName}", cb.playerName));
  }
}

// ─── Loader output ────────────────────────────────────────────────────────────

export interface LoadedObjects {
  interactables: InteractableObject[];
  pickupItems:   PickupItem[];
}

/**
 * Reads a RoomManifest and builds all interactable objects and pickup items.
 *
 * To add a new room object: add an entry to the manifest.
 * To add a new pickup shape: add an entry to PICKUP_MESH_BUILDERS above.
 * No factory files, no per-object imports in scene code.
 */
export function loadRoomObjects(
  manifest:  RoomManifest,
  callbacks: RoomCallbacks,
): LoadedObjects {
  const interactables: InteractableObject[] = [];
  const pickupItems:   PickupItem[]         = [];

  for (const def of manifest.objects) {
    switch (def.type) {

      case "furniture": {
        const mesh = buildFurnitureMesh(def.size, def.color);
        mesh.position.set(...def.position);
        interactables.push(new InteractableObject({
          name:         def.label,
          mesh,
          labelYOffset: def.size[1] / 2 + 0.35,
          onInteract:   resolveInteraction(def.interaction, callbacks),
        }));
        break;
      }

      case "book": {
        const mesh = buildBookMesh(def.size, def.color);
        mesh.position.set(...def.position);
        interactables.push(new InteractableObject({
          name:         def.label,
          mesh,
          labelYOffset: def.size[1] / 2 + 0.35,
          onInteract:   resolveInteraction(def.interaction, callbacks),
        }));
        break;
      }

      case "pickup": {
        const builder = PICKUP_MESH_BUILDERS[def.modelType];
        if (!builder) {
          console.warn(`[ObjectLoader] Unknown pickup modelType: "${def.modelType}"`);
          break;
        }
        const obj = builder();
        obj.position.set(...def.position);
        if (def.rotation) {
          obj.rotation.set(def.rotation[0], def.rotation[1], def.rotation[2]);
        }
        pickupItems.push(new PickupItem(def.itemId, obj, callbacks.onPickup));
        break;
      }
    }
  }

  return { interactables, pickupItems };
}
