import { PageShell } from "@/components/ui/nav/PageShell";
import { MenuButton } from "@/components/ui/nav/MenuButton";

export const metadata = { title: "Tummy Gummy Bunny — Start" };

export default function StartPage() {
  return (
    <PageShell backHref="/welcome" backLabel="Main Menu">
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">

        <div className="text-5xl mb-5" aria-hidden>🎮</div>

        <h1 className="text-2xl font-black uppercase tracking-widest text-summer-cream text-center">
          Start Game
        </h1>
        <p className="mt-2 text-xs tracking-widest uppercase text-summer-peach/60 text-center">
          Choose how you&apos;d like to play
        </p>

        <div className="mt-10 w-full max-w-sm space-y-3">
          <MenuButton
            icon="📖"
            label="Tutorial"
            href="/"
            description="Learn the ropes — recommended for new players"
          />
          <MenuButton
            icon="🗺️"
            label="New Game"
            href="/"
            description="Begin your adventure from the start"
          />
          <MenuButton
            icon="⏳"
            label="Continue"
            href="#"
            description="Coming soon — resume your story"
            disabled
          />
        </div>

      </div>
    </PageShell>
  );
}
