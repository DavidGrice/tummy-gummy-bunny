import * as THREE from "three";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { PickupItem } from "@/engine/objects/PickupItem";
import type { RoomManifest, RoomCallbacks, InteractionDef } from "./types";

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

interface LampParts {
  group:    THREE.Group;
  light:    THREE.PointLight;
  shadeMat: THREE.MeshLambertMaterial;
  isOn:     boolean;
}

function buildFloorLampMesh(): LampParts {
  const group = new THREE.Group();

  // Weighted base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.17, 0.05, 14),
    new THREE.MeshLambertMaterial({ color: 0x252525 }),
  );
  base.position.y  = 0.025;
  base.castShadow  = true;
  group.add(base);

  // Slim pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.022, 1.72, 8),
    new THREE.MeshLambertMaterial({ color: 0x303030 }),
  );
  pole.position.y = 0.05 + 0.86; // base top (0.05) + half pole
  pole.castShadow = true;
  group.add(pole);

  // Lampshade — open frustum, narrow at top, wide at bottom
  const shadeMat = new THREE.MeshLambertMaterial({
    color:    new THREE.Color(0x8C8880),
    emissive: new THREE.Color(0x000000),
    side:     THREE.DoubleSide,
  });
  const shade = new THREE.Mesh(
    new THREE.CylinderGeometry(0.09, 0.26, 0.30, 14, 1, true),
    shadeMat,
  );
  shade.position.y = 1.92; // pole top (1.77) + half shade height (0.15)
  group.add(shade);

  // Point light inside the shade opening — warm, short-range, off by default
  const light = new THREE.PointLight(0xFFE8A0, 0, 5.0, 1.8);
  light.position.y = 1.77;
  group.add(light);

  return { group, light, shadeMat, isOn: false };
}

/**
 * Registry of pickup model builders.
 * Add entries here as new collectable shapes are needed —
 * no scene or factory code changes required.
 */
const PICKUP_MESH_BUILDERS: Record<string, () => THREE.Object3D> = {
  key: buildKeyMesh,
};

// ─── Loader output ────────────────────────────────────────────────────────────

export interface LoadedObjects {
  interactables: InteractableObject[];
  pickupItems:   PickupItem[];
  /** Scene objects that aren't raycasted — add to scene but don't put in getCastTargets. */
  decoratives:   THREE.Object3D[];
}

/**
 * Reads a RoomManifest and builds all interactable objects, pickup items, and decoratives.
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
  const decoratives:   THREE.Object3D[]     = [];

  // Populated as "lamp" objects are built; read lazily when lamp-toggle fires.
  const lampRegistry = new Map<string, LampParts>();

  function resolveInteraction(def: InteractionDef): () => void {
    switch (def.kind) {
      case "inventory":
        return () => callbacks.onInventory(def.source);
      case "journal":
        return () => callbacks.onJournal();
      case "map":
        return () =>
          callbacks.onMap
            ? callbacks.onMap()
            : callbacks.onDialog("✨ A map of the house! It looks like there are more rooms to explore.");
      case "dialog":
        return () => callbacks.onDialog(def.message);
      case "dialog-template":
        return () => callbacks.onDialog(def.template.replace("{playerName}", callbacks.playerName));
      case "lamp-toggle": {
        const { lampId } = def;
        return () => {
          const lamp = lampRegistry.get(lampId);
          if (!lamp) return;
          lamp.isOn = !lamp.isOn;
          lamp.light.intensity = lamp.isOn ? 1.5 : 0;
          lamp.shadeMat.emissive.setHex(lamp.isOn ? 0xFFD080 : 0x000000);
          lamp.shadeMat.emissiveIntensity = lamp.isOn ? 0.55 : 0;
          lamp.shadeMat.color.setHex(lamp.isOn ? 0xC8A868 : 0x8C8880);
        };
      }
    }
  }

  for (const def of manifest.objects) {
    switch (def.type) {

      case "furniture": {
        const mesh = buildFurnitureMesh(def.size, def.color);
        mesh.position.set(...def.position);
        interactables.push(new InteractableObject({
          name:         def.label,
          mesh,
          labelYOffset: def.size[1] / 2 + 0.35,
          onInteract:   resolveInteraction(def.interaction),
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
          onInteract:   resolveInteraction(def.interaction),
        }));
        break;
      }

      case "lamp": {
        const parts = buildFloorLampMesh();
        parts.group.position.set(...def.position);
        lampRegistry.set(def.id, parts);
        decoratives.push(parts.group);
        break;
      }

      case "pickup": {
        if (callbacks.collectedIds?.has(def.itemId)) break;

        const builder = PICKUP_MESH_BUILDERS[def.modelType];
        if (!builder) {
          console.warn(`[ObjectLoader] Unknown pickup modelType: "${def.modelType}"`);
          break;
        }
        const obj = builder();
        obj.position.set(...def.position);
        if (def.rotation) obj.rotation.set(...def.rotation);
        pickupItems.push(new PickupItem(def.itemId, obj, callbacks.onPickup));
        break;
      }
    }
  }

  return { interactables, pickupItems, decoratives };
}
