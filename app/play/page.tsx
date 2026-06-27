import { GameCanvasLoader } from "@/components/game/GameCanvasLoader";

export const metadata = { title: "Tummy Gummy Bunny" };

export default function PlayPage() {
  return (
    <main className="w-screen h-screen overflow-hidden">
      <GameCanvasLoader />
    </main>
  );
}
