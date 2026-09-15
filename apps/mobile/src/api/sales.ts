import { apiGet, apiPost } from './client';
import type { KnockResult, SalesLeadDetail, SalesLeadsResult, SalesPipeline, SalesStats, StageResult } from './types';

export function getLeads(lat: number, lng: number, radiusKm: number): Promise<SalesLeadsResult> {
  return apiGet<SalesLeadsResult>(`/sales/leads?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
}

export function getLeadDetail(id: string): Promise<SalesLeadDetail> {
  return apiGet<SalesLeadDetail>(`/sales/leads/${id}`);
}

export function logKnock(id: string, outcome: string, notes: string): Promise<KnockResult> {
  return apiPost<KnockResult>(`/sales/leads/${id}/knock`, { outcome, notes });
}

export function setStage(id: string, stage: string): Promise<StageResult> {
  return apiPost<StageResult>(`/sales/leads/${id}/stage`, { stage });
}

export function getPipeline(): Promise<SalesPipeline> {
  return apiGet<SalesPipeline>('/sales/pipeline');
}

export function getStats(lat: number, lng: number, radiusKm: number): Promise<SalesStats> {
  return apiGet<SalesStats>(`/sales/stats?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
}
