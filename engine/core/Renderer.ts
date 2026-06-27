import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { RENDER } from "@/lib/constants";

export class Renderer {
  readonly instance: THREE.WebGLRenderer;
  private composer:    EffectComposer | null = null;
  private outlinePass: OutlinePass    | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.instance = new THREE.WebGLRenderer({ canvas, antialias: true });
    this.instance.setPixelRatio(Math.min(window.devicePixelRatio, RENDER.maxPixelRatio));
    this.instance.shadowMap.enabled = true;
    this.instance.shadowMap.type    = THREE.PCFSoftShadowMap;
  }

  /** Call once after scene loads — enables the post-processing pipeline */
  setup(scene: THREE.Scene, camera: THREE.Camera, width: number, height: number): void {
    this.composer = new EffectComposer(this.instance);
    this.composer.addPass(new RenderPass(scene, camera));

    this.outlinePass = new OutlinePass(new THREE.Vector2(width, height), scene, camera);
    this.outlinePass.edgeStrength  = 4;
    this.outlinePass.edgeGlow      = 0.5;
    this.outlinePass.edgeThickness = 2;
    this.outlinePass.pulsePeriod   = 0;
    this.outlinePass.visibleEdgeColor.set("#FFCF47"); // summer-gold
    this.outlinePass.hiddenEdgeColor.set("#F4923A");  // summer-sandy
    this.composer.addPass(this.outlinePass);

    // Converts internal linear color space back to sRGB for display
    this.composer.addPass(new OutputPass());
  }

  setHoveredObjects(objects: THREE.Object3D[]): void {
    if (this.outlinePass) this.outlinePass.selectedObjects = objects;
  }

  setSize(width: number, height: number): void {
    this.instance.setSize(width, height);
    this.composer?.setSize(width, height);
  }

  render(scene: THREE.Scene, camera: THREE.Camera): void {
    if (this.composer) {
      this.composer.render();
    } else {
      this.instance.render(scene, camera);
    }
  }

  dispose(): void {
    this.composer?.dispose();
    this.instance.dispose();
  }
}
