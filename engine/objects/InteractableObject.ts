import * as THREE from "three";
import { LabelSprite } from "./LabelSprite";

export interface InteractableObjectOptions {
  name:         string;
  mesh:         THREE.Mesh;
  /** Local-space Y above the mesh origin where the label floats */
  labelYOffset: number;
  onInteract:   () => void;
}

export class InteractableObject {
  readonly mesh:  THREE.Mesh;
  readonly label: LabelSprite;
  private readonly onInteractFn: () => void;

  constructor({ name, mesh, labelYOffset, onInteract }: InteractableObjectOptions) {
    this.mesh            = mesh;
    this.mesh.name       = name;
    this.onInteractFn    = onInteract;

    // Mark for raycasting identification
    this.mesh.userData.interactable = true;
    this.mesh.userData.onInteract   = () => this.onInteractFn();

    // Floating label — child of mesh so it inherits position
    this.label = new LabelSprite({ text: name });
    this.label.sprite.position.set(0, labelYOffset, 0);
    this.mesh.add(this.label.sprite);
  }

  setHovered(hovered: boolean): void {
    this.label.setHovered(hovered);
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
  }

  dispose(): void {
    this.label.dispose();
    this.mesh.geometry.dispose();
    if (Array.isArray(this.mesh.material)) {
      this.mesh.material.forEach((m) => m.dispose());
    } else {
      (this.mesh.material as THREE.Material).dispose();
    }
  }
}
