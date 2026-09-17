import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { makeStyles, radius, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { ADMIN_USER, DEMO_USER_GROUPS, DemoUser } from '../demoUsers';

interface DemoAccountPickerProps {
  /** Signs straight in as this demo user. */
  onPickUser: (user: DemoUser) => void;
  /** Omit to hide the admin row — used once already inside admin mode, where
   * picking "who to view as" is the only thing left to do. */
  onPickAdmin?: () => void;
}

/**
 * The five-surfaces-by-user directory, grouped exactly like `DEMO_USER_GROUPS`.
 * Reused in two places: a "browse demo accounts" shortcut under the sign-in
 * form (skips typing), and the admin's "sign in as" screen (the only way to
 * reach any of these workspaces without the account it belongs to).
 */
export function DemoAccountPicker({ onPickUser, onPickAdmin }: DemoAccountPickerProps) {
  const styles = useStyles();
  const { colors } = useTheme();

  return (
    <View style={styles.wrap}>
      {onPickAdmin ? (
        <Pressable
          onPress={onPickAdmin}
          accessibilityRole="button"
          accessibilityLabel={`Continue as admin, ${ADMIN_USER.name}`}
          style={({ pressed }) => [
            styles.row,
            styles.adminRow,
            { backgroundColor: pressed ? withAlpha(colors.brand, 0.16) : withAlpha(colors.brand, 0.1), borderColor: colors.brand },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: colors.brand }]}>
            <Text style={[styles.avatarText, { color: colors.onCta }]}>{initials(ADMIN_USER.name)}</Text>
          </View>
          <View style={styles.rowText}>
            <Text style={[styles.name, { color: colors.textHeading }]} numberOfLines={1}>{ADMIN_USER.name}</Text>
            <Text style={[styles.meta, { color: colors.textBody }]} numberOfLines={1}>Admin · choose who to sign in as</Text>
          </View>
          <Text style={[styles.chevron, { color: colors.brandInk }]}>›</Text>
        </Pressable>
      ) : null}

      {DEMO_USER_GROUPS.map((group) => (
        <View key={group.role} style={styles.group}>
          <Text style={[styles.groupLabel, { color: colors.textMuted }]}>{group.label}</Text>
          {group.users.map((user) => (
            <Pressable
              key={user.email}
              onPress={() => onPickUser(user)}
              accessibilityRole="button"
              accessibilityLabel={`Sign in as ${user.name}, ${group.label}`}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: pressed ? colors.surfaceMutedAlt : colors.surfaceCard, borderColor: colors.borderMuted },
              ]}
            >
              <View style={[styles.avatar, { backgroundColor: colors.surfaceMutedAlt }]}>
                <Text style={[styles.avatarText, { color: colors.textHeading }]}>{initials(user.name)}</Text>
              </View>
              <View style={styles.rowText}>
                <Text style={[styles.name, { color: colors.textHeading }]} numberOfLines={1}>{user.name}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]} numberOfLines={1}>{user.email}</Text>
              </View>
              <Text style={[styles.chevron, { color: colors.textMuted }]}>›</Text>
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const useStyles = makeStyles(() => ({
  wrap: { gap: 16 },
  group: { gap: 8 },
  groupLabel: { fontFamily: fontFamily.bodyBold, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  adminRow: { marginBottom: 2 },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.bodyBold, fontSize: 12.5 },
  rowText: { flex: 1, gap: 1 },
  name: { fontFamily: fontFamily.bodyBold, fontSize: 13.5 },
  meta: { fontFamily: fontFamily.body, fontSize: 11.5 },
  chevron: { fontFamily: fontFamily.bodyBold, fontSize: 18 },
}));
