import * as THREE from "three";
import { RENDER } from "@/lib/constants";

export class Renderer {
  readonly instance: THREE.WebGLRenderer;

  constructor(canvas: HTMLCanvasElement) {
    this.instance = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, RENDER.maxPixelRatio));
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  setSize(width: number, height: number) {
    this.instance.setSize(width, height);
  }

  render(scene: THREE.Scene, camera: THREE.Camera) {
    this.instance.render(scene, camera);
  }

  dispose() {
    this.instance.dispose();
  }
}
