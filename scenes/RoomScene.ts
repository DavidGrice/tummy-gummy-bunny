import * as THREE from "three";
import { BaseScene } from "@/scenes/BaseScene";
import { MrBunny } from "@/characters/MrBunny";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { PickupItem } from "@/engine/objects/PickupItem";
import { createFloor } from "@/engine/builders/Floor";
import { createWalls, type WallSet } from "@/engine/builders/Walls";
import { createWindows } from "@/engine/builders/Windows";
import { loadRoomObjects } from "@/engine/loaders/ObjectLoader";
import { buildCollisionBoxes, resolveDestination, resolveWalkPath, computeStandPos, type CollisionBox } from "@/engine/collision/CollisionBoxes";
import type { RoomManifest, RoomCallbacks, InventorySource } from "@/engine/loaders/types";
import type { EquippedClothing } from "@/lib/inventory";

export class RoomScene extends BaseScene {
  readonly id:    string;
  readonly label: string;

  private readonly manifest: RoomManifest;

  private mrBunny!:      MrBunny;
  private interactables: InteractableObject[] = [];
  private pickupItems:   PickupItem[]         = [];
  private decoratives:   THREE.Object3D[]     = [];
  private floor!:         THREE.Mesh;
  private wallSet!:       WallSet;
  private windows:        THREE.Group[]        = [];
  private lights:         THREE.Light[]        = [];
  private collisionBoxes: CollisionBox[]       = [];

  // ── Callbacks (set before setup() is called) ─────────────────────────────
  private progressFn:    (p: number)           => void = () => {};
  private dialogFn:      (m: string)           => void = () => {};
  private inventoryFn:   (src: InventorySource) => void = () => {};
  private pickupFn:      (id: string)          => void = () => {};
  private journalFn:     ()                    => void = () => {};
  private sceneChangeFn: (id: string)          => void = () => {};
  private mapFn:         ()                    => void = () => {};
  private flagFn:        (key: string)         => void = () => {};
  private playerName = "Bunny";

  // ── Follow-cam state (mobile only) ───────────────────────────────────────
  private followCam:          THREE.PerspectiveCamera | null = null;
  private readonly _camTarget = new THREE.Vector3();

  /** Room the player just came from — used to spawn near the entry door. */
  private readonly fromRoomId?: string;
  /** Resolved spawn position — set in setup(), used in setupCamera(). */
  private spawnPosition: [number, number] = [0, 0];

  constructor(manifest: RoomManifest, fromRoomId?: string) {
    super();
    this.manifest   = manifest;
    this.fromRoomId = fromRoomId;
    this.id         = manifest.id;
    this.label      = manifest.id;
  }

  // ── Callback setters ──────────────────────────────────────────────────────
  onProgress(fn: (p: number)            => void): void { this.progressFn    = fn; }
  onDialog(fn:   (m: string)            => void): void { this.dialogFn      = fn; }
  onInventory(fn: (src: InventorySource) => void): void { this.inventoryFn  = fn; }
  onPickup(fn:    (id: string)          => void): void { this.pickupFn      = fn; }
  onJournal(fn:   ()                    => void): void { this.journalFn     = fn; }
  onSceneChange(fn: (id: string)        => void): void { this.sceneChangeFn = fn; }
  onMap(fn:         ()                   => void): void { this.mapFn         = fn; }
  onFlag(fn:        (key: string)        => void): void { this.flagFn        = fn; }
  setPlayerName(name: string):                    void { this.playerName    = name; }

  setCharacterEquipped(equipped: EquippedClothing): void {
    this.mrBunny?.setEquipped(equipped);
  }

  // ── Setup ─────────────────────────────────────────────────────────────────
  async setup(scene: THREE.Scene): Promise<void> {
    scene.background = new THREE.Color(this.manifest.background);

    this.progressFn(10);
    this.setupLighting(scene);

    this.progressFn(25);
    this.floor = createFloor(this.manifest);
    scene.add(this.floor);

    this.progressFn(40);
    this.wallSet = createWalls(this.manifest);
    for (const name of this.manifest.hiddenWalls ?? []) {
      this.wallSet[name].visible = false;
    }
    this.wallSet.all.forEach((w) => scene.add(w));

    this.progressFn(55);
    this.windows = createWindows(this.manifest);
    this.windows.forEach((w) => scene.add(w));

    this.progressFn(65);
    const callbacks: RoomCallbacks = {
      onDialog:      this.dialogFn,
      onInventory:   this.inventoryFn,
      onJournal:     this.journalFn,
      onPickup:      this.pickupFn,
      onSceneChange: this.sceneChangeFn,
      onMap:         this.mapFn,
      onFlag:        this.flagFn,
      playerName:    this.playerName,
      collectedIds:  this.loadCollectedIds(),
    };
    const loaded = await loadRoomObjects(this.manifest, callbacks);
    this.interactables = loaded.interactables;
    this.pickupItems   = loaded.pickupItems;
    this.decoratives   = loaded.decoratives;
    this.interactables.forEach((obj) => obj.addToScene(scene));
    this.decoratives.forEach((obj)   => scene.add(obj));

    this.collisionBoxes = buildCollisionBoxes(this.manifest);

    this.progressFn(78);
    this.pickupItems.forEach((item) => item.addToScene(scene));

    this.progressFn(85);
    this.spawnPosition = this.computeSpawnPosition();
    this.mrBunny = new MrBunny(this.spawnPosition);
    this.mrBunny.addToScene(scene);

    this.progressFn(100);
  }

  // ── Update ────────────────────────────────────────────────────────────────
  update(delta: number): void {
    this.mrBunny?.update(delta);
    for (const item of this.pickupItems) item.update(delta);
    this.updateFollowCam(delta);
  }

