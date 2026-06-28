import * as THREE from "three";
import { Character } from "@/engine/characters/Character";
import { buildClothingLayers, applyEquipped } from "@/engine/characters/ClothingLayers";
import type { ClothingLayers } from "@/engine/characters/ClothingLayers";
import type { EquippedClothing } from "@/lib/inventory";
import { BUNNY_START } from "@/scenes/tutorial/data/layout";

const BASE_Y      = 0.5;  // resting floor height
const HOP_HEIGHT  = 0.10; // units per hop peak
const HOP_FREQ    = 6;    // hops per second while walking

export class MrBunny extends Character {
  private clothing:  ClothingLayers;
  private animTime   = 0;

  constructor() {
    // CapsuleGeometry(radius=0.25, length=0.5) → total height = 1.0
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.5, 6, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xF0E0C8 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.position.set(BUNNY_START[0], BASE_Y, BUNNY_START[1]);

    // Ears
    const earGeo   = new THREE.CapsuleGeometry(0.07, 0.35, 4, 8);
    const earMat   = new THREE.MeshLambertMaterial({ color: 0xE8C0A0 });
    const innerMat = new THREE.MeshLambertMaterial({ color: 0xE89090 });

    const leftEar  = new THREE.Mesh(earGeo, earMat);
    leftEar.position.set(-0.12, 0.48, -0.04);
    leftEar.rotation.z = -0.2;

    const rightEar = new THREE.Mesh(earGeo, earMat.clone());
    rightEar.position.set(0.12, 0.48, -0.04);
    rightEar.rotation.z = 0.2;

    const innerGeo   = new THREE.CapsuleGeometry(0.035, 0.22, 4, 8);
    const leftInner  = new THREE.Mesh(innerGeo, innerMat);
    leftInner.position.set(-0.12, 0.48, -0.06);
    leftInner.rotation.z = -0.2;

    const rightInner = new THREE.Mesh(innerGeo, innerMat.clone());
    rightInner.position.set(0.12, 0.48, -0.06);
    rightInner.rotation.z = 0.2;

    body.add(leftEar, rightEar, leftInner, rightInner);

    const clothing = buildClothingLayers(body);

    super(body, 3);
    this.clothing = clothing;
  }

  override update(delta: number): void {
    const wasMoving = this.isMoving;
    super.update(delta); // handles position + arrival
    const justLanded = wasMoving && !this.isMoving;

    if (this.isMoving) {
      this.animTime += delta;

      // Periodic hop: sin gives 0→peak→0 cleanly; max(0,…) keeps feet on ground between hops
      const hopPhase = Math.max(0, Math.sin(this.animTime * HOP_FREQ * Math.PI));
      this.mesh.position.y = BASE_Y + hopPhase * HOP_HEIGHT;

      // Squash-and-stretch: taller at peak, wider at base
      const scaleY  = 1 + hopPhase * 0.10;
      const scaleXZ = 1 / Math.sqrt(scaleY); // rough volume conservation
      this.mesh.scale.set(scaleXZ, scaleY, scaleXZ);

    } else {
      // Landing squash, then ease back to neutral
      if (justLanded) {
        this.animTime = 0;
        this.mesh.position.y = BASE_Y;
        this.mesh.scale.set(1.14, 0.86, 1.14); // emphatic squash on touchdown
      }

      // Smooth spring back to (1, 1, 1)
      const s = delta * 14;
      this.mesh.scale.x = THREE.MathUtils.lerp(this.mesh.scale.x, 1, s);
      this.mesh.scale.y = THREE.MathUtils.lerp(this.mesh.scale.y, 1, s);
      this.mesh.scale.z = THREE.MathUtils.lerp(this.mesh.scale.z, 1, s);
    }
  }

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
