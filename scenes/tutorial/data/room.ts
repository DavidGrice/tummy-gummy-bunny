import type { RoomManifest } from "@/engine/loaders/types";

/**
 * Single source of truth for Mr. Bunny's room.
 * Add, move, or remove objects here — no factory files or scene code changes needed.
 *
 * Room is 8×8 units. Coordinate convention (top-down):
 *   -Z = back wall (north), +Z = front wall with door (south)
 *   -X = left wall (west),  +X = right wall (east)
 *   Windows on back wall at x=−1.0 (left) and x=+1.0 (right), y=1.75
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
  doorId:      "door",
  hiddenWalls: ["southLeft", "southRight", "southLintel"],
  objects: [
    // ── Furniture ─────────────────────────────────────────────────────────────

    // Left wall — wardrobe stays centre of west wall
    {
      id:          "wardrobe",
      type:        "furniture",
      label:       "Wardrobe",
      position:    [-3.55, 1.1,  0],
      size:        [0.5,   2.2,  1.2],
      color:       0x8B5A3C,
      interaction: { kind: "inventory", source: "wardrobe" },
    },

    // Back-left area — dresser moved near the left (west) window
    {
      id:          "dresser",
      type:        "furniture",
      label:       "Dresser",
      position:    [-2.2,  0.5,  -3.55],
      size:        [1.6,   1.0,   0.5],
      color:       0x6B4423,
      interaction: { kind: "inventory", source: "dresser" },
    },

    // Back-right area — white desk under the right (east) window
    {
      id:          "desk",
      type:        "furniture",
      label:       "Desk",
      position:    [1.0,   0.45, -3.5],
      size:        [1.4,   0.9,   0.6],
      color:       0xF0EDE8,
      interaction: { kind: "dialog", message: "A clean white desk. Great for homework… or doodles. 📝" },
    },

    // Front wall — door leads to the hallway
    {
      id:          "door",
      type:        "furniture",
      label:       "Hallway",
      position:    [0,     1.1,  3.5],
      size:        [0.9,   2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "hallway" },
    },

    // Right wall — bed (GLB model)
    {
      id:          "bed",
      type:        "furniture",
      label:       "Bed",
      position:    [3.4,   0.25, -0.5],
      size:        [1.0,   0.5,   2.2],
      color:       0x8B4513,
      interaction: { kind: "dialog-template", template: "{playerName} yawns… maybe just five more minutes? 😴" },
      flagKey:     "tgb_bed_rested",
      modelPath:   "/models/bunny_bed.glb",
    },

    // Right wall near the door — light switch for the floor lamp
    {
      id:          "light-switch",
      type:        "furniture",
      label:       "Light Switch",
      position:    [3.75,  1.2,   2.5],
      size:        [0.06,  0.12,  0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp" },
    },

    // ── Books / special meshes ────────────────────────────────────────────────

    // Journal — moved with the dresser, sits on top of it
    {
      id:          "journal",
      type:        "book",
      label:       "Journal",
      position:    [-2.0,  1.02, -3.47],
      size:        [0.22,  0.04,  0.28],
      color:       0x5C2E0A,
      interaction: { kind: "journal" },
    },

    // Map — rests on the desk, light tan/brown, unlocks minimap when picked up
    {
      id:          "room-map",
      type:        "book",
      label:       "Map",
      position:    [0.85,  0.908, -3.28],
      size:        [0.35,  0.015, 0.28],
      color:       0xD4A574,
      interaction: { kind: "map" },
    },

    // ── Decorative lamp (toggled via outlet above) ────────────────────────────
    {
      id:       "floor-lamp",
      type:     "lamp",
      position: [2.8, 0, -2.8],
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
