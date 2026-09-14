import { apiGet } from './client';
import type { BillExplain } from './types';

export function getBillExplain(): Promise<BillExplain> {
  return apiGet<BillExplain>('/bill/explain');
}
