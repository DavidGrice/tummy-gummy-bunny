"use client";

import { useState, useEffect } from "react";

export interface GameOptions {
  soundEnabled:       boolean;
  musicEnabled:       boolean;
  showTutorialHints:  boolean;
}

const STORAGE_KEY = "tgb_options";

const DEFAULTS: GameOptions = {
  soundEnabled:      true,
  musicEnabled:      true,
  showTutorialHints: true,
};

export function useOptions() {
  const [options, setOptions] = useState<GameOptions>(DEFAULTS);
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setOptions({ ...DEFAULTS, ...JSON.parse(saved) });
    } catch { /* storage unavailable */ }
    setLoaded(true);
  }, []);

  function setOption<K extends keyof GameOptions>(key: K, value: GameOptions[K]) {
    const updated = { ...options, [key]: value };
    setOptions(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { /* storage unavailable */ }
  }

  return { options, setOption, loaded };
}
