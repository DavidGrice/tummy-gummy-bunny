"use client";

import { useEffect, useState } from "react";

interface BottomSheetProps {
  onClose:    () => void;
  children:   React.ReactNode;
  /** Tailwind height class — defaults to h-[90vh] */
  heightCls?: string;
}

/**
 * Mobile bottom sheet with slide-up entrance animation and tap-backdrop-to-close.
 * Wrap mobile variants of panels with this instead of the centered modal container.
 */
export function BottomSheet({ onClose, children, heightCls = "h-[90vh]" }: BottomSheetProps) {
  const [visible, setVisible] = useState(false);

  // Defer one rAF so the initial translate-y-full paint happens before the toggle
  useEffect(() => {
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-end">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className={`relative z-10 w-full ${heightCls} flex flex-col rounded-t-3xl overflow-hidden
          transition-transform duration-300 ease-out
          ${visible ? "translate-y-0" : "translate-y-full"}`}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Drag handle */}
        <div className="absolute top-0 inset-x-0 flex justify-center pt-2.5 z-10 pointer-events-none">
          <div className="w-10 h-1 rounded-full bg-white/30" />
        </div>

        {children}
      </div>
    </div>
  );
}
