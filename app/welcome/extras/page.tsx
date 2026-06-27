import { PageShell } from "@/components/ui/nav/PageShell";

export const metadata = { title: "Tummy Gummy Bunny — Extras" };

const PLACEHOLDERS = [
  { icon: "📸", title: "Dev Diary",      description: "Behind-the-scenes photos from development" },
  { icon: "🎨", title: "Concept Art",    description: "Early sketches and character designs" },
  { icon: "🗺️", title: "World Map",      description: "Region sketches and location planning" },
  { icon: "📝", title: "Design Docs",    description: "Design philosophy and game mechanics notes" },
  { icon: "🐰", title: "Character Art",  description: "Tummy Gummy Bunny design evolution" },
  { icon: "🌅", title: "Environment Art",description: "Scene mood boards and lighting studies" },
] as const;

export default function ExtrasPage() {
  return (
    <PageShell backHref="/welcome" backLabel="Main Menu">
      <div className="min-h-screen flex flex-col items-center py-24 px-4">

        <div className="text-5xl mb-5" aria-hidden>✨</div>

        <h1 className="text-2xl font-black uppercase tracking-widest text-summer-cream text-center">
          Extras
        </h1>
        <p className="mt-2 text-xs tracking-widest uppercase text-summer-peach/60 text-center">
          Dev gallery &amp; concept art
        </p>

        {/* Gallery grid */}
        <div className="mt-12 w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {PLACEHOLDERS.map((item) => (
            <div
              key={item.title}
              className="
                rounded-2xl border border-summer-cream/15
                bg-summer-cream/8 backdrop-blur-sm
                p-6 flex flex-col items-center text-center
                transition-all duration-200 hover:bg-summer-cream/15 hover:border-summer-coral/30
              "
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

      </div>
    </PageShell>
  );
}
