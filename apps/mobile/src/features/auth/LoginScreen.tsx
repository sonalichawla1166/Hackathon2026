import React, { useCallback, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SessionUser, useUiStore, Surface } from '@/state/store';
import { makeStyles, radius, spacing, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { CgInfinityLogo } from '@/components/brand/CgInfinityLogo';
import { BodyText, Caption, Eyebrow, H1 } from '@/components/ui/Text';
import { AuthBackdrop } from './components/AuthBackdrop';
import { AuthField } from './components/AuthField';
import { GoogleSignInButton } from './components/GoogleSignInButton';
import { RoleOption, RoleSelector } from './components/RoleSelector';
import { GoogleProfile } from './googleAuth';
import { login as loginRequest, signup as signupRequest } from '@/api/auth';
import { ApiError } from '@/api/client';

const ROLES: readonly RoleOption[] = [
  { key: 'app', label: 'Customer app', blurb: 'Bill, usage, solar and outage tools for a residential account.' },
  { key: 'portal', label: 'Public portal', blurb: 'Rate comparison and self-service, no account needed.' },
  { key: 'ops', label: 'Ops dashboard', blurb: 'Predictive maintenance and demand-response targeting.' },
  { key: 'copilot', label: 'Agent copilot', blurb: 'Live call assist with grounded, cited answers.' },
  { key: 'sales', label: 'Field sales', blurb: 'Nearby leads within your territory, door-knocking and visit history.' },
];

/** Narrower than this and the card goes edge-to-edge and the role tiles stack. */
const COMPACT_BREAKPOINT = 560;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

type Mode = 'login' | 'signup';

/** A verified admin, waiting to pick which surface to view — the only
 * situation where a workspace is still chosen after credentials are already
 * confirmed, rather than fixed on the account. */
interface PendingAdmin {
  token: string;
  email: string;
}

function toSessionUser(profile: GoogleProfile): SessionUser {
  return { name: profile.name, email: profile.email, picture: profile.picture, method: 'google', isDemo: profile.isDemo };
}

/** "maria.alvarez@x.com" → "Maria Alvarez", so the profile menu has a name. */
function nameFromEmail(email: string): string {
  const local = email.trim().split('@')[0] ?? '';
  const words = local.split(/[._-]+/).filter(Boolean);
  if (words.length === 0) return 'Signed-in user';
  return words.map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
}

export function LoginScreen() {
  const login = useUiStore((s) => s.login);
  const { colors } = useTheme();
  const styles = useStyles();
  const { width } = useWindowDimensions();
  const compact = width < COMPACT_BREAKPOINT;

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Surface | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [noticeIsError, setNoticeIsError] = useState(false);
  const [attempted, setAttempted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [googleAccount, setGoogleAccount] = useState<GoogleProfile | null>(null);
  // Set once a login response comes back for the seeded admin account —
  // credentials are already verified at that point, so the picker below only
  // ever chooses a workspace, never re-authenticates.
  const [pendingAdmin, setPendingAdmin] = useState<PendingAdmin | null>(null);

  const trimmedEmail = email.trim();
  const isEmailValid = EMAIL_RE.test(trimmedEmail);
  const isPasswordValid = password.length >= MIN_PASSWORD_LENGTH;
  const credentialsFilled = isEmailValid && isPasswordValid;
  // A Google sign-in stands in for the email + passcode pair (login mode only).
  const identityReady = credentialsFilled || googleAccount !== null;
  // Signup fixes the account's workspace right away, so it needs a role too;
  // a plain login no longer does — the account already has one on file.
  const canSubmit =
    mode === 'signup' ? credentialsFilled && role !== null && !submitting : identityReady && !submitting;

  const pickRole = useCallback((next: Surface) => {
    setRole(next);
    setNotice(null);
  }, []);

  const switchMode = useCallback((next: Mode) => {
    setMode(next);
    setNotice(null);
    setNoticeIsError(false);
    setAttempted(false);
    setPassword('');
    setRole(null);
    setPendingAdmin(null);
  }, []);

  const finishAdminSignIn = useCallback(
    (chosen: Surface) => {
      if (!pendingAdmin) return;
      login(chosen, { name: 'Admin', email: pendingAdmin.email, method: 'passcode', viaAdmin: true }, pendingAdmin.token);
    },
    [pendingAdmin, login]
  );

  const submit = useCallback(async () => {
    setAttempted(true);

    if (mode === 'signup') {
      if (!credentialsFilled) {
        setNotice(`Enter a valid email and a passcode of at least ${MIN_PASSWORD_LENGTH} characters.`);
        setNoticeIsError(true);
        return;
      }
      if (!role) {
        setNoticeIsError(true);
        setNotice('Pick which workspace this account opens into.');
        return;
      }
      setSubmitting(true);
      setNotice(null);
      try {
        await signupRequest(trimmedEmail, password, role);
        setNoticeIsError(false);
        setNotice('Account created — log in below.');
        setPassword('');
        setAttempted(false);
        setRole(null);
        setMode('login');
      } catch (err) {
        setNoticeIsError(true);
        setNotice(
          err instanceof ApiError ? err.message : "Couldn't reach the backend. Check your connection and try again."
        );
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // login mode
    if (googleAccount) {
      if (!role) {
        setNoticeIsError(true);
        setNotice('Pick a workspace to continue.');
        return;
      }
      login(role, toSessionUser(googleAccount), null);
      return;
    }
    if (!identityReady) {
      setNoticeIsError(true);
      setNotice('Enter your email and passcode, or continue with Google.');
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await loginRequest(trimmedEmail, password);
      if (res.isAdmin) {
        setPendingAdmin({ token: res.token, email: res.email });
      } else {
        login(res.role as Surface, { name: nameFromEmail(trimmedEmail), email: res.email, method: 'passcode' }, res.token);
      }
    } catch (err) {
      setNoticeIsError(true);
      setNotice(
        err instanceof ApiError ? err.message : "Couldn't reach the backend. Check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }, [mode, role, identityReady, credentialsFilled, login, googleAccount, trimmedEmail, password]);

  // Google returns an identity, not a workspace — so land straight in the
  // chosen surface if one is already selected, otherwise ask for it.
  const onGoogleSuccess = useCallback(
    (profile: GoogleProfile) => {
      setGoogleAccount(profile);
      setEmail(profile.email);
      const prefix = profile.isDemo ? 'Demo sign-in (no Google account connected). ' : '';
      setNoticeIsError(false);
      if (role) {
        if (prefix) setNotice(prefix.trim());
        login(role, toSessionUser(profile), null);
      } else {
        setNotice(`${prefix}Signed in as ${profile.email}. Pick a workspace to continue.`);
      }
    },
    [role, login]
  );

  const googleLabel = useMemo(
    () => (googleAccount ? `Continue as ${googleAccount.name}` : 'Continue with Google'),
    [googleAccount]
  );

  const emailInvalid = attempted && !isEmailValid;
  const passwordInvalid = attempted && mode === 'signup' ? !isPasswordValid : attempted && !googleAccount && !isPasswordValid;

  // Google (post-auth) and signup both still need a workspace picked; a plain
  // email/passcode login never shows this — the account already has one.
  const showRolePicker = mode === 'signup' || (mode === 'login' && googleAccount !== null);

  return (
    <View style={styles.root}>
      <AuthBackdrop />

      <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
        <View style={[styles.topBar, compact && styles.topBarCompact]}>
          <CgInfinityLogo size={compact ? 32 : 38} tagline="OneGridAI" />
          <ThemeToggle />
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView
            contentContainerStyle={[styles.scroll, compact && styles.scrollCompact]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.card, compact && styles.cardCompact]}>
              {pendingAdmin ? (
                <>
                  <Eyebrow style={styles.eyebrow}>Admin</Eyebrow>
                  <H1 style={styles.title}>Sign in as…</H1>
                  <BodyText style={styles.subtitle}>
                    Signed in as {pendingAdmin.email}. Choose which workspace to view.
                  </BodyText>

                  <RoleSelector options={ROLES} value={role} onChange={(next) => finishAdminSignIn(next)} stacked={compact} />

                  <Pressable
                    onPress={() => {
                      setPendingAdmin(null);
                      setPassword('');
                    }}
                    hitSlop={6}
                    accessibilityRole="link"
                    style={styles.helpLink}
                  >
                    <Text style={[styles.helpText, { color: colors.textBody }]}>‹ Back to sign in</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Eyebrow style={styles.eyebrow}>Secure sign-in</Eyebrow>
                  <H1 style={styles.title}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</H1>
                  <BodyText style={styles.subtitle}>
                    {mode === 'login'
                      ? 'Sign in with your account — it knows which workspace it opens into.'
                      : "Set up your account and pick which workspace it opens into. Only the admin account can switch between workspaces."}
                  </BodyText>

                  <View style={styles.fields}>
                    <AuthField
                      value={email}
                      onChangeText={(next) => {
                        setEmail(next);
                        setGoogleAccount(null);
                      }}
                      placeholder="Enter email / phone no"
                      autoCapitalize="none"
                      autoComplete="email"
                      keyboardType="email-address"
                      textContentType="emailAddress"
                      returnKeyType="next"
                      invalid={emailInvalid}
                    />
                    <AuthField
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Passcode"
                      secure
                      autoComplete="current-password"
                      textContentType="password"
                      returnKeyType="go"
                      onSubmitEditing={submit}
                      invalid={passwordInvalid}
                    />
                  </View>

                  {mode === 'login' && (
                    <Pressable
                      onPress={() => setNotice('Password help is on the roadmap — use Google sign-in for now.')}
                      hitSlop={6}
                      accessibilityRole="link"
                      style={styles.helpLink}
                    >
                      <Text style={[styles.helpText, { color: colors.textBody }]}>Having trouble signing in?</Text>
                    </Pressable>
                  )}

                  {showRolePicker && (
                    <>
                      <Caption style={styles.sectionLabel}>
                        {mode === 'signup' ? 'Workspace for this account' : 'Sign in as'}
                      </Caption>
                      <RoleSelector options={ROLES} value={role} onChange={pickRole} stacked={compact} />
                    </>
                  )}

                  {notice ? (
                    <View
                      style={[
                        styles.notice,
                        {
                          backgroundColor: withAlpha(noticeIsError ? colors.danger : colors.brand, 0.14),
                          borderColor: withAlpha(noticeIsError ? colors.danger : colors.brand, 0.4),
                        },
                      ]}
                    >
                      <Caption color={colors.textBody}>{notice}</Caption>
                    </View>
                  ) : null}

                  <Button variant="cta" size="md" block disabled={!canSubmit} onPress={submit} style={styles.submit}>
                    {mode === 'login'
                      ? submitting
                        ? 'Signing in…'
                        : 'Sign in'
                      : submitting
                        ? 'Creating account…'
                        : 'Create account'}
                  </Button>

                  {mode === 'login' && (
                    <>
                      <View style={styles.dividerRow}>
                        <View style={[styles.rule, { backgroundColor: colors.borderMuted }]} />
                        <Caption style={styles.dividerLabel}>Or sign in with</Caption>
                        <View style={[styles.rule, { backgroundColor: colors.borderMuted }]} />
                      </View>

                      <GoogleSignInButton label={googleLabel} onSuccess={onGoogleSuccess} onNotice={setNotice} />
                    </>
                  )}

                  <View style={styles.footerRow}>
                    <Caption>{mode === 'login' ? "Don't have an account?" : 'Already have an account?'}</Caption>
                    <Pressable
                      onPress={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                      hitSlop={6}
                      accessibilityRole="link"
                    >
                      <Text style={[styles.footerLink, { color: colors.brandStrong }]}>
                        {mode === 'login' ? 'Sign up' : 'Log in'}
                      </Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>

            <Caption style={styles.copyright}>© {new Date().getFullYear()} CG Infinity · OneGridAI · Privacy policy</Caption>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  root: { flex: 1, backgroundColor: t.colors.page },
  flex: { flex: 1 },
  safe: { flex: 1 },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.md,
  },
  topBarCompact: { paddingHorizontal: spacing.md },

  scroll: {
    flexGrow: 1,
    // Children stay stretched so their `width: '100%'` resolves against the
    // ScrollView's own width; the card centres itself with `alignSelf`.
    // `alignItems: center` here lets a wide child widen the content box and
    // push the card past a narrow viewport.
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  scrollCompact: { paddingHorizontal: spacing.md },

  card: {
    alignSelf: 'center',
    width: '100%',
    maxWidth: 440,
    backgroundColor: t.colors.surfaceCard,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    padding: spacing.lg,
    ...t.shadow.lifted,
  },
  cardCompact: { padding: spacing.md, borderRadius: 22 },

  eyebrow: { textAlign: 'center' },
  title: { marginTop: 8, marginBottom: 6, fontSize: 30, lineHeight: 34, textAlign: 'center' },
  subtitle: { marginBottom: spacing.md, textAlign: 'center' },

  fields: { gap: 10 },
  helpLink: { alignSelf: 'flex-start', marginTop: 10 },
  helpText: { fontFamily: fontFamily.bodyBold, fontSize: 12.5 },

  sectionLabel: {
    marginTop: spacing.md,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontFamily: fontFamily.bodyBold,
  },

  notice: {
    marginTop: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },

  submit: { marginTop: spacing.md },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: spacing.md,
  },
  rule: { flex: 1, height: 1 },
  dividerLabel: { textTransform: 'uppercase', letterSpacing: 0.8 },

  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
    marginTop: spacing.md,
  },
  footerLink: { fontFamily: fontFamily.bodyBold, fontSize: 11.5 },

  copyright: { alignSelf: 'center', textAlign: 'center' },
}));
