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
  cx:        number;
  cy:        number;
  hw:        number;
  hd:        number;
  isCurrent: boolean;
  /** Object rects in SVG coordinates, already positioned relative to room center. */
  objRects:  { x: number; y: number; w: number; h: number }[];
}

interface LinkLine { x1: number; y1: number; x2: number; y2: number }

const PAD = 12;
const S   = MINIMAP_SCALE;

export function MinimapHUD({ currentRoomId, discoveredIds }: Props) {
  const { viewBox, svgHeight, roomRects, linkLines } = useMemo(() => {
    const visible = WORLD_ROOMS.filter((r) => discoveredIds.has(r.id));
    if (visible.length === 0) {
      return { viewBox: "0 0 60 60", svgHeight: 60, roomRects: [], linkLines: [] };
    }

    // World → SVG: X maps directly; Z is kept as-is (−Z = north = negative Y = up).
    const roomRects: RoomRect[] = visible.map((r) => {
      const cx = r.worldX * S;
      const cy = r.worldZ * S;
      const hw = (r.dims.w * S) / 2;
      const hd = (r.dims.d * S) / 2;

      // Furniture objects in SVG coords (room-local positions offset from room centre)
      const objRects = r.objects.map((o) => ({
        x: cx + o.x * S - (o.w * S) / 2,
        y: cy + o.z * S - (o.d * S) / 2,
        w: o.w * S,
        h: o.d * S,
      }));

      return { ...r, cx, cy, hw, hd, isCurrent: r.id === currentRoomId, objRects };
    });

    // Dynamic viewBox from bounding box of all visible rooms
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

    const svgHeight = Math.round((130 * vh) / vw);

    // Edge-to-edge corridor lines between adjacent discovered rooms
    const linkLines: LinkLine[] = ROOM_LINKS.flatMap((link) => {
      const from = roomRects.find((r) => r.id === link.from);
      const to   = roomRects.find((r) => r.id === link.to);
      if (!from || !to) return [];

      const dy = to.cy - from.cy;
      const dx = to.cx - from.cx;

      if (Math.abs(dy) >= Math.abs(dx)) {
        const goingNorth = dy < 0;
        return [{
          x1: from.cx, y1: goingNorth ? from.cy - from.hd : from.cy + from.hd,
          x2: to.cx,   y2: goingNorth ? to.cy   + to.hd   : to.cy   - to.hd,
        }];
      }
      const goingEast = dx > 0;
      return [{
        x1: goingEast ? from.cx + from.hw : from.cx - from.hw, y1: from.cy,
        x2: goingEast ? to.cx   - to.hw   : to.cx   + to.hw,   y2: to.cy,
      }];
    });

    return { viewBox: `${vx} ${vy} ${vw} ${vh}`, svgHeight, roomRects, linkLines };
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
          {/*
            Crayon / pencil wobble.
            type="turbulence" gives sharp, jagged displacement (vs fractalNoise which is smooth).
            scale="5" displaces ~7–8 screen pixels at 130px display width — clearly hand-drawn.
          */}
          <filter id="mm-crayon" x="-10%" y="-10%" width="120%" height="120%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.055"
              numOctaves="4"
              seed="17"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="5"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Warm amber glow drawn behind the current room's rect */}
          <filter id="mm-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
            <feFlood floodColor="rgba(255,200,40,0.5)" result="colour" />
            <feComposite in="colour" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Clip paths — one per room so furniture never bleeds outside its rect */}
          {roomRects.map((r) => (
            <clipPath key={`clip-${r.id}`} id={`mm-clip-${r.id}`}>
              <rect x={r.cx - r.hw} y={r.cy - r.hd} width={r.hw * 2} height={r.hd * 2} />
            </clipPath>
          ))}
        </defs>

        {/* Everything inside this group gets the crayon wobble */}
        <g filter="url(#mm-crayon)">

          {/* Corridor connectors */}
          {linkLines.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="rgba(210,190,155,0.55)"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}

          {/* Rooms */}
          {roomRects.map((r) => (
            <g key={r.id} filter={r.isCurrent ? "url(#mm-glow)" : undefined}>

              {/* Room fill + border */}
              <rect
                x={r.cx - r.hw}
                y={r.cy - r.hd}
                width={r.hw * 2}
                height={r.hd * 2}
                fill={r.fill + (r.isCurrent ? "DD" : "88")}
                stroke={r.isCurrent ? "rgba(255,210,50,0.95)" : "rgba(190,170,140,0.7)"}
                strokeWidth={r.isCurrent ? 2.5 : 1.5}
                strokeDasharray={r.isCurrent ? undefined : "3 1"}
                strokeLinejoin="round"
                rx="2"
              />

              {/* Furniture items — clipped to room bounds */}
              {r.objRects.length > 0 && (
                <g clipPath={`url(#mm-clip-${r.id})`}>
                  {r.objRects.map((o, i) => (
                    <rect
                      key={i}
                      x={o.x} y={o.y}
                      width={o.w} height={o.h}
                      fill={r.isCurrent ? "rgba(70,38,8,0.55)" : "rgba(70,38,8,0.28)"}
                      rx="0.8"
                    />
                  ))}
                </g>
              )}

              {/* Room label */}
              <text
                x={r.cx}
                y={r.cy}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={4.5}
                fill={r.isCurrent ? "rgba(255,228,110,0.95)" : "rgba(235,220,195,0.65)"}
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
