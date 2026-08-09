// Fetch wrapper for the Django REST API (Fexo_backend, mounted under
// /api/). Attaches the auth token from localStorage when present, parses
// JSON, and throws ApiError with the parsed error body on non-2xx so
// callers can show a real validation message instead of a generic one.

import { readStorage, STORAGE_KEYS, writeStorage, removeStorage } from './storage';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8000';

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(extractMessage(body) ?? `API error ${status}`);
    this.status = status;
    this.body = body;
  }
}

function extractMessage(body: unknown): string | undefined {
  if (body && typeof body === 'object') {
    const record = body as Record<string, unknown>;
    if (typeof record.detail === 'string') return record.detail;
    // DRF validation errors come back as { field: ["message", ...] }
    const firstArray = Object.values(record).find((v) => Array.isArray(v) && v.length);
    if (firstArray) return String((firstArray as unknown[])[0]);
  }
  return undefined;
}

export function getToken(): string | null {
  return readStorage<string | null>(STORAGE_KEYS.token, null);
}

export function setToken(token: string): void {
  writeStorage(STORAGE_KEYS.token, token);
}

export function clearToken(): void {
  removeStorage(STORAGE_KEYS.token);
}

interface ApiFetchOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  /** Skip attaching the Authorization header even if a token exists. */
  skipAuth?: boolean;
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { method = 'GET', body, skipAuth = false } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (!skipAuth) {
    const token = getToken();
    if (token) headers.Authorization = `Token ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    // Always fetch fresh — content is admin-editable and cart/orders/
    // wishlist are live user state, so stale caching would just be
    // confusing during local dev.
    cache: 'no-store',
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new ApiError(res.status, data);
  }
  return data as T;
}
