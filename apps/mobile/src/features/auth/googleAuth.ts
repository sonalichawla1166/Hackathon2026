import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

// Closes the popup/redirect tab that Google hands control back through.
// Must run once at module scope, before any auth request is created.
WebBrowser.maybeCompleteAuthSession();

const USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v3/userinfo';

export interface GoogleProfile {
  email: string;
  name: string;
  picture?: string;
  /** True for the stand-in identity used when Google is not configured. */
  isDemo?: boolean;
}

export type GoogleSignInStatus = 'idle' | 'pending' | 'error';

/**
 * Stand-in identity used when no OAuth client ID is configured, so the
 * sign-in flow can still be walked end to end. The UI labels it as a demo —
 * it is never presented as a real Google account.
 */
export const DEMO_GOOGLE_PROFILE: GoogleProfile = {
  email: 'demo.agent@cginfinity.com',
  name: 'Demo agent',
  isDemo: true,
};

interface GoogleClientIds {
  web?: string;
  ios?: string;
  android?: string;
}

/**
 * OAuth client IDs, read from (in order) `app.json` → `extra.googleAuth`, then
 * `EXPO_PUBLIC_GOOGLE_*_CLIENT_ID` environment variables. Client IDs are public
 * by design — there is no client secret in this flow (PKCE), so shipping them
 * in the bundle is expected.
 *
 * See `src/features/auth/README.md` for how to create them.
 */
function readClientIds(): GoogleClientIds {
  const extra = (Constants.expoConfig?.extra?.googleAuth ?? {}) as GoogleClientIds;
  return {
    web: extra.web || process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || undefined,
    ios: extra.ios || process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined,
    android: extra.android || process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined,
  };
}

/**
 * True when the current platform has a client ID to sign in with.
 *
 * `useGoogleSignIn` THROWS when it is false — `expo-auth-session`'s Google
 * provider asserts on a missing client ID during render — so callers must
 * check this before mounting the component that uses the hook.
 */
export function isGoogleConfigured(): boolean {
  const ids = readClientIds();
  if (Platform.OS === 'ios') return Boolean(ids.ios || ids.web);
  if (Platform.OS === 'android') return Boolean(ids.android || ids.web);
  return Boolean(ids.web);
}

export interface GoogleSignInResult {
  /** Opens the Google consent screen. */
  signIn: () => void;
  /** False while the auth request is still being prepared. */
  isReady: boolean;
  status: GoogleSignInStatus;
  error: string | null;
}

/**
 * Google sign-in over Expo AuthSession (PKCE implicit/code flow).
 *
 * Calls `onSuccess` with the signed-in profile. Failure and cancellation are
 * surfaced through `status`/`error` rather than thrown, so the caller can keep
 * rendering the form.
 *
 * Only mount a component that calls this when `isGoogleConfigured()` is true.
 */
export function useGoogleSignIn(onSuccess: (profile: GoogleProfile) => void): GoogleSignInResult {
  const idsRef = useRef<GoogleClientIds>(readClientIds());
  const ids = idsRef.current;

  const [status, setStatus] = useState<GoogleSignInStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: ids.web,
    iosClientId: ids.ios,
    androidClientId: ids.android,
    scopes: ['openid', 'profile', 'email'],
  });

  // `onSuccess` is usually an inline arrow from the screen; keep it in a ref so
  // the response effect does not re-run (and re-fetch) on every render.
  const onSuccessRef = useRef(onSuccess);
  useEffect(() => {
    onSuccessRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!response) return;

    if (response.type === 'dismiss' || response.type === 'cancel') {
      setStatus('idle');
      return;
    }

    if (response.type === 'error') {
      setStatus('error');
      setError(response.error?.message ?? 'Google sign-in failed.');
      return;
    }

    if (response.type !== 'success') return;

    const accessToken = response.authentication?.accessToken;
    if (!accessToken) {
      setStatus('error');
      setError('Google did not return an access token.');
      return;
    }

    let cancelled = false;
    setStatus('pending');

    (async () => {
      try {
        const res = await fetch(USERINFO_ENDPOINT, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (!res.ok) throw new Error(`Google profile lookup failed (${res.status}).`);
        const profile = (await res.json()) as { email?: string; name?: string; picture?: string };
        if (cancelled) return;
        if (!profile.email) throw new Error('Google account has no email address.');

        setStatus('idle');
        setError(null);
        onSuccessRef.current({ email: profile.email, name: profile.name ?? profile.email, picture: profile.picture });
      } catch (e) {
        if (cancelled) return;
        setStatus('error');
        setError(e instanceof Error ? e.message : 'Google sign-in failed.');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [response]);

  const signIn = useCallback(() => {
    if (!request) return;
    setError(null);
    setStatus('pending');
    promptAsync().catch((e: unknown) => {
      setStatus('error');
      setError(e instanceof Error ? e.message : 'Could not open Google sign-in.');
    });
  }, [request, promptAsync]);

  return { signIn, isReady: Boolean(request), status, error };
}
