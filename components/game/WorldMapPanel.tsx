"use client";

import { useMemo } from "react";
import { WORLD_ROOMS, ROOM_LINKS, MINIMAP_SCALE } from "@/lib/worldGrid";

interface Props {
  currentRoomId: string;
  discoveredIds: Set<string>;
}

const PAD = 12;
const S   = MINIMAP_SCALE;

const CAVEAT: React.CSSProperties = { fontFamily: "var(--font-caveat)" };

interface RoomRect {
  id:        string;
  label:     string;
  fill:      string;
  cx:        number;
  cy:        number;
  hw:        number;
  hd:        number;
  isCurrent: boolean;
}

interface LinkLine { x1: number; y1: number; x2: number; y2: number }

export function WorldMapPanel({ currentRoomId, discoveredIds }: Props) {
  const { viewBox, vBoxW, vBoxH, roomRects, linkLines } = useMemo(() => {
    const visible = WORLD_ROOMS.filter((r) => discoveredIds.has(r.id));
    if (visible.length === 0) {
      return { viewBox: "0 0 60 60", vBoxW: 60, vBoxH: 60, roomRects: [], linkLines: [] };
    }

    const roomRects: RoomRect[] = visible.map((r) => ({
      ...r,
      cx:        r.worldX * S,
      cy:        r.worldZ * S,
      hw:        (r.dims.w * S) / 2,
      hd:        (r.dims.d * S) / 2,
      isCurrent: r.id === currentRoomId,
    }));

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    for (const r of roomRects) {
      minX = Math.min(minX, r.cx - r.hw); maxX = Math.max(maxX, r.cx + r.hw);
      minY = Math.min(minY, r.cy - r.hd); maxY = Math.max(maxY, r.cy + r.hd);
    }

    const vx = minX - PAD; const vy = minY - PAD;
    const vw = maxX - minX + PAD * 2;
    const vh = maxY - minY + PAD * 2;

    const linkLines: LinkLine[] = ROOM_LINKS.flatMap((link) => {
      const from = roomRects.find((r) => r.id === link.from);
      const to   = roomRects.find((r) => r.id === link.to);
      if (!from || !to) return [];
      const dy = to.cy - from.cy;
      const dx = to.cx - from.cx;
      if (Math.abs(dy) >= Math.abs(dx)) {
        const n = dy < 0;
        return [{ x1: from.cx, y1: n ? from.cy - from.hd : from.cy + from.hd,
                  x2: to.cx,   y2: n ? to.cy   + to.hd   : to.cy   - to.hd }];
      }
      const e = dx > 0;
      return [{ x1: e ? from.cx + from.hw : from.cx - from.hw, y1: from.cy,
                x2: e ? to.cx   - to.hw   : to.cx   + to.hw,   y2: to.cy }];
    });

    return { viewBox: `${vx} ${vy} ${vw} ${vh}`, vBoxW: vw, vBoxH: vh, roomRects, linkLines };
  }, [currentRoomId, discoveredIds]);

  const discovered = discoveredIds.size;

  return (
    <div
      className="flex-1 flex flex-col overflow-y-auto"
      style={{
        background:      "#FFF9F0",
        backgroundImage: "repeating-linear-gradient(transparent, transparent 31px, #C5D8E8 31px, #C5D8E8 32px)",
        lineHeight:      "32px",
      }}
    >
      <div className="flex flex-col items-center py-8 px-6 gap-6">
        {/* Title */}
        <div className="text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-amber-700/50">
            Explorer&apos;s Notes
          </p>
          <h2 className="text-3xl font-bold text-amber-900/80 leading-tight" style={CAVEAT}>
            World Map
          </h2>
        </div>

        {/* Map SVG */}
        {roomRects.length > 0 ? (
          <div
            className="w-full"
            style={{ maxWidth: "380px", aspectRatio: `${vBoxW} / ${vBoxH}` }}
          >
            <svg
              viewBox={viewBox}
              width="100%"
              height="100%"
              className="block overflow-visible"
            >
              <defs>
                {/*
                  Displayed at up to 380px, viewBox ~90 units → 1 unit ≈ 4.2px.
                  scale=1.8 → ~7.6px displacement: clearly hand-drawn.
                */}
                <filter id="wm-crayon" x="-10%" y="-10%" width="120%" height="120%">
                  <feTurbulence
                    type="turbulence"
                    baseFrequency="0.055"
                    numOctaves="4"
                    seed="41"
                    result="noise"
                  />
                  <feDisplacementMap
                    in="SourceGraphic"
                    in2="noise"
                    scale="1.8"
                    xChannelSelector="R"
                    yChannelSelector="G"
                  />
                </filter>

                <filter id="wm-glow" x="-30%" y="-30%" width="160%" height="160%">
                  <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
                  <feFlood floodColor="rgba(200,140,10,0.4)" result="colour" />
                  <feComposite in="colour" in2="blur" operator="in" result="glow" />
                  <feMerge>
                    <feMergeNode in="glow" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              <g filter="url(#wm-crayon)">
                {/* Connection corridors */}
                {linkLines.map((l, i) => (
                  <line
                    key={i}
                    x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
                    stroke="rgba(140,100,50,0.45)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                ))}

                {/* Rooms — no furniture, label near top of rect */}
                {roomRects.map((r) => (
                  <g key={r.id} filter={r.isCurrent ? "url(#wm-glow)" : undefined}>
                    <rect
                      x={r.cx - r.hw} y={r.cy - r.hd}
                      width={r.hw * 2} height={r.hd * 2}
                      fill={r.fill + (r.isCurrent ? "CC" : "77")}
                      stroke={r.isCurrent ? "rgba(180,120,10,0.95)" : "rgba(130,95,50,0.65)"}
                      strokeWidth={r.isCurrent ? 2.5 : 1.5}
                      strokeDasharray={r.isCurrent ? undefined : "3 1"}
                      strokeLinejoin="round"
                      rx="2"
                    />

                    {/* Label near top of room rect — stays clear of center/furniture */}
                    <text
                      x={r.cx}
                      y={r.cy - r.hd + 7}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fontSize={r.isCurrent ? 6 : 5}
                      fill={r.isCurrent ? "rgba(130,80,5,0.95)" : "rgba(100,65,25,0.70)"}
                      fontFamily="system-ui, sans-serif"
                      fontWeight={r.isCurrent ? "700" : "500"}
                    >
                      {r.label}
                    </text>

                    {/* "You are here" marker for current room */}
                    {r.isCurrent && (
                      <text
                        x={r.cx}
                        y={r.cy + 3}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={5}
                        fill="rgba(160,100,10,0.70)"
                        fontFamily="system-ui, sans-serif"
                      >
                        ★ here
                      </text>
                    )}
                  </g>
                ))}
              </g>
            </svg>
          </div>
        ) : (
          <p className="text-amber-600/40 text-lg text-center" style={CAVEAT}>
            No rooms discovered yet…
          </p>
        )}

        {/* Discovery count */}
        <p className="text-sm text-amber-700/55 text-center" style={CAVEAT}>
          {discovered} room{discovered !== 1 ? "s" : ""} explored
        </p>
      </div>
    </div>
  );
}
