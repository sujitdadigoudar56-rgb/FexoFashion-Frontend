// Which bag lines the customer has ticked for checkout. Kept in
// sessionStorage so the selection survives going from the bag to
// checkout (and a refresh) but not a new browsing session.

const KEY = 'fexo:bag-selection';

export function readSelection(): number[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as number[]) : null;
  } catch {
    return null;
  }
}

export function writeSelection(ids: number[]): void {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    // storage unavailable — checkout falls back to the whole bag
  }
}

export function clearSelection(): void {
  try {
    window.sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
