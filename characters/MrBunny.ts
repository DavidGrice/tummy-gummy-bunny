import * as THREE from "three";
import { Character } from "@/engine/characters/Character";
import { buildClothingLayers, applyEquipped } from "@/engine/characters/ClothingLayers";
import type { ClothingLayers } from "@/engine/characters/ClothingLayers";
import type { EquippedClothing } from "@/lib/inventory";
import { BUNNY_START } from "@/scenes/tutorial/data/layout";

export class MrBunny extends Character {
  private clothing: ClothingLayers;

  constructor() {
    // CapsuleGeometry(radius=0.25, length=0.5) → total height = 1.0
    // Centered at origin: bottom at y=-0.5, top at y=0.5
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.5, 6, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xF0E0C8 }); // warm cream
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    // Lift so feet sit on the floor (y=0)
    body.position.set(BUNNY_START[0], 0.5, BUNNY_START[1]);

    // Ears — children of body, positioned in body's local space
    const earGeo   = new THREE.CapsuleGeometry(0.07, 0.35, 4, 8);
    const earMat   = new THREE.MeshLambertMaterial({ color: 0xE8C0A0 });
    const innerMat = new THREE.MeshLambertMaterial({ color: 0xE89090 }); // pink inner

    const leftEar  = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.12, 0.48, -0.04);
    leftEar.rotation.z = -0.2;

    const rightEar = new THREE.Mesh(earGeo, earMat.clone());
    rightEar.position.set(0.12, 0.48, -0.04);
    rightEar.rotation.z = 0.2;

    // Tiny inner-ear accent
    const innerGeo   = new THREE.CapsuleGeometry(0.035, 0.22, 4, 8);
    const leftInner  = new THREE.Mesh(innerGeo, innerMat);
    leftInner.position.set(-0.12, 0.48, -0.06);
    leftInner.rotation.z = -0.2;

    const rightInner = new THREE.Mesh(innerGeo, innerMat.clone());
    rightInner.position.set(0.12, 0.48, -0.06);
    rightInner.rotation.z = 0.2;

    body.add(leftEar, rightEar, leftInner, rightInner);

    // Clothing layers (added as body children, all invisible by default)
    const clothing = buildClothingLayers(body);

    super(body, 3);
    this.clothing = clothing;
  }

  /** Called whenever the player changes equipped items. */
  setEquipped(equipped: EquippedClothing): void {
    applyEquipped(this.clothing, equipped);
  }

  dispose(): void {
    this.mesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.geometry.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          (obj.material as THREE.Material).dispose();
        }
      }
    });
  }
}
