import Link from "next/link";

interface BackButtonProps {
  href:   string;
  label?: string;
}

export function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="
        inline-flex items-center gap-2
        min-h-[44px] min-w-[44px] px-1
        text-summer-cream/70 hover:text-summer-cream
        transition-colors duration-200
        text-sm font-semibold tracking-widest uppercase
        group
      "
    >
      <span className="transition-transform duration-200 group-hover:-translate-x-1">
        &#8592;
      </span>
      {label}
    </Link>
  );
}
