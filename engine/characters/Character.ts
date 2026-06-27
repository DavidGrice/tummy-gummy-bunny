import * as THREE from "three";

export abstract class Character {
  readonly mesh: THREE.Object3D;
  isMoving = false;

  private target:  THREE.Vector3 | null = null;
  private arrival: (() => void) | undefined;
  private readonly speed: number;

  constructor(mesh: THREE.Object3D, speed = 3) {
    this.mesh  = mesh;
    this.speed = speed;
  }

  /** Move to target (world space). No-op while already moving. */
  walkTo(target: THREE.Vector3, onArrival?: () => void): void {
    if (this.isMoving) return;

    // Keep on the character's current floor plane
    const flat = new THREE.Vector3(target.x, this.mesh.position.y, target.z);

    const dist = flat.distanceTo(this.mesh.position);
    if (dist < 0.05) {
      onArrival?.();
      return;
    }

    this.target   = flat;
    this.arrival  = onArrival;
    this.isMoving = true;

    // Face the direction of travel (Y-axis only)
    const lookTarget = flat.clone();
    lookTarget.y = this.mesh.position.y;
    this.mesh.lookAt(lookTarget);
  }

  update(delta: number): void {
    if (!this.isMoving || !this.target) return;

    const dir  = this.target.clone().sub(this.mesh.position);
    const dist = dir.length();
    const step = this.speed * delta;

    if (dist <= step) {
      this.mesh.position.copy(this.target);
      this.isMoving = false;
      this.target   = null;
      this.arrival?.();
      this.arrival  = undefined;
    } else {
      this.mesh.position.addScaledVector(dir.normalize(), step);
    }
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
  }

  abstract dispose(): void;
}
