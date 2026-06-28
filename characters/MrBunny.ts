import * as THREE from "three";
import { Character } from "@/engine/characters/Character";
import { buildClothingLayers, applyEquipped } from "@/engine/characters/ClothingLayers";
import type { ClothingLayers } from "@/engine/characters/ClothingLayers";
import type { EquippedClothing } from "@/lib/inventory";

const BASE_Y     = 0.5;  // resting floor height
const HOP_HEIGHT = 0.10; // units per hop peak
const HOP_FREQ   = 6;    // hops per second while walking

export class MrBunny extends Character {
  private clothing: ClothingLayers;
  private animTime  = 0;

  /** @param startPosition [x, z] spawn tile — read from RoomManifest.bunnyStart */
  constructor(startPosition: [number, number] = [0, 1]) {
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.5, 6, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xF0E0C8 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.position.set(startPosition[0], BASE_Y, startPosition[1]);

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
    super.update(delta);
    const justLanded = wasMoving && !this.isMoving;

    if (this.isMoving) {
      this.animTime += delta;
      const hopPhase = Math.max(0, Math.sin(this.animTime * HOP_FREQ * Math.PI));
      this.mesh.position.y = BASE_Y + hopPhase * HOP_HEIGHT;

      const scaleY  = 1 + hopPhase * 0.10;
      const scaleXZ = 1 / Math.sqrt(scaleY);
      this.mesh.scale.set(scaleXZ, scaleY, scaleXZ);

    } else {
      if (justLanded) {
        this.animTime = 0;
        this.mesh.position.y = BASE_Y;
        this.mesh.scale.set(1.14, 0.86, 1.14);
      }
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
