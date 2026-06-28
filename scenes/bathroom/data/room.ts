import type { RoomManifest } from "@/engine/loaders/types";

/**
 * Upstairs bathroom — 4×4 units (≈ 2m × 2m).
 * Located east of the hallway; the only entrance is the west-wall door.
 *
 * Top-down layout (north = −Z, south = +Z, east = +X, west = −X):
 *
 *   ┌─────────────────────────┐
 *   │  [Toilet]   [Bathtub]   │
 *   │                         │
 *   [Door]           [Sink]   │
 *   │                         │
 *   └─────────────────────────┘ (south wall hidden — camera side)
 *
 *   West wall (−X) : door back to hallway (z=0, centred)
 *   North wall (−Z) : toilet (west corner) + bathtub (east side)
 *   East wall (+X)  : sink / vanity
 */
export const BATHROOM_ROOM: RoomManifest = {
  id:         "bathroom",
  background: 0xD8EDF2,
  dimensions: { width: 4, depth: 4, wallHeight: 3, wallThick: 0.2 },

  // Tight bounds — small room, leave a sliver around each wall
  bounds: { min: -1.6, max: 1.6 },

  // Spawn just inside the west-wall door
  bunnyStart: [-1.1, 0.3],

  wallColor:  0xE8F2F5,
  floorColor: 0xB8CFD4,

  // Small frosted window above the bathtub on the north wall
  windows: [{ x: 0.8, y: 1.75 }],

  // South wall is always hidden — camera peeks in from the south
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [1, 7, 3],
    sunIntensity:     0.95,
    ambientIntensity: 0.78,
    ambientColor:     0xEEF6FF, // cool white — bathroom fluorescent feel
  },

  objects: [
    // ── Door — west wall, back to hallway ─────────────────────────────────────
    // Width along Z (0.9), thin along X (0.15) — matches hallway east-wall door
    {
      id:          "door-hallway",
      type:        "furniture",
      label:       "Hallway",
      position:    [-1.95, 1.1, 0],
      size:        [0.15, 2.2, 0.9],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "hallway" },
    },

    // ── Toilet — north-west corner ────────────────────────────────────────────
    {
      id:          "toilet",
      type:        "furniture",
      label:       "Toilet",
      position:    [-1.3, 0.42, -1.5],
      size:        [0.65, 0.85, 0.7],
      color:       0xF0F2F0,
      interaction: { kind: "dialog", message: "Just a toilet. Nothing to see here. 🚽" },
    },

    // ── Bathtub — north wall, east side ──────────────────────────────────────
    {
      id:          "bathtub",
      type:        "furniture",
      label:       "Bathtub",
      position:    [0.8, 0.35, -1.62],
      size:        [1.4, 0.7, 0.62],
      color:       0xE8F0F6,
      interaction: { kind: "dialog", message: "A deep bubble bath with lavender salts. Maybe after the adventure! 🛁" },
    },

    // ── Sink / vanity — east wall ─────────────────────────────────────────────
    {
      id:          "sink",
      type:        "furniture",
      label:       "Sink",
      position:    [1.75, 0.42, 0.3],
      size:        [0.4, 0.85, 0.65],
      color:       0xEEF2F4,
      interaction: { kind: "dialog-template", template: "{playerName} checks the mirror above the sink. Looking good! 🪥" },
    },
  ],
};
