import * as THREE from "three";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { PickupItem } from "@/engine/objects/PickupItem";
import { loadFittedGLB } from "@/models/loaders/loadFittedGLB";
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

function buildWallLampMesh(facing: "north" | "south" | "east" | "west" = "south"): LampParts {
  const dir = {
    north: new THREE.Vector3( 0, 0,-1),
    south: new THREE.Vector3( 0, 0, 1),
    east:  new THREE.Vector3( 1, 0, 0),
    west:  new THREE.Vector3(-1, 0, 0),
  }[facing];

  const ARM_LEN = 0.28;
  const group   = new THREE.Group();

  // Brown rectangular mount plate flush to the wall (behind group origin)
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.20, 0.04),
    new THREE.MeshLambertMaterial({ color: 0x3A2010 }),
  );
  plate.position.copy(dir.clone().multiplyScalar(-0.02));
  plate.castShadow = true;
  group.add(plate);

  // Brown horizontal arm extending into the room
  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, ARM_LEN, 8),
    new THREE.MeshLambertMaterial({ color: 0x5C3520 }),
  );
  // Rotate cylinder's Y-axis to align with facing direction
  arm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.clone());
  arm.position.copy(dir.clone().multiplyScalar(ARM_LEN / 2));
  arm.castShadow = true;
  group.add(arm);

  // Gold lampshade sitting on top of the arm tip
  const shadeMat = new THREE.MeshLambertMaterial({
    color:             new THREE.Color(0xC8A868),
    emissive:          new THREE.Color(0xFFD080),
    emissiveIntensity: 0.5,
    side:              THREE.DoubleSide,
  });
  const shade = new THREE.Mesh(
    // Narrow at top, wide at bottom (traditional shade shape)
    new THREE.CylinderGeometry(0.055, 0.14, 0.18, 12, 1, true),
    shadeMat,
  );
  const tipPos = dir.clone().multiplyScalar(ARM_LEN);
  shade.position.set(tipPos.x, 0.11, tipPos.z); // 0.11 = shade half-height + small gap
  shade.castShadow = true;
  group.add(shade);

  // Small emissive bulb visible through the shade opening
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.038, 8, 6),
    new THREE.MeshStandardMaterial({
      color:             0xFFEE88,
      emissive:          new THREE.Color(0xFFEE88),
      emissiveIntensity: 1.0,
    }),
  );
  bulb.position.set(tipPos.x, 0.02, tipPos.z);
  group.add(bulb);

  // Warm point light — wall sconces start ON
  const light = new THREE.PointLight(0xFFE090, 1.4, 4.5, 1.5);
  light.position.set(tipPos.x, 0.06, tipPos.z);
  group.add(light);

  return { group, light, shadeMat, isOn: true };
}

/**
 * Registry of pickup model builders.
 * Add entries here as new collectable shapes are needed —
 * no scene or factory code changes required.
 */
const PICKUP_MESH_BUILDERS: Record<string, () => THREE.Object3D> = {
  key: buildKeyMesh,
};

/** Invisible but raycastable box used as the interaction/hover target for a GLB visual. */
function buildGLBHitBox(
  size:        [number, number, number],
  position:    [number, number, number],
  visualModel: THREE.Object3D | null,
): THREE.Mesh {
  const hitBox = new THREE.Mesh(
    new THREE.BoxGeometry(...size),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 }),
  );
  hitBox.position.set(...position);
  if (visualModel) hitBox.userData.visualModel = visualModel;
  return hitBox;
}

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
export async function loadRoomObjects(
  manifest:  RoomManifest,
  callbacks: RoomCallbacks,
): Promise<LoadedObjects> {
  const interactables: InteractableObject[] = [];
  const pickupItems:   PickupItem[]         = [];
  const decoratives:   THREE.Object3D[]     = [];

  // Populated as "lamp" objects are built; read lazily when lamp-toggle fires.
  const lampRegistry = new Map<string, LampParts>();

  function resolveInteraction(def: InteractionDef, flagKey?: string): () => void {
    const action = ((): () => void => {
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
        case "scene-change":
          return () => callbacks.onSceneChange?.(def.targetRoomId);
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
    })();

    if (!flagKey) return action;
    return () => {
      action();
      try { localStorage.setItem(flagKey, "true"); } catch { /* SSR / storage unavailable */ }
      callbacks.onFlag?.(flagKey);
    };
  }

  for (const def of manifest.objects) {
    switch (def.type) {

      case "furniture": {
        if (def.modelPath) {
          const model = await loadFittedGLB({
            id:                def.id,
            modelPath:         def.modelPath,
            position:          def.position,
            fitSize:           def.size,
            fitPlane:          "xz",
            rotation:          def.modelRotation,
            scale:             def.modelScale,
            tintColor:         def.color,
            materialOverrides: def.materialOverrides,
          });
          if (model) decoratives.push(model);
          const hitBox = buildGLBHitBox(def.size, def.position, model);
          interactables.push(new InteractableObject({
            name:         def.label,
            mesh:         hitBox,
            labelYOffset: def.size[1] / 2 + 0.35,
            onInteract:   resolveInteraction(def.interaction, def.flagKey),
          }));
        } else {
          const mesh = buildFurnitureMesh(def.size, def.color);
          mesh.position.set(...def.position);
          interactables.push(new InteractableObject({
            name:         def.label,
            mesh,
            labelYOffset: def.size[1] / 2 + 0.35,
            onInteract:   resolveInteraction(def.interaction, def.flagKey),
          }));
        }
        break;
      }

      case "book": {
        if (def.modelPath) {
          const model = await loadFittedGLB({
            id:                def.id,
            modelPath:         def.modelPath,
            position:          def.position,
            fitSize:           def.size,
            fitPlane:          "xz",
            rotation:          def.modelRotation,
            scale:             def.modelScale,
            tintColor:         def.color,
            materialOverrides: def.materialOverrides,
          });
          if (model) decoratives.push(model);
          const hitBox = buildGLBHitBox(def.size, def.position, model);
          interactables.push(new InteractableObject({
            name:         def.label,
            mesh:         hitBox,
            labelYOffset: def.size[1] / 2 + 0.35,
            onInteract:   resolveInteraction(def.interaction, def.flagKey),
          }));
        } else {
          const mesh = buildBookMesh(def.size, def.color);
          mesh.position.set(...def.position);
          interactables.push(new InteractableObject({
            name:         def.label,
            mesh,
            labelYOffset: def.size[1] / 2 + 0.35,
            onInteract:   resolveInteraction(def.interaction, def.flagKey),
          }));
        }
        break;
      }

      case "lamp": {
        const parts = buildFloorLampMesh();
        parts.group.position.set(...def.position);
        lampRegistry.set(def.id, parts);
        decoratives.push(parts.group);
        break;
      }

      case "wallLamp": {
        const parts = buildWallLampMesh(def.facing ?? "south");
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
