import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { makeStyles, radius, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { ApiError } from '@/api/client';

const useStyles = makeStyles((t) => ({
  wrap: { padding: 32, alignItems: 'center', gap: 10 },
  errorCard: {
    backgroundColor: t.colors.surfaceCard,
    borderRadius: radius.md,
    margin: 4,
    borderWidth: 1,
    borderColor: withAlpha(t.colors.danger, 0.25),
  },
  label: { fontFamily: fontFamily.body, fontSize: 13, color: t.colors.textMuted },
  errorTitle: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textHeading, textAlign: 'center' },
  errorMessage: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, textAlign: 'center' },
  retryBtn: {
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: t.colors.accent,
    borderRadius: radius.sm,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  retryText: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: t.colors.accent },
}));

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const styles = useStyles();
  const message =
    error instanceof ApiError
      ? `Backend returned ${error.status}. Is it running?`
      : error instanceof Error
        ? error.message
        : 'Something went wrong.';
  return (
    <View style={[styles.wrap, styles.errorCard]}>
      <Text style={styles.errorTitle}>Couldn't reach the backend</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Pressable style={styles.retryBtn} onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}
