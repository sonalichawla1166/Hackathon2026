// Derived view-model calculations, ported from the `renderVals()` method in
// `project/OneGridAI Platform.dc.html`. Kept as pure functions so screens can
// memoize on exactly the store fields they read.
import { colors } from '@/theme';
import {
  ASSETS,
  DR_FILTERS,
  FAQ_DATA,
  FIXED,
  DELIV,
  SUPPLY,
  TAXRATE,
  RETAIL,
  USAGE,
  USD,
  USD0,
  billFor,
  KWH_HISTORY,
} from '@/data/content';

export interface BillLine {
  label: string;
  amount: string;
  plain: string;
  bg: string;
  v: number;
  pct: number;
}

export function billLines(): BillLine[] {
  const lines: Omit<BillLine, 'pct'>[] = [
    { label: 'Basic service charge', amount: USD(FIXED), plain: 'Fixed monthly charge for the meter and service line. Does not move with usage.', bg: colors.surfaceMuted, v: FIXED },
    { label: 'Delivery, 1,240 kWh', amount: USD(USAGE * DELIV), plain: 'Getting the electricity to you. Billed in two tiers, and 990 kWh landed in the higher one.', bg: colors.accent, v: USAGE * DELIV },
    { label: 'Supply, 1,240 kWh', amount: USD(USAGE * SUPPLY), plain: 'The energy itself at 11.28¢ per kWh. You are on the utility default supply, not an ESCO.', bg: colors.primary, v: USAGE * SUPPLY },
    { label: 'Taxes and surcharges', amount: USD((FIXED + USAGE * RETAIL) * TAXRATE), plain: 'State and city taxes plus system benefit charges, applied to everything above.', bg: colors.cta, v: (FIXED + USAGE * RETAIL) * TAXRATE },
  ];
  const total = lines.reduce((a, l) => a + l.v, 0);
  return lines.map((l) => ({ ...l, pct: (l.v / total) * 100 }));
}

export function billHistory() {
  return KWH_HISTORY.map((h, i) => ({ m: h.m, hPx: Math.round((h.v / 1310) * 56), active: i === 5 }));
}

export function meterIntervals() {
  return Array.from({ length: 14 }, (_, i) => {
    const flagged = i >= 7;
    return { hPx: Math.round(flagged ? 62 + (i % 3) * 6 : 30 + (i % 4) * 5), flagged };
  });
}

export interface SolarNumbers {
  kw: number;
  gen: number;
  net: number;
  bill: number;
  base: number;
  annual: number;
  cost: number;
  payback: number;
}

export function solarNumbers(kw: number): SolarNumbers {
  const gen = (kw * 1180) / 12;
  const net = Math.max(0, USAGE - gen);
  const exported = Math.max(0, gen - USAGE);
  const gross = FIXED + net * RETAIL - exported * RETAIL;
  const bill = Math.max(FIXED, gross) * (1 + TAXRATE);
  const base = billFor(USAGE);
  const annual = (base - bill) * 12;
  const cost = kw * 2850 * 0.7;
  return { kw, gen, net, bill, base, annual, cost, payback: annual > 0 ? cost / annual : 0 };
}

export function riskColor(risk: number) {
  return risk >= 0.8 ? colors.danger : risk >= 0.7 ? colors.accent : '#4D6F84';
}

export interface PlanCard {
  name: string;
  desc: string;
  monthly: string;
  annual: string;
  isBest: boolean;
  delta: string;
  deltaColor: string;
}

export function ratePlans(portalUsage: number): PlanCard[] {
  const flat = billFor(portalUsage);
  const touOff = 0.61;
  const tou = (FIXED + portalUsage * (touOff * 0.0782 + (1 - touOff) * 0.1691) + portalUsage * DELIV) * (1 + TAXRATE);
  const budget = billFor(1200) * 0.995;
  const plans = [
    { name: 'SC 1 tiered, current', monthlyV: flat, desc: 'Two delivery tiers, flat supply. The default residential plan.' },
    { name: 'EV Time-of-Use', monthlyV: tou, desc: 'Cheap after 11pm, expensive 2pm to 8pm. Rewards overnight charging.' },
    { name: 'Budget billing', monthlyV: budget, desc: 'Same amount every month, trued up once a year. No saving, just no surprises.' },
  ];
  const best = plans.reduce((a, p) => (p.monthlyV < a.monthlyV ? p : a), plans[0]);
  return plans.map((p) => ({
    name: p.name,
    desc: p.desc,
    monthly: USD(p.monthlyV),
    annual: USD0(p.monthlyV * 12),
    isBest: p === best,
    delta: p === best ? 'Lowest cost at this usage' : '+' + USD0((p.monthlyV - best.monthlyV) * 12) + ' a year vs the best plan',
    deltaColor: p === best ? colors.cta : colors.textMuted,
  }));
}

export function faqs(faqOpen: number) {
  return FAQ_DATA.map((f, i) => ({ ...f, open: faqOpen === i }));
}

export function assetsForList(selIdx: number) {
  return ASSETS.map((a, i) => ({
    ...a,
    riskLabel: a.risk.toFixed(2),
    riskPct: Math.round(a.risk * 100),
    riskColorValue: riskColor(a.risk),
    selected: i === selIdx,
  }));
}

export function drCohort(drPicks: number[]) {
  const picks = drPicks.map((i) => DR_FILTERS[i]);
  const drCount = picks.length
    ? Math.round(picks.reduce((a, f) => Math.min(a, f.n), 99999) * (1 - 0.08 * (picks.length - 1)))
    : 12480;
  const avgKw = picks.length ? picks.reduce((a, f) => a + f.kw, 0) / picks.length : 1.6;
  const mw = (drCount * avgKw) / 1000;

  const curve = Array.from({ length: 12 }, (_, i) => {
    const load = [52, 58, 66, 78, 92, 100, 96, 84, 70, 60, 54, 48][i];
    const inWindow = i >= 4 && i <= 7;
    const cut = inWindow ? Math.round(load * Math.min(0.24, mw / 40)) : 0;
    return { base: Math.round(load - cut), cut };
  });

  return { drCount, mw, curve };
}
