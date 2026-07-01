import type { RoomManifest } from "@/engine/loaders/types";
import { PALETTE } from "@/lib/palette";
import { MODELS } from "@/models/registry";

/**
 * The Neighbourhood — 24×12 units.
 * The street outside the front garden. Accessed via the garden gate.
 *
 * Top-down layout (north = −Z toward home, south = +Z toward street):
 *
 *   ┌──[Fence left]──[Gate home]──[Fence right]──────────────────┐
 *   │                                                             │
 *   │   [Bench]       [Lamp post]        [Fire hydrant]          │
 *   │                                                             │
 *   └─────────────────────────────────────────────────────────────┘
 *
 *   North wall (−Z) : picket fence + gate back to front garden
 *   Street runs east–west across the south half
 */
export const NEIGHBORHOOD_ROOM: RoomManifest = {
  id:         "neighborhood",
  background: 0x88C0E8,
  dimensions: { width: 24, depth: 12, wallHeight: 2.5, wallThick: 0.2 },

  bounds: { min: -5.5, max: 5.5, minX: -11.5, maxX: 11.5, minZ: -5.5, maxZ: 5.5 },

  bunnyStart: [0, -3.0],

  wallColor:  0xB0A898,
  floorColor: 0x787060,  // pavement

  windows: [],

  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [4, 14, 3],
    sunIntensity:     1.4,
    ambientIntensity: 0.85,
    ambientColor:     0xD8EEFF,
  },

  objects: [
    // ── North wall — gate back to front garden ────────────────────────────────
    {
      id:          "gate-home",
      type:        "furniture",
      label:       "Home",
      position:    [0, 0.55, -5.5],
      size:        [1.6, 1.1, 0.1],
      color:       0xF5F2EB,
      interaction: { kind: "scene-change", targetRoomId: "outside" },
    },

    // ── Fence sections flanking the gate ─────────────────────────────────────
    {
      id:          "fence-home-left",
      type:        "furniture",
      label:       "Fence",
      position:    [-6.55, 0.5, -5.5],
      size:        [9.9, 1.0, 0.1],
      color:       0xF0EDE8,
      interaction: { kind: "dialog", message: "A white picket fence. The house is just on the other side. 🏡" },
    },
    {
      id:          "fence-home-right",
      type:        "furniture",
      label:       "Fence",
      position:    [6.55, 0.5, -5.5],
      size:        [9.9, 1.0, 0.1],
      color:       0xF0EDE8,
      interaction: { kind: "dialog", message: "A white picket fence. The house is just on the other side. 🏡" },
    },

    // ── Street props ──────────────────────────────────────────────────────────
    // Natural: 0.965W × 0.480H × 0.381D, base-at-origin, cY=0.240.
    // fitSize [1.3, 0.52, 0.42]: autoScale=1.083 → Y=0.240×1.083=0.260.
    {
      id:                "bench",
      type:              "furniture",
      label:             "Bench",
      position:          [-4.0, 0.26, -2.0],
      size:              [1.3, 0.52, 0.42],
      color:             PALETTE.woodLight,
      interaction:       { kind: "dialog", message: "A neighbourhood bench. Great for people-watching. 🪑" },
      flagKey:           "tgb_bench_used",
      modelPath:         MODELS.bench,
      materialOverrides: { Bench_Light_Wood: PALETTE.woodWarm, Bench_Cream_Fabric: PALETTE.fabricCream },
    },
    {
      id:          "fire-hydrant",
      type:        "furniture",
      label:       "Fire Hydrant",
      position:    [3.5, 0.35, -1.5],
      size:        [0.4, 0.7, 0.4],
      color:       0xCC3A2A,
      interaction: { kind: "dialog", message: "A shiny red fire hydrant. Don't even think about it. 🚒" },
    },

    // ── Floor lamp (street lamp) ──────────────────────────────────────────────
    {
      id:       "street-lamp",
      type:     "lamp",
      position: [0, 0, -1.5],
    },
  ],
};
