import React, { useCallback, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { SURFACE_LABELS, useUiStore } from '@/state/store';
import { useLogout } from '@/api/hooks';
import { makeStyles, radius, spacing, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogoutIcon } from '@/components/icons/BrandIcons';

/** Below this the menu is a bottom sheet instead of a dropdown card. */
const SHEET_BREAKPOINT = 620;

interface ProfileMenuProps {
  /** Sitting on a plum header rather than a card. */
  onInverse?: boolean;
  /** Extra rows for the surface that owns the menu, e.g. an account number. */
  details?: ReadonlyArray<{ label: string; value: string }>;
  /**
   * Whether the menu carries the appearance switch and sign out. The desktop
   * customer layout turns this off because its sidebar pins both to the
   * bottom of the navigation column, leaving the menu to say who you are.
   */
  showAccountControls?: boolean;
}

/**
 * Avatar button in the app header. Opens the one place that holds who you are,
 * the appearance switch and sign out — so every surface's header is just a
 * title plus this.
 */
export function ProfileMenu({ onInverse = false, details = [], showAccountControls = true }: ProfileMenuProps) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { width } = useWindowDimensions();
  const asSheet = width < SHEET_BREAKPOINT;

  const user = useUiStore((s) => s.user);
  const session = useUiStore((s) => s.session);
  const logout = useLogout();
  const [open, setOpen] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const signOut = useCallback(() => {
    setOpen(false);
    logout();
  }, [logout]);

  const name = user?.name ?? 'Signed-in user';
  const email = user?.email ?? '—';
  const initials = useMemo(() => toInitials(name), [name]);

  const rows = useMemo(
    () => [
      { label: 'Workspace', value: session ? SURFACE_LABELS[session] : '—' },
      { label: 'Organisation', value: 'CG Infinity · OneGridAI' },
      { label: 'Signed in with', value: user?.method === 'google' ? 'Google' : 'Email + passcode' },
      ...details,
    ],
    [session, user?.method, details]
  );

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`Account menu for ${name}`}
        hitSlop={6}
        style={({ pressed }) => [
          styles.avatarButton,
          onInverse ? styles.avatarOnInverse : styles.avatarOnSurface,
          pressed && { opacity: 0.8 },
        ]}
      >
        {user?.picture ? (
          <Image source={{ uri: user.picture }} style={styles.avatarImage} accessibilityIgnoresInvertColors />
        ) : (
          <Text style={[styles.avatarInitials, { color: onInverse ? colors.textInverse : colors.textHeading }]}>{initials}</Text>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType={asSheet ? 'slide' : 'fade'} onRequestClose={close}>
        <Pressable style={styles.scrim} onPress={close} accessibilityLabel="Close account menu">
          {/* Swallow taps inside the card so they do not close the menu. */}
          <Pressable
            style={[styles.card, asSheet ? styles.cardSheet : styles.cardDropdown]}
            onPress={(e) => e.stopPropagation()}
          >
            <ScrollView bounces={false} showsVerticalScrollIndicator={false}>
              <View style={styles.identityRow}>
                <View style={[styles.avatarLarge, { backgroundColor: withAlpha(colors.brand, 0.18), borderColor: colors.brand }]}>
                  {user?.picture ? (
                    <Image source={{ uri: user.picture }} style={styles.avatarLargeImage} accessibilityIgnoresInvertColors />
                  ) : (
                    <Text style={[styles.avatarLargeInitials, { color: colors.brandInk }]}>{initials}</Text>
                  )}
                </View>
                <View style={styles.identityText}>
                  <Text style={styles.name} numberOfLines={1}>{name}</Text>
                  <Text style={styles.email} numberOfLines={1}>{email}</Text>
                  {user?.isDemo ? (
                    <View style={[styles.demoPill, { backgroundColor: withAlpha(colors.brand, 0.16), borderColor: withAlpha(colors.brand, 0.45) }]}>
                      <Text style={[styles.demoPillText, { color: colors.brandInk }]}>Demo account</Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View style={styles.divider} />

              {rows.map((row) => (
                <View key={row.label} style={styles.detailRow}>
                  <Text style={styles.detailLabel}>{row.label}</Text>
                  <Text style={styles.detailValue} numberOfLines={1}>{row.value}</Text>
                </View>
              ))}

              {showAccountControls && (
                <>
                  <View style={styles.divider} />

                  <View style={styles.appearanceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.detailLabel}>Appearance</Text>
                      <Text style={styles.appearanceHint}>Light or dark, remembered on this device.</Text>
                    </View>
                    <ThemeToggle />
                  </View>

                  <Pressable
                    onPress={signOut}
                    accessibilityRole="button"
                    style={({ pressed }) => [
                      styles.signOut,
                      { borderColor: withAlpha(colors.danger, 0.5), backgroundColor: pressed ? withAlpha(colors.danger, 0.12) : 'transparent' },
                    ]}
                  >
                    <LogoutIcon size={16} color={colors.danger} />
                    <Text style={[styles.signOutLabel, { color: colors.danger }]}>Sign out</Text>
                  </Pressable>
                </>
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

/** "Maria Alvarez" → "MA". Falls back to the first character. */
function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const useStyles = makeStyles((t) => ({
  avatarButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarOnInverse: { backgroundColor: t.colors.inverseFillWeak, borderColor: t.colors.borderInverse },
  avatarOnSurface: { backgroundColor: t.colors.surfaceMutedAlt, borderColor: t.colors.borderMuted },
  avatarImage: { width: '100%', height: '100%' },
  avatarInitials: { fontFamily: fontFamily.bodyBold, fontSize: 13, letterSpacing: 0.3 },

  scrim: { flex: 1, backgroundColor: 'rgba(12,10,20,0.45)' },

  card: {
    backgroundColor: t.colors.surfaceCard,
    borderColor: t.colors.borderHairline,
    borderWidth: 1,
    padding: spacing.md,
    ...t.shadow.lifted,
  },
  cardDropdown: {
    position: 'absolute',
    top: 64,
    right: 16,
    width: 320,
    maxHeight: 520,
    borderRadius: 20,
  },
  cardSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    maxHeight: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: spacing.lg,
  },

  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarLarge: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarLargeImage: { width: '100%', height: '100%' },
  avatarLargeInitials: { fontFamily: fontFamily.bodyBold, fontSize: 17 },
  identityText: { flex: 1, gap: 2 },
  name: { fontFamily: fontFamily.heading, fontSize: 16, color: t.colors.textHeading },
  email: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted },
  demoPill: {
    alignSelf: 'flex-start',
    marginTop: 4,
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  demoPillText: { fontFamily: fontFamily.bodyBold, fontSize: 10 },

  divider: { height: 1, backgroundColor: t.colors.borderHairline, marginVertical: spacing.md },

  detailRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingVertical: 5 },
  detailLabel: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted },
  detailValue: { flex: 1, textAlign: 'right', fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: t.colors.textHeading },

  appearanceRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  appearanceHint: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted, marginTop: 2 },

  signOut: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderRadius: radius.pill,
    paddingVertical: 11,
  },
  signOutLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13.5 },
}));
