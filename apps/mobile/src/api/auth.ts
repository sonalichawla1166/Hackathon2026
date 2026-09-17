import { API_BASE_URL, apiPost } from './client';

export interface LoginResponse {
  token: string;
  /** The account's fixed role, chosen once at signup — or "admin" for the
   * one seeded admin account, which isn't tied to a surface. */
  role: string;
  email: string;
  /** True only for the seeded admin account. The client uses this to decide
   * whether to show the post-login "sign in as" surface picker at all. */
  isAdmin: boolean;
}

export interface SignupResponse {
  message: string;
}

// No `role` param — the account's role is fixed at signup (see `signup`
// below) and the backend looks it up, rather than the client choosing a
// surface fresh on every login.
export function login(email: string, password: string) {
  return apiPost<LoginResponse>('/auth/login', { email, password });
}

export function signup(email: string, password: string, role: string) {
  return apiPost<SignupResponse>('/auth/signup', { email, password, role });
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
