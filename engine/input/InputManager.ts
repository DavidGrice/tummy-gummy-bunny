import * as THREE from "three";

type ClickHandler = (pointer: THREE.Vector2) => void;
type HoverHandler = (pointer: THREE.Vector2) => void;

export class InputManager {
  readonly pointer: THREE.Vector2 = new THREE.Vector2();
  private clickHandlers: Set<ClickHandler> = new Set();
  private hoverHandlers: Set<HoverHandler> = new Set();
  private canvas: HTMLCanvasElement;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    canvas.addEventListener("pointermove", this.onPointerMove);
    canvas.addEventListener("pointerdown", this.onPointerDown);
  }

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    this.hoverHandlers.forEach((fn) => fn(this.pointer.clone()));
  };

  private onPointerDown = (e: PointerEvent) => {
    // Always read position from the event — on touch, pointermove may not
    // have fired yet, so this.pointer would be stale from a previous tap.
    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    this.pointer.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
    this.clickHandlers.forEach((fn) => fn(this.pointer.clone()));
  };

  onClick(handler: ClickHandler) {
    this.clickHandlers.add(handler);
    return () => this.clickHandlers.delete(handler);
  }

  onHover(handler: HoverHandler) {
    this.hoverHandlers.add(handler);
    return () => this.hoverHandlers.delete(handler);
  }

  dispose() {
    this.canvas.removeEventListener("pointermove", this.onPointerMove);
    this.canvas.removeEventListener("pointerdown", this.onPointerDown);
    this.clickHandlers.clear();
    this.hoverHandlers.clear();
  }
}
