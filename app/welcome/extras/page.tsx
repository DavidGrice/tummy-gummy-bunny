import Link from "next/link";
import { PageShell } from "@/components/ui/nav/PageShell";

export const metadata = { title: "Tummy Gummy Bunny — Extras" };

const PLACEHOLDERS = [
  { icon: "📸", title: "Dev Diary",       description: "Behind-the-scenes photos from development" },
  { icon: "🎨", title: "Concept Art",     description: "Early sketches and character designs" },
  { icon: "🗺️", title: "World Map",       description: "Region sketches and location planning" },
  { icon: "📝", title: "Design Docs",     description: "Design philosophy and game mechanics notes" },
  { icon: "🐰", title: "Character Art",   description: "Tummy Gummy Bunny design evolution" },
  { icon: "🌅", title: "Environment Art", description: "Scene mood boards and lighting studies" },
] as const;

export default function ExtrasPage() {
  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center py-16 px-4">

        <div className="w-full max-w-xl rounded-3xl bg-gray-900/60 backdrop-blur-md border border-white/8 shadow-[0_8px_32px_rgba(0,0,0,0.5)] px-8 py-10 flex flex-col items-center">

          <div className="text-5xl mb-5" aria-hidden>✨</div>

          <h1 className="text-2xl font-black uppercase tracking-widest text-summer-cream text-center">
            Extras
          </h1>
          <p className="mt-2 text-xs tracking-widest uppercase text-summer-peach/60 text-center">
            Dev gallery &amp; concept art
          </p>

          <div className="mt-8 mb-6 w-full border-t border-white/10" />

          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PLACEHOLDERS.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-summer-cream/15 bg-summer-cream/8 backdrop-blur-sm p-5 flex flex-col items-center text-center transition-all duration-200 hover:bg-summer-cream/15 hover:border-summer-coral/30"
              >
                <span className="text-4xl mb-3" aria-hidden>{item.icon}</span>
                <p className="font-black uppercase tracking-widest text-summer-cream text-xs mb-1">
                  {item.title}
                </p>
                <p className="text-xs text-summer-peach/60 leading-relaxed">{item.description}</p>
                <span className="mt-4 text-[10px] uppercase tracking-widest text-summer-peach/30">
                  Coming soon
                </span>
              </div>
            ))}
          </div>

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
