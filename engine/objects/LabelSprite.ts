import * as THREE from "three";

interface LabelSpriteOptions {
  text:     string;
  fontSize?: number;
  padX?:    number;
  padY?:    number;
}

export class LabelSprite {
  readonly sprite:  THREE.Sprite;
  private texture:  THREE.CanvasTexture;
  private material: THREE.SpriteMaterial;

  constructor({ text, fontSize = 22, padX = 20, padY = 11 }: LabelSpriteOptions) {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d")!;

    ctx.font = `bold ${fontSize}px Arial`;
    const textW = ctx.measureText(text).width;

    canvas.width  = Math.ceil(textW + padX * 2);
    canvas.height = Math.ceil(fontSize + padY * 2);

    // Re-set font — canvas resize resets state
    ctx.font          = `bold ${fontSize}px Arial`;
    ctx.textAlign     = "center";
    ctx.textBaseline  = "middle";

    // Pill background — manual arc path for broad browser compatibility
    const r = canvas.height / 2;
    ctx.fillStyle = "rgba(20, 10, 0, 0.82)";
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
    ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
    ctx.arcTo(0, canvas.height, 0, 0, r);
    ctx.arcTo(0, 0, canvas.width, 0, r);
    ctx.closePath();
    ctx.fill();

    // Label text
    ctx.fillStyle = "#FFF5E6";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    this.texture  = new THREE.CanvasTexture(canvas);
    this.material = new THREE.SpriteMaterial({
      map:         this.texture,
      transparent: true,
      depthTest:   false, // always renders on top of geometry
    });
    this.sprite = new THREE.Sprite(this.material);

    // Scale to consistent world-space width (~0.9 units)
    const aspect = canvas.width / canvas.height;
    this.sprite.scale.set(aspect * 0.55, 0.55, 1);

    // Exclude from raycasting — clicks should hit the mesh, not the label
    this.sprite.raycast = () => undefined;
  }

  setVisible(visible: boolean): void {
    this.sprite.visible = visible;
  }

  dispose(): void {
    this.texture.dispose();
    this.material.dispose();
  }
}
