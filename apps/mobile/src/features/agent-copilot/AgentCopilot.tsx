import React from 'react';
import { View, ScrollView, StyleSheet, useWindowDimensions } from 'react-native';
import { useCopilotCall, useAdvanceCall, useUseSuggestion } from '@/api/hooks';
import { useUiStore } from '@/state/store';
import { colors, palette, radius, shadow } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Eyebrow, BodyText, Caption } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { CitationRow } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function AgentCopilot() {
  const { width } = useWindowDimensions();
  const compact = width < 900;
  const logout = useUiStore((s) => s.logout);

  const { data, isPending, isError, error, refetch } = useCopilotCall();
  const advance = useAdvanceCall();
  const useSuggestion = useUseSuggestion();

  if (isPending) return <LoadingState label="Loading call…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const { callTimer, customer, transcript, facts, openAnomaly, suggestion, advanceLabel, useLabel, nextActions } = data;

  const left = (
    <View style={[styles.leftCol, compact && styles.leftColCompact]}>
      <Eyebrow color={colors.textInverseMuted}>{'Live call · ' + callTimer}</Eyebrow>
      <BodyText color="#fff" style={styles.name}>{customer.name}</BodyText>
      <BodyText color={colors.textInverseMuted} style={styles.acctInfo}>
        {customer.account}{'\n'}{customer.address}
      </BodyText>
      <View style={styles.factsList}>
        {facts.map((f, i) => (
          <View key={i} style={styles.factRow}>
            <BodyText color={colors.textInverseMuted} style={styles.factKey}>{f.k}</BodyText>
            <BodyText color="#fff" style={styles.factValue}>{f.v}</BodyText>
          </View>
        ))}
      </View>
      <View style={styles.anomalyBox}>
        <BodyText color="#fff" style={styles.anomalyTitle}>Open anomaly</BodyText>
        <BodyText color={colors.textInverseMuted} style={styles.anomalyBody}>
          {openAnomaly}
        </BodyText>
      </View>
    </View>
  );

  const center = (
    <View style={[styles.centerCol, compact && styles.centerColCompact]}>
      <View style={styles.centerHeader}>
        <View style={{ flex: 1, minWidth: 200 }}>
          <BodyText color={colors.textHeading} style={styles.h2}>Agent-assist copilot</BodyText>
          <BodyText color={colors.textMuted} style={styles.centerSubtitle}>
            Same brain as the customer chat, same retrieval index, agent-facing prompt.
          </BodyText>
        </View>
        <View style={styles.headerActions}>
          <Button variant="outlineDark" size="md" onPress={logout}>
            Log out
          </Button>
          <Button variant="primary" size="md" onPress={() => advance.mutate()} disabled={advance.isPending}>
            {advanceLabel}
          </Button>
        </View>
      </View>

      <View style={[styles.transcriptCard, compact && styles.transcriptCardCompact]}>
        <Eyebrow color={colors.accent}>Live transcript</Eyebrow>
        <View style={styles.transcriptRows}>
          {transcript.map((t, i) => (
            <View key={i} style={styles.transcriptRow}>
              <BodyText
                color={t.who === 'Maria' ? colors.accent : colors.textMuted}
                style={styles.speakerLabel}
              >
                {t.who}
              </BodyText>
              <BodyText color={colors.textHeading} style={styles.transcriptText}>{t.text}</BodyText>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const right = (
    <View style={[styles.rightCol, compact ? styles.rightColCompact : styles.rightColWide]}>
      <View>
        <Eyebrow color={colors.cta}>Suggested answer</Eyebrow>
        <View style={styles.suggestionBox}>
          <BodyText color={colors.textHeading} style={styles.suggestionText}>{suggestion.text}</BodyText>
        </View>
        <View style={{ marginTop: 10 }}>
          <CitationRow items={suggestion.cites} />
        </View>
        <View style={styles.suggestionButtons}>
          <Button variant="cta" size="sm" onPress={() => useSuggestion.mutate()} disabled={useSuggestion.isPending}>{useLabel}</Button>
          <Button variant="outlineDark" size="sm">Rephrase</Button>
        </View>
      </View>

      <View style={styles.dividedSection}>
        <BodyText color={colors.textHeading} style={styles.sectionHeading}>Retrieved chunks</BodyText>
        <View style={styles.chunksList}>
          {suggestion.chunks.map((c, i) => (
            <View key={i} style={styles.chunkCard}>
              <View style={styles.chunkHeaderRow}>
                <BodyText color={colors.textHeading} style={styles.chunkSrc}>{c.src}</BodyText>
                <BodyText color={colors.cta} style={styles.chunkScore}>{c.score}</BodyText>
              </View>
              <BodyText color={colors.textMuted} style={styles.chunkText}>{c.text}</BodyText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.dividedSection}>
        <BodyText color={colors.textHeading} style={[styles.sectionHeading, { marginBottom: 10 }]}>
          Next best actions
        </BodyText>
        <View style={styles.actionsList}>
          {nextActions.map((a, i) => (
            <View key={i} style={styles.actionRow}>
              <Caption color={colors.textHeading} style={styles.actionText}>{a}</Caption>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.fill}>
      {compact ? (
        <ScrollView style={styles.fill} contentContainerStyle={styles.stackContent}>
          {left}
          {center}
          {right}
        </ScrollView>
      ) : (
        <View style={styles.wideRow}>
          <ScrollView style={styles.leftColWide} contentContainerStyle={styles.growContent}>
            {left}
          </ScrollView>
          <ScrollView style={styles.centerColWideScroll} contentContainerStyle={styles.growContent}>
            {center}
          </ScrollView>
          <ScrollView style={styles.rightColOuter} contentContainerStyle={styles.growContent}>
            {right}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: palette.gray200 },
  stackContent: { backgroundColor: palette.gray200, flexGrow: 1 },
  wideRow: { flex: 1, flexDirection: 'row', backgroundColor: palette.gray200 },

  growContent: { flexGrow: 1 },
  leftColWide: { flex: 0, width: 270 },
  leftCol: { flexGrow: 1, backgroundColor: colors.primary, padding: 22, paddingVertical: 24 },
  leftColCompact: { flexGrow: undefined, padding: 22 },
  name: { fontFamily: fontFamily.heading, fontSize: 20, marginTop: 10, marginBottom: 4 },
  acctInfo: { fontSize: 12.5, lineHeight: 19 },
  factsList: { flexDirection: 'column', gap: 11, marginTop: 22 },
  factRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  factKey: { fontSize: 12, lineHeight: 17 },
  factValue: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, textAlign: 'right' },
  anomalyBox: { backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: radius.md, padding: 14, marginTop: 22 },
  anomalyTitle: { fontFamily: fontFamily.heading, fontSize: 12 },
  anomalyBody: { fontSize: 11.5, lineHeight: 17, marginTop: 5 },

  centerColWideScroll: { flex: 1, minWidth: 0 },
  centerCol: { flexGrow: 1, padding: 24, paddingHorizontal: 28, gap: 16 },
  centerColCompact: { flexGrow: undefined, padding: 22 },
  centerHeader: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 18, flexWrap: 'wrap' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  h2: { fontFamily: fontFamily.heading, fontSize: 24, lineHeight: 28 },
  centerSubtitle: { fontSize: 13, lineHeight: 19, marginTop: 6 },
  transcriptCard: {
    flex: 1,
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.md,
    padding: 22,
    gap: 14,
    minHeight: 260,
    ...shadow.card,
  },
  transcriptCardCompact: { flex: undefined, minHeight: undefined },
  transcriptRows: { gap: 14 },
  transcriptRow: { flexDirection: 'row', gap: 12 },
  speakerLabel: { fontFamily: fontFamily.bodyBold, fontSize: 11, lineHeight: 20, width: 58, textTransform: 'uppercase', letterSpacing: 0.6 },
  transcriptText: { fontSize: 13.5, lineHeight: 21, flex: 1 },

  rightColOuter: { flex: 0, width: 370 },
  rightCol: { flexGrow: 1, padding: 22, gap: 18, backgroundColor: colors.surfaceCard },
  rightColWide: { borderLeftWidth: 2, borderLeftColor: colors.surfaceMuted },
  rightColCompact: { flexGrow: undefined, paddingHorizontal: 22, paddingVertical: 22, borderTopWidth: 2, borderTopColor: colors.surfaceMuted },

  suggestionBox: { backgroundColor: colors.surfaceMuted, borderRadius: radius.md, padding: 15, marginTop: 11 },
  suggestionText: { fontSize: 13.5, lineHeight: 22 },
  suggestionButtons: { flexDirection: 'row', gap: 8, marginTop: 14 },

  dividedSection: { borderTopWidth: 2, borderTopColor: colors.surfaceMuted, paddingTop: 18 },
  sectionHeading: { fontFamily: fontFamily.heading, fontSize: 13, lineHeight: 17 },

  chunksList: { gap: 10, marginTop: 11 },
  chunkCard: { borderWidth: 2, borderColor: colors.surfaceMuted, borderRadius: radius.md, padding: 12 },
  chunkHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  chunkSrc: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, lineHeight: 15 },
  chunkScore: { fontFamily: fontFamily.bodyBold, fontSize: 11, lineHeight: 14 },
  chunkText: { fontSize: 11.5, lineHeight: 18, marginTop: 6 },

  actionsList: { gap: 7 },
  actionRow: { backgroundColor: palette.gray200, borderRadius: radius.chip, paddingVertical: 10, paddingHorizontal: 12 },
  actionText: { fontSize: 12.5, lineHeight: 18 },
});
