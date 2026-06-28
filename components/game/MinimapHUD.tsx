"use client";

import { useState, useMemo } from "react";
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
  objRects:  { x: number; y: number; w: number; h: number }[];
}

interface LinkLine { x1: number; y1: number; x2: number; y2: number }

const PAD = 12;
const S   = MINIMAP_SCALE;

export function MinimapHUD({ currentRoomId, discoveredIds }: Props) {
  const [expanded, setExpanded] = useState(false);

  const { viewBox, vBoxW, vBoxH, roomRects, linkLines } = useMemo(() => {
    const visible = WORLD_ROOMS.filter((r) => discoveredIds.has(r.id));
    if (visible.length === 0) {
      return { viewBox: "0 0 60 60", vBoxW: 60, vBoxH: 60, roomRects: [], linkLines: [] };
    }

    const roomRects: RoomRect[] = visible.map((r) => {
      const cx = r.worldX * S;
      const cy = r.worldZ * S;
      const hw = (r.dims.w * S) / 2;
      const hd = (r.dims.d * S) / 2;
      const objRects = r.objects.map((o) => ({
        x: cx + o.x * S - (o.w * S) / 2,
        y: cy + o.z * S - (o.d * S) / 2,
        w: o.w * S,
        h: o.d * S,
      }));
      return { ...r, cx, cy, hw, hd, isCurrent: r.id === currentRoomId, objRects };
    });

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

    return { viewBox: `${vx} ${vy} ${vw} ${vh}`, vBoxW: vw, vBoxH: vh, roomRects, linkLines };
  }, [currentRoomId, discoveredIds]);

  if (roomRects.length === 0) return null;

  // ── Shared SVG markup ──────────────────────────────────────────────────────
  // `size` = "sm" for the corner minimap, "lg" for the expanded modal.
  // Filter IDs must be unique per SVG so both can coexist in the DOM.
  function MapSVG({ size }: { size: "sm" | "lg" }) {
    const isLg = size === "lg";
    // Scale-5 displacement looks great at 130px; at ~400px it'd be ~25px — far too wobbly.
    // At large size, keep physical displacement ≈ 7–9px by scaling proportionally.
    const crayonScale = isLg ? 1.8 : 5;
    const cr = `mm-cr-${size}`;
    const gl = `mm-gl-${size}`;

    return (
      <svg
        viewBox={viewBox}
        width={isLg ? "100%" : 130}
        height={isLg ? "100%" : Math.round((130 * vBoxH) / vBoxW)}
        className="block overflow-visible"
      >
        <defs>
          <filter id={cr} x="-10%" y="-10%" width="120%" height="120%">
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
              scale={crayonScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <filter id={gl} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur in="SourceAlpha" stdDeviation="2.5" result="blur" />
            <feFlood floodColor="rgba(255,200,40,0.5)" result="colour" />
            <feComposite in="colour" in2="blur" operator="in" result="glow" />
            <feMerge>
              <feMergeNode in="glow" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {roomRects.map((r) => (
            <clipPath key={`clip-${r.id}-${size}`} id={`mm-clip-${r.id}-${size}`}>
              <rect x={r.cx - r.hw} y={r.cy - r.hd} width={r.hw * 2} height={r.hd * 2} />
            </clipPath>
          ))}
        </defs>

        <g filter={`url(#${cr})`}>
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
            <g key={r.id} filter={r.isCurrent ? `url(#${gl})` : undefined}>
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

              {/* Furniture — clipped to room bounds */}
              {r.objRects.length > 0 && (
                <g clipPath={`url(#mm-clip-${r.id}-${size})`}>
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
                fontSize={isLg ? 5.5 : 4.5}
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
    );
  }

  // ── Small corner minimap ───────────────────────────────────────────────────
  const smallMinimap = (
    <div
      className="absolute top-4 right-4 z-20 flex flex-col items-center gap-1.5 rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md px-3 pt-2 pb-3 shadow-[0_4px_20px_rgba(0,0,0,0.45)] cursor-pointer hover:border-white/35 hover:bg-black/50 transition-colors"
      onClick={() => setExpanded(true)}
      title="Tap to expand map"
    >
      <div className="flex w-full items-center justify-between">
        <span className="text-white/45 text-[9px] font-semibold tracking-[0.18em] uppercase select-none">
          Map
        </span>
        {/* Expand icon — two diagonal outward arrows */}
        <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="text-white/35">
          <path d="M7 1.5h2.5V4M9.5 1.5 6 5M4 9.5H1.5V7M1.5 9.5 5 6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <MapSVG size="sm" />
    </div>
  );

  // ── Full-screen expanded modal ─────────────────────────────────────────────
  const expandedModal = (
    <div
      className="absolute inset-0 z-40 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.72)" }}
      onClick={() => setExpanded(false)}
    >
      <div
        className="relative flex flex-col gap-0 rounded-3xl border border-white/25 bg-black/55 backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.7)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: "min(82vw, 520px)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2">
          <div>
            <p className="text-white/40 text-[9px] font-semibold tracking-[0.2em] uppercase">House</p>
            <h3 className="text-white/80 text-base font-semibold tracking-tight leading-none">Map</h3>
          </div>
          <button
            onClick={() => setExpanded(false)}
            aria-label="Close map"
            className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/90 transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Map SVG — fills up to 82vw but no more than 520px; height from aspect ratio */}
        <div
          className="px-4 pb-1"
          style={{
            width: "100%",
            aspectRatio: `${vBoxW} / ${vBoxH}`,
          }}
        >
          <MapSVG size="lg" />
        </div>

        {/* Footer */}
        <p className="pb-3 text-center text-white/30 text-[10px] select-none">
          Tap outside to close
        </p>
      </div>
    </div>
  );

  return (
    <>
      {smallMinimap}
      {expanded && expandedModal}
    </>
  );
}
