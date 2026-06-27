import * as THREE from "three";

export interface GameModel {
  id: string;
  object: THREE.Object3D;
  interactable: boolean;
}

export interface ModelAsset {
  id: string;
  path: string;
}
