import type { RoomManifest } from "@/engine/loaders/types";
import { MODELS } from "@/models/registry";

/**
 * The landing / upstairs hallway — 12×5 units (≈ 6m × 2.5m real-world).
 * A wide horizontal landing connecting all the rooms on this floor.
 *
 * Top-down layout (north = -Z, south = +Z, east = +X, west = -X):
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │        [Sibling's]            [Bunny's Room]         │
 *   │                                              [Bath]  │
 *   │                                                      │
 *   │                   [Parents']                         │
 *   [Family Area] ────────────────────────────────────────
 *
 *   North wall (-Z) : Sibling x≈−1.5 | Bunny x≈+4.5 (spread across wall)
 *   East wall  (+X) : bathroom (z=0, centred)
 *   South wall (+Z) : parents' bedroom x≈+1.5 (midpoint of kids, camera side)
 *   West wall  (-X) : family area / corridor to kitchen + dining room
 */
export const HALLWAY_ROOM: RoomManifest = {
  id:         "hallway",
  background: 0xBFB5A0,
  dimensions: { width: 12, depth: 5, wallHeight: 3, wallThick: 0.2 },

  // Wide X range for the corridor, narrow Z (the hallway is shallow)
  bounds: { min: -4.5, max: 4.5, minX: -4.8, maxX: 4.8, minZ: -1.8, maxZ: 1.8 },

  bunnyStart: [2.0, -1.0],   // spawns near Bunny's Room door on the north wall

  wallColor:  0xD4CABC,
  floorColor: 0x9E7E58,
  windows:    [],             // interior landing — no windows

  // Hide south panels so the camera (behind the south wall) can see the room
  hiddenWalls: ["southLeft", "southRight", "southLintel"],

  lighting: {
    sunPosition:      [2, 8, 4],
    sunIntensity:     1.0,
    ambientIntensity: 0.65,
  },

  objects: [
    // ── North wall — children's rooms (right side cluster) ────────────────────

    // Mr. Bunny's bedroom — right-centre of north wall, 2 units left of original
    {
      id:          "door-bedroom",
      type:        "furniture",
      label:       "Bunny's Room",
      position:    [2.5,  1.1, -2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "tutorial" },
      modelPath:   MODELS.door,
    },

    // Sibling's room — further left on the north wall
    {
      id:          "door-sibling",
      type:        "furniture",
      label:       "Sibling's Room",
      position:    [-3.5, 1.1, -2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "sibling" },
      modelPath:   MODELS.door,
    },

    // ── East wall — bathroom ──────────────────────────────────────────────────

    // Door width is along Z (0.9), thickness along X (0.15)
    {
      id:          "door-bathroom",
      type:        "furniture",
      label:       "Bathroom",
      position:    [5.5,  1.1,  0],
      size:        [0.15, 2.2,  0.9],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "bathroom" },
      modelPath:     MODELS.door,
      modelRotation: [0, Math.PI / 2, 0],
    },

    // ── South wall — parents' bedroom ─────────────────────────────────────────
    // Midpoint of the two kids' door x-coordinates: (2.5 + -3.5) / 2 = -0.5

    {
      id:          "door-parents",
      type:        "furniture",
      label:       "Parents' Room",
      position:    [-0.5, 1.1,  2.0],
      size:        [0.9,  2.2,  0.15],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "parents" },
      modelPath:   MODELS.door,
    },

    // ── North wall — wall sconces between the two children's doors ───────────
    // Symmetrically around x=−0.5 (midpoint of sibling x=−3.5 and bedroom x=2.5)
    // facing "south" → brown arm extends into room; shade + point-light start ON
    {
      id:       "sconce-left",
      type:     "wallLamp",
      position: [-2.0, 2.05, -2.35],
      facing:   "south",
    },
    {
      id:       "sconce-right",
      type:     "wallLamp",
      position: [1.0, 2.05, -2.35],
      facing:   "south",
    },

    // ── West wall — dining room ───────────────────────────────────────────────

    // Door width is along Z (0.9), thickness along X (0.15)
    {
      id:          "door-family",
      type:        "furniture",
      label:       "Dining Room",
      position:    [-5.5, 1.1,  0],
      size:        [0.15, 2.2,  0.9],
      color:       0x5C3D1E,
      interaction: { kind: "scene-change", targetRoomId: "dining" },
      modelPath:     MODELS.door,
      modelRotation: [0, Math.PI / 2, 0],
    },
  ],
};
