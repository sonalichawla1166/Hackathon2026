import { apiGet, apiPost } from './client';
import type { PayResult, PaymentMethods } from './types';

export function getPaymentMethods(): Promise<PaymentMethods> {
  return apiGet<PaymentMethods>('/payments/methods');
}

export function pay(method: number): Promise<PayResult> {
  return apiPost<PayResult>('/payments/pay', { method });
}
