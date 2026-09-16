import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useUiStore } from '@/state/store';
import { usePaymentMethods, usePay } from '@/api/hooks';
import { makeStyles, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function PayScreen() {
  const styles = useStyles();
  const { colors } = useTheme();
  const payMethod = useUiStore((s) => s.payMethod);
  const setPayMethod = useUiStore((s) => s.setPayMethod);
  const { data, isPending, isError, error, refetch } = usePaymentMethods();
  const pay = usePay();

  if (isPending) return <LoadingState label="Loading payment options…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const paid = pay.data?.paid ?? data.paid;

  return (
    <View style={styles.wrap}>
      <View style={styles.amountCard}>
        <Text style={styles.amountLabel}>Amount due {data.dueDate}</Text>
        <Text style={styles.amountValue}>{data.amountDue}</Text>
      </View>

      <View style={styles.options}>
        {data.options.map((o, i) => {
          const active = payMethod === i;
          return (
            <Pressable key={o.label} onPress={() => setPayMethod(i)} style={[styles.optionRow, active && styles.optionRowActive]}>
              <View style={[styles.radioOuter, { borderColor: active ? colors.cta : colors.borderHairline }]}>
                {active && <View style={styles.radioInner} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.optionLabel}>{o.label}</Text>
                <Text style={styles.optionDetail}>{o.detail}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button variant="cta" size="md" block disabled={pay.isPending} onPress={() => pay.mutate(payMethod)}>
        {paid ? 'Payment recorded' : `Pay ${data.amountDue}`}
      </Button>

      {paid && pay.data && (
        <View style={styles.confirmCard}>
          <Text style={styles.confirmTitle}>Confirmation {pay.data.confirmation}</Text>
          <Text style={styles.confirmBody}>{pay.data.note}</Text>
        </View>
      )}

      <Text style={styles.footNote}>Budget billing would flatten this to $274 a month. Ask the assistant to compare.</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { padding: 17, gap: 15 },
  amountCard: { backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 17, alignItems: 'center' },
  amountLabel: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted },
  amountValue: { fontFamily: fontFamily.heading, fontSize: 40, color: t.colors.textHeading, marginTop: 5 },
  options: { gap: 1, backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, overflow: 'hidden' },
  optionRow: { backgroundColor: t.colors.surfaceCard, padding: 14, paddingHorizontal: 15, flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionRowActive: { backgroundColor: t.colors.surfaceMuted },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: t.colors.cta },
  optionLabel: { fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },
  optionDetail: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, marginTop: 2 },
  confirmCard: { backgroundColor: t.colors.surfaceCard, borderWidth: 2, borderColor: t.colors.cta, borderRadius: 5.4, padding: 15 },
  confirmTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.brandInk },
  confirmBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, marginTop: 5, lineHeight: 18 },
  footNote: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted, lineHeight: 18 },
}));
