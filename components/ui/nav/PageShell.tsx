import { themeGradients } from "@/config/theme.config";
import { BackButton } from "./BackButton";

interface PageShellProps {
  children:   React.ReactNode;
  backHref?:  string;
  backLabel?: string;
  className?: string;
}

export function PageShell({
  children,
  backHref,
  backLabel,
  className = "",
}: PageShellProps) {
  return (
    <div
      className={`min-h-screen relative overflow-x-hidden ${className}`}
      style={{ background: themeGradients.sky }}
    >
      {/* Ambient light blobs — clipped by overflow-hidden on the fixed container */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-summer-gold/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-summer-ember/10 blur-3xl" />
      </div>

      {/* Back navigation */}
      {backHref && (
        <div className="absolute top-6 left-6 z-20">
          <BackButton href={backHref} label={backLabel} />
        </div>
      )}

      <div className="relative z-10">{children}</div>
    </div>
  );
}
