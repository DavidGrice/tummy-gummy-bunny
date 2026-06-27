import * as THREE from "three";
import type { InventoryItem } from "@/lib/inventory";

interface EquippedSnapshot {
  outerwear: InventoryItem | null;
  top:       InventoryItem | null;
  bottom:    InventoryItem | null;
}

function clothingMat(): THREE.MeshLambertMaterial {
  return new THREE.MeshLambertMaterial({
    color:               0xffffff,
    polygonOffset:       true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits:  -4,
  });
}

export class PreviewBunny {
  readonly group: THREE.Group;

  private outerwearMesh: THREE.Mesh;
  private topMesh:       THREE.Mesh;
  private bottomMesh:    THREE.Mesh;

  constructor() {
    this.group = new THREE.Group();

    // --- Body (same proportions as MrBunny) ---
    const bodyGeo = new THREE.CapsuleGeometry(0.25, 0.5, 6, 12);
    const bodyMat = new THREE.MeshLambertMaterial({ color: 0xF0E0C8 });
    const body    = new THREE.Mesh(bodyGeo, bodyMat);
    body.castShadow = true;
    body.position.y = 0.5; // feet on floor at y=0

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

    // Eyes — small dark spheres on the front face
    const eyeGeo = new THREE.SphereGeometry(0.045, 6, 6);
    const eyeMat = new THREE.MeshLambertMaterial({ color: 0x1A0800 });
    const lEye   = new THREE.Mesh(eyeGeo, eyeMat);
    lEye.position.set(-0.10, 0.12, -0.23);
    const rEye = new THREE.Mesh(eyeGeo, eyeMat.clone());
    rEye.position.set( 0.10, 0.12, -0.23);

    // Nose
    const noseGeo = new THREE.SphereGeometry(0.03, 5, 5);
    const noseMat = new THREE.MeshLambertMaterial({ color: 0xE89090 });
    const nose    = new THREE.Mesh(noseGeo, noseMat);
    nose.position.set(0, -0.03, -0.25);

    body.add(lEar, rEar, lInner, rInner, lEye, rEye, nose);

    // --- Clothing layers (children of body, in body-local space) ---
    // Body local: y=-0.5 (feet), y=+0.5 (top of head region)
    // Cylinder part: y=-0.25 to y=+0.25

    // Outerwear — wraps entire torso
    this.outerwearMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.58, 0.92, 0.58),
      clothingMat(),
    );
    this.outerwearMesh.position.y = -0.02;
    this.outerwearMesh.visible    = false;
    body.add(this.outerwearMesh);

    // Top — upper body only
    this.topMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.56, 0.40, 0.56),
      clothingMat(),
    );
    this.topMesh.position.y = 0.08;
    this.topMesh.visible    = false;
    body.add(this.topMesh);

    // Bottom — lower body / legs
    this.bottomMesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.52, 0.38, 0.52),
      clothingMat(),
    );
    this.bottomMesh.position.y = -0.24;
    this.bottomMesh.visible    = false;
    body.add(this.bottomMesh);

    this.group.add(body);
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.group);
  }

  setEquipped(equipped: EquippedSnapshot): void {
    this.applyLayer(this.outerwearMesh, equipped.outerwear);
    this.applyLayer(this.topMesh,       equipped.top);
    this.applyLayer(this.bottomMesh,    equipped.bottom);
  }

  private applyLayer(mesh: THREE.Mesh, item: InventoryItem | null): void {
    if (item) {
      (mesh.material as THREE.MeshLambertMaterial).color.setHex(item.colorHex);
      mesh.visible = true;
    } else {
      mesh.visible = false;
    }
  }

  update(delta: number): void {
    this.group.rotation.y += delta * 0.55; // slow auto-spin
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
