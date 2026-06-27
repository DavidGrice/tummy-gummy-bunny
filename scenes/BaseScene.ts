import * as THREE from "three";

export abstract class BaseScene {
  abstract readonly id:    string;
  abstract readonly label: string;

  /** Add all scene objects to the Three.js scene */
  abstract setup(scene: THREE.Scene): Promise<void>;

  /** Called every frame with delta time in seconds */
  abstract update(delta: number): void;

  /** Dispose all geometries, materials, textures owned by this scene */
  abstract dispose(): void;

  /** Objects the raycaster should test against on each click */
  abstract getCastTargets(): THREE.Object3D[];

  /** Handle a processed raycaster hit from useGame */
  abstract handleClick(intersection: THREE.Intersection): void;

  /** Optional: position the camera when this scene loads */
  setupCamera?(camera: THREE.PerspectiveCamera): void;
}
