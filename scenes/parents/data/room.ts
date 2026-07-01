import type { RoomManifest } from "@/engine/loaders/types";
import { MODELS } from "@/models/registry";

/**
 * Parents' bedroom — 9×8 units (≈ 4.5m × 4m). The largest bedroom on the floor.
 * Accessed from the south wall of the hallway.
 *
 * Inner wall faces (W=9, D=8, T=0.2):
 *   North z = -(4.0 - 0.1) = -3.9
 *   South z = +(4.0 - 0.1) =  3.9   (panels hidden — camera side)
 *   West  x = -(4.5 - 0.1) = -4.4
 *   East  x = +(4.5 - 0.1) =  4.4
 *
 * Top-down layout:
 *
 *   ┌──────────────────────────────────────────┐
 *   │  [Win]    [King Bed]    [Win]            │
 *   │  [L.Stand]          [R.Stand]            │
 *   │                                          │
 *   [Wardrobe]              [Vanity] [Lamp]    │
 *   │                                          │
 *   │  [Chair]              [Switch]  [Door]   │
 *   └──────────────────────────────────────────┘
 */
export const PARENTS_ROOM: RoomManifest = {
  id:         "parents",
  background: 0xDDD0C0,
  dimensions: { width: 9, depth: 8, wallHeight: 3, wallThick: 0.2 },

  // Rectangular room — override X bounds to use full width
  bounds: { min: -3.5, max: 3.5, minX: -4.2, maxX: 4.2, minZ: -3.5, maxZ: 3.5 },

  bunnyStart: [0, 2.8],

  wallColor:  0xECE0CC,
  floorColor: 0xA88C6C,

  // Two windows above the bed on the north wall
  windows: [
    { x: -1.5, y: 1.75 },
    { x:  1.5, y: 1.75 },
  ],
  windowModelPath: MODELS.window,

  doorId:      "door",
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [3, 8, 5],
    sunIntensity:     1.0,
    ambientIntensity: 0.72,
    ambientColor:     0xFFF3E8,
  },

  objects: [
    // ── South wall — door to hallway ──────────────────────────────────────────
    {
      id:          "door",
      type:        "furniture",
      label:       "Hallway",
      position:    [0, 1.1, 3.5],
      size:        [0.9, 2.2, 0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "hallway" },
      modelPath:   MODELS.door,
    },

    // ── North wall — king bed (centred, back flush with north inner face) ──────
    // Natural: 2.141W × 1.050H × 2.258D, base-at-origin. No rotation — headboard
    // is at -Z (north face) in the GLB. Auto-scale 0.886 → 1.90W × 0.93H × 2.00D.
    // bboxCenterY = 0.465. position Y = 0.465. Back z = −2.9 − 1.00 = −3.90 (flush).
    {
      id:          "bed",
      type:        "furniture",
      label:       "Bed",
      position:    [0, 0.47, -2.9],
      size:        [1.9, 0.93, 2.0],
      color:       0x7A5038,
      interaction: { kind: "dialog", message: "Mum and Dad's bed. Off limits, obviously. 🛏️" },
      modelPath:   MODELS.parentsBed,
    },

    // ── Nightstands flanking the bed ──────────────────────────────────────────
    // Natural: 0.308W × 0.500H × 0.308D, base-at-origin, cY=0.250.
    // fitSize [0.5, 0.7, 0.5]: autoScale 1.400 → 0.431W × 0.700H × 0.431D.
    // position Y = 0.250 × 1.4 = 0.350.
    {
      id:          "nightstand-left",
      type:        "furniture",
      label:       "Nightstand",
      position:    [-1.7, 0.35, -2.9],
      size:        [0.5, 0.7, 0.5],
      color:       0x6B4423,
      interaction: { kind: "dialog", message: "A nightstand with a reading lamp and a dog-eared novel. 📖" },
      modelPath:   MODELS.parentsNightstand,
    },
    {
      id:          "nightstand-right",
      type:        "furniture",
      label:       "Nightstand",
      position:    [1.7, 0.35, -2.9],
      size:        [0.5, 0.7, 0.5],
      color:       0x6B4423,
      interaction: { kind: "dialog", message: "A nightstand with a glass of water and some reading glasses. 👓" },
      modelPath:   MODELS.parentsNightstand,
    },

    // ── West wall — wardrobe ──────────────────────────────────────────────────
    // GLB natural: 2.52W × 4.615H × 0.776D. fitPlane "xz" would pick scale=0.644 →
    // height 2.97, base below floor. modelScale: 0.477 (= 2.2/4.615) caps height at
    // 2.2 and gives world X=0.370 (depth), world Z=1.202 (width) after [0,π/2,0].
    // West inner face: x=-4.4. Flush center: x = -4.4 + 0.370/2 = -4.215 ≈ -4.22.
    {
      id:          "wardrobe",
      type:        "furniture",
      label:       "Wardrobe",
      position:    [-4.22, 1.1, 0],
      size:        [0.37, 2.2, 1.2],
      color:       0x7A5840,
      interaction: { kind: "dialog", message: "A grand wardrobe. You can hear coat hangers clinking inside. 👔" },
      modelPath:     MODELS.wardrobe,
      modelScale:    0.477,
      modelRotation: [0, Math.PI / 2, 0],
    },

    // ── East wall — vanity ────────────────────────────────────────────────────
    // Natural: 1.500W × 0.886H × 0.513D, base-at-origin, cY=0.443.
    // Rotated [0,π/2,0]: post-rotation X=0.513 (depth), Z=1.500 (along wall).
    // autoScale 1.0 → exact natural size. cY×scale=0.443.
    // East inner face x=4.4; center x = 4.4 − 0.513/2 = 4.14.
    {
      id:          "vanity",
      type:        "furniture",
      label:       "Vanity",
      position:    [4.14, 0.44, -1.2],
      size:        [0.55, 0.9, 1.5],
      color:       0x8B6240,
      interaction: { kind: "dialog", message: "A vanity covered in trinkets, photo frames, and a small mirror. 🪞" },
      modelPath:     MODELS.parentsVanity,
      modelRotation: [0, Math.PI / 2, 0],
    },

    // ── Armchair — south-west corner ─────────────────────────────────────────
    // Natural: 1.190W × 0.885H × 1.007D, base-at-origin, cY=0.443.
    // fitSize [1.5, 1.1, 1.3]: autoScale 1.243 → 1.479W × 1.100H × 1.252D.
    // position Y = 0.443 × 1.243 = 0.551.
    {
      id:          "armchair",
      type:        "furniture",
      label:       "Armchair",
      position:    [-2.8, 0.55, 2.0],
      size:        [1.5, 1.1, 1.3],
      color:       0x9B6B4A,
      interaction: { kind: "dialog-template", template: "A cosy armchair. {playerName} could curl up here for hours. ☕" },
      modelPath:   MODELS.parentsArmchair,
    },

    // ── East wall — light switch (near south end) ─────────────────────────────
    // East inner face x=4.4. center x = 4.4 - 0.06/2 = 4.37
    {
      id:          "light-switch",
      type:        "furniture",
      label:       "Light Switch",
      position:    [4.37, 1.2, 2.2],
      size:        [0.06, 0.12, 0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp" },
      modelPath:     MODELS.lightSwitch,
      // East wall — rotate to face west (−X) into the room.
      modelRotation: [0, -Math.PI / 2, 0],
    },

    // ── West wall — second light switch (mirrors east switch) ────────────────
    // West inner face x=-4.4. center x = -4.4 + 0.06/2 = -4.37
    {
      id:          "light-switch-2",
      type:        "furniture",
      label:       "Light Switch",
      position:    [-4.37, 1.2, 2.2],
      size:        [0.06, 0.12, 0.09],
      color:       0xECECE8,
      interaction: { kind: "lamp-toggle", lampId: "floor-lamp-2" },
      modelPath:     MODELS.lightSwitch,
      // West wall — rotate to face east (+X) into the room.
      modelRotation: [0, Math.PI / 2, 0],
    },

    // ── Floor lamp — east side, near bed ─────────────────────────────────────
    {
      id:        "floor-lamp",
      type:      "lamp",
      position:  [3.8, 0, -2.5],
      modelPath: MODELS.lamp,
    },

    // ── Floor lamp — west side, mirroring east lamp ───────────────────────────
    {
      id:        "floor-lamp-2",
      type:      "lamp",
      position:  [-3.8, 0, -2.5],
      modelPath: MODELS.lamp,
    },
  ],
};
