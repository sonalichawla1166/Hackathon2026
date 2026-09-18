import React, { useEffect, useRef, useState } from 'react';
import { View, Pressable, Text, ScrollView, useWindowDimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  useCopilotCall,
  useAdvanceCall,
  useCompleteCall,
  useCopilotAsk,
  useRephrase,
  useResetCall,
  useToggleAction,
  useUseSuggestion,
} from '@/api/hooks';
import { makeStyles, radius, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { PageWash } from '@/components/ui/PageWash';
import { ProfileMenu } from '@/components/ui/ProfileMenu';
import { Eyebrow, BodyText, Caption } from '@/components/ui/Text';
import { Button } from '@/components/ui/Button';
import { CitationRow } from '@/components/ui/Citation';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { MicIcon } from '@/components/icons/TabIcons';
import { hiddenScrollbar } from '@/components/ui/scroll';
import { useVoiceInput } from '@/features/customer-app/screens/useVoiceInput';

const COPILOT_PROFILE_DETAILS = [
  { label: 'Queue', value: 'Residential billing' },
  { label: 'Access', value: 'Agent copilot' },
] as const;

function formatElapsed(startedAt: number | null, endedAt: number | null, nowSec: number): string {
  if (!startedAt) return '00:00';
  const secs = Math.max(0, Math.floor((endedAt ?? nowSec) - startedAt));
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

export function AgentCopilot() {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 900;

  const { data, isPending, isError, error, refetch } = useCopilotCall();
  const advance = useAdvanceCall();
  const useSuggestion = useUseSuggestion();
  const rephrase = useRephrase();
  const copilotAsk = useCopilotAsk();
  const toggleAction = useToggleAction();
  const completeCall = useCompleteCall();
  const resetCall = useResetCall();

  // The call clock ticks client-side from the server's start timestamp, so
  // it reads as live without polling; it freezes once the call is ended.
  const [nowSec, setNowSec] = useState(() => Date.now() / 1000);
  useEffect(() => {
    const id = setInterval(() => setNowSec(Date.now() / 1000), 1000);
    return () => clearInterval(id);
  }, []);

  // Keep the newest transcript line in view on the wide layout, where the
  // transcript column scrolls on its own.
  const transcriptScrollRef = useRef<ScrollView>(null);
  const transcriptLength = data?.transcript.length ?? 0;
  useEffect(() => {
    transcriptScrollRef.current?.scrollToEnd({ animated: true });
  }, [transcriptLength]);

  // Voice is web-only (see ChatScreen for why native recording doesn't work
  // in this Expo Go build — the native audio module isn't bundled for this
  // SDK). Playback uses the browser's own Audio element directly instead of
  // an Expo audio module, since this code path only ever runs on web.
  const audioRef = useRef<any>(null);

  const voice = useVoiceInput((transcript) => copilotAsk.mutate(transcript, {
    onSuccess: (result) => {
      if (result.audio_b64 && typeof window !== 'undefined') {
        audioRef.current?.pause?.();
        const audio = new (window as any).Audio(`data:audio/wav;base64,${result.audio_b64}`);
        audio.play();
        audioRef.current = audio;
      }
    },
  }));

  const stopVoice = () => {
    if (voice.listening) voice.stop();
    audioRef.current?.pause?.();
    audioRef.current = null;
  };

  const handleMicPress = () => {
    if (!voice.supported) {
      Alert.alert(
        'Voice input unavailable',
        'Voice input works in a web browser — run the app with `npm run web`. Native recording isn\'t available in this build.'
      );
      return;
    }
    if (voice.listening) voice.stop();
    else voice.start();
  };

  if (isPending) return <LoadingState label="Loading call…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const {
    callStartedAt, callEndedAt, customer, transcript, facts, openAnomaly, suggestion,
    advanceLabel, callComplete, callEnded, useLabel, nextActions, summary,
  } = data;

  const timer = formatElapsed(callStartedAt, callEndedAt, nowSec);
  const busy = advance.isPending || completeCall.isPending || resetCall.isPending;
  const customerInitials = initials(customer.name);
  const customerFirstName = customer.name.split(/\s+/)[0] ?? 'Customer';
  const maxScore = Math.max(0.01, ...suggestion.chunks.map((c) => parseFloat(c.score) || 0));

  // ── Left: who's on the line ──────────────────────────────────────────────
  const left = (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.leftCol, compact && styles.leftColCompact]}
    >
      <View style={styles.statusPill}>
        <View style={[styles.statusDot, { backgroundColor: callEnded ? colors.textInverseMuted : colors.success }]} />
        <Caption color={colors.textInverse} style={styles.statusText}>
          {callEnded ? 'Ended' : 'Live'} · {timer}
        </Caption>
      </View>

      <View style={styles.identityRow}>
        <View style={styles.avatar}>
          <Text style={[styles.avatarText, { color: colors.textInverse }]}>{customerInitials}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <BodyText color={colors.textInverse} style={styles.name}>{customer.name}</BodyText>
          <Caption color={colors.textInverseMuted} style={styles.acctInfo}>{customer.account}</Caption>
        </View>
      </View>
      <Caption color={colors.textInverseMuted} style={styles.address}>{customer.address}</Caption>

      <View style={styles.factsCard}>
        {facts.map((f, i) => (
          <View key={f.k} style={[styles.factRow, i > 0 && styles.factRowDivider]}>
            <Caption color={colors.textInverseMuted} style={styles.factKey}>{f.k}</Caption>
            <BodyText color={colors.textInverse} style={styles.factValue}>{f.v}</BodyText>
          </View>
        ))}
      </View>

      <View style={styles.anomalyCard}>
        <View style={[styles.anomalyRail, { backgroundColor: colors.warning }]} />
        <View style={{ flex: 1 }}>
          <Eyebrow color={colors.warning}>Open anomaly</Eyebrow>
          <Caption color={colors.textInverseMutedAlt} style={styles.anomalyBody}>{openAnomaly}</Caption>
        </View>
      </View>
    </LinearGradient>
  );

  // ── Center: the call itself ──────────────────────────────────────────────
  const header = (
    <View style={styles.toolbar}>
      <View style={styles.titleRow}>
        <View style={{ flex: 1, minWidth: 0 }}>
          <BodyText color={colors.textHeading} style={styles.h2}>Agent-assist copilot</BodyText>
          <Caption color={colors.textMuted} style={styles.centerSubtitle}>
            Same brain as the customer chat, same retrieval index, agent-facing prompt.
          </Caption>
        </View>
        <ProfileMenu details={COPILOT_PROFILE_DETAILS} />
      </View>

      <View style={styles.controlsRow}>
        <Pressable
          style={[styles.speakBtn, voice.listening && styles.speakBtnActive, callEnded && styles.controlDisabled]}
          onPress={handleMicPress}
          disabled={copilotAsk.isPending || callEnded}
          accessibilityRole="button"
          accessibilityLabel={voice.listening ? 'Stop listening' : 'Ask a question by voice'}
        >
          <MicIcon size={15} color={voice.listening ? colors.onCta : colors.textHeading} />
          <Text style={[styles.speakLabel, { color: voice.listening ? colors.onCta : colors.textHeading }]}>
            {voice.listening ? 'Listening…' : copilotAsk.isPending ? 'Answering…' : 'Speak'}
          </Text>
        </Pressable>

        {callEnded ? (
          <Button
            variant="cta"
            size="md"
            onPress={() => {
              stopVoice();
              resetCall.mutate();
            }}
            disabled={busy}
          >
            New call
          </Button>
        ) : (
          <>
            <Button
              variant="outlineDark"
              size="md"
              onPress={() => {
                stopVoice();
                advance.mutate();
              }}
              disabled={busy || callComplete}
            >
              {advanceLabel}
            </Button>
            <Button
              variant="primary"
              size="md"
              onPress={() => {
                stopVoice();
                completeCall.mutate();
              }}
              disabled={busy}
            >
              {completeCall.isPending ? 'Wrapping up…' : 'End call'}
            </Button>
          </>
        )}
      </View>
    </View>
  );

  // After-call notes: the payoff of the whole surface. Generated once by the
  // backend at end-of-call, so it renders exactly what the agent would file.
  const wrapUp = summary ? (
    <View style={styles.summaryCard}>
      <View style={[styles.summaryRail, { backgroundColor: colors.brand }]} />
      <View style={{ flex: 1, gap: 12 }}>
        <View style={styles.summaryHeaderRow}>
          <Eyebrow color={colors.brandInk}>After-call notes</Eyebrow>
          <Caption color={colors.textMuted}>Duration {summary.durationLabel}</Caption>
        </View>
        <BodyText color={colors.textHeading} style={styles.summaryHeadline}>{summary.headline}</BodyText>
        <View style={styles.summaryStats}>
          {summary.stats.map((s) => (
            <View key={s.k} style={styles.summaryStat}>
              <BodyText color={colors.textHeading} style={styles.summaryStatValue}>{s.v}</BodyText>
              <Caption color={colors.textMuted}>{s.k}</Caption>
            </View>
          ))}
        </View>
      </View>
    </View>
  ) : null;

  const pendingBubble = voice.listening || copilotAsk.isPending;

  const transcriptRows = (
    <View style={styles.transcriptRows}>
      {transcript.map((t, i) => {
        const isAgent = t.who === 'Agent';
        return (
          <View key={i} style={[styles.bubbleRow, isAgent && styles.bubbleRowAgent]}>
            {!isAgent && (
              <View style={[styles.bubbleAvatar, { backgroundColor: withAlpha(colors.accent, 0.18) }]}>
                <Text style={[styles.bubbleAvatarText, { color: colors.accent }]}>{t.who[0]}</Text>
              </View>
            )}
            <View style={[styles.bubbleCol, isAgent && styles.bubbleColAgent]}>
              <Caption color={isAgent ? colors.textMuted : colors.accent} style={styles.speakerLabel}>
                {isAgent ? 'Agent · you' : t.who}
              </Caption>
              <View
                style={[
                  styles.bubble,
                  isAgent
                    ? { backgroundColor: colors.surfaceMuted, borderTopRightRadius: 4 }
                    : { backgroundColor: withAlpha(colors.accent, 0.12), borderTopLeftRadius: 4 },
                ]}
              >
                <BodyText color={colors.textHeading} style={styles.bubbleText}>{t.text}</BodyText>
              </View>
            </View>
          </View>
        );
      })}
      {pendingBubble && (
        <View style={styles.bubbleRow}>
          <View style={[styles.bubbleAvatar, { backgroundColor: withAlpha(colors.accent, 0.18) }]}>
            <Text style={[styles.bubbleAvatarText, { color: colors.accent }]}>{customerFirstName[0]}</Text>
          </View>
          <View style={styles.bubbleCol}>
            <Caption color={colors.accent} style={styles.speakerLabel}>{customerFirstName}</Caption>
            <View style={[styles.bubble, styles.bubblePending, { borderColor: withAlpha(colors.accent, 0.35) }]}>
              <Caption color={colors.textMuted}>
                {voice.listening ? 'Listening…' : 'Finding the grounded answer…'}
              </Caption>
            </View>
          </View>
        </View>
      )}
    </View>
  );

  const transcriptHeader = (
    <View style={styles.transcriptHeader}>
      <Eyebrow color={colors.accent}>{callEnded ? 'Call transcript' : 'Live transcript'}</Eyebrow>
      <Caption color={colors.textMuted}>{transcript.length} lines</Caption>
    </View>
  );

  // ── Right: what the copilot recommends ───────────────────────────────────
  const right = (
    <View style={[styles.rightCol, compact ? styles.rightColCompact : styles.rightColWide]}>
      <View style={styles.suggestionCard}>
        <View style={[styles.suggestionRail, { backgroundColor: colors.brand }]} />
        <View style={{ flex: 1, gap: 12 }}>
          <View style={styles.suggestionHeaderRow}>
            <Eyebrow color={colors.brandInk}>Suggested answer</Eyebrow>
            <Caption color={colors.textMuted}>
              {suggestion.cites.length > 0 ? `Grounded in ${suggestion.cites.length} source${suggestion.cites.length === 1 ? '' : 's'}` : 'No citation'}
            </Caption>
          </View>
          <BodyText color={colors.textHeading} style={styles.suggestionText}>{suggestion.text}</BodyText>
          {suggestion.cites.length > 0 && <CitationRow items={suggestion.cites} />}
          <View style={styles.suggestionButtons}>
            <Button
              variant="cta"
              size="sm"
              onPress={() => useSuggestion.mutate()}
              disabled={useSuggestion.isPending || data.used || callEnded}
            >
              {data.used ? '✓ Inserted' : useLabel}
            </Button>
            <Button
              variant="outlineDark"
              size="sm"
              disabled={rephrase.isPending || callEnded}
              onPress={() => rephrase.mutate()}
            >
              {rephrase.isPending ? 'Rephrasing…' : 'Rephrase'}
            </Button>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <BodyText color={colors.textHeading} style={styles.sectionHeading}>Evidence</BodyText>
          <Caption color={colors.textMuted}>{suggestion.chunks.length} passages</Caption>
        </View>
        <View style={styles.chunksList}>
          {suggestion.chunks.map((c, i) => {
            const rel = Math.max(0.08, (parseFloat(c.score) || 0) / maxScore);
            return (
              <View key={i} style={styles.chunkCard}>
                <View style={styles.chunkHeaderRow}>
                  <Caption color={colors.textHeading} style={styles.chunkSrc}>{c.src}</Caption>
                  {i === 0 && (
                    <View style={[styles.topMatch, { backgroundColor: withAlpha(colors.brand, 0.18) }]}>
                      <Caption color={colors.brandInk} style={styles.topMatchText}>Top match</Caption>
                    </View>
                  )}
                </View>
                <View style={styles.relTrack}>
                  <View style={[styles.relFill, { width: `${Math.round(rel * 100)}%`, backgroundColor: colors.brand }]} />
                </View>
                <Caption color={colors.textMuted} style={styles.chunkText} numberOfLines={3}>{c.text}</Caption>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeaderRow}>
          <BodyText color={colors.textHeading} style={styles.sectionHeading}>Next best actions</BodyText>
          <Caption color={colors.textMuted}>
            {nextActions.filter((a) => a.done).length}/{nextActions.length} done
          </Caption>
        </View>
        <View style={styles.actionsList}>
          {nextActions.map((a) => (
            <Pressable
              key={a.text}
              onPress={() => toggleAction.mutate(a.text)}
              disabled={toggleAction.isPending || callEnded}
              style={[styles.actionRow, a.done && styles.actionRowDone]}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: a.done }}
            >
              <View style={[styles.actionCheck, a.done && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                {a.done && <Text style={[styles.actionCheckMark, { color: colors.onAccent }]}>✓</Text>}
              </View>
              <Caption color={colors.textHeading} style={[styles.actionText, a.done && styles.actionTextDone]}>
                {a.text}
              </Caption>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );

  // Compact: what the agent needs first is the answer, then the wrap-up if
  // there is one, then the transcript; the customer facts are reference and
  // sit last so the suggestion isn't below the fold.
  if (compact) {
    return (
      <View style={styles.fill}>
        <PageWash />
        <ScrollView style={styles.fill} contentContainerStyle={styles.stackContent} {...hiddenScrollbar}>
          <View style={styles.centerColCompact}>
            {header}
            {wrapUp}
          </View>
          {right}
          <View style={styles.centerColCompact}>
            <View style={styles.transcriptCardCompact}>
              {transcriptHeader}
              {transcriptRows}
            </View>
          </View>
          {left}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.fill}>
      <PageWash />
      <View style={styles.wideRow}>
        <ScrollView style={styles.leftColWide} contentContainerStyle={styles.growContent} {...hiddenScrollbar}>
          {left}
        </ScrollView>

        <View style={styles.centerCol}>
          {header}
          {wrapUp}
          <View style={styles.transcriptCard}>
            {transcriptHeader}
            <ScrollView
              ref={transcriptScrollRef}
              style={styles.transcriptScroll}
              contentContainerStyle={styles.transcriptScrollContent}
              {...hiddenScrollbar}
            >
              {transcriptRows}
            </ScrollView>
          </View>
        </View>

        <ScrollView style={styles.rightColOuter} contentContainerStyle={styles.growContent} {...hiddenScrollbar}>
          {right}
        </ScrollView>
      </View>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, backgroundColor: t.colors.page },
  stackContent: { flexGrow: 1 },
  wideRow: { flex: 1, flexDirection: 'row' },
  growContent: { flexGrow: 1 },

  // Left column
  leftColWide: { flex: 0, width: 280 },
  leftCol: { flexGrow: 1, padding: 22, paddingVertical: 24, gap: 18 },
  leftColCompact: { flexGrow: undefined },
  statusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: t.colors.inverseFillWeak,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 11,
  },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: fontFamily.bodyBold, letterSpacing: 0.6, textTransform: 'uppercase', fontSize: 10.5 },
  identityRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: t.colors.inverseFillWeak,
    borderWidth: 1,
    borderColor: t.colors.borderInverseSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontFamily: fontFamily.heading, fontSize: 16 },
  name: { fontFamily: fontFamily.heading, fontSize: 19, lineHeight: 23 },
  acctInfo: { fontSize: 12 },
  address: { fontSize: 12, marginTop: -8 },
  factsCard: { backgroundColor: t.colors.inverseFillWeak, borderRadius: radius.md, paddingHorizontal: 14 },
  factRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12, paddingVertical: 11 },
  factRowDivider: { borderTopWidth: 1, borderTopColor: t.colors.borderInverseSoft },
  factKey: { fontSize: 12 },
  factValue: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, textAlign: 'right', flexShrink: 1 },
  anomalyCard: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: t.colors.inverseFillWeak,
    borderRadius: radius.md,
    padding: 14,
    overflow: 'hidden',
  },
  anomalyRail: { width: 3, borderRadius: 2, alignSelf: 'stretch' },
  anomalyBody: { fontSize: 12, lineHeight: 18, marginTop: 6 },

  // Center column
  centerCol: { flex: 1, minWidth: 0, padding: 24, paddingHorizontal: 28, gap: 16 },
  centerColCompact: { padding: 20, gap: 16 },
  toolbar: {
    backgroundColor: t.colors.surfaceCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    padding: 18,
    gap: 14,
  },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 },
  h2: { fontFamily: fontFamily.heading, fontSize: 22, lineHeight: 26 },
  centerSubtitle: { fontSize: 12.5, lineHeight: 18, marginTop: 4 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  speakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 40,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: t.colors.surfaceMuted,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
  },
  speakBtnActive: { backgroundColor: t.colors.danger, borderColor: t.colors.danger },
  speakLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13 },
  controlDisabled: { opacity: 0.5 },

  summaryCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: t.colors.surfaceCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    padding: 18,
    overflow: 'hidden',
    ...t.shadow.card,
  },
  summaryRail: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  summaryHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  summaryHeadline: { fontSize: 14, lineHeight: 22 },
  summaryStats: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  summaryStat: { minWidth: 110 },
  summaryStatValue: { fontFamily: fontFamily.heading, fontSize: 22, lineHeight: 26 },

  transcriptCard: {
    flex: 1,
    minHeight: 0,
    backgroundColor: t.colors.surfaceCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    overflow: 'hidden',
    ...t.shadow.card,
  },
  transcriptCardCompact: {
    backgroundColor: t.colors.surfaceCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    paddingBottom: 18,
    overflow: 'hidden',
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: t.colors.borderHairline,
  },
  transcriptScroll: { flex: 1, minHeight: 0 },
  transcriptScrollContent: { padding: 20 },
  transcriptRows: { gap: 14, paddingHorizontal: 0 },
  bubbleRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, paddingHorizontal: 20, maxWidth: '85%' },
  bubbleRowAgent: { alignSelf: 'flex-end', justifyContent: 'flex-end' },
  bubbleAvatar: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bubbleAvatarText: { fontFamily: fontFamily.heading, fontSize: 12 },
  bubbleCol: { flexShrink: 1, gap: 4 },
  bubbleColAgent: { alignItems: 'flex-end' },
  speakerLabel: { fontFamily: fontFamily.bodyBold, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase' },
  bubble: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleText: { fontSize: 13.5, lineHeight: 20 },
  bubblePending: { backgroundColor: 'transparent', borderWidth: 1, borderStyle: 'dashed' },

  // Right column
  rightColOuter: { flex: 0, width: 380 },
  rightCol: { flexGrow: 1, padding: 22, gap: 20, backgroundColor: t.colors.surfaceCard },
  rightColWide: { borderLeftWidth: 1, borderLeftColor: t.colors.borderHairline },
  rightColCompact: { flexGrow: undefined, borderTopWidth: 1, borderTopColor: t.colors.borderHairline },
  suggestionCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: t.colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 16,
    overflow: 'hidden',
  },
  suggestionRail: { width: 4, borderRadius: 2, alignSelf: 'stretch' },
  suggestionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' },
  suggestionText: { fontSize: 14, lineHeight: 22 },
  suggestionButtons: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },

  section: { gap: 10 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 10 },
  sectionHeading: { fontFamily: fontFamily.heading, fontSize: 13.5, lineHeight: 17 },

  chunksList: { gap: 8 },
  chunkCard: {
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    borderRadius: radius.md,
    padding: 12,
    gap: 7,
  },
  chunkHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  chunkSrc: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, flexShrink: 1 },
  topMatch: { borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  topMatchText: { fontFamily: fontFamily.bodyBold, fontSize: 10, letterSpacing: 0.4, textTransform: 'uppercase' },
  relTrack: { height: 4, borderRadius: 2, backgroundColor: t.colors.surfaceMuted, overflow: 'hidden' },
  relFill: { height: '100%' },
  chunkText: { fontSize: 11.5, lineHeight: 17 },

  actionsList: { gap: 7 },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: t.colors.surfaceMutedAlt,
    borderRadius: radius.chip,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  actionRowDone: { opacity: 0.65 },
  actionCheck: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: t.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionCheckMark: { fontSize: 12, lineHeight: 14, fontFamily: fontFamily.bodyBold },
  actionText: { fontSize: 12.5, lineHeight: 18, flex: 1 },
  actionTextDone: { textDecorationLine: 'line-through' },
}));
