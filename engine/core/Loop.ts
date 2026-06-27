export class Loop {
  private animationId: number | null = null;
  private callbacks: Set<(delta: number) => void> = new Set();
  private lastTime = 0;

  start() {
    const tick = (time: number) => {
      const delta = (time - this.lastTime) / 1000;
      this.lastTime = time;
      this.callbacks.forEach((cb) => cb(delta));
      this.animationId = requestAnimationFrame(tick);
    };
    this.animationId = requestAnimationFrame(tick);
  }

  stop() {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  add(callback: (delta: number) => void) {
    this.callbacks.add(callback);
  }

  remove(callback: (delta: number) => void) {
    this.callbacks.delete(callback);
  }
}
