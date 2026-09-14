import React, { useState } from 'react';
import { View, TextInput, Pressable, StyleSheet, ScrollView, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUiStore, Surface } from '@/state/store';
import { colors, radius, shadow, spacing } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { H1, H4, BodyText, Caption, Eyebrow } from '@/components/ui/Text';

const ROLES: { key: Surface; label: string; blurb: string }[] = [
  { key: 'app', label: 'Customer app', blurb: 'Bill, usage, solar and outage tools for a residential account.' },
  { key: 'portal', label: 'Public portal', blurb: 'Rate comparison and self-service, no account needed.' },
  { key: 'ops', label: 'Ops dashboard', blurb: 'Predictive maintenance and demand-response targeting.' },
  { key: 'copilot', label: 'Agent copilot', blurb: 'Live call assist with grounded, cited answers.' },
];

export function LoginScreen() {
  const login = useUiStore((s) => s.login);
  const { width } = useWindowDimensions();
  const compact = width < 640;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Surface | null>(null);

  const canSubmit = email.trim().length > 0 && password.trim().length > 0 && role !== null;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Card style={[styles.card, compact && styles.cardCompact]} padding={compact ? spacing.lg : spacing.xl}>
          <Eyebrow>CG Infinity · OneGridAI</Eyebrow>
          <H1 style={styles.title}>Sign in</H1>
          <BodyText style={styles.subtitle}>
            One AI layer, four surfaces — sign in and pick which one you're working in today.
          </BodyText>

          <View style={styles.field}>
            <Caption style={styles.label}>Email</Caption>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@conedison.com"
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              style={styles.input}
            />
          </View>

          <View style={styles.field}>
            <Caption style={styles.label}>Password</Caption>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={colors.textMuted}
              secureTextEntry
              style={styles.input}
            />
          </View>

          <Caption style={[styles.label, { marginTop: spacing.sm }]}>Sign in as</Caption>
          <View style={styles.roleGrid}>
            {ROLES.map((r) => {
              const active = role === r.key;
              return (
                <Pressable
                  key={r.key}
                  onPress={() => setRole(r.key)}
                  style={[styles.roleCard, active && styles.roleCardActive]}
                >
                  <H4 color={active ? '#fff' : colors.textHeading}>{r.label}</H4>
                  <Caption color={active ? colors.textInverseMuted : colors.textMuted} style={styles.roleBlurb}>
                    {r.blurb}
                  </Caption>
                </Pressable>
              );
            })}
          </View>

          <Button
            variant="cta"
            size="md"
            block
            disabled={!canSubmit}
            onPress={() => role && login(role)}
            style={styles.submit}
          >
            Log in
          </Button>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.page },
  scrollContent: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { width: '100%', maxWidth: 460, ...shadow.lifted },
  cardCompact: { maxWidth: '100%' },
  title: { marginTop: 8, marginBottom: 6, fontSize: 28, lineHeight: 32 },
  subtitle: { marginBottom: spacing.lg },
  field: { marginBottom: spacing.md },
  label: { marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.6 },
  input: {
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fontFamily.body,
    fontSize: 14,
    color: colors.textBody,
    backgroundColor: colors.surfaceCard,
  },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: spacing.lg },
  roleCard: {
    flexGrow: 1,
    flexBasis: '47%',
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.surfaceCard,
  },
  roleCardActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleBlurb: { marginTop: 4 },
  submit: { marginTop: spacing.xs },
});
