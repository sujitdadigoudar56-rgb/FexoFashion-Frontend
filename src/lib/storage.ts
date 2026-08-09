// Small localStorage read/write helpers. Now that Cart/Wishlist/Auth are
// backed by the real Django API (see lib/api.ts, context/*), the only
// things that still live in localStorage are the auth token itself and
// the client-only "recently viewed" trail — everything else is server
// state fetched fresh.

const PREFIX = 'fexo:';

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    // storage full / disabled — silently ignore, mirrors best-effort caching
  }
}

export function removeStorage(key: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(PREFIX + key);
}

export const STORAGE_KEYS = {
  token: 'token',
  recentlyViewed: 'recently-viewed',
} as const;
