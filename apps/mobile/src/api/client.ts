import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { useUiStore } from '@/state/store';

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

// Fallback id, only used before login (POST /auth/login itself doesn't read
// X-Session-Id, so this never actually reaches a session-aware endpoint).
// Once logged in, the real session id is the token /auth/login returned —
// see state/store.ts's `token` field, persisted so it survives an app reload.
const FALLBACK_SESSION_ID = `mobile-${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}`;

// FastAPI error bodies are JSON: {"detail": "some message"} for a raised
// HTTPException, or {"detail": [{"msg": "...", ...}, ...]} for a pydantic
// validation failure (422). Pull the human-readable string out of either
// shape instead of surfacing raw JSON in the UI.
function extractErrorMessage(rawBody: string): string | null {
  if (!rawBody) return null;
  try {
    const parsed = JSON.parse(rawBody);
    const detail = parsed?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && typeof detail[0]?.msg === 'string') return detail[0].msg;
  } catch {
    // not JSON — fall through to returning the raw text
  }
  return rawBody;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const sessionId = useUiStore.getState().token ?? FALLBACK_SESSION_ID;
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Session-Id': sessionId,
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new ApiError(res.status, extractErrorMessage(text) || res.statusText || `Request to ${path} failed`);
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
