"use client";

interface TooltipProps {
  content:          string;
  position?:        "top" | "bottom" | "left" | "right";
  align?:           "center" | "start" | "end";
  children:         React.ReactNode;
  wrapperClassName?: string;
}

/**
 * Reusable hover tooltip. Wraps children in a `relative group` div so the
 * tooltip appears on hover via Tailwind's group-hover utilities.
 *
 * Usage:
 *   <Tooltip content="Inventory" position="top">
 *     <button>🎒</button>
 *   </Tooltip>
 */
export function Tooltip({
  content,
  position        = "top",
  align           = "center",
  children,
  wrapperClassName = "",
}: TooltipProps) {
  // Placement relative to the trigger
  const placementCls = {
    top:    "bottom-full mb-2",
    bottom: "top-full mt-2",
    left:   "right-full mr-2 top-1/2 -translate-y-1/2",
    right:  "left-full ml-2 top-1/2 -translate-y-1/2",
  }[position];

  // Horizontal alignment (only applies to top/bottom)
  const alignCls =
    position === "left" || position === "right"
      ? ""
      : align === "center"
        ? "left-1/2 -translate-x-1/2"
        : align === "end"
          ? "right-0"
          : "left-0";

  return (
    <div className={`relative group ${wrapperClassName}`}>
      {children}

      {/* Tooltip bubble */}
      <div
        role="tooltip"
        className={`
          absolute z-50 ${placementCls} ${alignCls}
          px-3 py-1.5 rounded-xl pointer-events-none select-none
          bg-gray-900/95 backdrop-blur-sm border border-white/10
          text-white/80 text-xs font-semibold whitespace-nowrap tracking-wide
          opacity-0 group-hover:opacity-100
          transition-opacity duration-150
        `}
      >
        {content}
      </div>
    </div>
  );
}
