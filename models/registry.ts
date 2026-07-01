/**
 * Single source of truth for GLB model paths.
 * Room manifests reference MODELS.xyz instead of hardcoded path strings —
 * rename or move a file once, here, instead of hunting through every room.
 *
 * Folder convention (mirrors ObjectDef kinds in engine/loaders/types.ts):
 *   furniture/    freestanding, collidable items (FurnitureObjectDef)
 *   architecture/ built into the room shell (windows, doors)
 *   props/        smaller interactive/decorative items (books, lamps, switches)
 */
export const MODELS = {
  // ── Furniture ────────────────────────────────────────────────────────────
  bathroomSink:   "/models/furniture/bunny_bathroomsink.glb",
  bathroomToilet: "/models/furniture/bunny_bathroomtoilet.glb",
  bathroomTub:    "/models/furniture/bunny_bathroomtub.glb",
  bed:            "/models/furniture/bunny_bed.glb",
  parentsBed:     "/models/furniture/bunny_parents_bed.glb",
  bookshelf:      "/models/furniture/bunny_bookshelf.glb",
  desk:           "/models/furniture/bunny_desk.glb",
  dresser:        "/models/furniture/bunny_dresser.glb",
  wardrobe:       "/models/furniture/bunny_wardrobe.glb",

  // ── Architecture ─────────────────────────────────────────────────────────
  window: "/models/architecture/bunny_window.glb",
  door:   "/models/architecture/bunny_door.glb",

  // ── Props ────────────────────────────────────────────────────────────────
  journal:     "/models/props/bunny_journal.glb",
  lamp:        "/models/props/bunny_lamp.glb",
  lightSwitch: "/models/props/bunny_lightswitch.glb",
  map:         "/models/props/bunny_map.glb",
  wallLamp:    "/models/props/bunny_wall_lamp.glb",
} as const;

export type ModelKey = keyof typeof MODELS;