  private updateFollowCam(delta: number): void {
    if (!this.followCam || !this.mrBunny) return;
    const char = this.mrBunny.mesh.position;
    this._camTarget.set(char.x, 3.5, char.z + 5);
    this.followCam.position.lerp(this._camTarget, Math.min(1, delta * 10));
    this.followCam.lookAt(char.x, char.y + 0.5, char.z);
  }

  // ── Input ─────────────────────────────────────────────────────────────────
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
      const { min, max, minX, maxX, minZ, maxZ } = this.manifest.bounds;
      target.x = THREE.MathUtils.clamp(target.x, minX ?? min, maxX ?? max);
      target.z = THREE.MathUtils.clamp(target.z, minZ ?? min, maxZ ?? max);
      // 1) push destination out of any box it lands inside
      const dest = resolveDestination(target, this.collisionBoxes);
      // Safety: re-clamp after resolution (clipped boxes prevent this in normal cases,
      // but keeps the bunny inside the room if any edge case slips through)
      dest.x = THREE.MathUtils.clamp(dest.x, minX ?? min, maxX ?? max);
      dest.z = THREE.MathUtils.clamp(dest.z, minZ ?? min, maxZ ?? max);
      // 2) if the straight-line path still crosses a box, stop at the box edge
      const safe = resolveWalkPath(this.mrBunny.mesh.position, dest, this.collisionBoxes);
      this.mrBunny.walkTo(safe);

    } else if (obj?.userData.interactable) {
      // Compute a stand position on the bunny's side of the object, just outside its surface
      const standPos = computeStandPos(obj, this.mrBunny.mesh.position, this.collisionBoxes);
      // Resolve path to avoid clipping through other furniture on the way to the standPos
      const safeStand = resolveWalkPath(this.mrBunny.mesh.position, standPos, this.collisionBoxes);
      this.mrBunny.walkTo(safeStand, () => {
        obj!.userData.onInteract?.();
      });
    }
  }

  // ── Camera ────────────────────────────────────────────────────────────────
  setupCamera(camera: THREE.PerspectiveCamera): void {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 640;
    if (isMobile) {
      this.followCam = camera;
      camera.fov = 60;
      camera.updateProjectionMatrix();

      const [sx, sz] = this.spawnPosition;
      camera.position.set(sx, 3.5, sz + 5);
      camera.lookAt(sx, 0.5, sz);

      for (const obj of this.interactables) obj.setLabelAlwaysVisible(true);
    } else {
      camera.position.set(0, 8, 8);
      camera.lookAt(0, 0, 0);
    }
  }

  // ── Dispose ───────────────────────────────────────────────────────────────
  dispose(): void {
    this.floor.geometry.dispose();
    (this.floor.material as THREE.Material).dispose();

    this.wallSet.all.forEach((w) => {
      w.geometry.dispose();
      (w.material as THREE.Material).dispose();
    });

    this.windows.forEach((group) => {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (Array.isArray(child.material) ? child.material : [child.material as THREE.Material])
            .forEach((m) => m.dispose());
        }
      });
    });

    this.interactables.forEach((i) => i.dispose());
    this.pickupItems.forEach((i) => i.dispose());
    this.decoratives.forEach((obj) => {
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
          (Array.isArray(child.material) ? child.material : [child.material as THREE.Material])
            .forEach((m) => m.dispose());
        }
        if (child instanceof THREE.Light) child.dispose();
      });
    });

    this.mrBunny?.dispose();
    this.lights.forEach((l) => l.dispose());
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  /**
   * If we know which room the player came from, find the door in this room that
   * leads back there and spawn the bunny just inside it. Falls back to bunnyStart.
   */
  private computeSpawnPosition(): [number, number] {
    if (!this.fromRoomId) return this.manifest.bunnyStart;

    const entryDoor = this.manifest.objects.find(
      (o) =>
        o.type === "furniture" &&
        o.interaction.kind === "scene-change" &&
        o.interaction.targetRoomId === this.fromRoomId,
    );
    if (!entryDoor || entryDoor.type !== "furniture") return this.manifest.bunnyStart;

    const [px, , pz] = entryDoor.position;
    const [wx, , wz] = entryDoor.size;
    const OFFSET = 0.8;

    if (wx < wz) {
      // Thin in X → east or west wall door; step inward along X
      return [px + (px > 0 ? -OFFSET : OFFSET), pz];
    } else {
      // Thin in Z → north or south wall door; step inward along Z
      return [px, pz + (pz > 0 ? -OFFSET : OFFSET)];
    }
  }

  private loadCollectedIds(): Set<string> {
    try {
      const raw = localStorage.getItem(`tgb_room_${this.manifest.id}_collected`);
      return new Set<string>(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  }

  private setupLighting(scene: THREE.Scene): void {
    const lx = this.manifest.lighting;

    const ambient = new THREE.AmbientLight(
      lx?.ambientColor     ?? 0xFFF5E6,
      lx?.ambientIntensity ?? 0.7,
    );

    const sun = new THREE.DirectionalLight(
      lx?.sunColor    ?? 0xFFD080,
      lx?.sunIntensity ?? 1.4,
    );
    const [sx, sy, sz] = lx?.sunPosition ?? [4, 10, 6];
    sun.position.set(sx, sy, sz);
    sun.castShadow            = true;
    sun.shadow.mapSize.width  = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.camera.near    = 0.5;
    sun.shadow.camera.far     = 30;
    sun.shadow.camera.left    = -6;
    sun.shadow.camera.right   = 6;
    sun.shadow.camera.top     = 6;
    sun.shadow.camera.bottom  = -6;

    scene.add(ambient, sun);
    this.lights = [ambient, sun];
  }
}
