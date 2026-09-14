import { apiGet } from './client';
import type { AccountSummary } from './types';

export function getAccountSummary(): Promise<AccountSummary> {
  return apiGet<AccountSummary>('/account/summary');
}
