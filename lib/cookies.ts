/**
 * Cookie helpers for client-side auth state.
 * Safe to import in server components — browser APIs are behind typeof guards
 * and only execute when the functions are called on the client.
 */

export const COOKIE_KEYS = {
  username: "tgb_username", // must match USERNAME_COOKIE in middleware.ts
} as const;

const SEVEN_DAYS = 60 * 60 * 24 * 7;

export function setUsername(name: string): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_KEYS.username}=${encodeURIComponent(name)}; path=/; max-age=${SEVEN_DAYS}; SameSite=Lax`;
}

export function clearUsername(): void {
  if (typeof document === "undefined") return;
  document.cookie = `${COOKIE_KEYS.username}=; path=/; max-age=0; SameSite=Lax`;
}

export function getUsername(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp(`(?:^|;\\s*)${COOKIE_KEYS.username}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1]) : null;
}
