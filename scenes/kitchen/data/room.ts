import type { RoomManifest } from "@/engine/loaders/types";
import { PALETTE } from "@/lib/palette";
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
 *   ┌───────[Dining↑]──────[Fridge]──────────────┐
 *   [Win]                                         │
 *   [Counter/Sink]     [Island]                   │
 *   [Win]                                         │
 *   │                           [Lamp] [Switch]   │
 *   └─────────────────────────────────────────────┘
 *
 * Counter + sink hug the west wall; fridge is in the north-west corner;
 * windows face west (to the outside, not into another room).
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

  // Two west-facing windows above the counter — no longer on the north wall
  windows: [
    { x: -1.0, y: 1.75, wall: "west" },
    { x:  1.0, y: 1.75, wall: "west" },
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
    {
      id:          "door-dining",
      type:        "furniture",
      label:       "Dining Room",
      position:    [2.2, 1.1, -2.5],
      size:        [0.9, 2.2, 0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "dining" },
      modelPath:   MODELS.door,
    },

    // ── North wall — fridge ───────────────────────────────────────────────────
    // Natural: 1.200W × 2.118H × 0.759D, base-at-origin, cY=1.059.
    // fitSize [1.3, 2.3, 0.9]: autoScale=1.083 → 1.300W × 2.294H × 0.822D.
    // position Y = 1.059 × 1.083 = 1.147. North inner z=−2.9; center z=−2.9+0.411=−2.489≈−2.5.
    // Rotated π so the door faces south (into the room) — model default faces −Z.
    {
      id:            "fridge",
      type:          "furniture",
      label:         "Fridge",
      position:      [-1.5, 1.147, -2.5],
      size:          [1.3, 2.3, 0.9],
      color:         0xD8E0E4,
      interaction:   { kind: "dialog", message: "A big family fridge. Someone left the door ajar again. 🧊" },
      modelPath:     MODELS.refrigerator,
      modelRotation: [0, Math.PI, 0],
    },

    // ── West wall — counter ───────────────────────────────────────────────────
    // Natural: 2.700W × 0.904H × 1.930D, base-at-origin, cY=0.452.
    // Rotation [0,−π/2,0]: natural Z(1.930)→−X(west/wall), natural X(2.700)→+Z(south along wall).
    // fitSize [2.0, 1.1, 3.0]: autoScale=min(2.0/1.930, 3.0/2.700)=1.036.
    // Scaled: 2.0 deep × 0.937H × 2.797 long. Front face(east) at X=−1.4; back(west wall) at X=−3.4.
    // Counter runs Z: −1.0 (north) to +1.797 (south). Y=0.452×1.036=0.468.
    {
      id:            "counter",
      type:          "furniture",
      label:         "Counter",
      position:      [-1.4, 0.468, -1.0],
      size:          [2.0, 1.1, 3.0],
      color:         0xC8CED0,
      interaction:   { kind: "dialog", message: "The kitchen counter. Covered in crumbs, obviously. 🍞" },
      modelPath:     MODELS.kitchenCounter,
      modelRotation: [0, -Math.PI / 2, 0],
    },

    // ── West wall — sink (sits on counter top) ────────────────────────────────
    // Natural: 0.762W × 0.510H × 0.559D, base-at-origin, cY=0.255.
    // fitSize [0.6, 0.5, 0.55]: autoScale=0.787 → scaled cY=0.201.
    // Counter top Y=0.937; sink position Y=0.937+0.201=1.138.
    {
      id:          "sink",
      type:        "furniture",
      label:       "Sink",
      position:    [-2.4, 1.138, -0.5],
      size:        [0.6, 0.5, 0.55],
      color:       0xB0C0C4,
      interaction: { kind: "dialog", message: "A stainless steel sink. Dishes piling up already. 🫧" },
      modelPath:   MODELS.kitchenSink,
    },

    // ── Centre — kitchen island ───────────────────────────────────────────────
    // Natural: 2.660W × 0.926H × 1.110D, base-at-origin, cY=0.463.
    // fitSize [2.4, 1.05, 1.0]: autoScale=0.901 → 2.397W × 0.834H × 1.000D.
    // position Y = 0.463 × 0.901 = 0.417.
    {
      id:                "island",
      type:              "furniture",
      label:             "Kitchen Island",
      position:          [0, 0.417, 0.5],
      size:              [2.4, 1.05, 1.0],
      color:             PALETTE.woodWarm,
      interaction:       { kind: "dialog", message: "The kitchen island. Great for breakfast, better for hiding snacks. 🍪" },
      modelPath:         MODELS.kitchenIsland,
      materialOverrides: { Island_Light_Oak: PALETTE.woodWarm },
    },

    // ── Bar stools — south face of the island ────────────────────────────────
    // Natural: 0.392W × 1.031H × 0.381D, base-at-origin, cY=0.515.
    // fitSize [0.42, 1.05, 0.42]: autoScale=1.018 → Y=0.515×1.018=0.524.
    // Island south edge Z=1.0; stool center Z=1.0+0.194=1.194≈1.2.
    // Model default faces −Z (toward island) — no rotation needed.
    {
      id:          "barstool-left",
      type:        "furniture",
      label:       "Bar Stool",
      position:    [-0.7, 0.524, 1.2],
      size:        [0.42, 1.05, 0.42],
      color:       0x111111,
      interaction: { kind: "dialog", message: "A sleek bar stool. Hop up and enjoy the view! 🍳" },
      modelPath:   MODELS.barstool,
    },
    {
      id:          "barstool-centre",
      type:        "furniture",
      label:       "Bar Stool",
      position:    [0, 0.524, 1.2],
      size:        [0.42, 1.05, 0.42],
      color:       0x111111,
      interaction: { kind: "dialog", message: "A sleek bar stool. Hop up and enjoy the view! 🍳" },
      modelPath:   MODELS.barstool,
    },
    {
      id:          "barstool-right",
      type:        "furniture",
      label:       "Bar Stool",
      position:    [0.7, 0.524, 1.2],
      size:        [0.42, 1.05, 0.42],
      color:       0x111111,
      interaction: { kind: "dialog", message: "A sleek bar stool. Hop up and enjoy the view! 🍳" },
      modelPath:   MODELS.barstool,
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
      modelPath:     MODELS.door,
      modelRotation: [0, Math.PI / 2, 0],
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
      modelPath:     MODELS.lightSwitch,
      // East wall — rotate to face west (−X) into the room.
      modelRotation: [0, -Math.PI / 2, 0],
    },

    // ── Floor lamp — south-east area ─────────────────────────────────────────
    {
      id:        "floor-lamp",
      type:      "lamp",
      position:  [2.0, 0, 2.0],
      modelPath: MODELS.lamp,
    },
  ],
};
