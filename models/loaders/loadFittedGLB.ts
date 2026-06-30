import * as THREE from "three";
import { sharedModelLoader } from "./ModelLoader";

export interface FitGLBOptions {
  /** Used only for console logging — falls back to modelPath. */
  id?:        string;
  modelPath:  string;
  position:   [number, number, number];
  /**
   * Target footprint the model is auto-scaled to fill, measured AFTER `rotation`
   * is applied (so a 90°-rotated model fits against its rotated footprint, not
   * its as-authored one). Ignored if `scale` is given.
   */
  fitSize:    [number, number, number];
  /** Which two axes of fitSize/the natural box are compared. "xz" for floor-standing props, "xy" for wall-mounted ones (windows). Default "xz". */
  fitPlane?:  "xz" | "xy";
  /** Euler rotation [x, y, z] radians, applied before the natural box is measured. */
  rotation?:  [number, number, number];
  /** Explicit scale override — skips auto-fit entirely. */
  scale?:     number | [number, number, number];
  /**
   * Tint applied to any mesh material left at the GLB's default white (no map,
   * no authored baseColor) — fills in the "color" look for low-poly parts the
   * artist left blank, without touching materials that already carry a color
   * (trim, metal, fabric accents, etc).
   */
  tintColor?: number;
  /**
   * Override specific named materials by hex colour, keyed by material name
   * (exact match or startsWith). Takes effect after tintColor, so it can
   * recolour authored materials that are already non-white (e.g. Blanket/Pillow
   * on bunny_bed.glb which export as pink from Blender).
   */
  materialOverrides?: Record<string, number>;
}

const _loggedAutoScale = new Set<string>();

/**
 * Loads a GLB, rotates/scales/tints it to fit a room object's manifest data, and
 * positions it. Shared by furniture/book objects (ObjectLoader.ts, fitPlane "xz")
 * and windows (Windows.ts, fitPlane "xy") so the rotate→measure→scale order and
 * blank-material tinting only need to live in one place.
 */
export async function loadFittedGLB(opts: FitGLBOptions): Promise<THREE.Object3D | null> {
  const {
    id = opts.modelPath,
    modelPath,
    position,
    fitSize,
    fitPlane = "xz",
    rotation,
    scale,
    tintColor,
    materialOverrides,
  } = opts;

  try {
    const gltf  = await sharedModelLoader.load(modelPath);
    const model = gltf.scene.clone(true);

    // Rotate first — auto-scale below measures the POST-rotation footprint,
    // so a 90°-turned model (e.g. a door on an east/west wall) fits correctly
    // instead of being measured against its as-authored (unrotated) box.
    if (rotation) model.rotation.set(...rotation);

    if (scale !== undefined) {
      if (Array.isArray(scale)) model.scale.set(...scale);
      else model.scale.setScalar(scale);
    } else {
      const naturalBox = new THREE.Box3().setFromObject(model);
      const ns = new THREE.Vector3();
      naturalBox.getSize(ns);

      const [naturalA, naturalB] = fitPlane === "xy" ? [ns.x, ns.y] : [ns.x, ns.z];
      const [targetA,  targetB]  = fitPlane === "xy" ? [fitSize[0], fitSize[1]] : [fitSize[0], fitSize[2]];

      if (naturalA > 0 && naturalB > 0) {
        const fitScale = Math.min(targetA / naturalA, targetB / naturalB);
        model.scale.setScalar(fitScale);
        if (!_loggedAutoScale.has(id)) {
          _loggedAutoScale.add(id);
          console.log(
            `[loadFittedGLB] "${id}" natural ${ns.x.toFixed(3)}×${ns.y.toFixed(3)}×${ns.z.toFixed(3)} (post-rotation), ` +
            `auto-scale → ${fitScale.toFixed(4)} (pass an explicit scale to override)`,
          );
        }
      }
    }

    // Correct for GLBs whose pivot is at the model base rather than its centre.
    // Manifest position[1] is always the *centre* Y (designed for BoxGeometry).
    // Read the post-rotation/scale bbox, find its centre, and shift so that
    // bbox centre == position[1] — works whether the GLB origin is at base or centre.
    const sizedBox = new THREE.Box3().setFromObject(model);
    const bboxCenterY = (sizedBox.min.y + sizedBox.max.y) / 2;

    if (tintColor !== undefined) tintBlankMaterials(model, tintColor);
    if (materialOverrides)       applyMaterialOverrides(model, materialOverrides);

    model.position.set(position[0], position[1] - bboxCenterY, position[2]);
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow    = true;
        child.receiveShadow = true;
      }
    });

    return model;
  } catch (err) {
    console.warn(`[loadFittedGLB] Failed to load "${modelPath}":`, err);
    return null;
  }
}

/**
 * Recolour specific named materials. Key is matched against mat.name using
 * exact match first, then startsWith — handles Blender's ".001" suffixes.
 * Each matched material is cloned before mutation to avoid cross-instance
 * colour pollution between rooms that share the same cached GLB.
 */
function applyMaterialOverrides(
  model:     THREE.Object3D,
  overrides: Record<string, number>,
): void {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const apply = (mat: THREE.Material): THREE.Material => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
      const key =
        Object.keys(overrides).find(k => mat.name === k) ??
        Object.keys(overrides).find(k => mat.name.startsWith(k));
      if (key === undefined) return mat;
      const cloned = mat.clone();
      cloned.color.setHex(overrides[key]);
      return cloned;
    };
    child.material = Array.isArray(child.material)
      ? child.material.map(apply)
      : apply(child.material);
  });
}

/**
 * Many low-poly GLBs leave "body" materials at the glTF default (white, no
 * texture) — the artist relied on Blender's viewport display color, which
 * doesn't survive export. Detect exactly that default and tint it; materials
 * that already carry an authored color (handles, trim, glass, fabric) are
 * left untouched.
 */
function tintBlankMaterials(model: THREE.Object3D, color: number): void {
  model.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;

    const apply = (mat: THREE.Material): THREE.Material => {
      if (!(mat instanceof THREE.MeshStandardMaterial)) return mat;
      const isBlank = !mat.map && mat.color.r > 0.99 && mat.color.g > 0.99 && mat.color.b > 0.99;
      if (!isBlank) return mat;
      const tinted = mat.clone();
      tinted.color.setHex(color);
      return tinted;
    };

    child.material = Array.isArray(child.material)
      ? child.material.map(apply)
      : apply(child.material);
  });
}
