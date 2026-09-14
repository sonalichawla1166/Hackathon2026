import { create } from 'zustand';

// Pure client-side UI/navigation/selection state. All *data* — chat log,
// bill/solar numbers, program list, asset list, call transcript, etc. — now
// lives on the backend (see apps/backend/API.md) and is fetched with
// react-query hooks in src/api/hooks.ts. Anything kept here is either
// pure navigation (which surface/screen/tab) or a "position" (slider value,
// checkbox picks, which row is selected) that gets passed as a query param
// to a stateless GET, per API.md.

export type Surface = 'app' | 'portal' | 'ops' | 'copilot';
export type AppScreen = 'home' | 'chat' | 'bill' | 'sim' | 'alert' | 'programs' | 'outage' | 'pay';
export type OpsView = 'maint' | 'dr';

interface UiState {
  surface: Surface;
  setSurface: (s: Surface) => void;

  screen: AppScreen;
  setScreen: (s: AppScreen) => void;

  draft: string;
  setDraft: (d: string) => void;

  solarKw: number;
  setSolarKw: (kw: number) => void;

  portalUsage: number;
  setPortalUsage: (kwh: number) => void;

  reportPicks: number[];
  toggleReportPick: (i: number) => void;

  payMethod: number;
  setPayMethod: (i: number) => void;

  faqOpen: number;
  toggleFaq: (i: number) => void;

  opsView: OpsView;
  setOpsView: (v: OpsView) => void;

  selectedAssetId: string | null;
  selectAsset: (id: string) => void;

  drWindow: number;
  setDrWindow: (i: number) => void;

  drPicks: number[];
  toggleDrPick: (i: number) => void;

  drQueuedLocal: boolean;
  setDrQueuedLocal: (v: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  surface: 'app',
  setSurface: (surface) => set({ surface }),

  screen: 'home',
  setScreen: (screen) => set({ screen }),

  draft: '',
  setDraft: (draft) => set({ draft }),

  solarKw: 6,
  setSolarKw: (solarKw) => set({ solarKw }),

  portalUsage: 1240,
  setPortalUsage: (portalUsage) => set({ portalUsage }),

  reportPicks: [],
  toggleReportPick: (i) =>
    set((s) => ({ reportPicks: s.reportPicks.includes(i) ? s.reportPicks.filter((x) => x !== i) : [...s.reportPicks, i] })),

  payMethod: 0,
  setPayMethod: (payMethod) => set({ payMethod }),

  faqOpen: 0,
  toggleFaq: (i) => set((s) => ({ faqOpen: s.faqOpen === i ? -1 : i })),

  opsView: 'maint',
  setOpsView: (opsView) => set({ opsView }),

  selectedAssetId: null,
  selectAsset: (selectedAssetId) => set({ selectedAssetId }),

  drWindow: 1,
  setDrWindow: (drWindow) => set({ drWindow, drQueuedLocal: false }),

  drPicks: [0, 3],
  toggleDrPick: (i) =>
    set((s) => ({
      drPicks: s.drPicks.includes(i) ? s.drPicks.filter((x) => x !== i) : [...s.drPicks, i],
      drQueuedLocal: false,
    })),

  drQueuedLocal: false,
  setDrQueuedLocal: (drQueuedLocal) => set({ drQueuedLocal }),
}));

// Screen header titles — pure navigation copy, not "data", so it stays local.
export const SCREEN_TITLES: Record<AppScreen, string> = {
  home: 'Good afternoon, Maria',
  chat: 'Ask OneGridAI',
  bill: 'September bill',
  sim: 'Solar what-if',
  alert: 'Meter alert',
  programs: 'For you',
  outage: 'Report a problem',
  pay: 'Make a payment',
};
