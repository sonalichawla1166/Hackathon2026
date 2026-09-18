// Response shapes mirror `apps/backend/API.md` exactly — see that file for
// the authoritative contract.

export interface AccountSummary {
  customer: { name: string; utility: string; accountLabel: string };
  billTotal: string;
  deltaPct: string;
  deltaLabel: string;
  history: { m: string; hPx: number; active: boolean }[];
  alert: { title: string; detail: string };
  topProgram: { name: string; match: number; blurb: string };
}

export interface ChatMessage {
  role: 'bot' | 'user';
  text: string;
  cites: string[] | null;
}

export interface ChatResponse {
  log: ChatMessage[];
  suggestions: string[];
}

export interface BillLine {
  label: string;
  amount: string;
  plain: string;
  bg: string;
  v: number;
  pct: number;
}

export interface BillExplain {
  period: string;
  total: string;
  lines: BillLine[];
  whyItMoved: string;
}

export interface SimulateResult {
  solarKw: number;
  solarLabel: string;
  billToday: string;
  billWithSolar: string;
  rows: { k: string; v: string }[];
}

export interface AnomaliesResult {
  title: string;
  detail: string;
  intervals: { hPx: number; flagged: boolean }[];
  impact: string;
  ack: boolean;
  ctaLabel: string;
  ackNote: string | null;
}

export interface ProgramItem {
  name: string;
  why: string;
  value: string;
  match: number;
  matchLabel: string;
  enrolled: boolean;
}

export interface ProgramsResult {
  intro: string;
  programs: ProgramItem[];
}

export interface OutagePin {
  /** Layout coordinates, 0-1, kept from the original schematic map. */
  x: number;
  y: number;
  d: number;
  danger: boolean;
  /** The same arrangement projected onto real ground, for the tiled map. */
  lat: number;
  lng: number;
}

/** Severity drives the marker colour and the status pill. */
export type OutageSeverity = 'major' | 'minor' | 'planned' | 'restoring';

export interface OutageEvent {
  id: string;
  /** Neighbourhood and cross streets. */
  area: string;
  cause: string;
  customers: number;
  crews: number;
  /** Estimated restoration, or "Power restored" once it is back. */
  eta: string;
  status: string;
  severity: OutageSeverity;
  lat: number;
  lng: number;
}

export interface OutageMap {
  pins: OutagePin[];
  /** Active events behind the pins — the portal plots and lists these. */
  events: OutageEvent[];
  /** The service address the pins are arranged around. */
  center: { lat: number; lng: number };
  caption: string;
  portalCaption: string;
  options: string[];
  address: string;
  meter: string;
}

export interface OutageReportResult {
  reported: boolean;
  ticket: string;
  detail: string;
  note: string;
  address: string;
  meter: string;
}

export interface PaymentMethods {
  amountDue: string;
  dueDate: string;
  options: { label: string; detail: string }[];
  paid: boolean;
}

export interface PayResult {
  paid: boolean;
  confirmation: string;
  note: string;
}

export interface PortalNav {
  nav: string[];
  poweredBy: string;
}

export interface RatePlanCard {
  name: string;
  desc: string;
  monthly: string;
  annual: string;
  isBest: boolean;
  delta: string;
  deltaColor: string;
}

export interface PortalRates {
  usage: number;
  plans: RatePlanCard[];
}

export interface PortalSolar {
  solarKw: number;
  note: string;
  stats: { k: string; v: string }[];
}

export interface FaqEntry {
  q: string;
  a: string;
  cite: string;
}

export interface PortalFaqs {
  faqs: FaqEntry[];
}

export interface AssetDriver {
  k: string;
  v: string;
  w: string;
}

export interface OpsAsset {
  id: string;
  type: string;
  loc: string;
  age: string;
  installed: string;
  customers: number;
  action: string;
  drivers: AssetDriver[];
  riskLabel: string;
  riskPct: number;
  riskColorValue: string;
  dispatched: boolean;
  dispatchLabel: string;
  snoozed: boolean;
  snoozeLabel: string;
}

export interface OpsAssets {
  kpis: { k: string; v: string }[];
  columns: string[];
  assets: OpsAsset[];
}

