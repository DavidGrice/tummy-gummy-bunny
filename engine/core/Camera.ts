import * as THREE from "three";
import { CAMERA } from "@/lib/constants";

export class Camera {
  readonly instance: THREE.PerspectiveCamera;

  constructor(width: number, height: number) {
    this.instance = new THREE.PerspectiveCamera(
      CAMERA.fov,
      width / height,
      CAMERA.near,
      CAMERA.far
    );
    this.instance.position.set(0, 5, 10);
    this.instance.lookAt(0, 0, 0);
  }

  resize(width: number, height: number) {
    this.instance.aspect = width / height;
    this.instance.updateProjectionMatrix();
  }
}
