"use client";

import { useState, useCallback } from "react";
import { AUTH_CONFIG } from "@/config/auth.config";

const { username: cfg } = AUTH_CONFIG;

function getValidationError(value: string): string | null {
  if (value.length === 0)                                              return cfg.messages.required;
  if (value.length < cfg.minLength)                                   return cfg.messages.tooShort;
  if (value.length > cfg.maxLength)                                   return cfg.messages.tooLong;
  if (cfg.rules.mustStartWithAlphanumeric && !/^[a-zA-Z0-9]/.test(value)) return cfg.messages.invalidStart;
  if (cfg.rules.noConsecutiveSpecials && cfg.consecutiveSpecialPattern.test(value)) return cfg.messages.consecutiveSpecials;
  if (!cfg.pattern.test(value))                                       return cfg.messages.invalidPattern;
  return null;
}

export interface UsernameValidation {
  value:      string;
  error:      string | null;
  isValid:    boolean;
  charCount:  number;
  onChange:   (raw: string) => void;
  markTouched: () => void;
}

export function useUsernameValidation(): UsernameValidation {
  const [value,   setValue]   = useState("");
  const [touched, setTouched] = useState(false);

  const onChange = useCallback((raw: string) => {
    // Strip disallowed chars, then cap length
    const filtered = raw
      .split("")
      .filter((char) => cfg.allowedCharPattern.test(char))
      .join("")
      .slice(0, cfg.maxLength);

    setValue(filtered);
    if (filtered.length > 0) setTouched(true);
  }, []);

  const markTouched = useCallback(() => setTouched(true), []);

  const error   = touched ? getValidationError(value) : null;
  const isValid = getValidationError(value) === null;

  return { value, error, isValid, charCount: value.length, onChange, markTouched };
}
