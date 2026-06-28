import type { RoomManifest } from "@/engine/loaders/types";

/**
 * The hallway — a 3×8 unit corridor (≈ 1.5m × 4m real-world at 1 unit = 0.5m).
 * Connects Mr. Bunny's bedroom (south) to the living room (north, coming soon).
 *
 * Coordinate convention (same as all rooms):
 *   -Z = north wall, +Z = south wall (bedroom side)
 *   -X = west wall,  +X = east wall
 */
export const HALLWAY_ROOM: RoomManifest = {
  id:         "hallway",
  background: 0xC8BDA8,
  dimensions: { width: 3, depth: 8, wallHeight: 3, wallThick: 0.2 },

  // Narrower X bounds to keep the bunny inside the corridor width
  bounds: { min: -3.2, max: 3.2, minX: -0.9, maxX: 0.9 },

  bunnyStart: [0, 2.5],  // spawn near the bedroom door (south end)
  wallColor:  0xD8CFBC,
  floorColor: 0xA08060,

  windows: [],  // interior corridor — no windows

  doorId:      "door-south",
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:     [2, 8, 4],
    sunIntensity:    1.0,       // slightly dimmer than the bedroom
    ambientIntensity: 0.65,
  },

  objects: [
    // ── Doors ──────────────────────────────────────────────────────────────────

    // South door → back to Mr. Bunny's bedroom
    {
      id:          "door-south",
      type:        "furniture",
      label:       "Bedroom",
      position:    [0,    1.1,  3.5],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "tutorial" },
    },

    // North door → living room (coming soon)
    {
      id:          "door-north",
      type:        "furniture",
      label:       "Living Room",
      position:    [0,    1.1, -3.5],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "dialog", message: "The living room is just behind this door. Not quite ready yet… 🚪" },
    },

    // ── Furniture ──────────────────────────────────────────────────────────────

    // Coat rack — west wall, near the bedroom door
    {
      id:          "coat-rack",
      type:        "furniture",
      label:       "Coat Rack",
      position:    [-1.1, 1.0,  2.0],
      size:        [0.12, 2.0,  0.12],
      color:       0x5C3820,
      interaction: { kind: "dialog", message: "Mr. Bunny's favourite jacket hangs here, ready for an adventure. 🧥" },
    },

    // Small side table — east wall, mid-corridor
    {
      id:          "side-table",
      type:        "furniture",
      label:       "Side Table",
      position:    [1.1,  0.38, 0.0],
      size:        [0.45, 0.76, 0.35],
      color:       0xC4A882,
      interaction: { kind: "dialog", message: "A little side table. A half-drunk cup of carrot tea sits on it. 🥕" },
    },

    // Framed picture — west wall, mid-corridor
    {
      id:          "picture",
      type:        "furniture",
      label:       "Family Photo",
      position:    [-1.38, 1.6, -0.8],
      size:        [0.06,  0.5,  0.7],
      color:       0x8B6914,
      interaction: { kind: "dialog", message: "A family portrait. Everyone looks very fluffy and very happy. 🐰" },
    },
  ],
};
