import { apiGet, apiPost } from './client';
import type { DispatchResult, DrQueueResult, OpsAssets, OpsDr, OpsImpact, SnoozeResult } from './types';

export function getOpsAssets(): Promise<OpsAssets> {
  return apiGet<OpsAssets>('/ops/assets');
}

export function getOpsImpact(): Promise<OpsImpact> {
  return apiGet<OpsImpact>('/ops/impact');
}

export function dispatchAsset(assetId: string): Promise<DispatchResult> {
  return apiPost<DispatchResult>(`/ops/assets/${encodeURIComponent(assetId)}/dispatch`);
}

export function snoozeAsset(assetId: string): Promise<SnoozeResult> {
  return apiPost<SnoozeResult>(`/ops/assets/${encodeURIComponent(assetId)}/snooze`);
}

export function getDrCohort(window: number, picks: number[]): Promise<OpsDr> {
  const picksParam = picks.join(',');
  return apiGet<OpsDr>(`/ops/dr?window=${window}&picks=${encodeURIComponent(picksParam)}`);
}

export function queueDrEvent(window: number, picks: number[]): Promise<DrQueueResult> {
  const picksParam = picks.join(',');
  return apiPost<DrQueueResult>(`/ops/dr/queue?window=${window}&picks=${encodeURIComponent(picksParam)}`);
}
