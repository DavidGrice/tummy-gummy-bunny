import type { RoomManifest } from "@/engine/loaders/types";

/**
 * Single source of truth for Mr. Bunny's room.
 * Add, move, or remove objects here — no factory files or scene code changes needed.
 */
export const TUTORIAL_ROOM: RoomManifest = {
  id:         "tutorial",
  background: 0xE8D0A8,
  dimensions: { width: 8, depth: 8, wallHeight: 3, wallThick: 0.2 },
  bounds:     { min: -3.0, max: 3.0 },
  bunnyStart: [0, 1],
  wallColor:  0xEDD9B4,
  floorColor: 0xC8A878,
  windows: [
    { x: -1.0, y: 1.75 },
    { x:  1.0, y: 1.75 },
  ],
  objects: [
    // ── Furniture ─────────────────────────────────────────────────────────────
    {
      id:          "wardrobe",
      type:        "furniture",
      label:       "Wardrobe",
      position:    [-3.65, 1.1,  0],
      size:        [0.5,   2.2,  1.2],
      color:       0x8B5A3C,
      interaction: { kind: "inventory", source: "wardrobe" },
    },
    {
      id:          "dresser",
      type:        "furniture",
      label:       "Dresser",
      position:    [0,     0.5, -3.65],
      size:        [1.6,   1.0,  0.5],
      color:       0x6B4423,
      interaction: { kind: "inventory", source: "dresser" },
    },
    {
      id:          "door",
      type:        "furniture",
      label:       "Door",
      position:    [0,     1.1,  3.5],
      size:        [0.9,   2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "dialog", message: "This door leads to the living room. Almost ready for the day!" },
    },
    {
      id:          "bed",
      type:        "furniture",
      label:       "Bed",
      position:    [3.4,   0.25, -0.5],
      size:        [1.0,   0.5,  2.2],
      color:       0x8B4513,
      interaction: { kind: "dialog-template", template: "{playerName} yawns… maybe just five more minutes? 😴" },
    },

    // ── Books / special meshes ─────────────────────────────────────────────────
    {
      id:          "journal",
      type:        "book",
      label:       "Journal",
      position:    [0.42, 1.02, -3.47],
      size:        [0.22, 0.04,  0.28],
      color:       0x5C2E0A,
      interaction: { kind: "journal" },
    },

    // ── Pickup items ──────────────────────────────────────────────────────────
    {
      id:        "golden-key-pickup",
      type:      "pickup",
      modelType: "key",
      itemId:    "golden-key",
      position:  [0.8, 0.042, 1.2],
      rotation:  [-Math.PI / 2, 0, Math.PI / 8],
    },
  ],
};
