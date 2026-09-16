import React from 'react';
import { View, Text } from 'react-native';
import { useOpsImpact } from '@/api/hooks';
import { makeStyles } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function ImpactSummary({ compact }: { compact: boolean }) {
  const styles = useStyles();
  const { data, isPending, isError, error, refetch } = useOpsImpact();

  if (isPending) return <LoadingState label="Building impact summary…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View>
      <Text style={styles.title}>Impact & ROI</Text>
      <Text style={styles.subtitle}>
        The business case for OneGridAI in one view — pulled from what the other tabs already compute, so you don't
        have to click through all four surfaces to add it up yourself.
      </Text>

      <View style={[styles.grid, compact && styles.gridCompact]}>
        {data.groups.map((g) => (
          <View key={g.title} style={[styles.groupCard, !compact && { flexBasis: '31%' }]}>
            <Text style={styles.groupTitle}>{g.title}</Text>
            <View style={{ marginTop: 12, gap: 12 }}>
              {g.stats.map((s) => (
                <View key={s.k} style={styles.statRow}>
                  <Text style={styles.statLabel}>{s.k}</Text>
                  <Text style={styles.statValue}>{s.v}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>

      <Text style={styles.note}>{data.note}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  title: { fontFamily: fontFamily.heading, fontSize: 24, color: t.colors.textHeading },
  subtitle: { fontFamily: fontFamily.body, fontSize: 13, color: t.colors.textMuted, marginTop: 7, lineHeight: 19, maxWidth: 640 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginTop: 22 },
  gridCompact: { flexDirection: 'column' },

  groupCard: { backgroundColor: t.colors.surfaceCard, borderRadius: 5.4, padding: 18, ...t.shadow.card },
  groupTitle: { fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },

  // Label over value, not beside it. Several of these values are sentences
  // ("$56,213/yr (extrapolated across 120 customers)"), and in a third-width
  // card a side-by-side row squeezed the label into a five-line ribbon.
  statRow: { gap: 3, borderTopWidth: 1, borderTopColor: t.colors.surfaceMuted, paddingTop: 9 },
  statLabel: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted },
  statValue: { fontFamily: fontFamily.bodyBold, fontSize: 14, color: t.colors.textHeading, lineHeight: 19 },

  note: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.accent, marginTop: 20, lineHeight: 16, maxWidth: 720 },
}));
