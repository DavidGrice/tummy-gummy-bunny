import * as THREE from "three";
import type { BaseScene } from "@/scenes/BaseScene";

export class SceneManager {
  readonly instance: THREE.Scene;
  private current: BaseScene | null = null;

  constructor() {
    this.instance = new THREE.Scene();
    this.instance.background = new THREE.Color(0x1a1a2e);
  }

  async load(scene: BaseScene) {
    if (this.current) {
      this.current.dispose();
      this.instance.clear();
    }
    this.current = scene;
    await scene.setup(this.instance);
  }

  update(delta: number) {
    this.current?.update(delta);
  }

  dispose() {
    this.current?.dispose();
    this.instance.clear();
  }
}
