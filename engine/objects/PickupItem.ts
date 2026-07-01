import * as THREE from "three";
import { getPlaystyle } from "@/lib/playstyle";
import { LabelSprite } from "./LabelSprite";

const PARTICLE_COUNT = 14;

/** Canvas-generated radial gold gradient used as sprite texture */
function makeSparkleTexture(): THREE.Texture {
  const size   = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx    = canvas.getContext("2d")!;
  const g      = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0,   "rgba(255, 230, 80, 1)");
  g.addColorStop(0.3, "rgba(255, 200, 40, 0.85)");
  g.addColorStop(0.7, "rgba(255, 180, 0,  0.35)");
  g.addColorStop(1,   "rgba(255, 180, 0,  0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

interface Particle {
  sprite:      THREE.Sprite;
  mat:         THREE.SpriteMaterial;
  angle:       number;   // current orbit angle (radians)
  height:      number;   // 0 → 1, rises and fades out
  radius:      number;   // orbit radius from item centre
  orbitSpeed:  number;   // rad / s
  riseSpeed:   number;   // height units / s
}

/**
 * A world-space pickup item.
 *
 * Story Bunny mode: orbiting gold sparkle sprites + pulsing emissive glow.
 * Explorer Bunny mode: item sits in the world with no visual hint.
 */
export class PickupItem {
  /** Root object placed in the scene — may be a Group or a Mesh */
  readonly mesh:    THREE.Object3D;
  private scene:    THREE.Scene | null = null;
  private particles: Particle[]        = [];
  private sparkleTexture: THREE.Texture | null = null;
  private pulseTime  = 0;
  private _removed   = false;
  private readonly isStory: boolean;
  private label?: LabelSprite;

  constructor(
    readonly itemId:        string,
    mesh:                   THREE.Object3D,
    private readonly onPickupFn: (id: string) => void,
    label?: string,
  ) {
    this.mesh    = mesh;
    this.isStory = getPlaystyle() !== "explorer";

    if (label) {
      this.label = new LabelSprite({ text: label });
      this.label.setAlwaysVisible(true);
      this.label.sprite.position.set(0, 0.25, 0);
      this.mesh.add(this.label.sprite);
    }
  }

  addToScene(scene: THREE.Scene): void {
    this.scene = scene;
    scene.add(this.mesh);

    // Tag the ROOT so handleClick's parent-walk finds it correctly.
    // (Raycaster hits child meshes → walks up → stops here.)
    this.mesh.userData.interactable = true;
    this.mesh.userData.isPickup     = true;
    this.mesh.userData.onInteract   = () => this.pickup();

    if (this.isStory) {
      this.initParticles(scene);
    }
  }

  private initParticles(scene: THREE.Scene): void {
    this.sparkleTexture = makeSparkleTexture();
    const pos = new THREE.Vector3();
    this.mesh.getWorldPosition(pos);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const mat = new THREE.SpriteMaterial({
        map:      this.sparkleTexture,
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      });
      const sprite = new THREE.Sprite(mat);
      sprite.scale.setScalar(0.065 + Math.random() * 0.045);

      // Stagger initial state so particles don't all fade out at once
      const height = Math.random();
      const angle  = Math.random() * Math.PI * 2;
      const radius = 0.10 + Math.random() * 0.13;

      sprite.position.set(
        pos.x + radius * Math.cos(angle),
        pos.y + 0.05  + height * 0.4,
        pos.z + radius * Math.sin(angle),
      );
      mat.opacity = Math.max(0, 1 - height) * 0.85;

      scene.add(sprite);
      this.particles.push({
        sprite, mat, angle, height, radius,
        orbitSpeed: 0.55 + Math.random() * 0.9,
        riseSpeed:  0.28 + Math.random() * 0.28,
      });
    }
  }

  update(delta: number): void {
    if (this._removed) return;

    // ── Emissive pulse ────────────────────────────────────────────────────────
    if (this.isStory) {
      this.pulseTime += delta;
      const intensity = 0.22 + 0.22 * Math.sin(this.pulseTime * 2.8);
      this.mesh.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          const mat = child.material as THREE.MeshStandardMaterial;
          if (mat.emissive) mat.emissiveIntensity = intensity;
        }
      });
    }

    // ── Sparkle orbits ────────────────────────────────────────────────────────
    if (this.particles.length === 0) return;
    const pos = new THREE.Vector3();
    this.mesh.getWorldPosition(pos);

    for (const p of this.particles) {
      p.angle  += delta * p.orbitSpeed;
      p.height += delta * p.riseSpeed;

      if (p.height >= 1.0) {
        p.height = 0;
        p.angle  = Math.random() * Math.PI * 2;
        p.radius = 0.09 + Math.random() * 0.14;
      }

      p.sprite.position.set(
        pos.x + p.radius * Math.cos(p.angle),
        pos.y + 0.05     + p.height * 0.45,
        pos.z + p.radius * Math.sin(p.angle),
      );
      p.mat.opacity = Math.max(0, 1 - p.height) * 0.85;
    }
  }

  pickup(): void {
    if (this._removed) return;
    this._removed = true;
    this.cleanupMesh();
    this.onPickupFn(this.itemId);
  }

  /** Remove from scene and free GPU resources without firing the pickup callback. */
  dispose(): void {
    if (this._removed) return;
    this._removed = true;
    this.cleanupMesh();
  }

  private cleanupMesh(): void {
    if (this.scene) {
      this.scene.remove(this.mesh);
      for (const p of this.particles) {
        this.scene.remove(p.sprite);
        p.mat.dispose();
      }
    }
    const mats = new Set<THREE.Material>();
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.geometry.dispose();
        const arr = Array.isArray(child.material)
          ? child.material as THREE.Material[]
          : [child.material as THREE.Material];
        arr.forEach((m) => mats.add(m));
      }
    });
    mats.forEach((m) => m.dispose());
    this.sparkleTexture?.dispose();
    this.particles = [];
    this.label?.dispose();
  }

  get isPickedUp(): boolean { return this._removed; }

  /** Returns child Mesh objects suitable for raycasting */
  getCastMeshes(): THREE.Mesh[] {
    const out: THREE.Mesh[] = [];
    this.mesh.traverse((child) => {
      if (child instanceof THREE.Mesh) out.push(child);
    });
    return out;
  }
}
