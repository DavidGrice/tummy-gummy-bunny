import * as THREE from "three";
import { PickupItem } from "@/engine/objects/PickupItem";
import { ITEMS } from "../data/layout";

/**
 * A small golden key lying on the floor.
 * Shape: torus bow + shaft box + two tooth boxes.
 * All parts share one MeshStandardMaterial so emissive pulse is uniform.
 */
export function createGoldenKey(onPickup: (id: string) => void): PickupItem {
  const [x, z] = ITEMS.goldenKey.position;

  const mat = new THREE.MeshStandardMaterial({
    color:             0xFFD700,
    metalness:         0.85,
    roughness:         0.15,
    emissive:          new THREE.Color(0xFFD700),
    emissiveIntensity: 0.3,
  });

  // Bow (circular head of the key)
  const bow  = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.016, 8, 14), mat);

  // Shaft extending right from the bow centre
  const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.016, 0.016), mat);
  shaft.position.set(0.10, 0, 0);

  // Two teeth pointing down from the shaft
  const toothGeo = new THREE.BoxGeometry(0.025, 0.038, 0.016);
  const tooth1   = new THREE.Mesh(toothGeo, mat);
  tooth1.position.set(0.14, -0.027, 0);
  const tooth2   = new THREE.Mesh(toothGeo, mat);
  tooth2.position.set(0.175, -0.027, 0);

  const group = new THREE.Group();
  group.add(bow, shaft, tooth1, tooth2);

  // Lie flat on the floor, slight rotation so it reads as a key at camera angle
  group.rotation.x = -Math.PI / 2;
  group.rotation.z =  Math.PI / 8;
  group.position.set(x, 0.042, z);

  return new PickupItem("golden-key", group, onPickup);
}
