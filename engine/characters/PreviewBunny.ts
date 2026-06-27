import * as THREE from "three";
import { buildClothingLayers, applyEquipped } from "./ClothingLayers";
import type { ClothingLayers } from "./ClothingLayers";
import type { EquippedClothing } from "@/lib/inventory";

export class PreviewBunny {
  readonly group: THREE.Group;
  private clothing: ClothingLayers;

  constructor() {
    this.group = new THREE.Group();

    // Body — same proportions as MrBunny
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.5, 6, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xF0E0C8 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.position.y = 0.5;

    // Ears
    const earGeo   = new THREE.CapsuleGeometry(0.07, 0.35, 4, 8);
    const earMat   = new THREE.MeshLambertMaterial({ color: 0xE8C0A0 });
    const innerMat = new THREE.MeshLambertMaterial({ color: 0xE89090 });
    const innerGeo = new THREE.CapsuleGeometry(0.035, 0.22, 4, 8);

    const lEar = new THREE.Mesh(earGeo, earMat);
    lEar.position.set(-0.12, 0.48, -0.04); lEar.rotation.z = -0.2;
    const rEar = new THREE.Mesh(earGeo, earMat.clone());
    rEar.position.set( 0.12, 0.48, -0.04); rEar.rotation.z =  0.2;
    const lInner = new THREE.Mesh(innerGeo, innerMat);
    lInner.position.set(-0.12, 0.48, -0.06); lInner.rotation.z = -0.2;
    const rInner = new THREE.Mesh(innerGeo, innerMat.clone());
    rInner.position.set( 0.12, 0.48, -0.06); rInner.rotation.z =  0.2;

    // Eyes and nose (visible in the close-up preview)
    const eyeGeo = new THREE.SphereGeometry(0.045, 6, 6);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x1A0800 });
    const lEye   = new THREE.Mesh(eyeGeo, eyeMat);
    lEye.position.set(-0.10, 0.12, -0.23);
    const rEye = new THREE.Mesh(eyeGeo, eyeMat.clone());
    rEye.position.set( 0.10, 0.12, -0.23);
    const noseGeo = new THREE.SphereGeometry(0.03, 5, 5);
    const noseMat = new THREE.MeshLambertMaterial({ color: 0xE89090 });
    const nose    = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.03, -0.25);

    body.add(lEar, rEar, lInner, rInner, lEye, rEye, nose);

    // Shared clothing layers
    this.clothing = buildClothingLayers(body);

    this.group.add(body);
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.group);
  }

  setEquipped(equipped: EquippedClothing): void {
    applyEquipped(this.clothing, equipped);
  }

  update(delta: number): void {
    this.group.rotation.y += delta * 0.55;
  }

  dispose(): void {
    this.group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) obj.material.forEach((m) => m.dispose());
        else (obj.material as THREE.Material).dispose();
      }
    });
  }
}
