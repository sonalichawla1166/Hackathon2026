import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useUiStore } from '@/state/store';
import { useSalesPipeline } from '@/api/hooks';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { stageColor } from '../stageColors';

const COLUMN_WIDTH = 210;

export function PipelineScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const selectLead = useUiStore((s) => s.selectLead);
  const { data, isPending, isError, error, refetch } = useSalesPipeline();

  if (isPending) return <LoadingState label="Loading pipeline…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>Pipeline board</Text>
      <Text style={styles.subtitle}>Your whole lead book by stage — tap a card to open it.</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.board}>
        {data.stages.map((stage) => {
          const leads = data.board[stage] ?? [];
          const color = stageColor(stage, colors);
          return (
            <View key={stage} style={styles.column}>
              <View style={styles.columnHeader}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.columnTitle} numberOfLines={1}>{stage}</Text>
                <Text style={styles.columnCount}>{leads.length}</Text>
              </View>

              <View style={{ gap: 8 }}>
                {leads.map((l) => (
                  <Pressable key={l.id} style={[styles.card, { borderTopColor: color }]} onPress={() => selectLead(l.id)}>
                    <Text style={styles.cardAddress} numberOfLines={1}>
                      {l.address}
                      {l.unit ? `, ${l.unit}` : ''}
                    </Text>
                    <Text style={styles.cardCustomer} numberOfLines={1}>{l.customerName}</Text>
                    <View style={styles.cardMetaRow}>
                      <Text style={styles.cardMeta} numberOfLines={1}>{l.accountStatus}</Text>
                      <Text style={styles.cardDistance}>{l.distanceLabel}</Text>
                    </View>
                  </Pressable>
                ))}
                {leads.length === 0 && <Text style={styles.emptyColumn}>No leads here yet.</Text>}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { paddingTop: 17, paddingBottom: 8, gap: 4 },
  title: { fontFamily: fontFamily.heading, fontSize: 16, color: t.colors.textHeading, paddingHorizontal: 17 },
  subtitle: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, paddingHorizontal: 17, marginBottom: 8 },
  board: { paddingHorizontal: 17, gap: 12, paddingBottom: 12 },
  column: { width: COLUMN_WIDTH },
  columnHeader: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 },
  dot: { width: 9, height: 9, borderRadius: 4.5 },
  columnTitle: { flex: 1, fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: t.colors.textHeading },
  columnCount: { fontFamily: fontFamily.bodyBold, fontSize: 11.5, color: t.colors.textMuted },
  card: {
    backgroundColor: t.colors.surfaceCard,
    borderRadius: radius.md,
    borderTopWidth: 3,
    padding: 11,
  },
  cardAddress: { fontFamily: fontFamily.heading, fontSize: 12.5, color: t.colors.textHeading },
  cardCustomer: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, marginTop: 3 },
  cardMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 7, gap: 6 },
  cardMeta: { flex: 1, fontFamily: fontFamily.body, fontSize: 10.5, color: t.colors.textMuted },
  cardDistance: { fontFamily: fontFamily.bodyBold, fontSize: 10.5, color: t.colors.accent },
  emptyColumn: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, fontStyle: 'italic' },
}));
