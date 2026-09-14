import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { usePrograms, useToggleEnroll } from '@/api/hooks';
import { colors } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';

export function ProgramsScreen() {
  const { data, isPending, isError, error, refetch } = usePrograms();
  const toggleEnroll = useToggleEnroll();

  if (isPending) return <LoadingState label="Loading programs…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>{data.intro}</Text>
      {data.programs.map((p, i) => {
        const on = p.enrolled;
        const border = i === 0 ? colors.accent : colors.surfaceMuted;
        const badgeBg = p.match >= 80 ? colors.cta : colors.accent;
        return (
          <View key={p.name} style={[styles.card, { borderColor: border }]}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardName}>{p.name}</Text>
              <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                <Text style={styles.badgeText}>{p.matchLabel}</Text>
              </View>
            </View>
            <Text style={styles.cardWhy}>{p.why}</Text>
            <View style={styles.cardFooter}>
              <Text style={styles.cardValue}>{p.value}</Text>
              <Pressable
                onPress={() => toggleEnroll.mutate(i)}
                disabled={toggleEnroll.isPending}
                style={[
                  styles.enrolBtn,
                  on ? { backgroundColor: colors.cta, borderColor: colors.cta } : { backgroundColor: 'transparent', borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.enrolText, { color: on ? '#fff' : colors.textHeading }]}>{on ? 'Enrolled' : 'Enrol'}</Text>
              </Pressable>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 17, gap: 12 },
  intro: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted, lineHeight: 18 },
  card: { backgroundColor: colors.surfaceCard, borderWidth: 2, borderRadius: 5.4, padding: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  cardName: { flex: 1, fontFamily: fontFamily.heading, fontSize: 15, color: colors.textHeading },
  badge: { borderRadius: 3.2, paddingHorizontal: 8, paddingVertical: 5 },
  badgeText: { fontFamily: fontFamily.bodyBold, fontSize: 11, color: '#fff' },
  cardWhy: { fontFamily: fontFamily.body, fontSize: 12.5, color: colors.textMuted, marginTop: 7, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 12 },
  cardValue: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: colors.cta },
  enrolBtn: { borderWidth: 2, borderRadius: 5, paddingHorizontal: 14, paddingVertical: 9 },
  enrolText: { fontFamily: fontFamily.bodyBold, fontSize: 12 },
});
