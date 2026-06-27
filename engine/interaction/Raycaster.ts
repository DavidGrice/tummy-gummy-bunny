import * as THREE from "three";

export class Raycaster {
  private instance = new THREE.Raycaster();

  cast(
    pointer: THREE.Vector2,
    camera: THREE.Camera,
    objects: THREE.Object3D[]
  ): THREE.Intersection[] {
    this.instance.setFromCamera(pointer, camera);
    return this.instance.intersectObjects(objects, true);
  }

  castFirst(
    pointer: THREE.Vector2,
    camera: THREE.Camera,
    objects: THREE.Object3D[]
  ): THREE.Intersection | null {
    const hits = this.cast(pointer, camera, objects);
    return hits.length > 0 ? hits[0] : null;
  }
}
