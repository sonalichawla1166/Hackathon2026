import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Resolves the backend's base URL:
 * 1. `EXPO_PUBLIC_API_BASE_URL` env var, if set — always wins.
 * 2. On web, `http://localhost:8000` (same machine as the dev server).
 * 3. On native (Expo Go / a dev client), the LAN IP Metro is already
 *    serving from — the backend normally runs on the same dev machine, so
 *    this "just works" on a physical phone without any manual config.
 * 4. Fallback: `http://localhost:8000` (works in a simulator, which shares
 *    the host's network).
 */
function resolveBaseUrl(): string {
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');

  if (Platform.OS === 'web') return 'http://localhost:8000';

  const hostUri = Constants.expoConfig?.hostUri ?? (Constants as any).expoGoConfig?.debuggerHost;
  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : undefined;
  if (host) return `http://${host}:8000`;

  return 'http://localhost:8000';
}

export const API_BASE_URL = resolveBaseUrl();

// One id per app load — enough for a demo (each session gets its own chat
// log, enrollments, etc.), no persistence dependency required. Pass a fixed
// value here if you want two devices to share one "customer".
const SESSION_ID = `mobile-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': SESSION_ID,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, text || res.statusText || `Request to ${path} failed`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function apiGet<T>(path: string): Promise<T> {
  return apiFetch<T>(path);
}

export function apiPost<T>(path: string, body?: unknown): Promise<T> {
  return apiFetch<T>(path, {
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
}
