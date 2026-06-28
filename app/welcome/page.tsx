import { cookies } from "next/headers";
import { COOKIE_KEYS } from "@/lib/cookies";
import { PageShell } from "@/components/ui/nav/PageShell";
import { MenuButton } from "@/components/ui/nav/MenuButton";
import { themeGradients } from "@/config/theme.config";

export const metadata = { title: "Tummy Gummy Bunny — Main Menu" };

export default async function WelcomePage() {
  const store    = await cookies();
  const username = store.get(COOKIE_KEYS.username)?.value ?? "Adventurer";

  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">

        {/* Dark backdrop card */}
        <div className="w-full max-w-md rounded-3xl bg-gray-900/60 backdrop-blur-md border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-8 py-10 flex flex-col items-center">

          {/* Brand header */}
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-summer"
            style={{ background: themeGradients.button }}
            aria-hidden
          >
            🐰
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase text-summer-cream text-center leading-none">
            Tummy Gummy Bunny
          </h1>
          <p className="mt-2 text-sm tracking-widest uppercase text-summer-peach/70 text-center">
            Welcome back,&nbsp;
            <span className="text-summer-gold font-bold">{decodeURIComponent(username)}</span>
            !
          </p>

          {/* Divider */}
          <div className="mt-8 mb-6 w-48 border-t border-white/10" />

          {/* Main menu */}
          <nav className="w-full space-y-3" aria-label="Main menu">
            <MenuButton
              icon="🎮"
              label="Start"
              href="/welcome/start"
              description="Enter the world"
            />
            <MenuButton
              icon="⚙️"
              label="Options"
              href="/welcome/options"
              description="Customize your experience"
            />
            <MenuButton
              icon="📜"
              label="Credits"
              href="/welcome/credits"
              description="Meet the team"
            />
            <MenuButton
              icon="✨"
              label="Extras"
              href="/welcome/extras"
              description="Dev gallery & concept art"
            />
          </nav>

        </div>
      </div>
    </PageShell>
  );
}
