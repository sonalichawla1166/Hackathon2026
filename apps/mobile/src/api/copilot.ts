import { apiGet, apiPost } from './client';
import type { CopilotAskResult, CopilotCall } from './types';

export function getCopilotCall(): Promise<CopilotCall> {
  return apiGet<CopilotCall>('/copilot/call');
}

export function askByVoice(text: string): Promise<CopilotAskResult> {
  return apiPost<CopilotAskResult>('/copilot/ask', { text });
}

export function advanceCall(): Promise<CopilotCall> {
  return apiPost<CopilotCall>('/copilot/advance');
}

export function useSuggestion(): Promise<CopilotCall> {
  return apiPost<CopilotCall>('/copilot/use-suggestion');
}

export function rephraseSuggestion(): Promise<CopilotCall> {
  return apiPost<CopilotCall>('/copilot/rephrase');
}

export function toggleAction(action: string): Promise<CopilotCall> {
  return apiPost<CopilotCall>('/copilot/actions/toggle', { action });
}

export function completeCall(): Promise<CopilotCall> {
  return apiPost<CopilotCall>('/copilot/complete');
}

export function resetCall(): Promise<CopilotCall> {
  return apiPost<CopilotCall>('/copilot/reset');
}