export interface DispatchResult {
  id: string;
  dispatched: boolean;
  dispatchLabel: string;
}

export interface SnoozeResult {
  id: string;
  snoozed: boolean;
  snoozeLabel: string;
}

export interface VoiceAskResult {
  transcript: string;
  answer: string;
  cites: string[];
  audio_b64: string;
  tts_available: boolean;
}

export interface OpsDr {
  windows: string[];
  drCount: string;
  curve: { base: number; cut: number }[];
  stats: { k: string; v: string }[];
  payload: string;
}

export interface DrQueueResult {
  queued: boolean;
  ctaLabel: string;
}

export interface OpsImpactGroup {
  title: string;
  stats: { k: string; v: string }[];
}

export interface OpsImpact {
  note: string;
  groups: OpsImpactGroup[];
}

export interface SupportChannel {
  id: string;
  name: string;
  detail: string;
  /** What to do: a number, an address, or a call to action. */
  action: string;
  kind: 'phone' | 'email' | 'office';
  /** The emergency line, which is set apart from the rest. */
  urgent: boolean;
}

export interface SupportTopic {
  id: string;
  title: string;
  body: string;
}

export interface PortalSupport {
  channels: SupportChannel[];
  topics: SupportTopic[];
  note: string;
}

export interface RetrievedChunk {
  src: string;
  score: string;
  text: string;
}

export interface CopilotSuggestion {
  text: string;
  cites: string[];
  chunks: RetrievedChunk[];
}

export interface CopilotAction {
  text: string;
  done: boolean;
}

export interface CopilotSummary {
  headline: string;
  durationLabel: string;
  stats: { k: string; v: string }[];
}

export interface CopilotCall {
  callTimer: string;
  /** Epoch seconds; the client ticks its own clock from this. */
  callStartedAt: number | null;
  callEndedAt: number | null;
  customer: { name: string; account: string; address: string };
  transcript: { who: string; text: string }[];
  facts: { k: string; v: string }[];
  openAnomaly: string;
  suggestion: CopilotSuggestion;
  advanceLabel: string;
  /** The scripted opening has been fully advanced through. */
  callComplete: boolean;
  /** The agent ended the call; `summary` is populated. */
  callEnded: boolean;
  used: boolean;
  useLabel: string;
  nextActions: CopilotAction[];
  summary: CopilotSummary | null;
}

// POST /copilot/ask returns the full call payload (suggestion updated in
// place, same as rephrase) plus the spoken answer as base64 WAV.
export interface CopilotAskResult extends CopilotCall {
  audio_b64: string;
}

// ---- Field sales / door-to-door -------------------------------------------

export interface SalesVisit {
  date: string;
  outcome: string;
  rep: string;
  notes: string;
}

export interface SalesLead {
  id: string;
  address: string;
  unit: string | null;
  lat: number;
  lng: number;
  mapX: number;
  mapY: number;
  distanceKm: number;
  distanceLabel: string;
  customerName: string;
  accountStatus: string;
  stage: string;
  segment: string;
  phone: string;
  notes: string;
  visitCount: number;
  lastOutcome: string | null;
  lastVisitDate: string | null;
  knockedToday: boolean;
}

export interface SalesLeadDetail extends SalesLead {
  history: SalesVisit[];
  stages: string[];
}

export interface SalesLeadsResult {
  repBase: { lat: number; lng: number };
  radiusKm: number;
  kpis: { k: string; v: string }[];
  knockOutcomes: string[];
  stages: string[];
  leads: SalesLead[];
}

export interface KnockResult {
  lead: SalesLeadDetail;
  ctaLabel: string;
}

export interface StageResult {
  lead: SalesLeadDetail;
  ctaLabel: string;
}

export interface StageFunnelEntry {
  stage: string;
  count: number;
}

export interface SalesStats {
  today: { k: string; v: string }[];
  knockedToday: { id: string; address: string; outcome: string | null }[];
  suggestedRoute: { id: string; address: string; distanceLabel: string }[];
  stageFunnel: StageFunnelEntry[];
}

export interface SalesPipeline {
  stages: string[];
  board: Record<string, SalesLead[]>;
  counts: Record<string, number>;
}
