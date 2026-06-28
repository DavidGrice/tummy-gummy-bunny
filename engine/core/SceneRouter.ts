import type { RoomManifest } from "@/engine/loaders/types";

/**
 * Registry mapping room IDs to their manifests.
 * Lives in the engine layer — no React, no Three.js, no scene imports.
 * Scene creation happens in useGame, which keeps the layer boundary clean.
 *
 * Usage:
 *   router.register("tutorial", TUTORIAL_ROOM)
 *   router.register("hallway",  HALLWAY_ROOM)
 *   const manifest = router.get("hallway")  // → RoomManifest
 */
export class SceneRouter {
  private readonly registry = new Map<string, RoomManifest>();

  register(id: string, manifest: RoomManifest): this {
    this.registry.set(id, manifest);
    return this; // chainable: router.register("a", A).register("b", B)
  }

  get(id: string): RoomManifest {
    const manifest = this.registry.get(id);
    if (!manifest) throw new Error(`[SceneRouter] Unknown room id: "${id}". Registered: [${this.ids.join(", ")}]`);
    return manifest;
  }

  has(id: string): boolean {
    return this.registry.has(id);
  }

  get ids(): string[] {
    return [...this.registry.keys()];
  }
}
