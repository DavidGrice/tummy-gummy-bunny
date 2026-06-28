import * as THREE from "three";
import { BaseScene } from "@/scenes/BaseScene";
import { MrBunny } from "@/characters/MrBunny";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { createFloor } from "./objects/Floor";
import { createWalls } from "./objects/Walls";
import { createWindows } from "./objects/Windows";
import type { InventorySource, PickupFn, JournalFn } from "./data/interactions";
import { PickupItem } from "@/engine/objects/PickupItem";
import { loadRoomObjects } from "@/engine/loaders/ObjectLoader";
import { TUTORIAL_ROOM } from "./data/room";
import type { EquippedClothing } from "@/lib/inventory";

export class TutorialScene extends BaseScene {
  readonly id    = "tutorial";
  readonly label = "Mr. Bunny's Room";

  private mrBunny!:      MrBunny;
  private interactables: InteractableObject[] = [];
  private pickupItems:   PickupItem[]         = [];
  private floor!:        THREE.Mesh;
  private walls:         THREE.Mesh[]   = [];
  private windows:       THREE.Group[]  = [];
  private lights:        THREE.Light[]  = [];

  private progressFn:  (p: number)            => void = () => {};
  private dialogFn:    (m: string)            => void = () => {};
  private inventoryFn: (src: InventorySource) => void = () => {};
  private pickupFn:    PickupFn                       = () => {};
  private journalFn:   JournalFn                      = () => {};
  private playerName = "Bunny";

  onProgress(fn: (p: number)             => void): void { this.progressFn  = fn; }
  onDialog(fn:   (m: string)             => void): void { this.dialogFn    = fn; }
  onInventory(fn: (src: InventorySource) => void): void { this.inventoryFn = fn; }
  onPickup(fn:    PickupFn):                        void { this.pickupFn    = fn; }
  onJournal(fn:   JournalFn):                       void { this.journalFn   = fn; }
  setPlayerName(name: string):                      void { this.playerName  = name; }

  /** Pushes the player's equipped clothing directly onto MrBunny's mesh. */
  setCharacterEquipped(equipped: EquippedClothing): void {
    this.mrBunny?.setEquipped(equipped);
  }

  async setup(scene: THREE.Scene): Promise<void> {
    scene.background = new THREE.Color(0xE8D0A8);

    this.progressFn(10);
    this.setupLighting(scene);

    this.progressFn(25);
    this.floor = createFloor();
    scene.add(this.floor);

    this.progressFn(40);
    this.walls = createWalls();
    this.walls.forEach((w) => scene.add(w));

    this.progressFn(55);
    this.windows = createWindows();
    this.windows.forEach((w) => scene.add(w));

    this.progressFn(65);
    const loaded = loadRoomObjects(TUTORIAL_ROOM, {
      onDialog:    this.dialogFn,
      onInventory: this.inventoryFn,
      onJournal:   this.journalFn,
      onPickup:    this.pickupFn,
      playerName:  this.playerName,
    });
    this.interactables = loaded.interactables;
    this.pickupItems   = loaded.pickupItems;
    this.interactables.forEach((obj)  => obj.addToScene(scene));

    this.progressFn(78);
    this.pickupItems.forEach((item) => item.addToScene(scene));

    this.progressFn(85);
    this.mrBunny = new MrBunny();
    this.mrBunny.addToScene(scene);

    this.progressFn(100);
  }

  update(delta: number): void {
    this.mrBunny?.update(delta);
    for (const item of this.pickupItems) item.update(delta);
  }

  getCastTargets(): THREE.Object3D[] {
    const pickupMeshes: THREE.Mesh[] = [];
    for (const item of this.pickupItems) {
      if (!item.isPickedUp) pickupMeshes.push(...item.getCastMeshes());
    }
    return [this.floor, ...this.interactables.map((i) => i.mesh), ...pickupMeshes];
  }

  onHoverChange(obj: THREE.Object3D | null): void {
    for (const interactable of this.interactables) {
      interactable.setHovered(obj !== null && interactable.mesh === obj);
    }
  }

  handleClick(hit: THREE.Intersection): void {
    if (this.mrBunny.isMoving) return;

    let obj: THREE.Object3D | null = hit.object;
    while (obj && !obj.userData.interactable && !obj.userData.isFloor) {
      obj = obj.parent;
    }

    if (obj?.userData.isFloor) {
      const target = hit.point.clone();
      const { min, max } = TUTORIAL_ROOM.bounds;
      target.x = THREE.MathUtils.clamp(target.x, min, max);
      target.z = THREE.MathUtils.clamp(target.z, min, max);
      this.mrBunny.walkTo(target);

    } else if (obj?.userData.interactable) {
      const objPos   = obj.position.clone();
      const toCenter = new THREE.Vector3().sub(objPos);
      toCenter.y = 0;
      if (toCenter.length() > 0) toCenter.normalize(); else toCenter.set(0, 0, 1);

      const standPos = objPos.clone().addScaledVector(toCenter, 1.0);
      standPos.y = this.mrBunny.mesh.position.y;

      this.mrBunny.walkTo(standPos, () => {
        obj!.userData.onInteract?.();
      });
    }
  }

  setupCamera(camera: THREE.PerspectiveCamera): void {
    camera.position.set(0, 8, 8);
    camera.lookAt(0, 0, 0);
  }

  dispose(): void {
    this.floor.geometry.dispose();
    (this.floor.material as THREE.Material).dispose();

    this.walls.forEach((w) => {
      w.geometry.dispose();
      (w.material as THREE.Material).dispose();
    });

    this.windows.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (Array.isArray(child.material)
            ? child.material
            : [child.material as THREE.Material]
          ).forEach((m) => m.dispose());
        }
      });
    });

    this.interactables.forEach((i) => i.dispose());
    this.pickupItems.forEach((i) => i.dispose());
    this.mrBunny?.dispose();
    this.lights.forEach((l) => l.dispose());
  }

  private setupLighting(scene: THREE.Scene): void {
    const ambient = new THREE.AmbientLight(0xFFF5E6, 0.7);

    const sun = new THREE.DirectionalLight(0xFFD080, 1.4);
    sun.position.set(4, 10, 6);
    sun.castShadow             = true;
    sun.shadow.mapSize.width   = 1024;
    sun.shadow.mapSize.height  = 1024;
    sun.shadow.camera.near     = 0.5;
    sun.shadow.camera.far      = 30;
    sun.shadow.camera.left     = -6;
    sun.shadow.camera.right    = 6;
    sun.shadow.camera.top      = 6;
    sun.shadow.camera.bottom   = -6;

    scene.add(ambient, sun);
    this.lights = [ambient, sun];
  }
}
