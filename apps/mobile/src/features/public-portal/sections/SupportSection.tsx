import React from 'react';
import { View, Text } from 'react-native';
import type { SupportChannel } from '@/api/types';
import { usePortalSupport } from '@/api/hooks';
import { makeStyles, radius, useTheme, withAlpha } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { FaqAccordion } from '../FaqAccordion';

/**
 * Support: how to reach a human, and what you can settle without one.
 *
 * The emergency line is deliberately first and set apart — in a utility
 * product that is a safety affordance, not a design flourish.
 */
export function SupportSection({ compact }: { compact: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  const { data, isPending, isError, error, refetch } = usePortalSupport();

  if (isPending) return <LoadingState label="Loading support options…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const urgent = data.channels.filter((c) => c.urgent);
  const routine = data.channels.filter((c) => !c.urgent);

  const channels = (
    <View style={styles.block}>
      {urgent.map((c) => (
        <View
          key={c.id}
          style={[styles.urgentCard, { borderColor: colors.danger, backgroundColor: withAlpha(colors.danger, 0.08) }]}
        >
          <Text style={[styles.urgentEyebrow, { color: colors.danger }]}>Emergency</Text>
          <Text style={styles.urgentName}>{c.name}</Text>
          <Text style={[styles.action, { color: colors.danger }]}>{c.action}</Text>
          <Text style={styles.detail}>{c.detail}</Text>
        </View>
      ))}

      <Text style={styles.blockTitle}>Everything else</Text>
      <View style={[styles.channelGrid, compact && styles.channelGridCompact]}>
        {routine.map((c) => (
          <View key={c.id} style={styles.channelCard}>
            <Text style={styles.channelKind}>{KIND_LABEL[c.kind]}</Text>
            <Text style={styles.channelName}>{c.name}</Text>
            <Text style={styles.action}>{c.action}</Text>
            <Text style={styles.detail}>{c.detail}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.note}>{data.note}</Text>
    </View>
  );

  const topics = (
    <View style={styles.block}>
      <Text style={styles.blockTitle}>Sort it out yourself</Text>
      <View style={styles.topics}>
        {data.topics.map((tpc) => (
          <View key={tpc.id} style={styles.topicCard}>
            <Text style={styles.topicTitle}>{tpc.title}</Text>
            <Text style={styles.topicBody}>{tpc.body}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.wrap}>
      {channels}
      {topics}
      <FaqAccordion />
    </View>
  );
}

const KIND_LABEL: Record<SupportChannel['kind'], string> = {
  phone: 'By phone',
  email: 'By email',
  office: 'In person',
};

const useStyles = makeStyles((t) => ({
  wrap: { gap: 22 },

  block: { gap: 12 },
  blockTitle: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textHeading },

  urgentCard: { borderWidth: 2, borderRadius: radius.md, padding: 18 },
  urgentEyebrow: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 9,
    letterSpacing: 1.35,
    textTransform: 'uppercase',
  },
  urgentName: { fontFamily: fontFamily.heading, fontSize: 16, color: t.colors.textHeading, marginTop: 6 },

  channelGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  channelGridCompact: { flexDirection: 'column' },
  channelCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 240,
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    borderRadius: radius.md,
    padding: 16,
  },
  channelKind: {
    fontFamily: fontFamily.bodyBlack,
    fontSize: 9,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    color: t.colors.textMuted,
  },
  channelName: { fontFamily: fontFamily.heading, fontSize: 14, color: t.colors.textHeading, marginTop: 7 },
  action: { fontFamily: fontFamily.bodyBold, fontSize: 14, color: t.colors.accent, marginTop: 6 },
  detail: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, marginTop: 5, lineHeight: 17 },
  note: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.accent, lineHeight: 17 },

  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  topicCard: {
    flexGrow: 1,
    flexBasis: '47%',
    minWidth: 260,
    backgroundColor: t.colors.surfaceMuted,
    borderRadius: radius.md,
    padding: 16,
  },
  topicTitle: { fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },
  topicBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, marginTop: 6, lineHeight: 18 },
}));
