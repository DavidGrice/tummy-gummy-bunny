"use client";

import { useState, useEffect } from "react";
import { getUsername } from "@/lib/cookies";

export function usePlayer() {
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    setUsername(getUsername());
  }, []);

  return { username };
}
