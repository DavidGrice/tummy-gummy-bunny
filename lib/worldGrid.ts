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
import { PARENTS_ROOM }   from "@/scenes/parents/data/room";
import { DINING_ROOM }    from "@/scenes/dining/data/room";
import { KITCHEN_ROOM }   from "@/scenes/kitchen/data/room";
import { LIVING_ROOM }    from "@/scenes/living/data/room";
import { OUTSIDE_ROOM }   from "@/scenes/outside/data/room";
import type { RoomManifest, FurnitureObjectDef } from "@/engine/loaders/types";

export const MINIMAP_SCALE = 5; // pixels per game unit

// ── Shared types ──────────────────────────────────────────────────────────────

/** A single object drawn on the local room map. */
export interface MapObject {
  x:      number;  // room-local center X
  z:      number;  // room-local center Z
  w:      number;  // width  (X axis)
  d:      number;  // depth  (Z axis)
  label:  string;  // label shown in expanded view
  isDoor: boolean; // true → render as a door with directional label
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
 * Extracts furniture and doors from a room manifest for minimap rendering.
 *
 * Doors: detected by one axis being very thin (< 0.20 units — all game doors use 0.15).
 *   Their display size is boosted to 0.45 so they're visible as a blob on the map.
 *
 * Furniture: both axes must be > 0.25 to be meaningful at minimap scale.
 *
 * Excluded: light switches and other tiny wall-mounted items (both axes < 0.15).
 */
function extractFurniture(manifest: RoomManifest): MapObject[] {
  const result: MapObject[] = [];
  for (const o of manifest.objects) {
    if (o.type !== "furniture") continue;
    const [w, , d] = o.size;
    if (w < 0.15 && d < 0.15) continue; // light switches, tiny frames
    const isDoor = Math.min(w, d) < 0.20; // one thin axis → door shape
    if (!isDoor && (w <= 0.25 || d <= 0.25)) continue; // thin non-door furniture
    result.push({
      x:      o.position[0],
      z:      o.position[2],
      w:      isDoor ? Math.max(w, 0.45) : w,
      d:      isDoor ? Math.max(d, 0.45) : d,
      label:  o.label,
      isDoor,
    });
  }
  return result;
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
  {
    id:      "parents",
    label:   "Parents' Room",
    fill:    "#DDD0C0",
    dims:    { w: 9, d: 8 },
    // South-west of hallway — offset west to avoid overlapping Bunny's Room (0,0).
    // cx=-50, hw=22.5 → right edge=-27.5; bedroom left edge=-20 (7.5-unit gap).
    worldX:  -10,
    worldZ:  -2,
    objects: extractFurniture(PARENTS_ROOM),
  },
  {
    id:      "dining",
    label:   "Dining Room",
    fill:    "#D8C8A0",
    dims:    { w: 8, d: 7 },
    // West of hallway: hallway left edge = -30px; sibling left edge = -72.5px.
    // Place dining so right edge (-80px) clears sibling (-72.5px) by 7.5px.
    // cx = -100px → worldX = -20. Connector line represents the corridor passage.
    worldX:  -20,
    worldZ:  -9,
    objects: extractFurniture(DINING_ROOM),
  },
  {
    id:      "kitchen",
    label:   "Kitchen",
    fill:    "#CDD5D8",
    dims:    { w: 7, d: 6 },
    // South of dining: dining bottom edge = (-9 + 3.5) = -5.5 schematic units.
    // Gap 1 unit, kitchen half-depth 3. Kitchen centre Z = -5.5 + 1 + 3 = -1.5.
    // Keep same X as dining so the link line runs straight down.
    worldX:  -20,
    worldZ:  -2,
    objects: extractFurniture(KITCHEN_ROOM),
  },
  {
    id:      "living",
    label:   "Living Room",
    fill:    "#E8DCC8",
    dims:    { w: 9, d: 8 },
    // East of kitchen on schematic: kitchen right edge = -20+3.5 = -16.5.
    // Gap 1.5 units, living half-width 4.5. Living centre X = -16.5+1.5+4.5 = -10.5.
    // Vertically aligned with kitchen so link line is horizontal.
    worldX:  -10,
    worldZ:  -2,
    objects: extractFurniture(LIVING_ROOM),
  },
  {
    id:      "outside",
    label:   "Front Garden",
    fill:    "#87CEEB",
    dims:    { w: 12, d: 8 },
    // South of living on schematic: living bottom edge = -2+4 = 2.
    // Gap 1 unit, outside half-depth 4. Outside centre Z = 2+1+4 = 7.
    worldX:  -10,
    worldZ:   7,
    objects: extractFurniture(OUTSIDE_ROOM),
  },
];

// ── Room links ────────────────────────────────────────────────────────────────

export const ROOM_LINKS: RoomLink[] = [
  { from: "tutorial", to: "hallway"  },
  { from: "hallway",  to: "bathroom" },
  { from: "hallway",  to: "sibling"  },
  { from: "hallway",  to: "parents"  },
  { from: "hallway",  to: "dining"   },
  { from: "dining",   to: "kitchen"  },
  { from: "kitchen",  to: "living"   },
  { from: "living",   to: "outside"  },
];
