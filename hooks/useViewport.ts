"use client";

import { useEffect, useState } from "react";

/** SSR-safe viewport size hook. Defaults to desktop (1024px) until mounted. */
export function useViewport() {
  const [width, setWidth] = useState(1024);

  useEffect(() => {
    function update() { setWidth(window.innerWidth); }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return {
    width,
    isMobile: width < 640,   // matches Tailwind sm:
    isTablet: width >= 640 && width < 1024,
  };
}
