import type { RoomManifest } from "@/engine/loaders/types";
import { MODELS } from "@/models/registry";

/**
 * Kitchen — 7×6 units (≈ 3.5m × 3m).
 * Accessed via the south wall of the Dining Room (this room's north wall).
 *
 * Inner wall faces (W=7, D=6, T=0.2):
 *   North z = -(3.0 - 0.1) = -2.9
 *   South z = +(3.0 - 0.1) =  2.9   (camera side — panels hidden)
 *   West  x = -(3.5 - 0.1) = -3.4
 *   East  x = +(3.5 - 0.1) =  3.4
 *
 * Top-down layout:
 *
 *   ┌─────────────[Dining↑]────────────────────┐
 *   │ [Fridge] [Win][Counter/Sink][Win] [Door] │
 *   │                                           │
 *   │               [Island]                   │
 *   │                                           │
 *   │                         [Lamp][Switch]   │
 *   └───────────────────────────────────────────┘
 *
 * Counter spans the western portion of the north wall; the door to dining
 * sits at the east end (x=2.2), clear of counter collision by 0.62 units.
 */
export const KITCHEN_ROOM: RoomManifest = {
  id:         "kitchen",
  background: 0xCDD5D8,
  dimensions: { width: 7, depth: 6, wallHeight: 3, wallThick: 0.2 },

  // North bounds let the bunny reach the north-wall door
  bounds: { min: -2.5, max: 2.5, minX: -3.1, maxX: 3.1, minZ: -2.5, maxZ: 2.5 },

  // Spawn near the dining-room door on the north-east of the room
  bunnyStart: [2.2, -1.5],

  wallColor:  0xDDE5E8,
  floorColor: 0x8A9E96,

  // Two windows above the counter (western portion of north wall)
  windows: [
    { x: -1.8, y: 1.75 },
    { x: -0.3, y: 1.75 },
  ],
  windowModelPath: MODELS.window,

  // No doorId — entrance is the north wall, not the south wall.
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [2, 8, 4],
    sunIntensity:     1.0,
    ambientIntensity: 0.72,
    ambientColor:     0xF0F8FF,
  },

  objects: [
    // ── North wall — door back to dining room (east end) ─────────────────────
    // North inner face z = −2.9; center z = −2.9 + 0.4 = −2.5
    // x = 2.2 clears counter collision (maxX ≈ 1.13) by 0.62 units
    {
      id:          "door-dining",
      type:        "furniture",
      label:       "Dining Room",
      position:    [2.2, 1.1, -2.5],
      size:        [0.9, 2.2, 0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "dining" },
    },

    // ── North wall — counter with sink (western portion) ─────────────────────
    // Width 3.0 centred at x = −0.75 → spans x ∈ [−2.25, 0.75]
    // Collision maxX = 0.75 + 0.38 = 1.13; door west edge = 2.2 − 0.45 = 1.75 ✓
    {
      id:          "counter",
      type:        "furniture",
      label:       "Counter",
      position:    [-0.75, 0.5, -2.55],
      size:        [3.0, 1.0, 0.7],
      color:       0xC8CED0,
      interaction: { kind: "dialog", message: "The kitchen counter. Covered in crumbs, obviously. 🍞" },
    },

    // Sink — sits on the counter, left of centre
    {
      id:          "sink",
      type:        "furniture",
      label:       "Sink",
      position:    [-1.5, 1.07, -2.55],
      size:        [0.7, 0.14, 0.5],
      color:       0xB0C0C4,
      interaction: { kind: "dialog", message: "A stainless steel sink. Dishes piling up already. 🫧" },
    },

    // ── West wall — refrigerator ──────────────────────────────────────────────
    // West inner face x = −3.4; width 0.8; center x = −3.4 + 0.4 = −3.0
    // Placed at z = −0.5 (clear of counter collision at z = −1.82)
    {
      id:          "fridge",
      type:        "furniture",
      label:       "Fridge",
      position:    [-3.0, 1.0, -0.5],
      size:        [0.8, 2.0, 0.8],
      color:       0xD8E0E4,
      interaction: { kind: "dialog", message: "A big family fridge. Someone left the door ajar again. 🧊" },
    },

    // ── Centre — kitchen island / prep table ──────────────────────────────────
    // y = size[1]/2 = 1.0/2 = 0.5
    {
      id:          "island",
      type:        "furniture",
      label:       "Kitchen Island",
      position:    [0, 0.5, 0.5],
      size:        [1.8, 1.0, 0.9],
      color:       0xA89070,
      interaction: { kind: "dialog", message: "The kitchen island. Great for breakfast, better for hiding snacks. 🍪" },
    },

    // ── East wall — door to living room ──────────────────────────────────────
    // East inner face x = 3.4; center x = 3.0; z = 0 (centred in room depth)
    {
      id:          "door-living",
      type:        "furniture",
      label:       "Living Room",
      position:    [3.0, 1.1, 0],
      size:        [0.15, 2.2, 0.9],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "living" },
    },

    // ── East wall — light switch (south of the living room door) ─────────────
    {
      id:          "light-switch",
      type:        "furniture",
      label:       "Light Switch",
      position:    [3.37, 1.2, 2.0],
      size:        [0.06, 0.12, 0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp" },
    },

    // ── Floor lamp — south-east area ─────────────────────────────────────────
    {
      id:       "floor-lamp",
      type:     "lamp",
      position: [2.0, 0, 2.0],
    },
  ],
};
