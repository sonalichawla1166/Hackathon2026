import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';

// Pure client-side UI/navigation/selection state. All *data* — chat log,
// bill/solar numbers, program list, asset list, call transcript, etc. — now
// lives on the backend (see apps/backend/API.md) and is fetched with
// react-query hooks in src/api/hooks.ts. Anything kept here is either
// pure navigation (which surface/screen/tab), a login session, or a
// "position" (slider value, checkbox picks, which row is selected) that
// gets passed as a query param to a stateless GET, per API.md.

export type Surface = 'app' | 'portal' | 'ops' | 'copilot' | 'sales';

/** Who is signed in. Filled at login and shown in the profile menu. */
export interface SessionUser {
  name: string;
  email: string;
  /** Avatar URL, when the identity provider gave us one. */
  picture?: string;
  /** How they signed in — the profile menu says so. */
  method: 'google' | 'passcode';
  /** True for the stand-in identity used when Google is not configured. */
  isDemo?: boolean;
}

/** Display name for each workspace, used by the header and profile menu. */
export const SURFACE_LABELS: Record<Surface, string> = {
  app: 'Customer app',
  portal: 'Public portal',
  ops: 'Ops dashboard',
  copilot: 'Agent copilot',
  sales: 'Field sales',
};
export type AppScreen = 'home' | 'chat' | 'bill' | 'sim' | 'alert' | 'programs' | 'outage' | 'pay';
export type OpsView = 'maint' | 'dr';
export type SalesScreen = 'leads' | 'detail' | 'stats' | 'pipeline';
export type LocationMode = 'territory' | 'device';

// No backend auth exists yet — logging in just picks which surface's
// session you land in, so only `session` needs to survive a web refresh.
const webStorage = {
  getItem: (name: string) => (Platform.OS === 'web' ? window.localStorage.getItem(name) : null),
  setItem: (name: string, value: string) => {
    if (Platform.OS === 'web') window.localStorage.setItem(name, value);
  },
  removeItem: (name: string) => {
    if (Platform.OS === 'web') window.localStorage.removeItem(name);
  },
};

interface UiState {
  session: Surface | null;
  user: SessionUser | null;
  login: (role: Surface, user: SessionUser) => void;
  logout: () => void;

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

  salesScreen: SalesScreen;
  setSalesScreen: (s: SalesScreen) => void;

  salesRadiusKm: number;
  setSalesRadiusKm: (km: number) => void;

  selectedLeadId: string | null;
  selectLead: (id: string | null) => void;

  locationMode: LocationMode;
  setLocationMode: (m: LocationMode) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      session: null,
      user: null,
      login: (role, user) =>
        set({ session: role, user, screen: 'home', opsView: 'maint', salesScreen: 'leads', selectedLeadId: null }),
      logout: () => set({ session: null, user: null }),

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

      salesScreen: 'leads',
      setSalesScreen: (salesScreen) => set({ salesScreen }),

      salesRadiusKm: 10,
      setSalesRadiusKm: (salesRadiusKm) => set({ salesRadiusKm }),

      selectedLeadId: null,
      selectLead: (selectedLeadId) => set({ selectedLeadId, salesScreen: selectedLeadId ? 'detail' : 'leads' }),

      locationMode: 'territory',
      setLocationMode: (locationMode) => set({ locationMode }),
    }),
    {
      name: 'onegridai-session',
      storage: createJSONStorage(() => webStorage),
      partialize: (s) => ({ session: s.session, user: s.user }),
    }
  )
);

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
