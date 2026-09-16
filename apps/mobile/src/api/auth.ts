import { API_BASE_URL, apiPost } from './client';

export interface LoginResponse {
  token: string;
  role: string;
  email: string;
}

export interface SignupResponse {
  message: string;
}

export function login(email: string, password: string, role: string) {
  return apiPost<LoginResponse>('/auth/login', { email, password, role });
}

export function signup(email: string, password: string) {
  return apiPost<SignupResponse>('/auth/signup', { email, password });
}

// Takes the token explicitly (rather than going through apiPost's automatic
// X-Session-Id lookup) so callers can fire this before or after clearing it
// from local state without a race — see api/hooks.ts's useLogout.
export function logout(token: string) {
  return fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    headers: { 'X-Session-Id': token },
  });
}
