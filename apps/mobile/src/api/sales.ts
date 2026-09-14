import { apiGet, apiPost } from './client';
import type { KnockResult, SalesLeadDetail, SalesLeadsResult, SalesStats } from './types';

export function getLeads(lat: number, lng: number, radiusKm: number): Promise<SalesLeadsResult> {
  return apiGet<SalesLeadsResult>(`/sales/leads?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
}

export function getLeadDetail(id: string): Promise<SalesLeadDetail> {
  return apiGet<SalesLeadDetail>(`/sales/leads/${id}`);
}

export function logKnock(id: string, outcome: string, notes: string): Promise<KnockResult> {
  return apiPost<KnockResult>(`/sales/leads/${id}/knock`, { outcome, notes });
}

export function getStats(lat: number, lng: number, radiusKm: number): Promise<SalesStats> {
  return apiGet<SalesStats>(`/sales/stats?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`);
}
