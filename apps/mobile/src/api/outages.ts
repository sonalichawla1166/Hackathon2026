import { apiGet, apiPost } from './client';
import type { OutageMap, OutageReportResult } from './types';

export function getOutageMap(): Promise<OutageMap> {
  return apiGet<OutageMap>('/outages/map');
}

export function reportOutage(picks: number[]): Promise<OutageReportResult> {
  return apiPost<OutageReportResult>('/outages/report', { picks });
}
