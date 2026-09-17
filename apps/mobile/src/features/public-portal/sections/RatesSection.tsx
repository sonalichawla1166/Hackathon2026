import React from 'react';
import { View, Text } from 'react-native';
import { useUiStore } from '@/state/store';
import { usePortalRates } from '@/api/hooks';
import { makeStyles, radius } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { RangeSlider } from '@/components/ui/RangeSlider';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { RatePlanCards } from '../RatePlanCards';
import { FaqAccordion } from '../FaqAccordion';

/**
 * The usage slider. Lives here rather than in the portal shell because both
 * the single-page compact layout and the Rates section render it.
 */
export function UsageCard() {
  const styles = useStyles();
  const portalUsage = useUiStore((s) => s.portalUsage);
  const setPortalUsage = useUiStore((s) => s.setPortalUsage);
  const label = `${portalUsage.toLocaleString('en-US')} kWh`;

  return (
    <View style={styles.usageCard}>
      <View style={styles.usageHeader}>
        <Text style={styles.usageLabel}>Your monthly usage</Text>
        <Text style={styles.usageValue}>{label}</Text>
      </View>
      <RangeSlider value={portalUsage} minimumValue={200} maximumValue={2600} step={20} onValueChange={setPortalUsage} />
      <View style={styles.usageEnds}>
        <Text style={styles.usageEndLabel}>200 kWh</Text>
        <Text style={styles.usageEndLabel}>2,600 kWh</Text>
      </View>
    </View>
  );
}

export function RatePlanCardsSection({ compact }: { compact: boolean }) {
  const portalUsage = useUiStore((s) => s.portalUsage);
  const { data, isPending, isError, error, refetch } = usePortalRates(portalUsage);

  if (isPending) return <LoadingState label="Pricing rate plans…" inline />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return <RatePlanCards plans={data.plans} compact={compact} />;
}

/**
 * Rates: move the slider, price all three residential plans against the filed
 * tariff.
 */
export function RatesSection({ compact }: { compact: boolean }) {
  const styles = useStyles();

  return (
    <View style={styles.wrap}>
      <Text style={styles.intro}>
        No account needed. Set your typical monthly usage and every residential plan is priced against the
        current tariff, including the standing charge.
      </Text>
      <UsageCard />
      <RatePlanCardsSection compact={compact} />
      <FaqAccordion />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  wrap: { gap: 22 },
  intro: { fontFamily: fontFamily.body, fontSize: 13, color: t.colors.textMuted, lineHeight: 19, maxWidth: 640 },

  usageCard: { backgroundColor: t.colors.surfaceMuted, borderRadius: radius.md, padding: 22 },
  usageHeader: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
  usageLabel: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textHeading },
  usageValue: { fontFamily: fontFamily.heading, fontSize: 26, color: t.colors.textHeading },
  usageEnds: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 },
  usageEndLabel: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textMuted },
}));
