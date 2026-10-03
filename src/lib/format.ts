const inr = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 });

/** ₹1,299 / ₹1,299.50 — Indian digit grouping, no trailing .00. */
export function rupees(value: number | string | null | undefined): string {
  return `₹${inr.format(Number(value ?? 0))}`;
}

export function formatDate(iso: string, withTime = false): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
  });
}

export function addDays(iso: string, days: number): Date {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d;
}

/** "18–22 Aug 2026" — the standard delivery window shown after ordering. */
export function deliveryWindow(iso: string, fromDays = 5, toDays = 7): string {
  const from = addDays(iso, fromDays);
  const to = addDays(iso, toDays);
  const sameMonth = from.getMonth() === to.getMonth();
  const fromLabel = from.toLocaleDateString('en-IN', sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'short' });
  const toLabel = to.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  return `${fromLabel}–${toLabel}`;
}

export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: 'Order placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export function statusTone(status: string): string {
  if (status === 'delivered') return 'fx-pill fx-pill-success';
  if (status === 'shipped') return 'fx-pill fx-pill-info';
  if (status === 'cancelled') return 'fx-pill fx-pill-danger';
  if (status === 'pending') return 'fx-pill fx-pill-warning';
  return 'fx-pill';
}

/** Best-effort CSS colour for a product's colour name (falls back to grey). */
const NAMED: Record<string, string> = {
  black: '#111111',
  white: '#ffffff',
  ivory: '#f4efe3',
  cream: '#f1e9d8',
  beige: '#d9c7a7',
  taupe: '#8b7d6b',
  camel: '#b08850',
  brown: '#6b4a2f',
  grey: '#8a8a8a',
  gray: '#8a8a8a',
  charcoal: '#36393d',
  navy: '#1f2a44',
  blue: '#2f5fa8',
  indigo: '#2e3a6b',
  olive: '#5a5f3a',
  green: '#3b6b45',
  red: '#a3282c',
  burgundy: '#6b1d2a',
  maroon: '#5a1823',
  pink: '#e7b7c0',
  yellow: '#e8c547',
  orange: '#d9772b',
};

export function colorHex(name: string | null | undefined): string {
  if (!name) return '#c4c4c4';
  const key = name.trim().toLowerCase();
  if (NAMED[key]) return NAMED[key];
  const word = Object.keys(NAMED).find((k) => key.includes(k));
  return word ? NAMED[word] : '#c4c4c4';
}

export function initials(first?: string, last?: string, fallback = '?'): string {
  const s = `${(first ?? '').trim()[0] ?? ''}${(last ?? '').trim()[0] ?? ''}`.toUpperCase();
  return s || fallback.slice(0, 1).toUpperCase();
}
