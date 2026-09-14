import { apiGet } from './client';
import type { SimulateResult } from './types';

export function getSimulate(solarKw: number): Promise<SimulateResult> {
  return apiGet<SimulateResult>(`/simulate?solarKw=${encodeURIComponent(solarKw)}`);
}
