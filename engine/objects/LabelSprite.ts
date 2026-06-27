import * as THREE from "three";

interface LabelSpriteOptions {
  text:      string;
  fontSize?: number;
  padX?:     number;
  padY?:     number;
}

export class LabelSprite {
  readonly sprite:      THREE.Sprite;
  private material:     THREE.SpriteMaterial;
  private normalTex:    THREE.CanvasTexture;
  private hoveredTex:   THREE.CanvasTexture;

  constructor({ text, fontSize = 22, padX = 20, padY = 11 }: LabelSpriteOptions) {
    this.normalTex  = this.buildTexture(text, fontSize, padX, padY, "rgba(20, 10, 0, 0.82)", "#FFF5E6");
    this.hoveredTex = this.buildTexture(text, fontSize, padX, padY, "rgba(180, 55, 20, 0.95)", "#FFFFFF");

    this.material = new THREE.SpriteMaterial({
      map:         this.normalTex,
      transparent: true,
      depthTest:   false, // always renders on top of geometry
    });
    this.sprite = new THREE.Sprite(this.material);

    const aspect = this.normalTex.image.width / this.normalTex.image.height;
    this.sprite.scale.set(aspect * 0.55, 0.55, 1);

    // Exclude from raycasting — clicks should hit the mesh, not the label
    this.sprite.raycast = () => undefined;
  }

  private buildTexture(
    text: string, fontSize: number, padX: number, padY: number,
    bgColor: string, textColor: string
  ): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d")!;

    ctx.font = `bold ${fontSize}px Arial`;
    const textW = ctx.measureText(text).width;

    canvas.width  = Math.ceil(textW + padX * 2);
    canvas.height = Math.ceil(fontSize + padY * 2);

    // Re-set font — canvas resize resets state
    ctx.font         = `bold ${fontSize}px Arial`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    // Pill background — manual arcTo path for broad browser compatibility
    const r = canvas.height / 2;
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(canvas.width, 0, canvas.width, canvas.height, r);
    ctx.arcTo(canvas.width, canvas.height, 0, canvas.height, r);
    ctx.arcTo(0, canvas.height, 0, 0, r);
    ctx.arcTo(0, 0, canvas.width, 0, r);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = textColor;
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  }

  /** Switch between normal (dark pill) and hovered (coral pill) appearance */
  setHovered(hovered: boolean): void {
    this.material.map = hovered ? this.hoveredTex : this.normalTex;
    this.material.needsUpdate = true;
  }

  setVisible(visible: boolean): void {
    this.sprite.visible = visible;
  }

  dispose(): void {
    this.normalTex.dispose();
    this.hoveredTex.dispose();
    this.material.dispose();
  }
}
