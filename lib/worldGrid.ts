/**
 * Schematic world-map data.
 *
 * Positions are in SCHEMATIC units — not 1:1 spatial, but proportional to real
 * room dimensions so the minimap rectangles are correctly sized relative to each
 * other. The gap between rooms represents the door connection visually.
 *
 * Coordinate convention for the minimap (matches the game):
 *   worldX: positive = east,   negative = west
 *   worldZ: positive = south,  negative = north   (north = UP on the minimap)
 *
 * When a new room is built:
 *   1. Add a RoomNode here.
 *   2. Add a RoomLink connecting it to an existing room.
 *   3. Adjust worldX/worldZ so the layout looks sensible on the minimap.
 */

export const MINIMAP_SCALE = 5; // pixels per game unit

export interface RoomNode {
  id:     string;
  label:  string;
  /** Hex CSS fill for the room rectangle (matches room background palette). */
  fill:   string;
  dims:   { w: number; d: number };
  /** Schematic center position (see top-of-file note). */
  worldX: number;
  worldZ: number;
}

export interface RoomLink {
  from: string;
  to:   string;
}

// ── Room nodes ────────────────────────────────────────────────────────────────

export const WORLD_ROOMS: RoomNode[] = [
  {
    id:     "tutorial",
    label:  "Bunny's Room",
    fill:   "#E8D0A8",
    dims:   { w: 8, d: 8 },
    worldX: 0,
    worldZ: 0,
  },
  {
    id:     "hallway",
    label:  "Hallway",
    fill:   "#D4CABC",
    dims:   { w: 12, d: 5 },
    worldX: 0,
    // north of bedroom: -(bedroom_halfDepth + gap + hallway_halfDepth) = -(4 + 2.5 + 2.5)
    worldZ: -9,
  },
  // Future rooms — add entries here as manifests are built:
  // { id: "sibling",  label: "Sibling's Room", fill: "#D8CCB8", dims: { w: 7, d: 7 }, worldX: -8, worldZ: -9 },
  // { id: "bathroom", label: "Bathroom",        fill: "#C8D4D8", dims: { w: 4, d: 4 }, worldX:  8, worldZ: -9 },
  // { id: "parents",  label: "Parents' Room",   fill: "#D4C4B0", dims: { w: 9, d: 8 }, worldX:  0, worldZ:  9 },
  // { id: "family-corridor", label: "Corridor", fill: "#C8BFAE", dims: { w: 3, d: 8 }, worldX: -11, worldZ: -9 },
];

// ── Room links ────────────────────────────────────────────────────────────────

export const ROOM_LINKS: RoomLink[] = [
  { from: "tutorial", to: "hallway" },
  // { from: "hallway",  to: "sibling" },
  // { from: "hallway",  to: "bathroom" },
  // { from: "tutorial", to: "parents"  },  // south wall connection
  // { from: "hallway",  to: "family-corridor" },
];
