"use client";

import dynamic from "next/dynamic";

// Three.js requires browser APIs (WebGL, canvas, window). ssr: false must live
// inside a client component — Next.js 15 disallows it in Server Components.
const GameCanvas = dynamic(
  () => import("./GameCanvas").then((m) => ({ default: m.GameCanvas })),
  { ssr: false, loading: () => <div className="w-full h-full bg-summer-char" /> }
);

export function GameCanvasLoader() {
  return <GameCanvas />;
}
