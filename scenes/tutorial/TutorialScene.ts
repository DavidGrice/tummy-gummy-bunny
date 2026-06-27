import * as THREE from "three";
import { BaseScene } from "@/scenes/BaseScene";
import { MrBunny } from "@/characters/MrBunny";
import { InteractableObject } from "@/engine/objects/InteractableObject";
import { createFloor } from "./objects/Floor";
import { createWalls } from "./objects/Walls";
import { createWardrobe } from "./objects/Wardrobe";
import { createDresser } from "./objects/Dresser";
import { createRoomDoor } from "./objects/RoomDoor";
import { createInteractions } from "./data/interactions";
import { BOUNDS } from "./data/layout";

export class TutorialScene extends BaseScene {
  readonly id    = "tutorial";
  readonly label = "Mr. Bunny's Room";

  private mrBunny!:       MrBunny;
  private interactables:  InteractableObject[] = [];
  private floor!:         THREE.Mesh;
  private walls:          THREE.Mesh[] = [];
  private lights:         THREE.Light[] = [];

  private progressFn: (p: number) => void = () => {};
  private dialogFn:   (m: string) => void = () => {};

  onProgress(fn: (p: number) => void): void { this.progressFn = fn; }
  onDialog(fn:   (m: string) => void): void { this.dialogFn   = fn; }

  async setup(scene: THREE.Scene): Promise<void> {
    scene.background = new THREE.Color(0xE8D0A8); // warm ceiling/sky fill

    this.progressFn(10);
    this.setupLighting(scene);

    this.progressFn(30);
    this.floor = createFloor();
    scene.add(this.floor);

    this.progressFn(50);
    this.walls = createWalls();
    this.walls.forEach((w) => scene.add(w));

    this.progressFn(65);
    const interactions = createInteractions(this.dialogFn);
    this.interactables = [
      createWardrobe(interactions.wardrobe),
      createDresser(interactions.dresser),
      createRoomDoor(interactions.door),
    ];
    this.interactables.forEach((obj) => obj.addToScene(scene));

    this.progressFn(85);
    this.mrBunny = new MrBunny();
    this.mrBunny.addToScene(scene);

    this.progressFn(100);
  }

  update(delta: number): void {
    this.mrBunny?.update(delta);
  }

  /** Meshes the raycaster should test each click */
  getCastTargets(): THREE.Object3D[] {
    return [this.floor, ...this.interactables.map((i) => i.mesh)];
  }

  handleClick(hit: THREE.Intersection): void {
    if (this.mrBunny.isMoving) return;

    // Walk up the hierarchy — child meshes (door panel, knob) pass clicks to parent
    let obj: THREE.Object3D | null = hit.object;
    while (obj && !obj.userData.interactable && !obj.userData.isFloor) {
      obj = obj.parent;
    }

    if (obj?.userData.isFloor) {
      const target = hit.point.clone();
      target.x = THREE.MathUtils.clamp(target.x, BOUNDS.min, BOUNDS.max);
      target.z = THREE.MathUtils.clamp(target.z, BOUNDS.min, BOUNDS.max);
      this.mrBunny.walkTo(target);

    } else if (obj?.userData.interactable) {
      // Walk toward the object, then trigger interaction on arrival
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

    this.interactables.forEach((i) => i.dispose());
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
