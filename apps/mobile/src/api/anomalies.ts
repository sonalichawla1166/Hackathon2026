import { apiGet, apiPost } from './client';
import type { AnomaliesResult } from './types';

export function getAnomalies(): Promise<AnomaliesResult> {
  return apiGet<AnomaliesResult>('/anomalies');
}

export function ackAnomaly(): Promise<AnomaliesResult> {
  return apiPost<AnomaliesResult>('/anomalies/ack');
}

export function dismissAnomaly(): Promise<AnomaliesResult> {
  return apiPost<AnomaliesResult>('/anomalies/dismiss');
}
