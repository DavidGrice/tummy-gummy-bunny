"use client";

import { useState } from "react";
import { WORLD_ROOMS } from "@/lib/worldGrid";

interface Props {
  currentRoomId: string;
}

// Padding around the room in SVG/game units
const PAD = 1.0;

export function RoomMapHUD({ currentRoomId }: Props) {
  const [expanded, setExpanded] = useState(false);

  const room = WORLD_ROOMS.find((r) => r.id === currentRoomId);
  if (!room) return null;

  const { dims, objects, label, fill } = room;

  // viewBox: room centered at (0,0) in local coordinates
  const vx = -dims.w / 2 - PAD;
  const vy = -dims.d / 2 - PAD;
  const vw = dims.w + PAD * 2;
  const vh = dims.d + PAD * 2;
  const viewBox = `${vx} ${vy} ${vw} ${vh}`;

  // The viewBox is only ~10 game-units wide, so displacement scale must be
  // much smaller than the world-map: target ~7px physical displacement.
  //   small (140px wide) : 1 SVG unit ≈ 140/vw px  → scale = 7 / (140/vw)
  //   large  (480px wide) : 1 SVG unit ≈ 480/vw px  → scale = 7 / (480/vw)
  const crayonScaleSm = parseFloat(((7 / (140 / vw)) * 0.85).toFixed(2));
  const crayonScaleLg = parseFloat(((7 / (480 / vw)) * 0.85).toFixed(2));

  const smW = 140;
  const smH = Math.round(smW * vh / vw);

  function RoomSVG({ size }: { size: "sm" | "lg" }) {
    const isLg = size === "lg";
    const cr   = `rm-cr-${size}`;
    const cp   = `rm-cp-${size}`;

    return (
      <svg
        viewBox={viewBox}
        width={isLg ? "100%" : smW}
        height={isLg ? "100%" : smH}
        className="block"
      >
        <defs>
          {/*
            baseFrequency 0.5 ≈ noise cells ~2 SVG units wide → ~28px at 140px display.
            scale ~0.5 ≈ 7px physical displacement at the small card size.
          */}
          <filter id={cr} x="-8%" y="-8%" width="116%" height="116%">
            <feTurbulence
              type="turbulence"
              baseFrequency="0.5"
              numOctaves="3"
              seed="31"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={isLg ? crayonScaleLg : crayonScaleSm}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          <clipPath id={cp}>
            <rect
              x={-dims.w / 2} y={-dims.d / 2}
              width={dims.w}   height={dims.d}
            />
          </clipPath>
        </defs>

        <g filter={`url(#${cr})`}>
          {/* Room floor */}
          <rect
            x={-dims.w / 2} y={-dims.d / 2}
            width={dims.w}   height={dims.d}
            fill={fill + "AA"}
            stroke="rgba(160,130,90,0.75)"
            strokeWidth="0.18"
            strokeDasharray="0.7 0.2"
            strokeLinejoin="round"
            rx="0.25"
          />

          {/* Furniture */}
          <g clipPath={`url(#${cp})`}>
            {objects.map((o, i) => (
              <g key={i}>
                <rect
                  x={o.x - o.w / 2} y={o.z - o.d / 2}
                  width={o.w}        height={o.d}
                  fill="rgba(80,45,10,0.50)"
                  stroke="rgba(60,30,5,0.30)"
                  strokeWidth="0.06"
                  rx="0.12"
                />
                {isLg && (
                  <text
                    x={o.x}
                    y={o.z}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={Math.min(o.w, o.d) * 0.38}
                    fill="rgba(255,245,220,0.90)"
                    fontFamily="system-ui, sans-serif"
                    fontWeight="600"
                    style={{ pointerEvents: "none" }}
                  >
                    {o.label}
                  </text>
                )}
              </g>
            ))}
          </g>
        </g>
      </svg>
    );
  }

  return (
    <>
      {/* ── Small corner card ────────────────────────────────────────────── */}
      <div
        className="absolute top-4 right-4 z-20 flex flex-col rounded-2xl border border-white/20 bg-black/40 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.45)] cursor-pointer hover:border-white/35 hover:bg-black/50 transition-colors overflow-hidden"
        onClick={() => setExpanded(true)}
        title="Tap to expand room layout"
      >
        <div className="flex items-center justify-between px-3 pt-2 pb-1 gap-3">
          <span className="text-white/45 text-[9px] font-semibold tracking-[0.18em] uppercase select-none truncate">
            {label}
          </span>
          {/* Expand icon */}
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="text-white/35 shrink-0">
            <path
              d="M7 1.5h2.5V4M9.5 1.5 6 5M4 9.5H1.5V7M1.5 9.5 5 6"
              stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>

        <div className="px-3 pb-3">
          <RoomSVG size="sm" />
        </div>
      </div>

      {/* ── Expanded modal ───────────────────────────────────────────────── */}
      {expanded && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative flex flex-col rounded-3xl border border-white/25 bg-black/55 backdrop-blur-xl shadow-[0_12px_60px_rgba(0,0,0,0.7)] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: "min(85vw, 520px)", width: "100%" }}
          >
            <div className="flex items-center justify-between px-5 pt-4 pb-2">
              <div>
                <p className="text-white/40 text-[9px] font-semibold tracking-[0.2em] uppercase">
                  Room Layout
                </p>
                <h3 className="text-white/85 text-base font-semibold leading-none">{label}</h3>
              </div>
              <button
                onClick={() => setExpanded(false)}
                aria-label="Close room map"
                className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white/90 transition-colors text-sm"
              >
                ✕
              </button>
            </div>

            <div className="px-4 pb-1" style={{ aspectRatio: `${vw} / ${vh}` }}>
              <RoomSVG size="lg" />
            </div>

            <p className="pb-3 text-center text-white/30 text-[10px] select-none">
              Tap outside to close
            </p>
          </div>
        </div>
      )}
    </>
  );
}
