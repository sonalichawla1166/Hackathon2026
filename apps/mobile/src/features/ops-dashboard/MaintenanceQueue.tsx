import React from 'react';
import { View, Pressable, Text, ScrollView } from 'react-native';
import { useUiStore } from '@/state/store';
import { useDispatchAsset, useOpsAssets, useSnoozeAsset } from '@/api/hooks';
import { LinearGradient } from 'expo-linear-gradient';
import { makeStyles, radius, useTheme } from '@/theme';
import { fontFamily } from '@/theme/typography';
import { Button } from '@/components/ui/Button';
import { LoadingState, ErrorState } from '@/components/ui/AsyncState';
import { hiddenScrollbar } from '@/components/ui/scroll';

export function MaintenanceQueue({ compact }: { compact: boolean }) {
  const styles = useStyles();
  const { colors, gradients } = useTheme();
  const selectedAssetId = useUiStore((s) => s.selectedAssetId);
  const selectAsset = useUiStore((s) => s.selectAsset);
  const { data, isPending, isError, error, refetch } = useOpsAssets();
  const dispatchAsset = useDispatchAsset();
  const snoozeAsset = useSnoozeAsset();

  if (isPending) return <LoadingState label="Loading maintenance queue…" />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const { kpis, columns, assets } = data;

  // The backend returns an empty list until `seed.py` has been run, and every
  // row below reads `sel.*` — so say so plainly instead of crashing on it.
  if (assets.length === 0) {
    return (
      <EmptyQueue
        title="No assets in the queue"
        body="The maintenance database has no rows yet. Run `python seed.py` in apps/backend, then reload."
      />
    );
  }

  const selectedId = selectedAssetId ?? assets[0].id;
  const sel = assets.find((a) => a.id === selectedId) ?? assets[0];

  if (!sel) {
    return (
      <View>
        <Text style={styles.title}>Predictive maintenance queue</Text>
        <Text style={styles.subtitle}>No assets to show yet — run the backend's seed script to populate demo data.</Text>
      </View>
    );
  }

  // A brand-gradient hero rather than loose type on the page: it gives the
  // view a masthead and turns the KPIs into readable tiles. The measured ones
  // are short, so a long value like the model name is set as running text
  // instead of being blown up to headline size.
  const header = (
    <LinearGradient
      colors={gradients.brand}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, compact && styles.heroCompact]}
    >
      <View style={styles.heroText}>
        <Text style={styles.title}>Predictive maintenance queue</Text>
        <Text style={styles.subtitle}>
          Ranked by failure probability over the next 30 days.{' '}
          {kpis.find((k) => k.k === 'High-risk assets')?.v ?? '—'} of{' '}
          {kpis.find((k) => k.k === 'Assets monitored')?.v ?? '—'} assets above the 0.60 threshold.
        </Text>
      </View>
      <View style={[styles.kpiRow, compact && styles.kpiRowCompact]}>
        {kpis.map((k) => {
          const long = k.v.length > 10;
          return (
            <View key={k.k} style={[styles.kpiTile, long && styles.kpiTileWide]}>
              <Text style={styles.kpiLabel} numberOfLines={1}>{k.k}</Text>
              <Text style={[styles.kpiValue, long && styles.kpiValueLong]} numberOfLines={2}>{k.v}</Text>
            </View>
          );
        })}
      </View>
    </LinearGradient>
  );

  const headRow = (
    <View style={styles.tableHeadRow}>
      {columns.map((c, i) => (
        <Text key={c} style={[styles.tableHeadCell, colWidth(i)]} numberOfLines={1}>
          {c}
        </Text>
      ))}
    </View>
  );

  const rows = assets.map((a) => (
    <Pressable
      key={a.id}
      onPress={() => selectAsset(a.id)}
      style={[styles.row, { backgroundColor: a.id === sel.id ? colors.surfaceMuted : colors.surfaceCard }]}
    >
      <View style={colWidth(0)}>
        <Text style={styles.assetId} numberOfLines={1}>{a.id}</Text>
        <Text style={styles.assetType} numberOfLines={2}>{a.type}</Text>
      </View>
      <Text style={[styles.cellText, colWidth(1)]}>{a.loc}</Text>
      <Text style={[styles.cellText, colWidth(2)]}>{a.age}</Text>
      <View style={[styles.riskCell, colWidth(3)]}>
        <View style={styles.riskTrack}>
          <View style={[styles.riskFill, { width: `${a.riskPct}%`, backgroundColor: a.riskColorValue }]} />
        </View>
        <Text style={styles.riskLabel}>{a.riskLabel}</Text>
      </View>
    </Pressable>
  ));

  const detail = (
    <>
      <Text style={styles.eyebrow}>Selected asset</Text>
      <Text style={styles.selId}>{sel.id}</Text>
      <Text style={styles.selMeta}>
        {sel.type} · {sel.loc} · installed {sel.installed}
      </Text>

      <View style={styles.riskBox}>
        <Text style={styles.riskBoxLabel}>Failure probability, 30 days</Text>
        <Text style={styles.riskBoxValue}>{sel.riskLabel}</Text>
        <Text style={styles.riskBoxSub}>{sel.customers.toLocaleString('en-US')} customers downstream</Text>
      </View>

      <Text style={styles.driversTitle}>What drives the score</Text>
      <View style={{ gap: 9 }}>
        {sel.drivers.map((d) => (
          <View key={d.k}>
            <View style={styles.driverRow}>
              <Text style={styles.driverLabel}>{d.k}</Text>
              <Text style={styles.driverValue}>{d.v}</Text>
            </View>
            <View style={styles.driverTrack}>
              <View style={[styles.driverFill, { width: d.w as `${number}%` }]} />
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actionBox}>
        <Text style={styles.actionTitle}>Recommended action</Text>
        <Text style={styles.actionBody}>{sel.action}</Text>
      </View>

      <View style={styles.btnRow}>
        <Button
          variant="cta"
          size="sm"
          style={{ flex: 1 }}
          disabled={dispatchAsset.isPending}
          onPress={() => dispatchAsset.mutate(sel.id)}
        >
          {sel.dispatchLabel}
        </Button>
        <Button
          variant="outlineDark"
          size="sm"
          style={{ flex: 1 }}
          disabled={snoozeAsset.isPending || sel.snoozed}
          onPress={() => snoozeAsset.mutate(sel.id)}
        >
          {sel.snoozeLabel ?? 'Snooze 7 days'}
        </Button>
      </View>
    </>
  );

  // The page scrolls normally, the way the other two ops views do. Only the
  // rows get their own scroller, under a head row that stays put — and only on
  // a wide screen, where a capped table still shows plenty of the queue.
  // Nesting a second scroller inside the narrow layout would fight the page.
  return (
    <View>
      {header}
      <View style={[styles.layout, compact && styles.layoutCompact]}>
        <View style={[styles.tableCard, !compact && { flex: 1 }]}>
          {headRow}
          {compact ? (
            rows
          ) : (
            <ScrollView style={styles.rowsScroll} {...hiddenScrollbar}>
              {rows}
            </ScrollView>
          )}
        </View>
        <View style={[styles.detailCard, !compact && { width: 350 }]}>{detail}</View>
      </View>
    </View>
  );
}

function colWidth(i: number) {
  // Approximates the 1.5fr / 1fr / .7fr / .9fr grid from the prototype.
  const flexes = [1.5, 1, 0.7, 0.9];
  return { flex: flexes[i] };
}

function EmptyQueue({ title, body }: { title: string; body: string }) {
  const styles = useStyles();
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  emptyCard: {
    backgroundColor: t.colors.surfaceCard,
    borderWidth: 1,
    borderColor: t.colors.borderHairline,
    borderRadius: 5.4,
    padding: 24,
    margin: 4,
    gap: 8,
    alignItems: 'center',
  },
  emptyTitle: { fontFamily: fontFamily.heading, fontSize: 15, color: t.colors.textHeading, textAlign: 'center' },
  emptyBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, textAlign: 'center', lineHeight: 18 },
  hero: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 22,
    borderRadius: radius.md,
    paddingVertical: 24,
    paddingHorizontal: 26,
  },
  heroCompact: { flexDirection: 'column', alignItems: 'stretch', paddingVertical: 18, paddingHorizontal: 18, gap: 16 },
  heroText: { flex: 1, minWidth: 260 },
  title: { fontFamily: fontFamily.heading, fontSize: 24, color: t.colors.textInverse },
  subtitle: { fontFamily: fontFamily.body, fontSize: 13, color: t.colors.textInverseMuted, marginTop: 7, lineHeight: 19, maxWidth: 420 },
  kpiRow: { flexDirection: 'row', alignItems: 'stretch', gap: 10 },
  kpiRowCompact: { flexWrap: 'wrap' },
  kpiTile: {
    minWidth: 104,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: t.colors.borderInverse,
    backgroundColor: t.colors.inverseFillWeak,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  // A sentence-length value needs room to wrap rather than a number's width.
  kpiTileWide: { maxWidth: 230 },
  kpiLabel: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textInverseMuted },
  kpiValue: { fontFamily: fontFamily.heading, fontSize: 21, color: t.colors.textInverse, marginTop: 3 },
  kpiValueLong: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, lineHeight: 17, marginTop: 5 },

  layout: { flexDirection: 'row', gap: 24, marginTop: 22, alignItems: 'flex-start' },
  layoutCompact: { flexDirection: 'column' },

  tableCard: { backgroundColor: t.colors.surfaceCard, borderRadius: 5.4, overflow: 'hidden', ...t.shadow.card },
  // A cap rather than a fill: the card sits in a normally scrolling page, so
  // the rows need a definite height to scroll against.
  rowsScroll: { maxHeight: 520 },
  tableHeadRow: { flexDirection: 'row', gap: 12, paddingVertical: 13, paddingHorizontal: 18, backgroundColor: t.colors.primary },
  tableHeadCell: { fontFamily: fontFamily.bodyBlack, fontSize: 9.5, letterSpacing: 1.2, textTransform: 'uppercase', color: t.colors.textInverseMuted },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 14, paddingHorizontal: 18, borderTopWidth: 1, borderTopColor: t.colors.surfaceMuted, alignItems: 'center' },
  assetId: { fontFamily: fontFamily.heading, fontSize: 13.5, color: t.colors.textHeading },
  assetType: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textMuted, marginTop: 2 },
  cellText: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted },
  riskCell: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  riskTrack: { flex: 1, height: 6, borderRadius: 3, backgroundColor: t.colors.surfaceMuted, overflow: 'hidden' },
  riskFill: { height: '100%' },
  riskLabel: { fontFamily: fontFamily.bodyBold, fontSize: 12.5, color: t.colors.textHeading, width: 34, textAlign: 'right' },

  detailCard: { backgroundColor: t.colors.surfaceCard, borderRadius: 5.4, padding: 22, ...t.shadow.card },

  eyebrow: { fontFamily: fontFamily.bodyBlack, fontSize: 9.5, letterSpacing: 1.4, textTransform: 'uppercase', color: t.colors.accent },
  selId: { fontFamily: fontFamily.heading, fontSize: 21, color: t.colors.textHeading, marginTop: 9, marginBottom: 3 },
  selMeta: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, lineHeight: 18 },

  riskBox: { backgroundColor: t.colors.primary, borderRadius: 5.4, padding: 16, marginTop: 16 },
  riskBoxLabel: { fontFamily: fontFamily.body, fontSize: 11, color: t.colors.textInverseMuted },
  riskBoxValue: { fontFamily: fontFamily.heading, fontSize: 34, color: t.colors.textInverse, marginTop: 4 },
  riskBoxSub: { fontFamily: fontFamily.body, fontSize: 11.5, color: t.colors.textInverseMuted, marginTop: 6, lineHeight: 16 },

  driversTitle: { fontFamily: fontFamily.heading, fontSize: 13, color: t.colors.textHeading, marginTop: 18, marginBottom: 10 },
  driverRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  driverLabel: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted },
  driverValue: { fontFamily: fontFamily.bodyBold, fontSize: 12, color: t.colors.textHeading },
  driverTrack: { height: 5, borderRadius: 3, backgroundColor: t.colors.surfaceMuted, marginTop: 5, overflow: 'hidden' },
  driverFill: { height: '100%', backgroundColor: t.colors.accent },

  actionBox: { backgroundColor: t.colors.surfaceMuted, borderRadius: 5.4, padding: 15, marginTop: 18 },
  actionTitle: { fontFamily: fontFamily.heading, fontSize: 12.5, color: t.colors.textHeading },
  actionBody: { fontFamily: fontFamily.body, fontSize: 12.5, color: t.colors.textMuted, marginTop: 5, lineHeight: 18 },

  btnRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
}));
