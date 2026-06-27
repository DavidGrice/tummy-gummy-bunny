import * as THREE from "three";
import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";

export class ModelLoader {
  private loader = new GLTFLoader();
  private cache = new Map<string, GLTF>();

  async load(path: string): Promise<GLTF> {
    if (this.cache.has(path)) return this.cache.get(path)!;

    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          this.cache.set(path, gltf);
          resolve(gltf);
        },
        undefined,
        reject
      );
    });
  }

  clone(source: THREE.Object3D): THREE.Object3D {
    return source.clone();
  }

  clearCache() {
    this.cache.clear();
  }
}
