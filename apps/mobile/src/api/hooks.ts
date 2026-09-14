// react-query hooks wrapping apps/backend's API (see apps/backend/API.md).
// Screens should use these instead of calling the api/*.ts functions or
// fetch() directly — it keeps cache keys and invalidation consistent.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import * as accountApi from './account';
import * as anomaliesApi from './anomalies';
import * as billApi from './bill';
import * as chatApi from './chat';
import * as copilotApi from './copilot';
import * as opsApi from './ops';
import * as outagesApi from './outages';
import * as paymentsApi from './payments';
import * as portalApi from './portal';
import * as programsApi from './programs';
import * as salesApi from './sales';
import * as simulateApi from './simulate';
import type {
  AnomaliesResult,
  CopilotCall,
  OpsAssets,
  OutageMap,
  PaymentMethods,
  ProgramsResult,
} from './types';

// ---- Account -------------------------------------------------------------

export function useAccountSummary() {
  return useQuery({ queryKey: ['account', 'summary'], queryFn: accountApi.getAccountSummary });
}

// ---- Chat (shared by the customer app's "Ask" tab and the portal panel) --

export function useChat() {
  return useQuery({ queryKey: ['chat'], queryFn: chatApi.getChat });
}

export function useSendChat() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => chatApi.postChat(text),
    onSuccess: (data) => qc.setQueryData(['chat'], data),
  });
}

// ---- Bill -----------------------------------------------------------------

export function useBillExplain() {
  return useQuery({ queryKey: ['bill', 'explain'], queryFn: billApi.getBillExplain });
}

// ---- Solar simulator (shared value, different screens) --------------------

export function useSimulate(solarKw: number) {
  return useQuery({ queryKey: ['simulate', solarKw], queryFn: () => simulateApi.getSimulate(solarKw) });
}

// ---- Anomaly alert ----------------------------------------------------------

export function useAnomalies() {
  return useQuery({ queryKey: ['anomalies'], queryFn: anomaliesApi.getAnomalies });
}

export function useAckAnomaly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: anomaliesApi.ackAnomaly,
    onSuccess: (data: AnomaliesResult) => qc.setQueryData(['anomalies'], data),
  });
}

export function useDismissAnomaly() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: anomaliesApi.dismissAnomaly,
    onSuccess: (data: AnomaliesResult) => qc.setQueryData(['anomalies'], data),
  });
}

// ---- Programs ---------------------------------------------------------------

export function usePrograms() {
  return useQuery({ queryKey: ['programs'], queryFn: programsApi.getPrograms });
}

export function useToggleEnroll() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (index: number) => programsApi.toggleEnroll(index),
    onSuccess: (data: ProgramsResult) => qc.setQueryData(['programs'], data),
  });
}

// ---- Outages ------------------------------------------------------------------

export function useOutageMap() {
  return useQuery({ queryKey: ['outages', 'map'], queryFn: outagesApi.getOutageMap });
}

export function useReportOutage() {
  return useMutation({ mutationFn: (picks: number[]) => outagesApi.reportOutage(picks) });
}

// ---- Payments -------------------------------------------------------------------

export function usePaymentMethods() {
  return useQuery({ queryKey: ['payments', 'methods'], queryFn: paymentsApi.getPaymentMethods });
}

export function usePay() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (method: number) => paymentsApi.pay(method),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['payments', 'methods'] }),
  });
}

// ---- Public portal ------------------------------------------------------------------

export function usePortalNav() {
  return useQuery({ queryKey: ['portal', 'nav'], queryFn: portalApi.getPortalNav });
}

export function usePortalRates(usage: number) {
  return useQuery({ queryKey: ['portal', 'rates', usage], queryFn: () => portalApi.getPortalRates(usage) });
}

export function usePortalSolar(kw: number) {
  return useQuery({ queryKey: ['portal', 'solar', kw], queryFn: () => portalApi.getPortalSolar(kw) });
}

export function usePortalFaqs() {
  return useQuery({ queryKey: ['portal', 'faqs'], queryFn: portalApi.getPortalFaqs });
}

// ---- Ops: predictive maintenance ---------------------------------------------------

export function useOpsAssets() {
  return useQuery({ queryKey: ['ops', 'assets'], queryFn: opsApi.getOpsAssets });
}

export function useDispatchAsset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => opsApi.dispatchAsset(assetId),
    onSuccess: (result, assetId) => {
      qc.setQueryData<OpsAssets | undefined>(['ops', 'assets'], (prev) =>
        prev
          ? {
              ...prev,
              assets: prev.assets.map((a) =>
                a.id === assetId ? { ...a, dispatched: result.dispatched, dispatchLabel: result.dispatchLabel } : a
              ),
            }
          : prev
      );
    },
  });
}

// ---- Ops: demand response -------------------------------------------------------------

export function useDrCohort(window: number, picks: number[]) {
  return useQuery({
    queryKey: ['ops', 'dr', window, picks],
    queryFn: () => opsApi.getDrCohort(window, picks),
  });
}

export function useQueueDrEvent() {
  return useMutation({
    mutationFn: ({ window, picks }: { window: number; picks: number[] }) => opsApi.queueDrEvent(window, picks),
  });
}

// ---- Agent copilot -------------------------------------------------------------------

export function useCopilotCall() {
  return useQuery({ queryKey: ['copilot', 'call'], queryFn: copilotApi.getCopilotCall });
}

export function useAdvanceCall() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: copilotApi.advanceCall,
    onSuccess: (data: CopilotCall) => qc.setQueryData(['copilot', 'call'], data),
  });
}

export function useUseSuggestion() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: copilotApi.useSuggestion,
    onSuccess: (data: CopilotCall) => qc.setQueryData(['copilot', 'call'], data),
  });
}

// ---- Field sales: leads within range -----------------------------------------------

export function useSalesLeads(lat: number, lng: number, radiusKm: number) {
  return useQuery({
    queryKey: ['sales', 'leads', lat, lng, radiusKm],
    queryFn: () => salesApi.getLeads(lat, lng, radiusKm),
  });
}

export function useSalesLeadDetail(id: string | null) {
  return useQuery({
    queryKey: ['sales', 'lead', id],
    queryFn: () => salesApi.getLeadDetail(id as string),
    enabled: id !== null,
  });
}

export function useLogKnock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, outcome, notes }: { id: string; outcome: string; notes: string }) =>
      salesApi.logKnock(id, outcome, notes),
    onSuccess: (data, vars) => {
      qc.setQueryData(['sales', 'lead', vars.id], data.lead);
      qc.invalidateQueries({ queryKey: ['sales', 'leads'] });
      qc.invalidateQueries({ queryKey: ['sales', 'stats'] });
    },
  });
}

export function useSalesStats(lat: number, lng: number, radiusKm: number) {
  return useQuery({
    queryKey: ['sales', 'stats', lat, lng, radiusKm],
    queryFn: () => salesApi.getStats(lat, lng, radiusKm),
  });
}
