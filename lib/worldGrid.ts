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
 *   1. Import its manifest and call extractFurniture() in WORLD_ROOMS.
 *   2. Add a RoomLink connecting it to an existing room.
 *   3. Set worldX/worldZ so the schematic layout makes spatial sense.
 */

import { TUTORIAL_ROOM }  from "@/scenes/tutorial/data/room";
import { HALLWAY_ROOM }   from "@/scenes/hallway/data/room";
import { BATHROOM_ROOM }  from "@/scenes/bathroom/data/room";
import { SIBLING_ROOM }   from "@/scenes/sibling/data/room";
import type { RoomManifest, FurnitureObjectDef } from "@/engine/loaders/types";

export const MINIMAP_SCALE = 5; // pixels per game unit

// ── Shared types ──────────────────────────────────────────────────────────────

/** A single piece of furniture drawn on the local room map. */
export interface MapObject {
  x:     number; // room-local center X
  z:     number; // room-local center Z
  w:     number; // width  (X axis)
  d:     number; // depth  (Z axis)
  label: string; // furniture label shown in expanded view
}

export interface RoomNode {
  id:      string;
  label:   string;
  /** Hex CSS fill for the room rectangle (matches room background palette). */
  fill:    string;
  dims:    { w: number; d: number };
  /** Schematic center position (see top-of-file note). */
  worldX:  number;
  worldZ:  number;
  /** Furniture items to draw inside the room on the minimap. Auto-derived. */
  objects: MapObject[];
}

export interface RoomLink {
  from: string;
  to:   string;
}

// ── Furniture extractor ───────────────────────────────────────────────────────

/**
 * Pulls furniture worth showing on the minimap from a room manifest.
 *
 * Excluded:
 *   - scene-change doors (treated as room connectors, not furniture)
 *   - objects thinner than 0.25 units in either axis (doors, light switches)
 */
function extractFurniture(manifest: RoomManifest): MapObject[] {
  return manifest.objects
    .filter((o): o is FurnitureObjectDef =>
      o.type === "furniture" &&
      o.interaction.kind !== "scene-change" &&
      o.size[0] > 0.25 &&
      o.size[2] > 0.25,
    )
    .map((o) => ({
      x:     o.position[0],
      z:     o.position[2],
      w:     o.size[0],
      d:     o.size[2],
      label: o.label,
    }));
}

// ── Room nodes ────────────────────────────────────────────────────────────────

export const WORLD_ROOMS: RoomNode[] = [
  {
    id:      "tutorial",
    label:   "Bunny's Room",
    fill:    "#E8D0A8",
    dims:    { w: 8, d: 8 },
    worldX:  0,
    worldZ:  0,
    objects: extractFurniture(TUTORIAL_ROOM),
  },
  {
    id:      "hallway",
    label:   "Hallway",
    fill:    "#D4CABC",
    dims:    { w: 12, d: 5 },
    worldX:  0,
    // north of bedroom: -(bedroom_halfDepth + gap + hallway_halfDepth) = -(4 + 2.5 + 2.5)
    worldZ:  -9,
    objects: extractFurniture(HALLWAY_ROOM),  // empty — all hallway objects are thin doors
  },
  {
    id:      "bathroom",
    label:   "Bathroom",
    fill:    "#C8D8DC",
    dims:    { w: 4, d: 4 },
    // East of hallway: hallway right edge = 0 + 12/2 = 6, gap 1 unit, bathroom centre = 6+1+4/2 = 9
    worldX:  9,
    worldZ:  -9,
    objects: extractFurniture(BATHROOM_ROOM),
  },
  {
    id:      "sibling",
    label:   "Sibling's Room",
    fill:    "#D0D4E8",
    dims:    { w: 7, d: 7 },
    // West of hallway: hallway left edge = 0 - 12/2 = -6, gap 1.5 units, sibling centre = -6-1.5-7/2 = -11
    worldX:  -11,
    worldZ:  -9,
    objects: extractFurniture(SIBLING_ROOM),
  },
];

// ── Room links ────────────────────────────────────────────────────────────────

export const ROOM_LINKS: RoomLink[] = [
  { from: "tutorial", to: "hallway"  },
  { from: "hallway",  to: "bathroom" },
  { from: "hallway",  to: "sibling"  },
];
