import Link from "next/link";

interface MenuButtonProps {
  icon:         string;
  label:        string;
  href:         string;
  description?: string;
  disabled?:    boolean;
}

export function MenuButton({
  icon,
  label,
  href,
  description,
  disabled = false,
}: MenuButtonProps) {
  const inner = (
    <div
      className={`
        w-full flex items-center gap-4 px-5 py-4 rounded-2xl
        border border-summer-cream/15
        bg-summer-cream/8 backdrop-blur-sm
        transition-all duration-200
        ${disabled
          ? "opacity-35 cursor-not-allowed"
          : "hover:bg-summer-cream/15 hover:border-summer-coral/50 hover:scale-[1.01] cursor-pointer group"
        }
      `}
    >
      <span className="text-2xl select-none">{icon}</span>
      <div className="flex-1 text-left min-w-0">
        <p className="font-black uppercase tracking-widest text-summer-cream text-sm leading-none">
          {label}
        </p>
        {description && (
          <p className="text-xs text-summer-peach/70 mt-1 leading-none">{description}</p>
        )}
      </div>
      {!disabled && (
        <span className="text-summer-peach/50 text-sm transition-transform duration-200 group-hover:translate-x-1 shrink-0">
          &#8594;
        </span>
      )}
    </div>
  );

  if (disabled) return <div aria-disabled="true">{inner}</div>;
  return <Link href={href} className="block">{inner}</Link>;
}
