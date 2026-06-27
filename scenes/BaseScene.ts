import * as THREE from "three";

export abstract class BaseScene {
  abstract readonly id: string;
  abstract readonly label: string;

  abstract setup(scene: THREE.Scene): Promise<void>;
  abstract update(delta: number): void;
  abstract dispose(): void;
}
