import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useUiStore } from '@/state/store';
import { useLogKnock, useSalesLeadDetail } from '@/api/hooks';
import { colors, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { outcomeColor } from '../outcomeColors';

export function LeadDetailScreen() {
  const leadId = useUiStore((s) => s.selectedLeadId);
  const selectLead = useUiStore((s) => s.selectLead);
  const { data, isPending, isError, error, refetch } = useSalesLeadDetail(leadId);
  const logKnock = useLogKnock();

  const [outcome, setOutcome] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  if (isPending) return <LoadingState label="Loading address…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const submit = () => {
    if (!outcome || !leadId) return;
    logKnock.mutate(
      { id: leadId, outcome, notes },
      {
        onSuccess: () => {
          setOutcome(null);
          setNotes('');
        },
      }
    );
  };

  return (
    <View style={styles.wrap}>
      <Pressable onPress={() => selectLead(null)} style={styles.backRow}>
        <Text style={styles.backArrow}>‹</Text>
        <Text style={styles.backLabel}>All leads</Text>
      </Pressable>

      <Card>
        <Text style={styles.address}>
          {data.address}
          {data.unit ? `, ${data.unit}` : ''}
        </Text>
        <Text style={styles.distanceNote}>{data.distanceLabel} away</Text>

        <View style={styles.badgeRow}>
          <Badge label={data.accountStatus} bg={colors.primary} />
          {data.lastOutcome && <Badge label={`Last visit: ${data.lastOutcome}`} bg={outcomeColor(data.lastOutcome)} />}
        </View>

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Customer</Text>
          <Text style={styles.fieldValue}>{data.customerName}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Phone</Text>
          <Text style={styles.fieldValue}>{data.phone}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Why this lead</Text>
          <Text style={styles.fieldValue}>{data.segment}</Text>
        </View>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Notes</Text>
          <Text style={styles.fieldValue}>{data.notes}</Text>
        </View>
      </Card>

      <Card muted>
        <Text style={styles.knockTitle}>Log a knock</Text>
        <View style={styles.chipRow}>
          {['Sold', 'Not home', 'Not interested', 'Callback requested', 'Do not contact'].map((o) => (
            <Chip key={o} label={o} selected={outcome === o} onPress={() => setOutcome(o)} selectedBg={outcomeColor(o)} selectedBorder={outcomeColor(o)} />
          ))}
        </View>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Notes (optional)"
          placeholderTextColor={colors.textMuted}
          style={styles.notesInput}
          multiline
        />
        <Button variant="cta" size="md" block disabled={!outcome || logKnock.isPending} onPress={submit} style={{ marginTop: 10 }}>
          {logKnock.isPending ? 'Logging…' : 'Log this knock'}
        </Button>
      </Card>

      <Text style={styles.sectionTitle}>Visit history</Text>
      {data.history.length === 0 && <Text style={styles.emptyHistory}>No prior visits — this is a new lead.</Text>}
      <View style={{ gap: 8 }}>
        {data.history.map((v, i) => (
          <View key={i} style={styles.historyRow}>
            <View style={styles.historyTop}>
              <Badge label={v.outcome} bg={outcomeColor(v.outcome)} />
              <Text style={styles.historyDate}>{v.date}</Text>
            </View>
            <Text style={styles.historyRep}>{v.rep}</Text>
            {!!v.notes && <Text style={styles.historyNotes}>{v.notes}</Text>}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 17, gap: 13 },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backArrow: { fontFamily: fontFamily.bodyBold, fontSize: 20, color: colors.accent },
  backLabel: { fontFamily: fontFamily.bodyBold, fontSize: 13, color: colors.accent },
  address: { fontFamily: fontFamily.heading, fontSize: 18, color: colors.textHeading },
  distanceNote: { fontFamily: fontFamily.body, fontSize: 12, color: colors.textMuted, marginTop: 3 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  field: { marginTop: 12 },
  fieldLabel: { fontFamily: fontFamily.body, fontSize: 10.5, textTransform: 'uppercase', letterSpacing: 0.6, color: colors.textMuted },
  fieldValue: { fontFamily: fontFamily.body, fontSize: 13, color: colors.textHeading, marginTop: 3, lineHeight: 18 },
  knockTitle: { fontFamily: fontFamily.heading, fontSize: 14, color: colors.textHeading, marginBottom: 10 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  notesInput: {
    borderWidth: 2,
    borderColor: colors.borderMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: fontFamily.body,
    fontSize: 13,
    color: colors.textBody,
    backgroundColor: colors.surfaceCard,
    marginTop: 10,
    minHeight: 64,
    textAlignVertical: 'top',
  },
  sectionTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: colors.textHeading, marginTop: 4 },
  emptyHistory: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted },
  historyRow: { backgroundColor: colors.surfaceCard, borderWidth: 2, borderColor: colors.surfaceMuted, borderRadius: radius.md, padding: 12 },
  historyTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDate: { fontFamily: fontFamily.bodyMedium, fontSize: 11.5, color: colors.textMuted },
  historyRep: { fontFamily: fontFamily.body, fontSize: 11.5, color: colors.textMuted, marginTop: 6 },
  historyNotes: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textHeading, marginTop: 4, lineHeight: 17 },
});
