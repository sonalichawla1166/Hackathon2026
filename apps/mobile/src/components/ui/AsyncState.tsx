import React from 'react';
import { ActivityIndicator, Pressable, Text, View, StyleSheet } from 'react-native';
import { colors, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { ApiError } from '@/api/client';

export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={colors.accent} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
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
        <Pressable style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 32, alignItems: 'center', gap: 10 },
  errorCard: { backgroundColor: colors.surfaceCard, borderRadius: radius.md, margin: 4, borderWidth: 1, borderColor: colors.danger + '40' },
  label: { fontFamily: fontFamily.body, fontSize: 13, color: colors.textMuted },
  errorTitle: { fontFamily: fontFamily.heading, fontSize: 15, color: colors.textHeading, textAlign: 'center' },
  errorMessage: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted, textAlign: 'center' },
  retryBtn: { marginTop: 6, borderWidth: 1.5, borderColor: colors.accent, borderRadius: radius.sm, paddingHorizontal: 16, paddingVertical: 9 },
  retryText: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.accent },
});
