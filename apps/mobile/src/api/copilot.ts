import { apiGet, apiPost } from './client';
import type { CopilotCall } from './types';

export function getCopilotCall(): Promise<CopilotCall> {
  return apiGet<CopilotCall>('/copilot/call');
}

export function advanceCall(): Promise<CopilotCall> {
  return apiPost<CopilotCall>('/copilot/advance');
}

export function useSuggestion(): Promise<CopilotCall> {
  return apiPost<CopilotCall>('/copilot/use-suggestion');
}
