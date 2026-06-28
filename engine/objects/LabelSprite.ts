import * as THREE from "three";

interface LabelSpriteOptions {
  text:      string;
  fontSize?: number;
  padX?:     number;
  padY?:     number;
}

export class LabelSprite {
  readonly sprite:   THREE.Sprite;
  private material:  THREE.SpriteMaterial;
  private tex:       THREE.CanvasTexture;
  private _always = false;

  constructor({ text, fontSize = 16, padX = 14, padY = 8 }: LabelSpriteOptions) {
    this.tex = this.buildTexture(text, fontSize, padX, padY);

    this.material = new THREE.SpriteMaterial({
      map:         this.tex,
      transparent: true,
      depthTest:   false,
    });
    this.sprite = new THREE.Sprite(this.material);

    const aspect = this.tex.image.width / this.tex.image.height;
    this.sprite.scale.set(aspect * 0.30, 0.30, 1);

    // Hidden until hovered
    this.sprite.visible = false;

    // Exclude from raycasting — clicks should hit the mesh, not the label
    this.sprite.raycast = () => undefined;
  }

  private buildTexture(
    text: string, fontSize: number, padX: number, padY: number,
  ): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");
    const ctx    = canvas.getContext("2d")!;

    ctx.font = `600 ${fontSize}px Arial`;
    const textW = ctx.measureText(text).width;

    canvas.width  = Math.ceil(textW + padX * 2);
    canvas.height = Math.ceil(fontSize + padY * 2);

    // Re-set font after resize (canvas reset clears state)
    ctx.font         = `600 ${fontSize}px Arial`;
    ctx.textAlign    = "center";
    ctx.textBaseline = "middle";

    // Pill background
    const r = canvas.height / 2;
    ctx.fillStyle = "rgba(15, 6, 0, 0.88)";
    ctx.beginPath();
    ctx.moveTo(r, 0);
    ctx.arcTo(canvas.width, 0,            canvas.width, canvas.height, r);
    ctx.arcTo(canvas.width, canvas.height, 0,           canvas.height, r);
    ctx.arcTo(0,            canvas.height, 0,           0,             r);
    ctx.arcTo(0,            0,             canvas.width, 0,            r);
    ctx.closePath();
    ctx.fill();

    // Subtle outline ring
    ctx.strokeStyle = "rgba(255, 220, 150, 0.55)";
    ctx.lineWidth   = 1.5;
    ctx.stroke();

    ctx.fillStyle = "#FFE8B0";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    return new THREE.CanvasTexture(canvas);
  }

  /** Keep the label permanently visible regardless of hover state */
  setAlwaysVisible(v: boolean): void {
    this._always = v;
    this.sprite.visible = v;
  }

  /** Show the label while hovered, hide when not (no-op if alwaysVisible) */
  setHovered(hovered: boolean): void {
    if (this._always) return;
    this.sprite.visible = hovered;
  }

  setVisible(visible: boolean): void {
    if (this._always) return;
    this.sprite.visible = visible;
  }

  dispose(): void {
    this.tex.dispose();
    this.material.dispose();
  }
}
