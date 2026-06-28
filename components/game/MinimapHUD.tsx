"use client";

import { useMemo } from "react";
import { WORLD_ROOMS, ROOM_LINKS, MINIMAP_SCALE } from "@/lib/worldGrid";

interface Props {
  currentRoomId: string;
  discoveredIds: Set<string>;
}

interface RoomRect {
  id:        string;
  label:     string;
  fill:      string;
  cx:        number; // SVG center X
  cy:        number; // SVG center Y (−Z = north = upward, so northward rooms have smaller Y)
  hw:        number; // half-width in pixels
  hd:        number; // half-depth in pixels
  isCurrent: boolean;
}

interface LinkLine {
  x1: number; y1: number;
  x2: number; y2: number;
}

const PAD = 12; // viewport padding in SVG units

export function MinimapHUD({ currentRoomId, discoveredIds }: Props) {
  const { viewBox, svgHeight, roomRects, linkLines } = useMemo(() => {
    const visible = WORLD_ROOMS.filter((r) => discoveredIds.has(r.id));
    if (visible.length === 0) {
      return { viewBox: "0 0 60 60", svgHeight: 60, roomRects: [], linkLines: [] };
    }

    // Convert world coords → SVG pixel coords.
    // X maps directly; Z is negated so that −Z (north) renders as lower Y (upward).
    const roomRects: RoomRect[] = visible.map((r) => ({
      ...r,
      cx:        r.worldX * MINIMAP_SCALE,
      cy:        r.worldZ * MINIMAP_SCALE,
      hw:        (r.dims.w * MINIMAP_SCALE) / 2,
      hd:        (r.dims.d * MINIMAP_SCALE) / 2,
      isCurrent: r.id === currentRoomId,
    }));

    // Bounding box of all visible rooms
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const r of roomRects) {
      minX = Math.min(minX, r.cx - r.hw); maxX = Math.max(maxX, r.cx + r.hw);
      minY = Math.min(minY, r.cy - r.hd); maxY = Math.max(maxY, r.cy + r.hd);
    }

    const vx = minX - PAD;
    const vy = minY - PAD;
    const vw = maxX - minX + PAD * 2;
    const vh = maxY - minY + PAD * 2;
    const viewBox = `${vx} ${vy} ${vw} ${vh}`;

    // Scale to 130px display width; compute proportional height
    const svgHeight = Math.round((130 * vh) / vw);

    // Connection lines: connect facing edges of adjacent discovered rooms
    const linkLines: LinkLine[] = ROOM_LINKS.flatMap((link) => {
      const from = roomRects.find((r) => r.id === link.from);
      const to   = roomRects.find((r) => r.id === link.to);
      if (!from || !to) return [];

      const dy = to.cy - from.cy;
      const dx = to.cx - from.cx;

      // Primarily vertical (north-south) relationship
      if (Math.abs(dy) >= Math.abs(dx)) {
        const goingNorth = dy < 0;
        return [{
          x1: from.cx, y1: goingNorth ? from.cy - from.hd : from.cy + from.hd,
          x2: to.cx,   y2: goingNorth ? to.cy   + to.hd   : to.cy   - to.hd,
        }];
      }
      // Primarily horizontal (east-west) relationship
      const goingEast = dx > 0;
      return [{
        x1: goingEast ? from.cx + from.hw : from.cx - from.hw, y1: from.cy,
        x2: goingEast ? to.cx   - to.hw   : to.cx   + to.hw,   y2: to.cy,
      }];
    });

    return { viewBox, svgHeight, roomRects, linkLines };
  }, [currentRoomId, discoveredIds]);

  if (roomRects.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1.5 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md px-3 pt-2 pb-3 shadow-[0_4px_20px_rgba(0,0,0,0.45)]">
      <span className="text-white/45 text-[9px] font-semibold tracking-[0.18em] uppercase select-none">
        Map
      </span>

      <svg
        viewBox={viewBox}
        width={130}
        height={svgHeight}
        className="block overflow-visible"
      >
        <defs>
          {/* Subtle crayon-wobble displacement filter */}
          <filter id="mm-crayon" x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.07"
              numOctaves="3"
              seed="11"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Glow for the current room */}
          <filter id="mm-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2" result="blur" />
            <feFlood floodColor="rgba(255,210,60,0.55)" result="colour" />
            <feComposite in="colour" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g filter="url(#mm-crayon)">
          {/* Corridor connectors */}
          {linkLines.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="rgba(220,200,165,0.45)"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          ))}

          {/* Room rectangles */}
          {roomRects.map((r) => (
            <g key={r.id} filter={r.isCurrent ? "url(#mm-glow)" : undefined}>
              <rect
                x={r.cx - r.hw}
                y={r.cy - r.hd}
                width={r.hw * 2}
                height={r.hd * 2}
                fill={r.fill + (r.isCurrent ? "DD" : "77")}
                stroke={r.isCurrent ? "rgba(255,215,60,0.95)" : "rgba(200,185,155,0.65)"}
                strokeWidth={r.isCurrent ? 2.5 : 1.2}
                strokeLinejoin="round"
                rx="2"
              />
              <text
                x={r.cx}
                y={r.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={4.5}
                fill={r.isCurrent ? "rgba(255,230,120,0.95)" : "rgba(240,230,210,0.6)"}
                fontFamily="system-ui, sans-serif"
                fontWeight={r.isCurrent ? "700" : "500"}
              >
                {r.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
