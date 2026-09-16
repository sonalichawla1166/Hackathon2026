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

const ROLES: readonly RoleOption[] = [
  { key: 'app', label: 'Customer app', blurb: 'Bill, usage, solar and outage tools for a residential account.' },
  { key: 'portal', label: 'Public portal', blurb: 'Rate comparison and self-service, no account needed.' },
  { key: 'ops', label: 'Ops dashboard', blurb: 'Predictive maintenance and demand-response targeting.' },
  { key: 'copilot', label: 'Agent copilot', blurb: 'Live call assist with grounded, cited answers.' },
  { key: 'sales', label: 'Field sales', blurb: 'Nearby leads within your territory, door-knocking and visit history.' },
];

/** Narrower than this and the card goes edge-to-edge and the role tiles stack. */
const COMPACT_BREAKPOINT = 560;

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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Surface | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [googleAccount, setGoogleAccount] = useState<GoogleProfile | null>(null);

  const credentialsFilled = email.trim().length > 0 && password.length > 0;
  // A Google sign-in stands in for the email + password pair.
  const identityReady = credentialsFilled || googleAccount !== null;
  const canSubmit = identityReady && role !== null;

  const pickRole = useCallback((next: Surface) => {
    setRole(next);
    setNotice(null);
  }, []);

  const submit = useCallback(() => {
    if (!role) {
      setNotice('Pick a workspace to continue.');
      return;
    }
    if (!identityReady) {
      setNotice('Enter your email and passcode, or continue with Google.');
      return;
    }
    login(role, {
      name: googleAccount?.name ?? nameFromEmail(email),
      email: googleAccount?.email ?? email.trim(),
      picture: googleAccount?.picture,
      method: googleAccount ? 'google' : 'passcode',
      isDemo: googleAccount?.isDemo,
    });
  }, [role, identityReady, login, googleAccount, email]);

  // Google returns an identity, not a workspace — so land straight in the
  // chosen surface if one is already selected, otherwise ask for it.
  const onGoogleSuccess = useCallback(
    (profile: GoogleProfile) => {
      setGoogleAccount(profile);
      setEmail(profile.email);
      const prefix = profile.isDemo ? 'Demo sign-in (no Google account connected). ' : '';
      if (role) {
        if (prefix) setNotice(prefix.trim());
        login(role, toSessionUser(profile));
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
              <Eyebrow style={styles.eyebrow}>Secure sign-in</Eyebrow>
              <H1 style={styles.title}>Welcome back</H1>
              <BodyText style={styles.subtitle}>
                One AI layer, five surfaces. Enter your details, then pick the workspace you're in today.
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
                />
              </View>

              <Pressable
                onPress={() => setNotice('Password help is on the roadmap — use Google sign-in for now.')}
                hitSlop={6}
                accessibilityRole="link"
                style={styles.helpLink}
              >
                <Text style={[styles.helpText, { color: colors.textBody }]}>Having trouble signing in?</Text>
              </Pressable>

              <Caption style={styles.sectionLabel}>Sign in as</Caption>
              <RoleSelector options={ROLES} value={role} onChange={pickRole} stacked={compact} />

              {notice ? (
                <View style={[styles.notice, { backgroundColor: withAlpha(colors.brand, 0.14), borderColor: withAlpha(colors.brand, 0.4) }]}>
                  <Caption color={colors.textBody}>{notice}</Caption>
                </View>
              ) : null}

              <Button variant="cta" size="md" block disabled={!canSubmit} onPress={submit} style={styles.submit}>
                Sign in
              </Button>

              <View style={styles.dividerRow}>
                <View style={[styles.rule, { backgroundColor: colors.borderMuted }]} />
                <Caption style={styles.dividerLabel}>Or sign in with</Caption>
                <View style={[styles.rule, { backgroundColor: colors.borderMuted }]} />
              </View>

              <GoogleSignInButton
                label={googleLabel}
                onSuccess={onGoogleSuccess}
                onNotice={setNotice}
              />

              <View style={styles.footerRow}>
                <Caption>Don't have an account?</Caption>
                <Pressable
                  onPress={() => setNotice('Ask your CG Infinity administrator to provision an account.')}
                  hitSlop={6}
                  accessibilityRole="link"
                >
                  <Text style={[styles.footerLink, { color: colors.brandStrong }]}>Request now</Text>
                </Pressable>
              </View>
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
