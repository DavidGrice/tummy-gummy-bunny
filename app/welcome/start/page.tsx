import Link from "next/link";
import { PageShell } from "@/components/ui/nav/PageShell";
import { MenuButton } from "@/components/ui/nav/MenuButton";

export const metadata = { title: "Tummy Gummy Bunny — Start" };

export default function StartPage() {
  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">

        <div className="w-full max-w-md rounded-3xl bg-gray-900/60 backdrop-blur-md border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-8 py-10 flex flex-col items-center">

          <div className="text-5xl mb-5" aria-hidden>🎮</div>

          <h1 className="text-2xl font-black uppercase tracking-widest text-summer-cream text-center">
            Start Game
          </h1>
          <p className="mt-2 text-xs tracking-widest uppercase text-summer-peach/60 text-center">
            Choose how you&apos;d like to play
          </p>

          <div className="mt-8 mb-6 w-full border-t border-white/10" />

          <nav className="w-full space-y-3" aria-label="Start options">
            <MenuButton
              icon="📖"
              label="Tutorial"
              href="/play"
              description="Learn the ropes — recommended for new players"
            />
            <MenuButton
              icon="🗺️"
              label="New Game"
              href="/play"
              description="Begin your adventure from the start"
            />
            <MenuButton
              icon="⏳"
              label="Continue"
              href="#"
              description="Coming soon — resume your story"
              disabled
            />
          </nav>

          <div className="mt-6 pt-5 border-t border-white/10 w-full">
            <Link
              href="/welcome"
              className="group flex items-center justify-center gap-2 min-h-[44px] text-xs font-semibold tracking-widest uppercase text-summer-cream/50 hover:text-summer-cream transition-colors duration-200"
            >
              <span className="transition-transform duration-200 group-hover:-translate-x-1">←</span>
              Main Menu
            </Link>
          </div>

        </div>
      </div>
    </PageShell>
  );
}
