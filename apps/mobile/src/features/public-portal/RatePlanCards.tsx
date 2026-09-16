import React from 'react';
import { View, Text } from 'react-native';
import type { RatePlanCard } from '@/api/types';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Badge } from '@/components/ui/Badge';

export function RatePlanCards({ plans, compact }: { plans: RatePlanCard[]; compact: boolean }) {
  const styles = useStyles();
  const { colors } = useTheme();
  return (
    <View style={[styles.row, compact && styles.rowCompact]}>
      {plans.map((p) => (
        <View
          key={p.name}
          style={[
            styles.card,
            compact && styles.cardCompact,
            { borderColor: p.isBest ? colors.cta : colors.surfaceMuted },
          ]}
        >
          <View style={styles.badgeSlot}>{p.isBest && <Badge label="LOWEST FOR YOU" bg={colors.brandInk} />}</View>
          <Text style={styles.name}>{p.name}</Text>
          <Text style={styles.monthly}>{p.monthly}</Text>
          <Text style={styles.perMonth}>per month, {p.annual} a year</Text>
          <View style={styles.divider}>
            <Text style={styles.desc}>{p.desc}</Text>
          </View>
          <Text style={[styles.delta, { color: p.deltaColor }]}>{p.delta}</Text>
        </View>
      ))}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  row: { flexDirection: 'row', gap: 18 },
  rowCompact: { flexDirection: 'column' },
  card: {
    flex: 1,
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 2,
    borderRadius: radius.md,
    padding: 20,
    gap: 10,
    ...t.shadow.card,
  },
  cardCompact: { flex: undefined },
  badgeSlot: { minHeight: 22, justifyContent: 'flex-start' },
  name: { fontFamily: fontFamily.heading, fontSize: 17, lineHeight: 21, color: t.colors.textHeading },
  monthly: { fontFamily: fontFamily.heading, fontSize: 30, lineHeight: 32, color: t.colors.textHeading },
  perMonth: { fontFamily: fontFamily.body, fontSize: 12, color: t.colors.textMuted },
  divider: { borderTopWidth: 2, borderTopColor: t.colors.surfaceMuted, paddingTop: 11, marginTop: 2 },
  desc: { fontFamily: fontFamily.body, fontSize: 13, lineHeight: 20, color: t.colors.textMuted },
  delta: { fontFamily: fontFamily.bodyBold, fontSize: 12.5 },
}));
